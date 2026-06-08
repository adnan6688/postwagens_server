import express from 'express';
import { ConversationController } from './conversation.controller';
import { checkAuth } from '../../middlewares/auth.middleware';
import { Role } from '../users/user.interface';
import { multerUpload } from '../../config/multer.config';

const router = express.Router();

router.get(
  '/',
  checkAuth(...Object.values(Role)),
  ConversationController.getConversationsForUser,
);

router.get(
  '/:conversationId/messages',
  checkAuth(...Object.values(Role)),
  ConversationController.getMessagesForConversation,
);

router.post(
  '/messages',
  checkAuth(...Object.values(Role)),
  multerUpload.single('media'),
  ConversationController.sendMessage,
);

router.post(
    '/find-or-create',
    checkAuth(...Object.values(Role)),
    ConversationController.findOrCreateConversation,
);

export const ConversationRoutes = router;
