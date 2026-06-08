import { getSocketIo, isUserOnline } from '../../socket/socket';
import { INotification } from './notifications.interface';
import { Notification } from './notifications.model';
import User from '../users/user.model';
import fcm  from '../../config/firebase.config';
import { NotificationHelper } from './notification.helper';


const createNotification = async (payload: INotification) => {

  console.log("createNotification called");
  console.log("payload:", payload);

  const notification = await Notification.create(payload);

  if (!notification.userId) {
    console.log("No notification.userId");
    return notification;
  }

  const userId = notification.userId.toString();

    console.log("notification userId:", userId);
  console.log("isUserOnline:", isUserOnline(userId));

  await notification.populate([
    {
      path: 'userId',
      select: 'fullName avatar',
    },
    {
      path: 'actorId',
      select: 'fullName avatar',
    },
    {
      path: 'entity.postId',
    },
    {
      path: 'entity.commentId',
    },
    {
      path: 'entity.likeId',
    },
    {
      path: 'entity.listingId',
    },
    {
      path: 'entity.followId',
    },
    {
      path: 'entity.conversationId',
    },
  ]);

  const message = await NotificationHelper.generateNotificationMessage(notification);

     console.log("generated notification message:", message);

  if (isUserOnline(userId)) {
      console.log("Emitting new_notification to:", userId);
    const io = getSocketIo();
    io.to(userId).emit('new_notification', {
      ...notification.toObject(),
      message,
    });
  } else {
    const user = await User.findById(userId);
    if (user && user.fcmToken) {
      const fcmMessage = {
        notification: {
          title: 'New Notification',
          body: message,
        },
        token: user.fcmToken,
        data: {
          notification: JSON.stringify(notification),
        },
      };

      try {
        // @ts-ignore
        await fcm.messaging().send(fcmMessage);
      } catch (error) {
        console.error('Error sending FCM message:', error);
      }
    }
  }

  return notification;
};

const getNotificationsForUser = async (
  userId: string,
  query: {
    type?: string;
    page?: number;
    limit?: number;
  },
) => {
  const { type, page = 1, limit = 10 } = query;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const findQuery: any = { userId };

  if (type) {
    findQuery.type = type;
  }

  const notifications = await Notification.find(findQuery)
    .populate({
      path: 'userId',
      select: 'fullName avatar',
    })
    .populate({
      path: 'actorId',
      select: 'fullName avatar',
    })
    .populate({
      path: 'entity.postId',
    })
    .populate({
      path: 'entity.commentId',
    })
    .populate({
      path: 'entity.likeId',
    })
    .populate({
      path: 'entity.listingId',
    })
    .populate({
      path: 'entity.followId',
    })
    .populate({
      path: 'entity.conversationId',
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await Notification.countDocuments(findQuery);
  const totalPages = Math.ceil(total / limit);

  const notificationsWithMessages = await Promise.all(
    notifications.map(async (notification) => {
      const message =
        await NotificationHelper.generateNotificationMessage(notification);
      return {
        ...notification,
        message,
      };
    }),
  );
  return {
    data: notificationsWithMessages,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

const markAsRead = async (notificationId: string) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true },
  );
};

const markAllAsRead = async (userId: string) => {
    return await Notification.updateMany({ userId, isRead: false }, { isRead: true });
};

export const NotificationService = {
  createNotification,
  getNotificationsForUser,
  markAsRead,
  markAllAsRead,
};
