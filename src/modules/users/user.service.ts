import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IsActive, IUser, Role } from "./user.interface";
import User from "./user.model";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import mongoose, { Types } from "mongoose";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { redisClient } from "../../config/redis.config";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";
import { Follow } from "../follow/follow.model";

// CREATE USER
const createUserService = async (payload: Partial<IUser>) => {
  const { email, ...rest } = payload;

  const isUser = await User.findOne({ email });
  if (isUser) {
    throw new AppError(400, "User aleready exist. Please login!");
  }

  // Save User Auth
  const authUser: IAuthProvider = {
    provider: "credentials",
    providerId: payload.email as string,
  };

  const userPayload = {
    email,
    auths: [authUser],
    ...rest,
  };

  const creatUser = await User.create(userPayload); // Create user

  // Notification preference setup can be added here in future
  //   await NotificationPreference.create({
  //     user: new mongoose.Types.ObjectId(creatUser?._id),
  //     channel: {
  //       push: true,
  //       email: true,
  //       inApp: true,
  //     },
  //     directmsg: true,
  //     app: {
  //       product_updates: true,
  //       special_offers: true,
  //     },
  //     event: {
  //       event_invitations: true,
  //       event_changes: true,
  //       event_reminders: true,
  //     },
  //   });

  return creatUser;
};

// GET ALL USERS
const getAllUserService = async (query: Record<string, string | boolean>, userId: string) => {
  const filter: any = { isDeleted: false };


  const queryBuilder = new QueryBuilder(User.find(filter), query as Record<string, string>);

  const users = await queryBuilder
    .filter()
    .textSearch(["fullName", "email", "bio", "location"])
    .select()
    .sort()
    .paginate()
    .build();

  const meta = await queryBuilder.getMeta();

  return {
    meta,
    users,
  };
};

// GET ME
const getMeService = async (userId: string) => {
  const user = await User.aggregate([
    // Stage 1: Matching
    { $match: { _id: new Types.ObjectId(userId) } },

    // Stage 2: Lookup for people the user is following
    {
      $lookup: {
        from: "follows",
        localField: "_id",
        foreignField: "follower",
        as: "following",
      },
    },

    // Stage 3: Lookup for people following the user
    {
      $lookup: {
        from: "follows",
        localField: "_id",
        foreignField: "following",
        as: "followers",
      },
    },

    // Lookup for user's listings
    {
      $lookup: {
        from: "listings",
        localField: "_id",
        foreignField: "sellerId",
        as: "listings",
      },
    },

    // Stage 4: Add counts
    {
      $addFields: {
        followingCount: { $size: "$following" },
        followerCount: { $size: "$followers" },
        listingCount: { $size: "$listings" },
      },
    },

    // Projection
    {
      $project: {
        password: 0,
        interests: 0,
        following: 0, // remove the array
        followers: 0, // remove the array
        listings: 0, // remove the array
      },
    },
  ]);

  if (!user || user.length === 0) {
    throw new AppError(404, "User not found");
  }

  // Normalize the date to remove time part
  const normalizeDate = (date: Date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0); // Set time to midnight
    return normalizedDate;
  };

  const todayNormalized = normalizeDate(new Date());

  // Update user activity for the day
  //   await UserActivity.updateOne(
  //     { user: new Types.ObjectId(userId), date: todayNormalized }, // match user + normalized date
  //     { $setOnInsert: { createdAt: new Date() } }, // insert only if missing
  //     { upsert: true } // create if missing
  //   );

  return user[0];
};

// GET PROFILE
const getProfileService = async (
  profileUserId: string,
  currentUserId?: string,
) => {
  if (!profileUserId) {
    throw new AppError(400, "User ID is required");
  }

  const _user = await User.aggregate([
    // Stage 1: Matching
    { $match: { _id: new Types.ObjectId(profileUserId) } },

    // Stage 2: Lookup for people the user is following
    {
      $lookup: {
        from: "follows",
        localField: "_id",
        foreignField: "follower",
        as: "following",
      },
    },

    // Stage 3: Lookup for people following the user
    {
      $lookup: {
        from: "follows",
        localField: "_id",
        foreignField: "following",
        as: "followers",
      },
    },

    // Stage 4: Lookup for user's posts
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "userId",
        as: "posts",
      },
    },

    // Lookup for users's listing
    {
      $lookup: {
        from: "listings",
        localField: "_id",
        foreignField: "sellerId",
        as: "listings",
      },
    },

    // Stage 5: Add counts
    {
      $addFields: {
        followingCount: { $size: "$following" },
        followerCount: { $size: "$followers" },
        postCount: { $size: "$posts" },
        listingCount: { $size: "$listings" },
      },
    },

    // Projection
    {
      $project: {
        password: 0,
        following: 0, // remove the array
        followers: 0, // remove the array
        posts: 0, // remove the array
        listings: 0, // remove the array
      },
    },
  ]);

  const user = _user[0];
  if (!user) {
    throw new AppError(404, "User not found");
  }

  // Check if the current user is following this user
  if (currentUserId) {
    const isFollowing = await Follow.findOne({
      follower: currentUserId,
      following: profileUserId,
    });
    user.isFollowing = !!isFollowing;
  } else {
    user.isFollowing = false;
  }

  return user;
};

