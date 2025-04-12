import { Request, Response, NextFunction } from 'express';

export type EndpointCallback = (
    req: Request,
    res: Response,
    next: NextFunction,
) => Promise<void>;
