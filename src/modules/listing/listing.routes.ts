import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import {
  createListingZodSchema,
  deleteListingMediaZodSchema,
  updateListingZodSchema,
} from './listing.validate';
import { listingControllers } from './listing.controller';
import { checkAuth } from '../../middlewares/auth.middleware';
import { Role } from '../users/user.interface';
import { multerUpload } from '../../config/multer.config';

const router = express.Router();

router.post(
  '/',
  checkAuth(...Object.values(Role)),
  multerUpload.array('imagesAndVideos'),
  validateRequest(createListingZodSchema),
  listingControllers.createListing,
);

router.get(
  '/my-listings',
  checkAuth(...Object.values(Role)),
  listingControllers.getMyListings,
);
router.get( 
  '/user/:userId',
  checkAuth(...Object.values(Role)),
  listingControllers.getListingsByUserId,
);

router.get(
  '/',
  checkAuth(...Object.values(Role)),
  listingControllers.getAllListings,
);

router.delete(
  '/media',
  checkAuth(...Object.values(Role)),
  validateRequest(deleteListingMediaZodSchema, 'query'),
  listingControllers.deleteListingMedia,
);

router.get(
  '/:id/analytics',
  checkAuth(...Object.values(Role)),
  listingControllers.getListingAnalytics,
);

router.get(
  '/:id',
  checkAuth(...Object.values(Role)),
  listingControllers.getSingleListing,
);

router.patch(
  '/:id',
  checkAuth(...Object.values(Role)),
  multerUpload.array('imagesAndVideos'),
  validateRequest(updateListingZodSchema),
  listingControllers.updateListing,
);

router.delete(
  '/:id',
  checkAuth(...Object.values(Role)),
  listingControllers.deleteListing,
);


router.get('/listing/admin' , checkAuth(Role.ADMIN) , listingControllers.getAllListingForadmin)
router.get(
  "/listing/count",
  checkAuth(Role.ADMIN),
  listingControllers.listingStats
);

export const listingRoutes = router;
