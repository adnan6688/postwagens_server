import { Model, Types } from 'mongoose';
import { NotificationType } from '../notifications/notifications.interface';

export interface IChannelPreference {
    inApp: boolean;
    push: boolean;
}

export interface INotificationPreference {
  id?: Types.ObjectId;
  userId: Types.ObjectId;
  preferences: {
    [key in NotificationType]?: IChannelPreference;
  };
}

export type NotificationPreferenceModel = Model<INotificationPreference, Record<string, never>>;
