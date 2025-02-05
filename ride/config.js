import mongoose, { connect } from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;
const MongoDB_NAME = process.env.DB_NAME;


const connectToMongoDB = async ()=>{
    try {
        if(!MONGO_URL){
            console.error('URL NOT FOUND');
        }
        await mongoose.connect(MONGO_URL, {
                socketTimeoutMS:5000,
                serverSelectionTimeoutMS:3000
        });
        console.log(`Conneted to Database ${MongoDB_NAME}`);
        
        
    } catch (error) {
        console.error('Server not connected');
    }
}

export default connectToMongoDB;
