import { Request, Response } from 'express';
import { CatchAsync } from '../../utils/CatchAsync';
import { SendResponse } from '../../utils/SendResponse';
import { postServices } from './post.service';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';

// Create Post
const createPost = CatchAsync(async (req: Request, res: Response) => {
  const result = await postServices.createPostService(
    req.body,
    req.user as JwtPayload,
    req.files as Express.Multer.File[],
  );

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Post created successfully!',
    data: result,
  });
});

// Get My Posts
const getMyPosts = CatchAsync(async (req: Request, res: Response) => {
  const result = await postServices.getMyPostsService(req.user as JwtPayload);

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'My posts fetched successfully!',
    data: result,
  });
});

// Get All Posts
const getAllPosts = CatchAsync(async (req: Request, res: Response) => {
  const sanitizedQuery: Record<string, string> = {};
  for (const key in req.query) {
    const value = req.query[key];
    if (typeof value === 'string') {
      sanitizedQuery[key] = value;
    } else if (Array.isArray(value)) {
      sanitizedQuery[key] = value.join(',');
    }
  }

  const { meta, result } = await postServices.getAllPostsService(
    sanitizedQuery,
    req.user as JwtPayload,
  );

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Posts fetched successfully!',
    meta,
    data: result,
  });
});

// Get Single Post
const getSinglePost = CatchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as JwtPayload | undefined;
  const result = await postServices.getSinglePostService(id as string, user);

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post fetched successfully!',
    data: result,
  });
});

// Update Post
const updatePost = CatchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await postServices.updatePostService(
    id as string,
    req.body,
    req.user as JwtPayload,
    req.files as Express.Multer.File[],
  );

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post updated successfully!',
    data: result,
  });
});

// Get Posts By User Id
const getPostsByUserId = CatchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const result = await postServices.getPostsByUserIdService(userId as string);

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Posts fetched successfully!',
    data: result,
  });
});

// Delete Post
const deletePost = CatchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await postServices.deletePostService(id as string, req.user as JwtPayload);

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post deleted successfully!',
    data: null,
  });
});

// Delete Post Media
const deletePostMedia = CatchAsync(async (req: Request, res: Response) => {
  const { postId, mediaUrl } = req.query;
  const result = await postServices.deletePostMediaService(
    postId as string,
    mediaUrl as string,
    req.user as JwtPayload,
  );

  SendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post media deleted successfully!',
    data: result,
  });
});

export const postControllers = {
  createPost,
  getMyPosts,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
  getPostsByUserId,
  deletePostMedia,
};
