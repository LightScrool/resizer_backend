import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const { S3_ENDPOINT_URL, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;

if (!S3_ENDPOINT_URL) {
    throw new Error('"S3_ENDPOINT_URL" enviroment variable not specified');
}

if (!S3_ACCESS_KEY_ID) {
    throw new Error('"S3_ACCESS_KEY_ID" enviroment variable not specified');
}

if (!S3_SECRET_ACCESS_KEY) {
    throw new Error('"S3_SECRET_ACCESS_KEY" enviroment variable not specified');
}

export const s3Client = new S3Client({
    region: 'ru-central1',
    endpoint: S3_ENDPOINT_URL,
    credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
});
