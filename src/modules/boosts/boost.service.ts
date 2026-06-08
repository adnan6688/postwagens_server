import { StatusCodes } from 'http-status-codes';
import AppError from '../../errorHelpers/AppError';
import Listing from '../listing/listing.model';
import { Boost } from './boost.model';

// ListingBoost services
const boostListing = async (payload: any, userId: string) => {
  const { listingId, productId, name, price, duration, durationDays } = payload;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Listing not found');
  }

  // Check for an existing active boost for this listing
  const existingBoost = await Boost.findOne({
    listingId: listingId,
    endAt: { $gte: new Date() },
  });
  if (existingBoost) {
    throw new AppError(
      StatusCodes.CONFLICT,
      'This listing is already boosted.',
    );
  }

  const startAt = new Date();
  const endAt = new Date();
  endAt.setDate(startAt.getDate() + (durationDays || duration));

  // Create the boost document
  await Boost.create({
    listingId,
    userId,
    productId,
    name,
    price,
    durationDays: durationDays || duration,
    startAt,
    endAt,
  });

  // Update the listing to set isBoosted to true
  const updatedListing = await Listing.findByIdAndUpdate(
    listingId,
    { isBoosted: true },
    { new: true },
  );

  return updatedListing;
};

const getListingBoosts = async (listingId: string) => {
  const boosts = await Boost.find({ listingId });
  return boosts;
};

const getUserBoosts = async (userId: string) => {
  const boosts = await Boost.find({ userId }).populate('listingId userId');
  return boosts;
};

const getActiveBoosts = async () => {
  const boosts = await Boost.find({ endAt: { $gte: new Date() } }).populate(
    'listingId userId',
    'fullName avatar isVerified title description price imagesAndVideos category location condition',
  );
  return boosts;
};

const getRevenueOverview = async (year: number) => {
  const result = await Boost.aggregate([
    {
      $match: {
        $expr: {
          $eq: [{ $year: '$createdAt' }, year],
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        totalRevenue: { $sum: '$price' },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
      },
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        totalRevenue: 1,
      },
    },
  ]);
  return result;
};

export const BoostService = {
  boostListing,
  getListingBoosts,
  getUserBoosts,
  getActiveBoosts,
  getRevenueOverview,
};
