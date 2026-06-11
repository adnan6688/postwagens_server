import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IImageAndVideo, TPost } from "./post.interface";
import Post from "./post.model";
import { JwtPayload } from "jsonwebtoken";
import {
  deleteImageFromCLoudinary,
  uploadBufferToCloudinary,
} from "../../config/cloudinary.config";
import "../users/user.model";
import { BoostService } from "../boosts/boost.service";
import mongoose from "mongoose";


// Create Post
const createPostService = async (payload: TPost, user: JwtPayload, files: Express.Multer.File[],) => {
  payload.userId = user.userId;

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

  const post = await Post.create(payload);
  return post;
};

// Get My Posts
const getMyPostsService = async (user: JwtPayload) => {


  const posts = await Post.find({ userId: user.userId }).populate(
    "userId",
    "fullName email",
  );

  return posts;
};

// Get Posts By User Id
const getPostsByUserIdService = async (userId: string) => {
  const posts = await Post.find({ userId: userId }).populate(
    "userId",
    "fullName email",
  );
  return posts;
};

// const getAllPostsService = async (query: Record<string, any>, user: JwtPayload) => {


//   const page = Number(query.page) || 1;
//   const limit = Number(query.limit) || 10;
//   const sort = query.sort || "-createdAt";
//   const searchTerm = query.searchTerm;

//   const pipeline: any[] = [];

//   pipeline.push({
//     $lookup: {
//       from: "users",
//       localField: "userId",
//       foreignField: "_id",
//       as: "user",
//     },
//   });

//   pipeline.push({
//     $unwind: "$user",
//   });

//   if (searchTerm) {
//     pipeline.push({
//       $match: {
//         $or: [
//           { text: { $regex: searchTerm, $options: "i" } },
//           { "user.fullName": { $regex: searchTerm, $options: "i" } },
//         ],
//       },
//     });
//   }

//   const excludeField = ["page", "limit", "sort", "fields", "searchTerm"];
//   const filter: Record<string, any> = {};
//   filter.isDeleted = false;




//   for (const key in query) {
//     if (!excludeField.includes(key)) {
//       filter[key] = query[key];
//     }
//   }
//   if (Object.keys(filter).length > 0) {
//     pipeline.push({ $match: filter });
//   }

//   pipeline.push({
//     $lookup: {
//       from: "likes",
//       localField: "_id",
//       foreignField: "postId",
//       as: "likes",
//     },
//   });

//   pipeline.push({
//     $lookup: {
//       from: "comments",
//       localField: "_id",
//       foreignField: "postId",
//       as: "comments",
//     },
//   });

//   if (user) {
//     pipeline.push({
//       $lookup: {
//         from: "likes",
//         let: { postId: "$_id" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$postId", "$$postId"] },
//                   {
//                     $eq: ["$userId", new mongoose.Types.ObjectId(user.userId)],
//                   },
//                 ],
//               },
//             },
//           },
//         ],
//         as: "userLike",
//       },
//     });
//     pipeline.push({
//       $addFields: {
//         isLiked: { $gt: [{ $size: "$userLike" }, 0] },
//         likeCount: { $size: "$likes" },
//         commentCount: { $size: "$comments" },
//       },
//     });

//     pipeline.push({
//       $lookup: {
//         from: "blockedusers",
//         let: { sellerId: "$user._id" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$blockedUserid", "$$sellerId"] },
//                   {
//                     $eq: [
//                       "$blockerUserid",
//                       new mongoose.Types.ObjectId(user.userId),
//                     ],
//                   },
//                   { $eq: ["$isBlocked", true] },
//                 ],
//               },
//             },
//           },
//         ],
//         as: "blocked",
//       },
//     });

//     pipeline.push({
//       $match: {
//         blocked: { $size: 0 },
//       },
//     });

//     pipeline.push({
//       $match: {
//         $or: [
//           { blocked: { $size: 0 } },
//           { type: { $ne: "boost" } },
//         ],
//       },
//     });

//   } else {
//     pipeline.push({
//       $addFields: {
//         isLiked: false,
//         likeCount: { $size: "$likes" },
//         commentCount: { $size: "$comments" },
//       },
//     });
//   }

//   const sortStage: Record<string, any> = {};
//   if (sort) {
//     const [field, order] = sort.startsWith("-")
//       ? [sort.slice(1), -1]
//       : [sort, 1];
//     sortStage[field] = order;
//     pipeline.push({ $sort: sortStage });
//   }

//   pipeline.push({ $skip: (page - 1) * limit });
//   pipeline.push({ $limit: limit });

//   pipeline.push({
//     $project: {
//       userLike: 0,
//       likes: 0,
//       comments: 0,
//       "user.password": 0,
//       userId: 0,
//     },
//   });

