import { ApiError } from "../utils/ApiError.js";
import { RecruiterService } from './recruiter.service.js';
import type { LoginBody, RegisterBody } from '../types/auth.js';
import { CandidateService } from './candidate.service.js';
import { Candidate } from "../models/candidate.model.js";
import { Recruiter } from "../models/recruiter.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createCandidate, findCandidateByEmail, findCandidateById, updateCandidateEmailVerified, updateCandidatePassword, updateCandidateRefreshToken } from "../queries/candidate.queries.js";
import { createRecruiter, findRecruiterByEmail, findRecruiterById, updateRecruiterEmailVerified, updateRecruiterPassword, updateRecruiterRefreshToken } from "../queries/recruiter.queries.js";
import bcrypt from "bcrypt";
import type { CandidateRow, RecruiterRow } from "../types/pg.js";
import type { Role } from "../types/job.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { verifyEmailOtp } from "./email.service.js";

export class AuthService {
    static async register(data: RegisterBody) {
        const { email, password, role } = data
        if (!email?.trim() || !password?.trim() || !role) {
            throw new ApiError(400, 'Email, Password and Role is required!')
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingCandidate = await findCandidateByEmail(normalizedEmail);
        const existingRecruiter = await findRecruiterByEmail(normalizedEmail);

        if (existingCandidate || existingRecruiter) {
            throw new ApiError(400, 'User already registered!');
        }

        const hash = await bcrypt.hash(password, 10)

        let newUser: null | RecruiterRow | CandidateRow = null
        if (role === 'recruiter') {
            const { cname, owner } = data
            if (!cname?.trim() || !owner?.trim()) {
                throw new ApiError(400, 'Company Name and Owner is required!')
            }
            newUser = await createRecruiter({
                email: normalizedEmail,
                password: hash,
                cname,
                owner
            })
        } else {
            const { fname } = data
            if (!fname?.trim()) {
                throw new ApiError(400, 'Full Name is required!')
            }
            newUser = await createCandidate({
                email: normalizedEmail,
                password: hash,
                fname
            })
        }

        if (!newUser) {
            throw new ApiError(500, 'Something went wrong!')
        }

        return {
            id: newUser.id,
            email: newUser.email,
            role: role,
            email_verified: newUser.email_verified,
        };
    }

    static async login(data: LoginBody) {
        const { email, password } = data
        if (!email?.trim() || !password?.trim()) {
            throw new ApiError(400, 'Email and Password is required!')
        }

        const normalizedEmail = email.toLowerCase().trim();
        let existingCandidate = await findCandidateByEmail(normalizedEmail)
        let existingRecruiter = await findRecruiterByEmail(normalizedEmail)

        if (!existingCandidate && !existingRecruiter) {
            throw new ApiError(400, 'User not registered or verified!')
        }

        if (existingCandidate) {
            const isValid = await bcrypt.compare(password, existingCandidate.password)
            if (!isValid) {
                throw new ApiError(400, 'Please provide valid password!')
            }

            const accessToken = await generateAccessToken({ id: existingCandidate.id, email: existingCandidate.email, email_verified: existingCandidate.email_verified, role: 'candidate' })
            const refreshToken = await generateRefreshToken({ id: existingCandidate.id })

            await updateCandidateRefreshToken(existingCandidate.id, refreshToken)

            return {
                user: {
                    id: existingCandidate.id,
                    email: existingCandidate.email,
                    role: 'candidate',
                    email_verified: existingCandidate.email_verified,
                },
                accessToken,
                refreshToken
            };
        }

        if (existingRecruiter) {
            const isValid = await bcrypt.compare(password, existingRecruiter.password)
            if (!isValid) {
                throw new ApiError(400, 'Please provide valid password!')
            }

            const accessToken = await generateAccessToken({ id: existingRecruiter.id, email: existingRecruiter.email, email_verified: existingRecruiter.email_verified, role: 'recruiter' })
            const refreshToken = await generateRefreshToken({ id: existingRecruiter.id })

            await updateRecruiterRefreshToken(existingRecruiter.id, refreshToken)

            return {
                user: {
                    id: existingRecruiter.id,
                    email: existingRecruiter.email,
                    role: 'recruiter',
                    email_verified: existingRecruiter.email_verified,
                },
                accessToken,
                refreshToken
            };
        }

        return {
            user: null,
            accessToken: null,
            refreshToken: null
        }
    }

    static async logout(id: number, role: Role) {
        let user: CandidateRow | RecruiterRow | null = null
        if (role === 'candidate') {
            user = await findCandidateById(id)
        } else {
            user = await findRecruiterById(id)
        }

        if (!user) {
            throw new ApiError(404, 'User not found!')
        }

        if (role === 'candidate') {
            await updateCandidateRefreshToken(id, null)
        } else {
            await updateRecruiterRefreshToken(id, null)
        }

        return user;
    }

    static async refreshToken(refreshToken: string) {
        const decodedToken = await verifyRefreshToken(refreshToken) as { id: number, iat: number, exp: number }

        let user = await findRecruiterById(decodedToken.id) as null | CandidateRow | RecruiterRow
        let role = 'recruiter'
        if (!user) {
            user = await findCandidateById(decodedToken.id)
            role = 'candidate'
        }

        if (!user || !user.refresh_token || user.refresh_token !== refreshToken) {
            throw new ApiError(403, 'Invalid or expired token!')
        }

        const newAccessToken = await generateAccessToken({ id: user.id, email: user.email, email_verified: user.email_verified, role })
        const newRefreshToken = await generateRefreshToken({ id: user.id })

        if (user && newRefreshToken) {
            if (role === 'recruiter') await updateRecruiterRefreshToken(user.id, newRefreshToken)
            else await updateCandidateRefreshToken(user.id, newRefreshToken)
        }

        return {
            user: {
                id: user.id,
                email: user.email,
                role: role,
                email_verified: user.email_verified,
            },
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        }
    }

    static async changePass(userId: number, currentPass: string, newPass: string, role: Role) {
        if (!currentPass || !newPass) {
            throw new ApiError(400, 'Required fields not found!')
        }

        let user: CandidateRow | RecruiterRow | null = null
        if (role === 'candidate') {
            user = await findCandidateById(userId)
        } else {
            user = await findRecruiterById(userId)
        }

        if (!user) {
            throw new ApiError(404, 'User not found!')
        }

        const isValid = await bcrypt.compare(currentPass, user.password)
        if (!isValid) {
            throw new ApiError(400, 'Please provide valid password!')
        }

        const hash = await bcrypt.hash(newPass, 10)

        let verify = null;
        if (role === 'recruiter') {
            verify = await updateRecruiterPassword(userId, hash)
        } else {
            verify = await updateCandidatePassword(userId, hash)
        }

        if (!verify) {
            throw new ApiError(500, 'Something went wrong!')
        }

        return verify;
    }

    static async verifyEmail(userId: number, otp: number, role: Role) {
        let user: CandidateRow | RecruiterRow | null = null
        if (role === 'candidate') {
            user = await findCandidateById(userId)
        } else {
            user = await findRecruiterById(userId)
        }

        if (!user) {
            throw new ApiError(404, 'User not found!')
        }

        const isValid = await verifyEmailOtp(user.email, otp)
        if (!isValid) {
            throw new ApiError(400, 'Invalid Otp!')
        }

        if (role === 'candidate') {
            await updateCandidateEmailVerified(userId, true)
        } else {
            await updateRecruiterEmailVerified(userId, true)
        }

        return {
            id: user.id,
            email: user.email,
            email_verified: user.email_verified,
        };
    }
}