import { Candidate } from "../models/candidate.model.js";
import type { LoginBody, RegisterBody } from "../types/auth.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from 'bcrypt'
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { verifyEmailOtp } from "./email.service.js";
import { Recruiter } from "../models/recruiter.model.js";

export class CandidateService {
    static async register(data: RegisterBody) {
        const { email, password, fname } = data

        if (!fname) {
            throw new ApiError(400, 'Full name is required!')
        }

        const normalizedEmail = email.toLowerCase().trim();
        let existingUser = await Candidate.findOne({ email: normalizedEmail })
        if(!existingUser) {
            existingUser = await Recruiter.findOne({ email: normalizedEmail })
        }

        if (existingUser) {
            throw new ApiError(400, 'User already registered!')
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await Candidate.create({
            fname: fname,
            email: normalizedEmail,
            password: hash
        })

        return {
            id: user._id,
            email: user.email,
            email_verified: user.email_verified,
            role: 'candidate'
        };
    }

    static async login(data: LoginBody) {
        const { email, password } = data

        const normalizedEmail = email.toLowerCase().trim();
        const user = await Candidate.findOne({ email: normalizedEmail })

        if (!user) {
            return null;
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            throw new ApiError(401, "Invalid email or password");
        }

        const accessToken = await generateAccessToken({ id: user._id, email: user.email, email_verified: user.email_verified, role: 'candidate' })
        const refreshToken = await generateRefreshToken({ _id: user._id })

        user.refresh_token = refreshToken
        await user.save({ validateBeforeSave: false })

        return {
            user: {
                id: user._id,
                email: user.email,
                email_verified: user.email_verified,
                role: 'candidate'
            },
            accessToken,
            refreshToken
        }
    }

    static async verifyEmail(userId: string, otp: number) {
        const user = await Candidate.findById(userId)
        if (!user) {
            throw new ApiError(404, 'User not found!')
        }

        const isValid = await verifyEmailOtp(user.email, otp)
        if (!isValid) {
            throw new ApiError(400, 'Invalid Otp!')
        }

        user.email_verified = true;
        await user.save({ validateBeforeSave: false })

        return {
            id: user._id,
            email: user.email,
            email_verified: user.email_verified
        };
    }
}