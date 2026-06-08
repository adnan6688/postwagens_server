import express from 'express';
import { checkAuth } from '../../middlewares/auth.middleware';
import { Role } from '../users/user.interface';
import { blockedController } from './userBlocked.controller';

const router = express.Router();

router.post('/userBlock',  checkAuth(...Object.values(Role)),blockedController.blockUser);
router.post('/userUnBlock',  checkAuth(...Object.values(Role)),blockedController.unblockUser);
router.get('/allBlockedUser',  checkAuth(...Object.values(Role)),blockedController.getAllBlockedUsers);


export const userBlocked = router;