import fs from 'fs';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { checkIsAllowedExtension } from '~/helpers/check-is-allowed-extension';

type ConstructorParams = {
    endpointUrl: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
};

type UploadFileParams = {
    fileName: string;
    filePath: string;
    contentType: string;
};

export class S3Api {
    declare endpointUrl: string;
    declare bucketName: string;
    declare s3Client: S3Client;

    constructor({
        endpointUrl,
        accessKeyId,
        secretAccessKey,
        bucketName,
    }: ConstructorParams) {
        this.endpointUrl = endpointUrl;
        this.bucketName = bucketName;
        this.s3Client = new S3Client({
            region: 'ru-central1',
            endpoint: endpointUrl,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }

    async uploadFile({ fileName, filePath, contentType }: UploadFileParams) {
        const extension = filePath.split('.').pop();

        if (!extension) {
            throw new Error('Failed to get file extension');
        }

        if (!checkIsAllowedExtension(extension)) {
            throw new Error('Forbidden file extension');
        }

        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileName,
                Body: fs.readFileSync(filePath),
                ContentType: contentType,
            }),
        );

        return {
            fileUrl: `${this.endpointUrl}/${this.bucketName}/${fileName}`,
        };
    }
}
