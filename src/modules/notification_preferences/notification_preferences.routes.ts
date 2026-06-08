import { Router } from 'express';
import { NotificationPreferenceController } from './notification_preferences.controller';
import { checkAuth } from '../../middlewares/auth.middleware';
import { Role } from '../users/user.interface';

const router = Router();

router.get(
  '/',
  checkAuth(...Object.values(Role)),
  NotificationPreferenceController.getMyPreferences,
);

router.put(
  '/',
  checkAuth(...Object.values(Role)),
  NotificationPreferenceController.updateMyPreferences,
);

export const NotificationPreferenceRoutes = router;
