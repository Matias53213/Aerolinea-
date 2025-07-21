import { Router } from 'express';
import { registerPayment, getPaymentInfo, cancelReservation, confirmReservation, getReservations } from '../controllers/payment.controller';

const router = Router();

router.post('/register', registerPayment);
router.get('/:paymentId', getPaymentInfo);
router.get('/', getReservations);
router.put('/:id/confirm', confirmReservation);
router.put('/:id/cancel', cancelReservation);

export default router;