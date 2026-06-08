import { Router } from 'express';
import { NotificationController } from './notifications.controller';
import { checkAuth } from '../../middlewares/auth.middleware';
import { Role } from '../users/user.interface';

const router = Router();

router.get(
  '/',
  checkAuth(...Object.values(Role)),
  NotificationController.getMyNotifications,
);

router.patch(
  '/:notificationId/read',
  checkAuth(...Object.values(Role)),
  NotificationController.markAsRead,
);

router.patch(
    '/read-all',
    checkAuth(...Object.values(Role)),
    NotificationController.markAllAsRead,
  );

export const NotificationRoutes = router;
