import dotenv from 'dotenv';

import { S3Api } from './s3-api';

dotenv.config();

const {
    S3_ENDPOINT_URL,
    S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY,
    S3_BUCKET_NAME,
} = process.env;

if (!S3_ENDPOINT_URL) {
    throw new Error('"S3_ENDPOINT_URL" enviroment variable not specified');
}

if (!S3_ACCESS_KEY_ID) {
    throw new Error('"S3_ACCESS_KEY_ID" enviroment variable not specified');
}

if (!S3_SECRET_ACCESS_KEY) {
    throw new Error('"S3_SECRET_ACCESS_KEY" enviroment variable not specified');
}

if (!S3_BUCKET_NAME) {
    throw new Error('"S3_BUCKET_NAME" enviroment variable not specified');
}

export const s3Api = new S3Api({
    endpointUrl: S3_ENDPOINT_URL,
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
    bucketName: S3_BUCKET_NAME,
});
