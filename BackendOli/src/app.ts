import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import userRoutes from './routes/user.routes'
import paquetesRoutes from './routes/paquete.routes' 
import dotenv from 'dotenv';
import path from 'path';



const app = express()

app.use(morgan('dev'))
app.use(cors())
app.use(express.json())
dotenv.config();


app.use("/api", userRoutes);
app.use("/api/paquetes", paquetesRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

export default app;