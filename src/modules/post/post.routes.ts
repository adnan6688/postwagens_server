import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  createPostZodSchema,
  deletePostMediaZodSchema,
  updatePostZodSchema,
} from './post.validation';
import { postControllers } from './post.controller';
import { checkAuth } from '../../middlewares/auth.middleware';
import { Role } from '../users/user.interface';
import { multerUpload } from '../../config/multer.config';
import { LikeRoutes } from '../likes/like.routes';
import { PostCommentRoutes } from '../comments/comment.routes';

const router = express.Router();

router.post(
  '/',
  checkAuth(...Object.values(Role)),
  multerUpload.array('imagesAndVideos'),
  validateRequest(createPostZodSchema),
  postControllers.createPost,
);

router.get('/', checkAuth(...Object.values(Role)), postControllers.getAllPosts);

router.get(
  '/my-posts',
  checkAuth(...Object.values(Role)),
  postControllers.getMyPosts,
);

router.get(
  '/user/:userId',
  checkAuth(...Object.values(Role)),
  postControllers.getPostsByUserId,
);

router.delete(
  '/media',
  checkAuth(...Object.values(Role)),
  validateRequest(deletePostMediaZodSchema, 'query'),
  postControllers.deletePostMedia,
);

router.use('/:id', LikeRoutes);
router.use('/:id', PostCommentRoutes);

router.get(
  '/:id',
  checkAuth(...Object.values(Role)),
  postControllers.getSinglePost,
);

router.patch(
  '/:id',
  checkAuth(...Object.values(Role)),
  multerUpload.array('imagesAndVideos'),
  validateRequest(updatePostZodSchema),
  postControllers.updatePost,
);

router.delete(
  '/:id',
  checkAuth(...Object.values(Role)),
  postControllers.deletePost,
);

export const postRoutes = router;
