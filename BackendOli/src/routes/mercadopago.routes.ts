import { Router } from 'express';
import { crearPreferencia } from '../controllers/mercadopago.controllers';

const router = Router();

router.post('/pago', crearPreferencia);

export default router;
