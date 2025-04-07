import { Request, Response, NextFunction } from 'express';
import { ApiError } from '~/errors/api-error';

type THandler<Req, Res, Next> = (req: Req, res: Res, next: Next) => void;

export const withTryCatch = <
    Req extends Request,
    Res extends Response,
    Next extends NextFunction,
>(
    handler: THandler<Req, Res, Next>,
): THandler<Req, Res, Next> => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (e) {
            if (e instanceof ApiError) {
                next(e);
                return;
            }
            console.log(e);
            next(ApiError.internal());
        }
    };
};
