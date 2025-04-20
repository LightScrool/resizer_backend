import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

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

export const { IMAGE_PROXY_HOST } = process.env;

if (!IMAGE_PROXY_HOST) {
    throw new Error('IMAGE_PROXY_HOST env var not specified');
}
