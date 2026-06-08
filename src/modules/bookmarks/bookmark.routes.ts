import express from 'express';
import { BookmarkController } from './bookmark.controller';
import { checkAuth } from '../../middlewares/auth.middleware';
import { Role } from '../users/user.interface';

const router = express.Router();

router.get('/', checkAuth(...Object.values(Role)), BookmarkController.getBookmarksForUser);
router.post('/:listingId', checkAuth(...Object.values(Role)), BookmarkController.addBookmark);
router.delete('/:listingId', checkAuth(...Object.values(Role)), BookmarkController.removeBookmark);


export const BookmarkRoutes = router;
