import type { CookieOptions } from "express";
import { AuthService } from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { Recruiter } from "../models/recruiter.model.js";
import { Candidate } from "../models/candidate.model.js";
import type { Role } from "../types/job.d.ts";

export const register = asyncHandler(async (req, res) => {
    const user = await AuthService.register(req.body)

    res
        .status(201)
        .json(
            new ApiResponse(201, user, 'User registered successfully!')
        )
})

export const login = asyncHandler(async (req, res) => {
    const user = await AuthService.login(req.body)

    const options: CookieOptions = {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
    }

    res
        .status(200)
        .cookie('refreshToken', user.refreshToken, options)
        .cookie('accessToken', user.accessToken, options)
        .json(
            new ApiResponse(200, user, "User logged In Successfully!")
        )
})

export const logout = asyncHandler(async (req, res) => {
    const id = req.user?.id
    if(!id) {
        throw new ApiError(400, 'UserId not found!')
    }
    const user = await AuthService.logout(id)

    const options: CookieOptions = {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
    }

    res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, user, 'User loggedOut!')
    )
})

export const userDetails = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, req.user, 'User LoggedIn Successfully!'))
})

export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies

    if (!refreshToken) {
        throw new ApiError(403, 'Unauthorized request!')
    }

    try {
        console.log('Decoding...')
        const decodedToken = await verifyRefreshToken(refreshToken) as { _id: string, iat: number, exp: number }

        console.log('refreshToken:', decodedToken);
        let user = await Recruiter.findById(decodedToken._id)
        let role = 'recruiter'
        if(!user) {
            user = await Candidate.findById(decodedToken._id)
            role = 'candidate'
        }

        if (!user || !user.refresh_token || user.refresh_token !== refreshToken) {
            throw new ApiError(403, 'Invalid or expired token!')
        }

        console.log('Token generating..')
        const newAccessToken = await generateAccessToken({ id: user._id, email: user.email, email_verified: user.email_verified, role })
        const newRefreshToken = await generateRefreshToken({ _id: user._id })

        if (user && user.refresh_token && newRefreshToken) {
            user.refresh_token = newRefreshToken;
            await user.save({ validateBeforeSave: false });
        }

        const options: CookieOptions = {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000
        }

        res
            .cookie('accessToken', newAccessToken, options)
            .cookie('refreshToken', newRefreshToken, options)
            .status(200)
            .json(
                new ApiResponse(200, { user: { id: user._id, email: user.email, email_verified: user.email_verified }, accessToken: newAccessToken }, 'User logged in successfully!')
            )
    } catch (error) {
        console.error(error)
        throw error
    }
})