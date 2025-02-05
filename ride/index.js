import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();
import connectToMongoDB from './config.js'
import { connect as connectRabbitMQ } from './service/rabbit.js';
import rideRoutes from './routes/rideRoutes.js'

connectRabbitMQ();


const PORT = process.env.PORT;
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());
app.use(cookieParser());
connectToMongoDB();



app.use('/api/v1/ride/', rideRoutes )

app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`);
})
