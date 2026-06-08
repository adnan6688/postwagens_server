import { StatusCodes } from 'http-status-codes';
import { CatchAsync } from '../../utils/CatchAsync';
import { LikeService } from './like.service';
import { SendResponse } from '../../utils/SendResponse';

const likePost = CatchAsync(async (req, res) => {
  const { id } = req.params;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const userId = req.user.userId; // Assuming user is available in the request
  const result = await LikeService.likePost(id as string, userId);
  SendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Post liked successfully',
    data: result,
  });
});

const unlikePost = CatchAsync(async (req, res) => {
  const { id } = req.params;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const userId = req.user.userId; // Assuming user is available in the request
  await LikeService.unlikePost(id as string, userId);
  SendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Post unliked successfully',
    data: null,
  });
});

const getLikesForPost = CatchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await LikeService.getLikesForPost(id as string);
  SendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Likes for the post retrieved successfully',
    data: result,
  });
});

export const LikeController = {
  likePost,
  unlikePost,
  getLikesForPost,
};
