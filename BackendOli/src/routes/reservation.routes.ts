import { Router } from 'express';
import {
  createReservation,
  getReservationById,
  getUserReservations,
  cancelReservation,
  getAllReservations
} from '../controllers/reservation.controller';

const router = Router();

router.post('/', createReservation);
router.get('/', getAllReservations); 
router.get('/:id', getReservationById);
router.get('/user/:userId', getUserReservations);
router.put('/:id/cancel', cancelReservation);

export default router;