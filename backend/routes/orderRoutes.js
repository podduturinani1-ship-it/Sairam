import express from 'express';
import { getOrders, updateOrderStatus, createOrder, getMyOrders } from '../controllers/orderController.js';
import { protect, employeeGuard } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, employeeGuard, getOrders).post(protect, createOrder);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id/status').put(protect, employeeGuard, updateOrderStatus);

export default router;
