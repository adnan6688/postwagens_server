import { Request, Response } from 'express';
import {CatchAsync} from '../../utils/CatchAsync';
import { AnalyticsServices } from './analytics.service';
import {SendResponse} from '../../utils/SendResponse';
import httpStatus from 'http-status-codes';

const getAnalyticsSummary = CatchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsServices.getAnalyticsSummary();
  SendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Analytics summary fetched successfully',
    data: result,
  });
});

const getUserGrowth = CatchAsync(async (req: Request, res: Response) => {
  const { range } = req.query;
  const result = await AnalyticsServices.getUserGrowth(range as string);
  SendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User growth fetched successfully',
    data: result,
  });
});

const getTopListings = CatchAsync(async (req: Request, res: Response) => {
  const result = await AnalyticsServices.getTopListings();
  SendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Top listings fetched successfully',
    data: result,
  });
});

export const AnalyticsControllers = {
  getAnalyticsSummary,
  getUserGrowth,
  getTopListings,
};
