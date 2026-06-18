import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { protect, adminGuard } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getSettings).put(protect, adminGuard, updateSettings);

export default router;
