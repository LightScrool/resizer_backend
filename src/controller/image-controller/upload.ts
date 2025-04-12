import { withTryCatch } from '~/helpers/with-try-catch';

export const upload = withTryCatch(async (_req, res, _next) => {
    // TODO

    res.json({ message: 'ok' });
});
