import { RequestHandler } from 'express';
import {CatchAsync} from '../../utils/CatchAsync';
import { FollowService } from './follow.service';
import { SendResponse } from '../../utils/SendResponse';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';

const toggleFollow: RequestHandler = CatchAsync(async (req, res) => {
  const { userId } = req.params;
  // @ts-ignore
  const followerId = req.user?.userId;

  if (userId === followerId) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'You cannot follow/unfollow yourself');
  }

  const result = await FollowService.toggleFollow(followerId, userId as string);

  SendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.following ? 'User followed successfully' : 'User unfollowed successfully',
    data: result,
  });
});

const getFollowers: RequestHandler = CatchAsync(async (req, res) => {
  const { userId } = req.params;
  const result = await FollowService.getFollowers(userId as string);

  SendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Followers retrieved successfully',
    data: result,
  });
});

const getFollowing: RequestHandler = CatchAsync(async (req, res) => {
  const { userId } = req.params;
  const result = await FollowService.getFollowing(userId as string);

  SendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Following retrieved successfully',
    data: result,
  });
});


export const FollowController = {
  toggleFollow,
  getFollowers,
  getFollowing,
};