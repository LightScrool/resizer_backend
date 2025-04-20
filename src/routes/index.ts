import { Router } from 'express';
import { imageController } from '~/controller/image-controller';
import { projectController } from '~/controller/project-controller';
import { userController } from '~/controller/user-controller';
import { ApiError } from '~/errors/api-error';

const router = Router();

/** Всегда возвращает 200 */
router.get('/health-check', (req, res) => {
    res.status(200).json({ message: 'ok' });
});

/** Информаиця о пользователе, для шапки */
router.get('/v1/user', userController.getInfo);

/** Список проектов пользователя */
router.get('/v1/user/projects', userController.getProjectsList);

/** Создание проекта */
router.post('/v1/projects', projectController.create);

/** Удаление проекта */
router.delete('/v1/projects/:projectAlias', projectController.remove);

/** Информация о проекте (название, описание) */
router.get('/v1/projects/:projectAlias', projectController.getInfo);

/** Список пресетов в проекте */
router.get(
    '/v1/projects/:projectAlias/presets',
    projectController.getPresetsList,
);

/** Установка пресетов проекта */
router.post('/v1/projects/:projectAlias/presets', projectController.setPresets);

/** Список изображений в проекте */
router.get(
    '/v1/projects/:projectAlias/images',
    projectController.getImagesList,
);

/** Загружка изображения в проекте */
router.post('/v1/projects/:projectAlias/images', imageController.upload);

/** Удаление изображения */
router.delete('/v1/projects/:projectAlias/images/:imageId', (req, res) => {
    res.status(404).send(); // TODO
});

/** Получение секретного ключа проекта */
router.get('/v1/projects/:projectAlias/apiKey', projectController.getApiKey);

/** Сброс секретного ключа проекта */
router.delete(
    '/v1/projects/:projectAlias/apiKey',
    projectController.refreshApiKey,
);

router.use((_req, _res, next) => {
    next(ApiError.notFound('Route not found'));
});

export { router };
