import { Request, Response, NextFunction } from 'express';

export const logInfoMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    console.log(`New request ${req.method} ${req.path}`);
    next();
};
