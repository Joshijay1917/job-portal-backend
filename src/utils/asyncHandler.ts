import type { Request, Response, NextFunction } from "express"

export type AsyncController = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void>;

export function asyncHandler(fun: AsyncController) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fun(req, res, next)).catch(next)
    }
}