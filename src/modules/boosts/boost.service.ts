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

const getActiveBoosts = async (page = 1, limit = 10,) => {
  const skip = (page - 1) * limit;

  const filter = {
    endAt: { $gte: new Date() },
  };

  const total = await Boost.countDocuments(filter);

  const boosts = await Boost.find(filter).populate({
    path: 'listingId',
    select: '+imagesAndVideos title price viewCount',
  })
    .populate({
      path: 'userId',
      select: 'fullName',
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPages = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages
    },
    data: boosts,
  };
};


const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const getRevenueOverview = async (year: number) => {
  const result = await Boost.aggregate([
    {
      $match: {
        $expr: {
          $eq: [{ $year: "$createdAt" }, year],
        },
      },
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        totalRevenue: { $sum: "$price" },
      },
    },
    {
      $sort: { "_id.month": 1 },
    },
  ]);

  // normalize for frontend chart
  const formatted = monthNames.map((name, index) => {
    const found = result.find(r => r._id.month === index + 1);

    return {
      month: name,
      totalRevenue: found?.totalRevenue || 0,
    };
  });

  return formatted;
};




const getBoostStats = async () => {
  const now = new Date();

  const [totalBoosts, activeBoosts, expiredBoosts, revenue] =
    await Promise.all([
      Boost.countDocuments(),

      Boost.countDocuments({
        startAt: { $lte: now },
        endAt: { $gte: now },
      }),

      Boost.countDocuments({
        endAt: { $lt: now },
      }),

      Boost.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$price" },
          },
        },
      ]),
    ]);

  return {
    totalBoosts,
    activeBoosts,
    expiredBoosts,
    totalRevenue: revenue[0]?.total || 0,
  };
};

export const BoostService = {
  boostListing,
  getListingBoosts,
  getUserBoosts,
  getActiveBoosts,
  getRevenueOverview,
  getBoostStats
};
