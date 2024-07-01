import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const verifyJWT = asyncHandler(async(req, res, next) => {
try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") 
    
        if (!token) {
            throw new ApiError(400, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(400, "Invalid Access Token")
        }
    
        req.user = user;
        next()
} catch (error) {
    throw new ApiError(400, error?.message || "Invalid access token")
}
})

export const isAdmin = asyncHandler(async(req, res, next) => {
    if(req.user && req.user.role === "Admin"){
        next();
    }else{
        return res.status(400).json(new ApiResponse(400, "Unauthorized Access"))
    }

    // can use this also
    // if(!req.user && !req.user.role === "Admin"){
    //     throw new ApiError(400, "Unauthorized access!!")
    // }
    // next();
})