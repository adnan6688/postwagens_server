import express from 'express';
import { LikeController } from './like.controller';
import { checkAuth } from '../../middlewares/auth.middleware';
import { Role } from '../users/user.interface';

const router = express.Router({ mergeParams: true });

router.post('/like', checkAuth(...Object.values(Role)), LikeController.likePost);

router.delete('/like', checkAuth(...Object.values(Role)), LikeController.unlikePost);

router.get('/likes', LikeController.getLikesForPost);

export const LikeRoutes = router;
