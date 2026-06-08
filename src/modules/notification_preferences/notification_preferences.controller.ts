import { RequestHandler } from 'express';
import {CatchAsync} from '../../utils/CatchAsync';
import { NotificationPreferenceService } from './notification_preferences.service';
import {SendResponse} from '../../utils/SendResponse';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';

const getMyPreferences: RequestHandler = CatchAsync(async (req, res) => {
  const { userId } = req.user as JwtPayload;
  const result = await NotificationPreferenceService.getPreferences(userId);
  SendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notification preferences retrieved successfully',
    data: result,
  });
});

const updateMyPreferences: RequestHandler = CatchAsync(async (req, res) => {
  const { userId } = req.user as JwtPayload;
  const { preferences } = req.body;
  const result = await NotificationPreferenceService.updatePreferences(userId, preferences);
  SendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notification preferences updated successfully',
    data: result,
  });
});

export const NotificationPreferenceController = {
  getMyPreferences,
  updateMyPreferences,
};
