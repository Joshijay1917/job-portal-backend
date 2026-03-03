import type { Role } from "../types/job.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const optionalVerifyJwt = asyncHandler(async (req, res, next) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next();
    }

    try {
        const decodedToken = await verifyAccessToken(token) as { id: string, email: string, email_verified: boolean, role: Role }
        if (decodedToken) {
            const user = {
                id: decodedToken.id,
                email: decodedToken.email,
                email_verified: decodedToken.email_verified,
                role: decodedToken.role
            }
            req.user = user;
        }
        next()
    } catch (error) {
        console.error(error)
        return next();
    }
})