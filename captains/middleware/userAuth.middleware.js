import { ApiError } from "../utility/ApiError.js"
import { ApiResponse } from "../utility/ApiResponse.js"
import { AsyncHandler } from "../utility/AsyncHandler.js"
import  Captain  from "../models/Captain.js";
import jwt from "jsonwebtoken"

export const verifyUser = AsyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        console.log('middleware auth cookie', req.cookies);
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Fetch the user from the database
        const captain = await Captain.findById(decodedToken?._id).select("-password -refreshToken");

        if (!captain) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.captain = captain;
        next(); // Only call next() if user is authenticated and valid
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            // Send a response directly for expired token
            throw new ApiError(401, "Access token expired");
        }
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

