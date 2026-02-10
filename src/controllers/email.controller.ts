import { Recruiter } from "../models/recruiter.model.js";
import { CandidateService } from "../services/candidate.service.js";
import { verifyEmailOtp } from "../services/email.service.js";
import { RecruiterService } from "../services/recruiter.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const verifyToken = asyncHandler(async (req, res) => {
    const { userId, otp, role } = req.body

    if(!userId || !otp) {
        throw new ApiError(400, 'Invalid Access!')
    }

    let user = null;
    if(role === 'recruiter') {
        user = await RecruiterService.verifyEmail(userId, otp)
    } else {
        user = await CandidateService.verifyEmail(userId, otp)
    }

    if(!user) {
        throw new ApiError(400, 'User not registered')
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, user, "User verified successfully!")
    )
})