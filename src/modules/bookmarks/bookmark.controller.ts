import { StatusCodes } from 'http-status-codes';
import { CatchAsync } from '../../utils/CatchAsync';
import { BookmarkService } from './bookmark.service';
import { SendResponse } from '../../utils/SendResponse';

const addBookmark = CatchAsync(async (req, res) => {
  const { listingId } = req.params;
  // @ts-ignore
  const userId = req.user.userId;
  // @ts-ignore
  const result = await BookmarkService.addBookmark(listingId, userId);
  SendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Listing bookmarked successfully',
    data: result,
  });
});

const removeBookmark = CatchAsync(async (req, res) => {
  const { listingId } = req.params;
  // @ts-ignore
  const userId = req.user.userId;
  // @ts-ignore
  await BookmarkService.removeBookmark(listingId, userId);
  SendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Listing bookmark removed successfully',
    data: null,
  });
});

const getBookmarksForUser = CatchAsync(async (req, res) => {
  // @ts-ignore
    const userId = req.user.userId;
    const result = await BookmarkService.getBookmarksForUser(userId);
    SendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Bookmarks retrieved successfully',
        data: result,
    });
});

export const BookmarkController = {
  addBookmark,
  removeBookmark,
  getBookmarksForUser,
};
