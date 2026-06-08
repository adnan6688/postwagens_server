import { Schema, model } from 'mongoose';
import {
  INotificationPreference,
  NotificationPreferenceModel,
} from './notification_preferences.interface';

const notificationPreferenceSchema = new Schema<INotificationPreference, NotificationPreferenceModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    preferences: {
      type: Map,
      of: new Schema({
        inApp: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      }, { _id: false }),
    },
  },
  {
    timestamps: true,
  },
);

export const NotificationPreference = model<INotificationPreference, NotificationPreferenceModel>(
  'NotificationPreference',
  notificationPreferenceSchema,
);
