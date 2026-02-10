import type { Role } from "../types/job.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
        throw new ApiError(401, 'Unauthorized request!')
    }

    try {
        const decodedToken = await verifyAccessToken(token) as { id: string, email: string, email_verified: boolean, role: Role }
        if (decodedToken) {
            console.log('Decoded:', decodedToken)
            const user = {
                id: decodedToken.id,
                email: decodedToken.email,
                email_verified: decodedToken.email_verified,
                role: decodedToken.role
            }
            req.user = user;
        }
        next()
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            console.log('Token Expired')
            throw new ApiError(401, 'Token expired!')
        } else {
            console.error(error)
            throw error
        }
    }
})