import type { CookieOptions } from "express";
import { AuthService } from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { Recruiter } from "../models/recruiter.model.js";

export const registerUser = asyncHandler(async (req, res) => {
    const user = await AuthService.register(req.body)

    res.redirect(`/verify-email?userId=${user.id}`)
    // res
    // .status(201)
    // .json(
    //     new ApiResponse(201, user, 'User registered successfully!')
    // )
})

export const loginUser = asyncHandler(async (req, res) => {
    const { user, refreshToken, accessToken } = await AuthService.login(req.body)

    const options: CookieOptions = {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
    }

    res
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .status(200)
        .json(
            new ApiResponse(200, user, 'User logged in successfully!')
        )
})

export const forgotPassword = asyncHandler(async (req, res) => {

})

export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies

    if (!refreshToken) {
        return res.redirect('/login')
    }

    try {
        console.log('Decoding...')
        const decodedToken = await verifyRefreshToken(refreshToken) as { _id: string, iat: number, exp: number }

        console.log('refreshToken:', decodedToken);
        const user = await Recruiter.findById(decodedToken._id)

        if (!user || !user.refresh_token || user.refresh_token !== refreshToken) {
            return res.redirect('/login');
        }

        console.log('Token generating..')
        const newAccessToken = await generateAccessToken({ _id: user._id, email: user.email })
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
                new ApiResponse(200, { _id: user._id, email: user.email }, 'User logged in successfully!')
            )
    } catch (error) {
        console.error(error)
        res.redirect('/login')
    }
})

export const userDetails = asyncHandler(async (req, res) => {
    console.log('Response sended!')
    res.status(200).json(new ApiResponse(200, req.user, 'User LoggedIn Successfully!'))
})