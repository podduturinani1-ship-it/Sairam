import express from 'express';
import { getReviews, updateReview, deleteReview, createReview, getMyReviews } from '../controllers/reviewController.js';
import { protect, adminGuard } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/myreviews').get(protect, getMyReviews);

router.route('/')
  .get(getReviews)
  .post(protect, createReview);

router.route('/:id')
  .put(protect, adminGuard, updateReview)
  .delete(protect, adminGuard, deleteReview);

export default router;
