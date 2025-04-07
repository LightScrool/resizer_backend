import { Router } from 'express';
import { ApiError } from '~/errors/api-error';

const router = Router();

router.get('/health-check', (req, res, _next) => {
    res.status(200).json({ message: 'ok' });
});

router.use((_req, _res, next) => {
    next(ApiError.notFound());
});

export { router };
