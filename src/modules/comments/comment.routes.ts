import express from 'express';
import { CommentController } from './comment.controller';
import { checkAuth } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validateRequest';
import { CommentValidation } from './comment.validation';
import { Role } from '../users/user.interface';

const postCommentRouter = express.Router({ mergeParams: true });

postCommentRouter.post(
  '/comments',
  checkAuth(...Object.values(Role)),
  validateRequest(CommentValidation.createCommentSchema),
  CommentController.createComment,
);

postCommentRouter.get('/comments', CommentController.getCommentsForPost);

const commentRouter = express.Router();

commentRouter.get(
  '/:commentId/replies',
  CommentController.getCommentReplies,
);

commentRouter.patch(
  '/:commentId',
  checkAuth(...Object.values(Role)),
  validateRequest(CommentValidation.updateCommentSchema),
  CommentController.updateComment,
);

commentRouter.delete(
  '/:commentId',
  checkAuth(...Object.values(Role)),
  CommentController.deleteComment,
);

export { postCommentRouter as PostCommentRoutes, commentRouter as CommentRoutes };
