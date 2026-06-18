import express from 'express';
import { getMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuController.js';
import { protect, adminGuard } from '../middleware/authMiddleware.js';
import { body } from 'express-validator';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

router.route('/').get(getMenuItems).post(
  protect, 
  adminGuard,
  body('name').notEmpty().withMessage('Name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
  validateRequest,
  createMenuItem
);

router.route('/:id')
  .get(getMenuItemById)
  .put(protect, adminGuard, updateMenuItem)
  .delete(protect, adminGuard, deleteMenuItem);

export default router;
