import { StatusCodes } from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import { Like } from './like.model';
import  Post  from '../post/post.model';
import { NotificationService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notifications.interface';
import { Types } from 'mongoose';

const likePost = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  }

  const alreadyLiked = await Like.isLikedByUser(postId, userId);

  if (alreadyLiked) {
    throw new AppError(StatusCodes.CONFLICT, 'Post already liked');
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const like = await Like.create({ postId, userId });

  // Create notification
  if (post.userId.toString() !== userId) { // Do not notify if you like your own post
    await NotificationService.createNotification({
        userId: post.userId, // author of the post
        actorId: new Types.ObjectId(userId),
        type: NotificationType.LIKE,
        entity: {
            postId: post._id,
            likeId: like._id,
        },
        isRead: false,
    });
  }

  return like;
};

const unlikePost = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  }

  const liked = await Like.isLikedByUser(postId, userId);

  if (!liked) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not liked yet');
  }
   // @ts-ignore
  await Like.findByIdAndDelete(liked._id);

  return null;
};

const getLikesForPost = async (postId: string) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
  }

  const result = await Like.find({ postId }).populate('userId');
  return result;
};

export const LikeService = {
  likePost,
  unlikePost,
  getLikesForPost,
};
