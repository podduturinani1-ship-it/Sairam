import express from 'express';
import { authUser, registerUser, addStaff, getUserProfile, updateUserProfile, getUsers, deleteUser, updateUser } from '../controllers/userController.js';
import { protect, adminGuard, bossGuard } from '../middleware/authMiddleware.js';
import { body } from 'express-validator';
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

router.route('/').post(
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validateRequest,
  registerUser
).get(protect, adminGuard, getUsers);

router.post('/staff',
  protect,
  bossGuard,
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'kitchen', 'driver']).withMessage('Invalid role'),
  validateRequest,
  addStaff
);

router.post('/login',
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest,
  authUser
);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/:id').delete(protect, bossGuard, deleteUser).put(protect, adminGuard, updateUser);

export default router;
