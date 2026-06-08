import { NotificationPreference } from './notification_preferences.model';
import { INotificationPreference } from './notification_preferences.interface';

const getPreferences = async (userId: string) => {
  return await NotificationPreference.findOne({ userId });
};

const updatePreferences = async (userId: string, preferences: Partial<INotificationPreference['preferences']>) => {
  return await NotificationPreference.findOneAndUpdate(
    { userId },
    { $set: { preferences } },
    { new: true, upsert: true },
  );
};

export const NotificationPreferenceService = {
  getPreferences,
  updatePreferences,
};
