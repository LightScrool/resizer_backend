import { Request, Response, NextFunction } from 'express';
import { ApiError } from '~/errors/api-error';

export const errorHandlingMiddleware = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    const status = err instanceof ApiError ? err.status : 500;
    const message =
        err instanceof ApiError ? err.message : 'Internal server error';

    res.status(status).json({ message });
};
