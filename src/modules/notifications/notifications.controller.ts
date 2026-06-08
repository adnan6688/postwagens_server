import { RequestHandler } from 'express';
import {CatchAsync} from '../../utils/CatchAsync';
import { NotificationService } from './notifications.service';
import {SendResponse} from '../../utils/SendResponse';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';

const getMyNotifications: RequestHandler = CatchAsync(async (req, res) => {
  const { userId } = req.user as JwtPayload;
  const { type, page, limit } = req.query;
  const result = await NotificationService.getNotificationsForUser(userId, {
    type: type as string,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  SendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notifications retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const markAsRead: RequestHandler = CatchAsync(async (req, res) => {
  const { notificationId } = req.params;
  // @ts-ignore
  const result = await NotificationService.markAsRead(notificationId);
  SendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notification marked as read',
    data: result,
  });
});

const markAllAsRead: RequestHandler = CatchAsync(async (req, res) => {
    const { userId } = req.user as JwtPayload;
    await NotificationService.markAllAsRead(userId);
    SendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'All notifications marked as read',
      data: null,
    });
  });

export const NotificationController = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
