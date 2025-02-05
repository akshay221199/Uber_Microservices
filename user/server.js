import express from 'express';
import userRouter from './routes/userRoutes.js'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectToMongoDB from './config.js'
import dotenv from 'dotenv';
import { connect } from './service/rabbit.js';
dotenv.config();
connect();


const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

app.use(cookieParser());
connectToMongoDB();

app.use('/api/v1/user/', userRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, ()=>{
    console.log(`server running on port  Number ${PORT}`);
});