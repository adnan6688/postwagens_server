import { StatusCodes } from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import { Bookmark } from './bookmark.model';
import Listing from '../listing/listing.model';

const addBookmark = async (listingId: string, userId: string) => {
  const listing = await Listing.findById(listingId);

  if (!listing) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Listing not found');
  }

  const alreadyBookmarked = await Bookmark.findOne({ listingId, userId });

  if (alreadyBookmarked) {
    throw new AppError(StatusCodes.CONFLICT, 'Listing already bookmarked');
  }

  const result = await Bookmark.create({ listingId, userId });
  return result;
};

const removeBookmark = async (listingId: string, userId: string) => {
  const listing = await Listing.findById(listingId);

  if (!listing) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Listing not found');
  }

  const bookmarked = await Bookmark.findOne({ listingId, userId });

  if (!bookmarked) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Listing not bookmarked yet');
  }

  await Bookmark.findByIdAndDelete(bookmarked._id);

  return null;
};

const getBookmarksForUser = async (userId: string) => {
    const result = await Bookmark.find({ userId }).populate('listingId');
    return result;
};

export const BookmarkService = {
  addBookmark,
  removeBookmark,
  getBookmarksForUser,
};
