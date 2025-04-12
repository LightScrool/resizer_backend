import { Router } from 'express';
import { imageController } from '~/controller/image-controller';
import { ApiError } from '~/errors/api-error';

const router = Router();

router.get('/health-check', (req, res, _next) => {
    res.status(200).json({ message: 'ok' });
});

router.post('/v1/projects/:projectAlias/images', imageController.upload);

router.use((_req, _res, next) => {
    next(ApiError.notFound('Route not found'));
});

export { router };
