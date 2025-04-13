import { withTryCatch } from '~/helpers/with-try-catch';
import { getUserAuthInfo } from '~/auth/get-user-auth-info';
import { ApiError } from '~/errors/api-error';

export const getInfo = withTryCatch(async (req, res) => {
    const info = await getUserAuthInfo(req);

    if (!info) {
        throw ApiError.unauthorized();
    }

    const result = {
        name: info.name,
        avatarUrl: info.avatarUrl,
    };

    res.json(result);
});
