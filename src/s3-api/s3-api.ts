import fs from 'fs';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import Stream from 'stream';

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

type DownloadFileByUrlParams = {
    fileUrl: string;
    outputFilePath: string;
};

export class S3Api {
    declare endpointUrl: string;
    declare bucketName: string;
    declare s3Client: S3Client;

    constructor({
        endpointUrl: endpointUrlParam,
        accessKeyId,
        secretAccessKey,
        bucketName,
    }: ConstructorParams) {
        const endpointUrl = endpointUrlParam.endsWith('/')
            ? endpointUrlParam.slice(0, -1)
            : endpointUrlParam;

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

    private getDataFromFileUrl(fileUrl: string) {
        if (!fileUrl.startsWith(this.endpointUrl)) {
            throw new Error('Trying to delete file with another endpointUrl');
        }

        const urlWoHost = fileUrl.slice(this.endpointUrl.length);

        const regExpResult = /^\/([^/]+)\/(.+)$/.exec(urlWoHost);

        if (!regExpResult || regExpResult.length != 3) {
            throw new Error('Invalid url format');
        }

        const [_, bucketName, fileName] = regExpResult;

        return {
            bucketName,
            fileName,
        };
    }

    async uploadFile({ fileName, filePath, contentType }: UploadFileParams) {
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

    async deleteFileByUrl(fileUrl: string) {
        const { bucketName, fileName } = this.getDataFromFileUrl(fileUrl);

        await this.s3Client.send(
            new DeleteObjectCommand({
                Bucket: bucketName,
                Key: fileName,
            }),
        );
    }

    async downloadFileByUrl({
        fileUrl,
        outputFilePath,
    }: DownloadFileByUrlParams) {
        const { bucketName, fileName } = this.getDataFromFileUrl(fileUrl);

        const { Body } = await this.s3Client.send(
            new GetObjectCommand({
                Bucket: bucketName,
                Key: fileName,
            }),
        );

        if (!Body) {
            throw new Error('Error when downloading file from s3');
        }

        try {
            await new Promise<void>((resolve, reject) => {
                (Body as Stream)
                    .pipe(fs.createWriteStream(outputFilePath))
                    .on('error', (err) => reject(err))
                    .on('close', () => resolve());
            });
        } catch {
            throw new Error('Error when downloading file from s3');
        }
    }
}
