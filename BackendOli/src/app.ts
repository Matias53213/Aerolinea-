import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import paquetesRoutes from './routes/paquete.routes';
import mercadopagoRoutes from './routes/mercadopago.routes';
import paymentRoutes from './routes/payment.routes';
import reservationRoutes from './routes/reservation.routes';
import path from 'path';
import { AppDataSource } from './dbconfig/db';

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);
app.use("/api/paquetes", paquetesRoutes);
app.use('/api/mercadopago', mercadopagoRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/payments', paymentRoutes);



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/check', (_req, res) => {
  res.send('¡El servidor está funcionando!');
});

export default app;
