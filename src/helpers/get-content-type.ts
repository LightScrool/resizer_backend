import { AllowedFilesExtensions } from '~/config';

const EXTENSION_TO_CONTENT_TYPE_DICT: Record<AllowedFilesExtensions, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    svg: 'image/svg+xml',
};

const CONTENT_TYPE_TO_EXTENSION_DICT = Array.from(
    Object.entries(EXTENSION_TO_CONTENT_TYPE_DICT),
).reduce<Record<string, AllowedFilesExtensions>>(
    (acc, [extension, contentType]) => {
        if (!acc[contentType]) {
            acc[contentType] = extension as AllowedFilesExtensions;
        }

        return acc;
    },
    {},
);

export const getContentType = (extension: AllowedFilesExtensions) => {
    return EXTENSION_TO_CONTENT_TYPE_DICT[extension];
};

export const getExtension = (
    contentType: string | null | undefined,
): AllowedFilesExtensions | null => {
    if (!contentType) {
        return null;
    }

    const value = CONTENT_TYPE_TO_EXTENSION_DICT[contentType];

    if (!value) {
        return null;
    }

    return value;
};
