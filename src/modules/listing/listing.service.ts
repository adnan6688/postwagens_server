import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IImageAndVideo, IListing } from "./listing.interface";
import Listing from "./listing.model";
import { JwtPayload } from "jsonwebtoken";
import {
  deleteImageFromCLoudinary,
  uploadBufferToCloudinary,
} from "../../config/cloudinary.config";
import mongoose from "mongoose";
import { Follow } from "../follow/follow.model";
import { NotificationService } from "../notifications/notifications.service";
import { NotificationType } from "../notifications/notifications.interface";
import BlockedUserModel from "../userBlocked/userBlocked.model";
import { Boost } from "../boosts/boost.model";
import { Bookmark } from "../bookmarks/bookmark.model";

// Create Listing
const createListingService = async (
  payload: IListing,
  user: JwtPayload,
  files: Express.Multer.File[],
) => {
  payload.sellerId = user.userId;

  if (files && files.length > 0) {
    const imagesAndVideos: IImageAndVideo[] = [];
    for (const file of files) {
      const uploadedFile = await uploadBufferToCloudinary(
        file.buffer,
        file.originalname,
      );
      if (uploadedFile) {
        imagesAndVideos.push({
          type: file.mimetype.startsWith("image") ? "image" : "video",
          url: uploadedFile.secure_url,
        });
      }
    }
    payload.imagesAndVideos = imagesAndVideos;
  }

  const listing = await Listing.create(payload);

  const followers = await Follow.find({ following: user.userId });

  for (const follow of followers) {
    await NotificationService.createNotification({
      userId: follow.follower,
      actorId: user.userId,
      type: NotificationType.LISTING,
      entity: {
        listingId: listing._id,
      },
      isRead: false,
    });
  }

  return listing;
};

// Get My Listings
const getMyListingsService = async (user: JwtPayload) => {
  const listings = await Listing.find({ sellerId: user.userId }).populate({
    path: "seller",
    select: "fullName email avatar",
  });
  return listings;
};

// Get Listings By User Id
const getListingsByUserIdService = async (userId: string) => {
  const listings = await Listing.find({ sellerId: userId }).populate({
    path: "seller",
    select: "fullName email avatar",
  });
  return listings;
};

const getAllListingsService = async (query: Record<string, any>, user?: JwtPayload,) => {

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const sort = query.sort || "-createdAt";
  const searchTerm = query.searchTerm;

  const pipeline: any[] = [];

  // Text search
  if (searchTerm) {
    pipeline.push({
      $match: {
        $text: { $search: searchTerm },
      },
    });
  }



  const excludeField = ["page", "limit", "sort", "fields", "searchTerm"];
  const filter: Record<string, any> = {};

  filter.isDeleted = false;
  for (const key in query) {
    if (!excludeField.includes(key)) {
      filter[key] = query[key];
    }
  }
  if (Object.keys(filter).length > 0) {
    pipeline.push({ $match: filter });
  }

  // Join with users (seller details)
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "sellerId",
      foreignField: "_id",
      as: "seller",
    },
  });

  pipeline.push({
    $unwind: "$seller",
  });

  if (user) {

    pipeline.push({
      $lookup: {
        from: "bookmarks",
        let: { listingId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$listingId", "$$listingId"] },
                  {
                    $eq: ["$userId", new mongoose.Types.ObjectId(user.userId)],
                  },
                ],
              },
            },
          },
        ],
        as: "userBookmark",
      },
    });

    // Add isBookmarked field
    pipeline.push({
      $addFields: {
        isBookmarked: { $gt: [{ $size: "$userBookmark" }, 0] },
      },
    });

    // Exclude listings that are blocked by the user
    pipeline.push({
      $lookup: {
        from: "blockedusers",
        let: { sellerId: "$seller._id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$blockedUserid", "$$sellerId"] },
                  {
                    $eq: [
                      "$blockerUserid",
                      new mongoose.Types.ObjectId(user.userId),
                    ],
                  },
                  { $eq: ["$isBlocked", true] }, // Ensure that it's a blocked relationship
                ],
              },
            },
          },
        ],
        as: "blocked",
      },
    });

    pipeline.push({
      $match: {
        blocked: { $size: 0 },
      },
    });

    pipeline.push({
      $lookup: {
        from: "reportedusers",
        let: { listingID: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$id", "$$listingID"] }, // Matching the listing ID with reported users
                  { $eq: ["$type", "listing"] }, // Ensure it is of type "listing"
                ],
              },
            },
          },
        ],
        as: "reported",
      },
    });

    // Filter out reported listings (only show listings that are not reported)
    pipeline.push({
      $match: {
        reported: { $size: 0 },
      },
    });
  } else {
    pipeline.push({
      $addFields: {
        isBookmarked: false,
      },
    });
  }

  // Sorting
  const sortStage: Record<string, any> = {};
  if (sort) {
    const [field, order] = sort.startsWith("-")
      ? [sort.slice(1), -1]
      : [sort, 1];
    sortStage[field] = order;
    pipeline.push({ $sort: sortStage });
  }

  // Pagination
  pipeline.push({ $skip: (page - 1) * limit });
  pipeline.push({ $limit: limit });

  // Projection
  pipeline.push({
    $project: {
      userBookmark: 0,
      "seller.password": 0,
    },
  });

  const result = await Listing.aggregate(pipeline);

  const total = await Listing.countDocuments(filter);
  const meta = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };

  return {
    meta,
    result,
  };
};


