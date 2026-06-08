import { Model, Types } from 'mongoose';

export enum NotificationType {
  MESSAGE = 'message',
  LIKE = 'like',
  COMMENT = 'comment',
  LISTING = 'listing',
  PAYMENT = 'payment',
  USER_REGISTER = 'user_register',
  FOLLOW = 'follow',
}

export enum NotificationTargetRole {
    ADMIN = 'admin',
    USER = 'user',
}

export interface INotification {
  id?: Types.ObjectId;
  userId?: Types.ObjectId;
  targetRole?: NotificationTargetRole;
  actorId: Types.ObjectId;
  type: NotificationType;
  entity: {
    paymentId?: Types.ObjectId;
    amount?: number;
    userId?: Types.ObjectId;
    postId?: Types.ObjectId;
    commentId?: Types.ObjectId;
    likeId?: Types.ObjectId;
    listingId?: Types.ObjectId;
    followId?: Types.ObjectId;
    conversationId?: Types.ObjectId;
  };
  isRead: boolean;
  createdAt?: Date;
}

export type NotificationModel = Model<INotification, Record<string, never>>;
