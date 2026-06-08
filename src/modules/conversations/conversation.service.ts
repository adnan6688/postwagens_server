import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import {
  uploadBufferToCloudinary,
  uploadBufferToCloudinaryNew,
} from "../../config/cloudinary.config";
import { Conversation } from "./conversation.model";
import { getSocketIo } from "../../socket/socket";
import { Message } from "./message.model";
import mongoose from "mongoose";
import Listing from "../listing/listing.model";
import { NotificationService } from "../notifications/notifications.service";
import { NotificationType } from "../notifications/notifications.interface";
import sharp from "sharp";

const convert = require("heic-convert");

const sendMessage = async (
  senderId: string,
  participantBId: string,
  text?: string,
  listingId?: string,
  file?: Express.Multer.File,
) => {
  let conversation = await Conversation.findOne({
    $or: [
      { participantAId: senderId, participantBId: participantBId },
      { participantAId: participantBId, participantBId: senderId },
    ],
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participantAId: senderId,
      participantBId: participantBId,
    });
  }

  if (!text && !file) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Message text or media is required",
    );
  }

  if (listingId) {
    await Listing.findByIdAndUpdate(listingId, {
      $inc: { inquiryCount: 1 },
    });
  }


let mediaUrl: string | undefined;

if (file) {
  console.log("File detected:", file.originalname);

  let buffer = file.buffer;

  // 👉 HEIC detect
  if (
    file.mimetype === "image/heic" ||
    file.mimetype === "image/heif" ||
    file.originalname.toLowerCase().endsWith(".heic")
  ) {
    try {
      console.log("HEIC detected, converting...");

      buffer = await convert({
        buffer: file.buffer, 
        format: "JPEG",
        quality: 0.9,
      });

      console.log("✅ HEIC converted successfully");
    } catch (err) {
      console.error("❌ HEIC convert error:", err);
      throw new Error("HEIC conversion failed");
    }
  }

  // 👉 upload to cloudinary
  const uploadResult = await uploadBufferToCloudinary(
    buffer,
    file.originalname + ".jpg"
  );

  mediaUrl = uploadResult?.secure_url;
}


  let message = await Message.create({
    conversationId: conversation._id,
    senderId,
    text,
    mediaUrl,
    listing: listingId,
  });

  message = await message.populate(["senderId", "listing"]);

  const io = getSocketIo();
  const recipientId =
    conversation.participantAId.toString() === senderId
      ? conversation.participantBId.toString()
      : conversation.participantAId.toString();

  io.to(recipientId).emit("newMessage", message);

  await NotificationService.createNotification({
    userId: new mongoose.Types.ObjectId(recipientId),
    actorId: new mongoose.Types.ObjectId(senderId),
    type: NotificationType.MESSAGE,
    entity: {
      userId: new mongoose.Types.ObjectId(senderId),
      conversationId: conversation._id,
    },
    isRead: false,
  });

  return message;
};

const getConversationsForUser = async (userId: string, searchTerm?: string) => {
  const userIdObj = new mongoose.Types.ObjectId(userId);

  const aggregation: any[] = [
    // Match conversations for the user
    {
      $match: {
        $or: [{ participantAId: userIdObj }, { participantBId: userIdObj }],
      },
    },
    // Populate participants
    {
      $lookup: {
        from: "users",
        localField: "participantAId",
        foreignField: "_id",
        as: "participantADetails",
      },
    },
    { $unwind: "$participantADetails" },
    {
      $lookup: {
        from: "users",
        localField: "participantBId",
        foreignField: "_id",
        as: "participantBDetails",
      },
    },
    { $unwind: "$participantBDetails" },
    // Add a field for the other participant
    {
      $addFields: {
        otherParticipant: {
          $cond: {
            if: { $eq: ["$participantADetails._id", userIdObj] },
            then: "$participantBDetails",
            else: "$participantADetails",
          },
        },
      },
    },
  ];

  // Filter by search term
  if (searchTerm) {
    aggregation.push({
      $match: {
        "otherParticipant.fullName": { $regex: searchTerm, $options: "i" },
      },
    });
  }

  // Restore original participant fields and clean up
  aggregation.push(
    {
      $addFields: {
        participantAId: "$participantADetails",
        participantBId: "$participantBDetails",
      },
    },
    {
      $project: {
        participantADetails: 0,
        participantBDetails: 0,
        otherParticipant: 0,
      },
    },
  );

  const conversations = await Conversation.aggregate(aggregation);

  const conversationsWithDetails = await Promise.all(
    conversations.map(async (conversation) => {
      const unreadMessagesCount = await Message.countDocuments({
        conversationId: conversation._id,
        senderId: { $ne: userId },
        isRead: false,
      });

      const lastMessage = await Message.findOne({
        conversationId: conversation._id,
      })
        .sort({ sentAt: -1 })
        .populate("senderId")
        .populate("listing");

      return {
        ...conversation,
        hasUnreadMessages: unreadMessagesCount > 0,
        lastMessage,
      };
    }),
  );

  return conversationsWithDetails;
};

const getMessagesForConversation = async (
  conversationId: string,
  userId: string,
  options: { page: number; limit: number },
) => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const conversation = await Conversation.findById(conversationId)
    .populate("participantAId")
    .populate("participantBId");

  if (!conversation) {
    throw new AppError(StatusCodes.NOT_FOUND, "Conversation not found");
  }

  if (
    conversation.participantAId._id.toString() !== userId &&
    conversation.participantBId._id.toString() !== userId
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not a participant in this conversation",
    );
  }

  // Mark messages as read for the current user.
  // This will only update messages where the sender is not the current user.
  await Message.updateMany(
    { conversationId, senderId: { $ne: userId }, isRead: false },
    { isRead: true },
  );

  const messages = await Message.find({ conversationId })
    .sort({ sentAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("senderId")
    .populate("listing");
  const totalMessages = await Message.countDocuments({ conversationId });
  const totalPages = Math.ceil(totalMessages / limit);

  return { conversation, messages, totalPages, currentPage: page };
};

const findOrCreateConversation = async (
  participantAId: string,
  participantBId: string,
  options: { page: number; limit: number },
) => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  let conversation = await Conversation.findOne({
    $or: [
      { participantAId, participantBId },
      { participantAId: participantBId, participantBId: participantAId },
    ],
  })
    .populate("participantAId")
    .populate("participantBId");

  if (!conversation) {
    const newConversation = await Conversation.create({
      participantAId,
      participantBId,
    });
    conversation = await Conversation.findById(newConversation._id)
      .populate("participantAId")
      .populate("participantBId");
  }

  if (!conversation) {
    // This should not happen, but as a safeguard
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Could not create or find conversation",
    );
  }

  // Mark messages as read for the current user (participantAId).
  await Message.updateMany(
    {
      conversationId: conversation._id,
      senderId: { $ne: participantAId },
      isRead: false,
    },
    { isRead: true },
  );

  const messages = await Message.find({ conversationId: conversation._id })
    .sort({ sentAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("senderId")
    .populate("listing");
  const totalMessages = await Message.countDocuments({
    conversationId: conversation._id,
  });
  const totalPages = Math.ceil(totalMessages / limit);

  return { conversation, messages, totalPages, currentPage: page };
};

export const ConversationService = {
  sendMessage,
  getConversationsForUser,
  getMessagesForConversation,
  findOrCreateConversation,
};