//   const result = await Post.aggregate(pipeline);

//   const total = await Post.countDocuments(filter);
//   const meta = {
//     page,
//     limit,
//     total,
//     totalPages: Math.ceil(total / limit),
//   };

//   let activeBoosts = await BoostService.getActiveBoosts();

//   const shuffleArray = (array: any[]) => {
//     for (let i = array.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [array[i], array[j]] = [array[j], array[i]];
//     }
//     return array;
//   };
//   activeBoosts = shuffleArray(activeBoosts);

//   const combinedFeed: any[] = [];
//   const injectionInterval = 1;
//   const boostsPerPage = Math.floor(limit / injectionInterval);
//   const startBoostIndex = (page - 1) * boostsPerPage;
//   const endBoostIndex = startBoostIndex + boostsPerPage;
//   const boostsForThisPage = activeBoosts.slice(startBoostIndex, endBoostIndex);

//   let boostIndex = 0;
//   result.forEach((post: any, index: number) => {
//     combinedFeed.push({ type: "post", data: post });
//     if (
//       (index + 1) % injectionInterval === 0 &&
//       boostIndex < boostsForThisPage.length
//     ) {
//       combinedFeed.push({ type: "boost", data: boostsForThisPage[boostIndex] });
//       boostIndex++;
//     }
//   });

//   return {
//     meta,
//     result: combinedFeed,
//   };
// };





const getAllPostsService = async (query: Record<string, any>, user: JwtPayload) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const sort = query.sort || "-createdAt";
  const searchTerm = query.searchTerm;

  const pipeline: any[] = [];

  // ======================
  // USER JOIN
  // ======================
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user",
    },
  });

  pipeline.push({
    $unwind: "$user",
  });

  // ======================
  // SEARCH
  // ======================
  if (searchTerm) {
    pipeline.push({
      $match: {
        $or: [
          { text: { $regex: searchTerm, $options: "i" } },
          { "user.fullName": { $regex: searchTerm, $options: "i" } },
        ],
      },
    });
  }

  // ======================
  // DYNAMIC FILTER
  // ======================
  const excludeField = ["page", "limit", "sort", "fields", "searchTerm"];
  const filter: Record<string, any> = { isDeleted: false };

  for (const key in query) {
    if (!excludeField.includes(key)) {
      filter[key] = query[key];
    }
  }

  if (Object.keys(filter).length > 0) {
    pipeline.push({ $match: filter });
  }

  // ======================
  // LIKES + COMMENTS
  // ======================
  pipeline.push({
    $lookup: {
      from: "likes",
      localField: "_id",
      foreignField: "postId",
      as: "likes",
    },
  });

  pipeline.push({
    $lookup: {
      from: "comments",
      localField: "_id",
      foreignField: "postId",
      as: "comments",
    },
  });

  // ======================
  // USER LIKE + BLOCK FILTER ONLY IF LOGGED IN
  // ======================
  if (user) {
    // check if user liked
    pipeline.push({
      $lookup: {
        from: "likes",
        let: { postId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$postId", "$$postId"] },
                  {
                    $eq: [
                      "$userId",
                      new mongoose.Types.ObjectId(user.userId),
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: "userLike",
      },
    });

    pipeline.push({
      $addFields: {
        isLiked: { $gt: [{ $size: "$userLike" }, 0] },
        likeCount: { $size: "$likes" },
        commentCount: { $size: "$comments" },
      },
    });

    // ======================
    // BLOCKED USERS FILTER (IMPORTANT)
    // ======================
    pipeline.push({
      $lookup: {
        from: "blockedusers",
        let: { sellerId: "$user._id" },
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
                  { $eq: ["$isBlocked", true] },
                ],
              },
            },
          },
        ],
        as: "blocked",
      },
    });

    // 👉 FINAL BLOCK FILTER
    pipeline.push({
      $match: {
        blocked: { $size: 0 },
      },
    });
  } else {
    pipeline.push({
      $addFields: {
        isLiked: false,
        likeCount: { $size: "$likes" },
        commentCount: { $size: "$comments" },
      },
    });
  }

  // ======================
  // SORT
  // ======================
  const sortStage: Record<string, any> = {};

  const [field, order] = sort.startsWith("-")
    ? [sort.slice(1), -1]
    : [sort, 1];

  sortStage[field] = order;

  pipeline.push({ $sort: sortStage });

  // ======================
  // PAGINATION
  // ======================
  pipeline.push({ $skip: (page - 1) * limit });
  pipeline.push({ $limit: limit });

  // ======================
  // CLEAN RESPONSE
  // ======================
  pipeline.push({
    $project: {
      userLike: 0,
      likes: 0,
      comments: 0,
      "user.password": 0,
      userId: 0,
    },
  });

  // ======================
  // EXECUTE
  // ======================
  const result = await Post.aggregate(pipeline);

  const total = await Post.countDocuments(filter);

  const meta = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };

  // ======================
  // BOOST FEED MIX (JS SIDE)
  // ======================
  let activeBoosts = await BoostService.getActiveBoosts();

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  activeBoosts = shuffleArray(activeBoosts);

  const combinedFeed: any[] = [];
  const injectionInterval = 1;
  const boostsPerPage = Math.floor(limit / injectionInterval);

  const startBoostIndex = (page - 1) * boostsPerPage;
  const endBoostIndex = startBoostIndex + boostsPerPage;

  const boostsForThisPage = activeBoosts.slice(
    startBoostIndex,
    endBoostIndex
  );

  let boostIndex = 0;

  result.forEach((post: any, index: number) => {
    combinedFeed.push({ type: "post", data: post });

    if (
      (index + 1) % injectionInterval === 0 &&
      boostIndex < boostsForThisPage.length
    ) {
      combinedFeed.push({
        type: "boost",
        data: boostsForThisPage[boostIndex],
      });
      boostIndex++;
    }
  });

  return {
    meta,
    result: combinedFeed,
  };
};

