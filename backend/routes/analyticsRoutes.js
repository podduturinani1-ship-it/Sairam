import express from 'express';
import { getAnalytics, getLiveStatus } from '../controllers/analyticsController.js';
import { protect, adminGuard } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/live-status').get(getLiveStatus);
router.route('/').get(protect, adminGuard, getAnalytics);

export default router;