// USER UPDATE
const userUpdateService = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload,
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
  }

  // USER & ORGANIZER can ONLY update their own profile - Only admin can update others
  // if (
  //   (decodedToken.role === Role.USER || decodedToken.role === Role.ORGANIZER) &&
  //   decodedToken.userId !== userId
  // ) {
  //   throw new AppError(
  //     StatusCodes.FORBIDDEN,
  //     'You can only update your own profile'
  //   );
  // }

  // Delete previous avatar from cloudinary
  if (payload.avatar && user.avatar) {
    deleteImageFromCLoudinary(user?.avatar as string);
  }

  // Block password update from this route
  if (payload.password) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You can't update your password from this route!",
    );
  }

  // Role update protection
  if (payload.role) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.ADMIN) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "You are not allowed to update roles!",
      );
    }
  }

  // USER & ORGANIZER cannot update isActive, isDeleted, isVerified
  if (
    payload?.isActive !== undefined ||
    payload?.isDeleted !== undefined ||
    payload?.isVerified !== undefined
  ) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.ADMIN) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "You are not allowed to update account status!",
      );
    }
  }

  // PREVENT BLOCKED - INACTIVE, IF USER IS ADMIN
  if (
    payload.isActive === IsActive.INACTIVE ||
    payload.isActive === IsActive.BLOCKED ||
    payload.isDeleted === true
  ) {
    if (user.role === Role.ADMIN) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "Admin can't disabled himself!",
      );
    }
  }

  // Update Locations
  if (payload.location) {
    user.location = payload.location;
  }

  // FIELD WHITELISTING for USER & ORGANIZER
  if (decodedToken.role === Role.USER || decodedToken.role === Role.ADMIN) {
    const allowedUpdates = [
      "fullName",
      "avatar",
      "fcmToken",
      "bio",
      "location",
    ];

    Object.keys(payload).forEach((key) => {
      if (!allowedUpdates.includes(key)) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          `You are not allowed to update: ${key}`,
        );
      }
    });
  }

  // Update User
  const updatedUser = await User.findByIdAndUpdate(
    new Types.ObjectId(userId),
    payload,
    {
      new: true,
      runValidators: true,
    },
  );

  return updatedUser;
};

// DELETE USER
const userDeleteService = async (userId: string, decodedToken: JwtPayload) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
  }

  if (user.isDeleted) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User already deleted!");
  }

  const allowedRoles = [Role.ADMIN];

  if (!allowedRoles.includes(decodedToken.role)) {
    if (decodedToken.userId !== userId) {
      throw new AppError(StatusCodes.FORBIDDEN, "You can't delete others!");
    }
  }

  user.isDeleted = true;
  await user.save();

  return null;
};

// SEND VERIFICATION OTP
const verifyUserService = async (userId: string) => {
  const findUser = await User.findOne({ _id: userId });
  if (!findUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User not found!");
  }

  //   const phoneNumber = findUser.phone;
  //   const otp = randomOTPGenerator(100000, 999999);

  //   await redisClient.set(`${phoneNumber}`, otp, {
  //     EX: 300,
  //   });

  //    await twilio.messages.create({
  //       to: findUser.phone as string,
  //       body: `Your verification code is: ${otp}. This code will expire in 5 minutes. Do not share this code with anyone.`
  //   });

  return null;
};

// VERIFY OTP AND VERIFY USER
const verifyOTPService = async (phoneNumber: string, otp: string) => {
  const findUser = await User.findOne({ phone: phoneNumber });
  if (!findUser) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "User not found by this phone number!",
    );
  }

  if (otp.length !== 6) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid OTP!");
  }

  const getOTP = await redisClient.get(`${phoneNumber}`);
  if (!getOTP) {
    throw new AppError(StatusCodes.BAD_REQUEST, "OTP has expired or invalid!");
  }

  if (getOTP !== otp) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid isn't matched!");
  }

  if (findUser.isVerified) {
    throw new AppError(StatusCodes.BAD_REQUEST, "You are already verified!");
  }

  findUser.isVerified = true;
  await findUser.save();

  return null;
};

const purchaseBadgeService = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
  }

  // Here you would implement the payment logic.
  // For now, we simulate a successful payment.

  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);

  user.verifiedBadge = true;
  user.verifiedBadgeExpiration = expirationDate;

  await user.save();

  return user;
};

const updateSuspendStatusService = async (
  userId: string,
  isActive: IsActive,
  decodedToken: JwtPayload,
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found!");
  }

  if (user.role === Role.ADMIN) {
    throw new AppError(StatusCodes.FORBIDDEN, "Admins cannot be suspended!");
  }

  user.isActive = isActive;

  await user.save();

  return user;
};



const recentUsers = async () => {
  const data = await User.find({role : {$ne : 'ADMIN'}})
    .sort({ createdAt: -1 }).select('-auths -isDeleted -bio -updatedAt')
    .limit(9);

  return data;
};


// EXPORT ALL SERVICE
export const userServices = {
  createUserService,
  verifyOTPService,
  verifyUserService,
  getMeService,
  userUpdateService,
  userDeleteService,
  getAllUserService,
  purchaseBadgeService,
  updateSuspendStatusService,
  getProfileService,
  recentUsers
};
