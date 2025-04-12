import path from 'path';

export const ROOT_FOLDER = path.join(process.cwd(), 'dist');

export enum AllowedFilesExtensions {
    jpg = 'jpg',
    jpeg = 'jpeg',
    png = 'png',
    webp = 'webp',
    svg = 'svg',
}
export const ALLOWED_FILES_EXTENSIONS = Array.from(
    Object.values(AllowedFilesExtensions),
);

export const ORIGINAL_PRESET_ALIAS = 'original';
