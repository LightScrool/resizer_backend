import { AllowedFilesExtensions } from '~/config';

const EXTENSION_TO_CONTENT_TYPE_DICT: Record<AllowedFilesExtensions, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    svg: 'image/svg',
};

export const getContentType = (extension: AllowedFilesExtensions) => {
    return EXTENSION_TO_CONTENT_TYPE_DICT[extension];
};
