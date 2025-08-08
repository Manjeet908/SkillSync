import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async(req, res, next) => {

    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        if(!accessToken) {
            console.log("No access token found in cookies or headers");
            console.log("Cookies:", req.cookies);
            console.log("Authorization header:", req.header("Authorization"));
            throw new ApiError(401, "No Access Token, Unauthorized")
        }
        
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        if(!decodedToken)
            throw new ApiError(401, "Unauthorised Access Invalid Token")
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
    
        req.user = user
    
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }

})

export { verifyJWT }