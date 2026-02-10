import { type Request, type Response, type NextFunction } from 'express';
import { ApiResponse } from '../utils/ApiResponse.js';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;

    console.log(err)
    // res.status(statusCode).render('error', { message: err.message || 'We founding the error!' })
    res
    .status(statusCode)
    .json(
        new ApiResponse(statusCode, null, err.message || "Something Went Wrong!")
    )
};