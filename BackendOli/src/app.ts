import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import userRoutes from './routes/user.routes'
import paquetesRoutes from './routes/paquete.routes' 
import mercadopagoRoutes from './routes/mercadopago.routes';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);
app.use("/api/paquetes", paquetesRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/mercadopago', mercadopagoRoutes);

export default app;
