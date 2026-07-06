import express from 'express';
import { userControllers } from './user.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { userUpdateZodSchema, userZodSchema } from './user.validate';
import { checkAuth } from '../../middlewares/auth.middleware';
import { Role } from './user.interface';
import { multerUpload } from '../../config/multer.config';
import { FollowController } from '../follow/follow.controller';

const router = express.Router();

router.post(
  '/registration',
  validateRequest(userZodSchema),
  userControllers.registerUser
);

// GET ME
router.get('/get_me', checkAuth(...Object.keys(Role)), userControllers.getMe);

// Purchase Badge
router.post(
  '/purchase-badge',
  checkAuth(...Object.values(Role)),
  userControllers.purchaseBadge,
);

// GET USER PROFILE
router.get(
  '/profile/:userId',
  checkAuth(...Object.keys(Role)),
  userControllers.getProfile
);

// GET ALL USER LIST
router.get('/', checkAuth(...Object.values(Role)), userControllers.getAllUser);

// Follow routes
router.post(
  '/:userId/toggle-follow',
  checkAuth(...Object.values(Role)),
  FollowController.toggleFollow,
);
router.get(
  '/:userId/followers',
  checkAuth(...Object.values(Role)),
  FollowController.getFollowers,
);
router.get(
  '/:userId/following',
  checkAuth(...Object.values(Role)),
  FollowController.getFollowing,
);

// UPDATE USER
router.patch(
  '/update',
  checkAuth(...Object.keys(Role)),
  multerUpload.single('file'),
  validateRequest(userUpdateZodSchema),
  userControllers.userUpdate
);

// DELETE USER
router.delete(
  '/:userId',
  checkAuth(...Object.keys(Role)),
  userControllers.userDelete
);

// USER PHONE NUMBER VERIFICATION
router.get(
  '/phone_number_verification',
  checkAuth(...Object.keys(Role)),
  userControllers.userVefification
);
router.post(
  '/verify_otp',
  checkAuth(...Object.keys(Role)),
  userControllers.verifyOTP
);

router.put(
  '/suspend/:userId',
  checkAuth(...Object.keys(Role)),
  userControllers.updateSuspendStatus
)

router.get('/recentUser', checkAuth(Role.ADMIN) , userControllers.recentUsers)

router.patch('/user-update_status/:userId/:type' , checkAuth(Role.ADMIN) , userControllers.updateUserStatus)
export const userRoutes = router;