import express from 'express';
import { AnalyticsControllers } from './analytics.controller';

const router = express.Router();

router.get('/summary', AnalyticsControllers.getAnalyticsSummary);
router.get('/user-growth', AnalyticsControllers.getUserGrowth);
router.get('/top-listings', AnalyticsControllers.getTopListings);

export const AnalyticsRoutes = router;
