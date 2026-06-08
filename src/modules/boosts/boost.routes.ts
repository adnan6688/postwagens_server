import express from 'express';
import { BoostController } from './boost.controller';
import { checkAuth } from '../../middlewares/auth.middleware';
import { Role } from '../users/user.interface';

const router = express.Router();

// ListingBoost routes
router.post(
  '/',
  checkAuth(...Object.values(Role)),
  BoostController.boostListing,
);
router.get('/active', BoostController.getActiveBoosts);
router.get('/user', checkAuth(...Object.values(Role)), BoostController.getUserBoosts);
router.get('/listing/:listingId', BoostController.getListingBoosts);
router.get('/revenue-overview', checkAuth(Role.ADMIN), BoostController.getRevenueOverview);




export const BoostRoutes = router;
