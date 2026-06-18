import express from 'express';
import { createReservation, getReservations, updateReservationStatus, getMyReservations } from '../controllers/reservationController.js';
import { protect, adminGuard } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/myreservations').get(protect, getMyReservations);

router.route('/')
  .post(createReservation) // Open or use optional auth
  .get(protect, adminGuard, getReservations);

router.route('/:id/status').put(protect, adminGuard, updateReservationStatus);

export default router;