const getSinglePostService = async (id: string, user?: JwtPayload) => {
  const pipeline: any[] = [
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "postId",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "postId",
        as: "comments",
      },
    },
  ];

  if (user) {
    pipeline.push({
      $lookup: {
        from: "likes",
        let: { postId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$postId", "$$postId"] },
                  {
                    $eq: ["$userId", new mongoose.Types.ObjectId(user.userId)],
                  },
                ],
              },
            },
          },
        ],
        as: "userLike",
      },
    });
    pipeline.push({
      $addFields: {
        isLiked: { $gt: [{ $size: "$userLike" }, 0] },
        likeCount: { $size: "$likes" },
        commentCount: { $size: "$comments" },
      },
    });
  } else {
    pipeline.push({
      $addFields: {
        isLiked: false,
        likeCount: { $size: "$likes" },
        commentCount: { $size: "$comments" },
      },
    });
  }

  pipeline.push({
    $project: {
      userLike: 0,
      likes: 0,
      comments: 0,
      "user.password": 0,
      userId: 0,
    },
  });

  const result = await Post.aggregate(pipeline);

  if (result.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, "Post not found");
  }

  return result[0];
};

// Update Post
const updatePostService = async (
  id: string,
  payload: Partial<TPost>,
  user: JwtPayload,
  files: Express.Multer.File[],
) => {
  const post = await Post.findById(id);

  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, "Post not found");
  }

  if (post.userId.toString() !== user.userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to update this post",
    );
  }

  // Update text fields from payload
  if (payload.text) {
    post.text = payload.text;
  }

  if (files && files.length > 0) {
    if (!post.imagesAndVideos) {
      post.imagesAndVideos = [];
    }

    for (const file of files) {
      const uploadedFile = await uploadBufferToCloudinary(
        file.buffer,
        file.originalname,
      );
      if (uploadedFile) {
        post.imagesAndVideos.push({
          type: file.mimetype.startsWith("image") ? "image" : "video",
          url: uploadedFile.secure_url,
        });
      }
    }
  }

  const updatedPost = await post.save();

  return updatedPost;
};

// Delete Post
const deletePostService = async (id: string, user: JwtPayload) => {
  const post = await Post.findById(id);

  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, "Post not found");
  }

  if (post.userId.toString() !== user.userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to delete this post",
    );
  }

  // Delete images from Cloudinary before deleting the post
  if (post.imagesAndVideos && post.imagesAndVideos.length > 0) {
    for (const imageUrl of post.imagesAndVideos) {
      await deleteImageFromCLoudinary(imageUrl.url);
    }
  }

  await Post.findByIdAndDelete(id);

  return null;
};

// delete post media service
const deletePostMediaService = async (
  postId: string,
  mediaUrl: string,
  user: JwtPayload,
) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, "Post not found");
  }

  if (post.userId.toString() !== user.userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to delete media from this post",
    );
  }

  // Delete image from Cloudinary
  await deleteImageFromCLoudinary(mediaUrl);

  // Remove media from post
  const updatedImagesAndVideos = (post.imagesAndVideos || []).filter(
    (media) => decodeURIComponent(media.url) !== mediaUrl,
  );

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    { imagesAndVideos: updatedImagesAndVideos },
    { new: true, runValidators: true },
  );

  return updatedPost;
};

export const postServices = {
  createPostService,
  getMyPostsService,
  getAllPostsService,
  getSinglePostService,
  updatePostService,
  deletePostService,
  getPostsByUserIdService,
  deletePostMediaService,
};
