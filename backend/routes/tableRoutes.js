import express from 'express';
import { getTables, createTable, updateTable, deleteTable, getAvailableTables } from '../controllers/tableController.js';
import { protect, adminGuard } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/availability').get(getAvailableTables);
router.route('/').get(protect, adminGuard, getTables).post(protect, adminGuard, createTable);
router.route('/:id').put(protect, adminGuard, updateTable).delete(protect, adminGuard, deleteTable);

export default router;
