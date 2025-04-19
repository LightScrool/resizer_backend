import { Request } from 'express';
import { User } from '~/models';

export const WEB_AUTH_START = 'OAuth ';
const YP_ENDPOINT_URL = 'https://login.yandex.ru/info?format=json';

type UserAuthInfo = {
    id: string;
    yandexId: string;
    name: string;
    avatarUrl: string;
};

export const getUserAuthInfo = async (
    req: Request,
): Promise<UserAuthInfo | null> => {
    try {
        const { authorization } = req.headers;

        if (!authorization) {
            return null;
        }

        if (!authorization.startsWith(WEB_AUTH_START)) {
            return null;
        }

        const ypResp = await fetch(YP_ENDPOINT_URL, {
            headers: { authorization },
        });

        if (ypResp.status !== 200) {
            return null;
        }

        const {
            id: yandexId,
            default_avatar_id: avatarId,
            login: name,
        } = await ypResp.json();

        for (const field of [yandexId, avatarId, name]) {
            if (!field || typeof field !== 'string') {
                return null;
            }
        }

        const [userDb] = await User.findOrCreate({
            where: { yandexId },
            defaults: {
                name,
                yandexId,
            },
        });

        const id = userDb.id;
        const avatarUrl = `https://avatars.yandex.net/get-yapic/${avatarId}/islands-middle`;

        const result: UserAuthInfo = {
            id,
            yandexId,
            name,
            avatarUrl,
        };

        if (name !== userDb.name) {
            userDb.name = name;
            userDb.save().catch(() => {
                console.log(
                    `Error while updating name of user with id "${id}"`,
                );
            });
        }

        return result;
    } catch {
        return null;
    }
};
