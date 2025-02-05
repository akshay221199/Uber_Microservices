import mongoose from "mongoose";
import dotenv from 'dotenv';
import { ApiError } from "./utility/ApiError.js";
dotenv.config();


const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME;


const connectToMongoDB = async() =>{
    try {
        if(!MONGO_URL){
            throw new ApiError(404,'MongoDB connection string is not defined');
        }

        await mongoose.connect(MONGO_URL , {
            serverSelectionTimeoutMS:3000,
            socketTimeoutMS:5000
        });
        console.log(`Connected To Database Successfully ${DB_NAME}`);

    } catch (error) {
        throw new ApiError(404,'Failed To Connect DB');
    }
}

export default connectToMongoDB;