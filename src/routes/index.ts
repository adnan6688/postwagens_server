import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes';
import { userRoutes } from '../modules/users/user.routes';
import { listingRoutes } from '../modules/listing/listing.routes';
import { postRoutes } from '../modules/post/post.routes';
import { CommentRoutes } from '../modules/comments/comment.routes';
import { BookmarkRoutes } from '../modules/bookmarks/bookmark.routes';
import { BoostRoutes } from '../modules/boosts/boost.routes';
import { ConversationRoutes } from '../modules/conversations/conversation.routes';
import { NotificationRoutes } from '../modules/notifications/notifications.routes';
import { NotificationPreferenceRoutes } from '../modules/notification_preferences/notification_preferences.routes';
import { AnalyticsRoutes } from '../modules/analytics/analytics.routes';
import { userBlocked } from '../modules/userBlocked/userBlocked.routes';
import { userReport } from '../modules/userReport/userReport.routes';

export const router = Router();

const moduleRoutes = [
  // Add your route modules here
  {
    path: '/auth',
    route: authRouter,
  },
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/listings',
    route: listingRoutes,
  },
  {
    path: '/posts',
    route: postRoutes,
  },
  {
    path: '/comments',
    route: CommentRoutes,
  },
  {
    path: '/bookmarks',
    route: BookmarkRoutes,
  },
  {
    path: '/boosts',
    route: BoostRoutes,
  },
  {
    path: '/conversations',
    route: ConversationRoutes,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
  {
    path: '/notification-preferences',
    route: NotificationPreferenceRoutes,
  },
  {
    path: '/admin/analytics',
    route: AnalyticsRoutes,
  },
  {
    path: '/userBlockedService',
    route: userBlocked,
  },
  {
    path: '/reports',
    route: userReport,
  },
];

moduleRoutes.forEach(routeModule => {
  router.use(routeModule.path, routeModule.route);
});