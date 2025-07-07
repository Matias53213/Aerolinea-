import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import userRoutes from './routes/user.routes'
import dotenv from 'dotenv';


const app = express()

app.use(morgan('dev'))
app.use(cors())
app.use(express.json())
dotenv.config();


app.use("/api", userRoutes);

export default app;