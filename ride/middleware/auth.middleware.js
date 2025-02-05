import { ApiError } from "../utility/ApiError.js"
import { ApiResponse } from "../utility/ApiResponse.js"
import { AsyncHandler } from "../utility/AsyncHandler.js"
import jwt from "jsonwebtoken";
import axios from 'axios';

const verifyUser = AsyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }


        // const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        const response = await axios.get(`${process.env.BASE_URL}/user/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        const user = response.data.user;
        
        if (!user || !user._id) {
            throw new ApiError(401, "Invalid user data");
        }

        req.user = user; // Attach user to request object
        // req.body.user = user._id; // Ensure req.body.user is populated
        
        next();
    } catch (error) {
        console.error('JWT Error:', error); // Log the full error
        throw new ApiError(401, "Invalid access token");
    }
});




 const verifyCaptain = AsyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        console.log('middleware auth cookie', req.cookies);
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_CAPTAIN);

        const response = await axios.get(`${process.env.BASE_URL}/captain/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const cap = response.data;

        if (!cap) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.cap = cap;

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            // Send a response directly for expired token
            throw new ApiError(401, "Access token expired");
        }
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

export  {verifyCaptain , verifyUser };