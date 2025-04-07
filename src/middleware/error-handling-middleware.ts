import { Request, Response, NextFunction } from 'express';
import { ApiError } from '~/errors/api-error';

export const errorHandlingMiddleware = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    if (err instanceof ApiError) {
        res.locals.message = err.message;
        res.status(err.status);
    } else {
        res.locals.message = 'Internal server error';
        res.status(500);
    }

    res.send();
};