const getAllListingForAdmin = async (query: Record<string, any>) => {


  if (query.isBoosted) {
    query.isBoosted = query.isBoosted == 'true' ? true : false
  }
  const querybuilder = new QueryBuilder(Listing.find(), query);

  const listingQuery = querybuilder
    .filter()
    .textSearch(['title', 'description', 'color'])
    .sort()
    .paginate()
    .populate([{ path: "sellerId", model: "User", select: 'fullName avatar role email isActive isVerified' }]);

  const [data, meta] = await Promise.all([
    listingQuery.build(),
    querybuilder.getMeta(),
  ]);


  return {
    data,
    meta,
  };
};





// Get Single Listing
const getSingleListingService = async (id: string, user?: JwtPayload) => {
  const pipeline: any[] = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "sellerId",
        foreignField: "_id",
        as: "seller",
      },
    },
    {
      $unwind: "$seller",
    },
  ];

  if (user) {
    pipeline.push({
      $lookup: {
        from: "bookmarks",
        let: { listingId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$listingId", "$$listingId"] },
                  {
                    $eq: ["$userId", new mongoose.Types.ObjectId(user.userId)],
                  },
                ],
              },
            },
          },
        ],
        as: "userBookmark",
      },
    });
    pipeline.push({
      $addFields: {
        isBookmarked: { $gt: [{ $size: "$userBookmark" }, 0] },
      },
    });
  } else {
    pipeline.push({
      $addFields: {
        isBookmarked: false,
      },
    });
  }

  // Add view count
  await Listing.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

  pipeline.push({
    $project: {
      userBookmark: 0,
      "seller.password": 0,
    },
  });

  const result = await Listing.aggregate(pipeline);

  if (result.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "Listing not found");
  }

  return result[0];
};

// Update Listing
const updateListingService = async (
  id: string,
  payload: Partial<IListing>,
  user: JwtPayload,
  files: Express.Multer.File[],
) => {
  const listing = await Listing.findById(id);

  if (!listing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Listing not found");
  }

  if (listing.sellerId.toString() !== user.userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to update this listing",
    );
  }

  // Update fields from payload
  Object.assign(listing, payload);

  if (files && files.length > 0) {
    if (!listing.imagesAndVideos) {
      listing.imagesAndVideos = [];
    }

    for (const file of files) {
      const uploadedFile = await uploadBufferToCloudinary(
        file.buffer,
        file.originalname,
      );
      if (uploadedFile) {
        listing.imagesAndVideos.push({
          type: file.mimetype.startsWith("image") ? "image" : "video",
          url: uploadedFile.secure_url,
        });
      }
    }
  }

  const updatedListing = await listing.save();

  return updatedListing;
};

const deleteListingService = async (id: string, user: JwtPayload) => {
  const listing = await Listing.findById(id);

  if (!listing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Listing not found");
  }

  if (listing.sellerId.toString() !== user.userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to delete this listing",
    );
  }

  if (listing.imagesAndVideos && listing.imagesAndVideos.length > 0) {
    for (const image of listing.imagesAndVideos) {
      await deleteImageFromCLoudinary(image.url);
    }
  }

  await Listing.findByIdAndDelete(id);

  await Boost.deleteMany({ listingId: id });

  await Bookmark.deleteMany({ listingId: id });

  return null;
};

const deleteListingMediaService = async (
  listingId: string,
  mediaUrl: string,
  user: JwtPayload,
) => {
  const listing = await Listing.findById(listingId);

  if (!listing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Listing not found");
  }

  if (listing.sellerId.toString() !== user.userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to delete media from this listing",
    );
  }

  await deleteImageFromCLoudinary(mediaUrl);

  const updatedImagesAndVideos = (listing.imagesAndVideos || []).filter(
    (media) => decodeURIComponent(media.url) !== mediaUrl,
  );

  const updatedListing = await Listing.findByIdAndUpdate(
    listingId,
    { imagesAndVideos: updatedImagesAndVideos },
    { new: true, runValidators: true },
  );

  return updatedListing;
};

const getListingAnalyticsService = async (id: string) => {
  const listing = await Listing.findById(id);

  if (!listing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Listing not found");
  }

  // engagement analytics for last 7 days, last 1 month
  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(today.getMonth() - 1);
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  // engagement analytics = view count + inquiry count for last 7 days, last 1 month, last 1 year
  const engagementResult = await Listing.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $project: {
        viewCount: 1,
        inquiryCount: 1,
        engagementLast7Days: {
          $cond: [
            { $gte: ["$createdAt", oneWeekAgo] },
            { $add: ["$viewCount", "$inquiryCount"] },
            0,
          ],
        },
        engagementLast1Month: {
          $cond: [
            { $gte: ["$createdAt", oneMonthAgo] },
            { $add: ["$viewCount", "$inquiryCount"] },
            0,
          ],
        },
        engagementLast1Year: {
          $cond: [
            { $gte: ["$createdAt", oneYearAgo] },
            { $add: ["$viewCount", "$inquiryCount"] },
            0,
          ],
        },
      },
    },
  ]);

  return {
    ...engagementResult[0],
  };
};






const listingStats = async () => {


  const total = await Listing.countDocuments()
  const boosted = (await Listing.find({ isBoosted: true })).length
  const sold = (await Listing.find({ sold: true })).length
  const unsold = (await Listing.find({sold : false})).length
  return {
    total,
    boosted, sold , unsold
  }
}



export const listingServices = {
  createListingService,
  getMyListingsService,
  getAllListingsService,
  getSingleListingService,
  updateListingService,
  deleteListingService,
  getListingsByUserIdService,
  deleteListingMediaService,
  getListingAnalyticsService,

  getAllListingForAdmin,
  listingStats
};
