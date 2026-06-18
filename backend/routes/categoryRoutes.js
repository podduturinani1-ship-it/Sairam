import express from 'express';
import { getCategories, createCategory, deleteCategory } from '../controllers/categoryController.js';
import { protect, adminGuard } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getCategories).post(protect, adminGuard, createCategory);
router.route('/:id').delete(protect, adminGuard, deleteCategory);

export default router;
