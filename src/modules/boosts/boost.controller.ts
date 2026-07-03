import { StatusCodes } from 'http-status-codes';
import { CatchAsync } from '../../utils/CatchAsync';
import { BoostService } from './boost.service';
import { SendResponse } from '../../utils/SendResponse';

// ListingBoost controllers
const boostListing = CatchAsync(async (req, res) => {
  // @ts-ignore
  const userId = req.user.userId;
  const result = await BoostService.boostListing(req.body, userId);
  SendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Listing boosted successfully',
    data: result,
  });
});

const getListingBoosts = CatchAsync(async (req, res) => {
  const { listingId } = req.params;
  // @ts-ignore
  const result = await BoostService.getListingBoosts(listingId);
  SendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Listing boosts retrieved successfully',
    data: result,
  });
});

const getUserBoosts = CatchAsync(async (req, res) => {
  // @ts-ignore
  const userId = req.user.userId;
  const result = await BoostService.getUserBoosts(userId);
  SendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User boosts retrieved successfully',
    data: result,
  });
});

const getActiveBoosts = CatchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await BoostService.getActiveBoosts(page, limit,);

  SendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Active boosts retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});
const getRevenueOverview = CatchAsync(async (req, res) => {
  const year = Number(req.query.year || new Date().getFullYear());
  const result = await BoostService.getRevenueOverview(year);
  SendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Revenue overview retrieved successfully',
    data: result,
  });
});


const getBoostStats = CatchAsync(async (req, res) => {
  const result = await BoostService.getBoostStats()

  SendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Boost stats',
    data: result
  })
})

export const BoostController = {
  boostListing,
  getListingBoosts,
  getUserBoosts,
  getActiveBoosts,
  getRevenueOverview,
  getBoostStats
};
