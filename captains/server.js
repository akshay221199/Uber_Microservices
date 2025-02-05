import express from 'express';
import captainROute from './routes/captainRoutes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectToMongoDB from './config.js';
import dotenv from 'dotenv';
import { connect } from './service/rabbit.js'; // Use named import

dotenv.config();
connect();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true,
    })
);
app.use(cookieParser());
connectToMongoDB();

app.use('/api/v1/captain/', captainROute);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port number ${PORT}`);
});
