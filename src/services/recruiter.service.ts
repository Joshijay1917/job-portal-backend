import { Candidate } from "../models/candidate.model.js";
import { Recruiter } from "../models/recruiter.model.js";
import type { RegisterBody } from "../types/auth.js";
import type { RegisterCandidate } from "../types/candidate.js";
import type { LoginRecruiter, RegisterRecruiter } from "../types/recruiter.js";
import { ApiError } from "../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { sendEmail, verifyEmailOtp } from "./email.service.js";
import bcrypt from 'bcrypt'

export class RecruiterService {
    static async register(data: RegisterBody) {
        const { owner, email, password, cname } = data
        const normalizedEmail = email.toLowerCase().trim();

        console.log('Get owner ', owner, ' cname is ', cname)

        if (!cname || !owner) {
            throw new ApiError(400, 'Company name and owner is required!')
        }

        let existingUser = await Recruiter.findOne({ email: normalizedEmail })
        if(!existingUser) {
            existingUser = await Candidate.findOne({ email: normalizedEmail})
        }

        if (existingUser && existingUser.email_verified) {
            throw new ApiError(400, 'User already registered!')
        }

        if (existingUser && !existingUser.email_verified) {
            const messageId = await sendEmail(existingUser)
            if (!messageId) {
                throw new ApiError(500, 'Failed to send email!')
            }
            return {
                id: existingUser._id,
                email: existingUser.email,
                email_verified: existingUser.email_verified
            };
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await Recruiter.create({
            cname: cname,
            owner: owner,
            email: normalizedEmail,
            password: hash
        })

        const messageId = await sendEmail(user)
        if (!messageId) {
            throw new ApiError(500, 'Failed to send email!')
        }

        return {
            id: user._id,
            email: user.email,
            email_verified: user.email_verified,
            role: 'recruiter'
        };
    }

    static async login(data: LoginRecruiter) {
        const { email, password } = data

        const normalizedEmail = email.toLowerCase().trim();
        const user = await Recruiter.findOne({ email: normalizedEmail })

        if (!user || !user?.email_verified) {
            return null;
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            throw new ApiError(401, "Invalid email or password");
        }

        const accessToken = await generateAccessToken({ id: user._id, email: user.email, email_verified: user.email_verified, role: 'recruiter' })
        const refreshToken = await generateRefreshToken({ _id: user._id })

        user.refresh_token = refreshToken
        await user.save({ validateBeforeSave: false })

        return {
            user: {
                id: user._id,
                email: user.email,
                email_verified: user.email_verified,
                role: 'recruiter'
            },
            accessToken,
            refreshToken
        }
    }

    static async verifyEmail(userId: string, otp: number) {
        const user = await Recruiter.findById(userId)
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