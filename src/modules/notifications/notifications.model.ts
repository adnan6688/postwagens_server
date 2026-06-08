import { Schema, model } from 'mongoose';
import {
  INotification,
  NotificationModel,
  NotificationTargetRole,
  NotificationType,
} from './notifications.interface';

const notificationSchema = new Schema<INotification, NotificationModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    targetRole: {
      type: String,
      enum: Object.values(NotificationTargetRole),
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    entity: {
      paymentId: {
        type: Schema.Types.ObjectId,
      },
      amount: {
        type: Number,
      },
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
      postId: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
      commentId: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
      likeId: {
        type: Schema.Types.ObjectId,
        ref: 'Like',
      },
      listingId: {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
      },
      followId: {
        type: Schema.Types.ObjectId,
        ref: 'Follow',
      },
      conversationId: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Notification = model<INotification, NotificationModel>(
  'Notification',
  notificationSchema,
);
