import { AllowedFilesExtensions, ALLOWED_FILES_EXTENSIONS } from '~/config';

export const checkIsAllowedExtension = (
    extension: string | null | undefined,
): extension is AllowedFilesExtensions => {
    return ALLOWED_FILES_EXTENSIONS.some((v) => v === extension);
};
