import fs from 'fs';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

type ConstructorParams = {
    endpointUrl: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
};

type UploadFileParams = {
    fileName: string;
    filePath: string;
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

    async uploadFile({ fileName, filePath }: UploadFileParams) {
        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileName,
                Body: fs.readFileSync(filePath),
            }),
        );

        return {
            fileUrl: `${this.endpointUrl}/${this.bucketName}/${fileName}`,
        };
    }
}
