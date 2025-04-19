import { Request } from 'express';

import { ApiError } from '~/errors/api-error';
import { getUserAuthInfo, WEB_AUTH_START } from './get-user-auth-info';
import { Project } from '~/models';

const API_AUTH_START = 'API ';

type AccesPolicy = 'any' | 'api-only' | 'web-only';

export const validateProjectAccess = async (
    req: Request,
    prjectAlias: string,
    accesPolicy: AccesPolicy,
) => {
    const { authorization } = req.headers;

    if (!authorization) {
        throw ApiError.unauthorized();
    }

    if (authorization.startsWith(WEB_AUTH_START)) {
        if (accesPolicy === 'api-only') {
            throw ApiError.forbidden('This route allows acces only from API');
        }

        const [userInfo, project] = await Promise.all([
            getUserAuthInfo(req),
            Project.findOne({
                where: { alias: prjectAlias },
            }),
        ]);

        if (!userInfo) {
            throw ApiError.unauthorized();
        }

        if (!project) {
            throw ApiError.notFound('Project not found');
        }

        if (project.UserId !== userInfo.id) {
            throw ApiError.forbidden('The user does not own the project');
        }

        return;
    }

    if (authorization.startsWith(API_AUTH_START)) {
        if (accesPolicy === 'web-only') {
            throw ApiError.forbidden('This route allows acces only from UI');
        }

        const project = await Project.findOne({
            where: { alias: prjectAlias },
        });

        if (!project) {
            throw ApiError.notFound('Project not found');
        }

        const apiKey = authorization.slice(API_AUTH_START.length);

        if (project.apiKey !== apiKey) {
            throw ApiError.forbidden('Invalid api key');
        }

        return;
    }

    throw ApiError.unauthorized();
};
