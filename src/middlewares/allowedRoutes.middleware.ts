import type { Request, Response, NextFunction} from 'express'
import { ApiError } from '../utils/ApiError.js';

export const allowRoles = (...roles: ("candidate" | "recruiter")[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user)
            return res.status(401).json(new ApiError(401, 'Unauthorized'))

        if (!roles.includes(req.user.role))
            return res.status(403).json(new ApiError(403, 'Forbidden'));

        next();
    };
};
