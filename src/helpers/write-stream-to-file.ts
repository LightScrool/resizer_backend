import fs from 'fs';
import Stream from 'stream';

type WriteStreamToFileParams = {
    fileStream: Stream;
    outputFilePath: string;
};

export const writeStreamToFile = async ({
    fileStream,
    outputFilePath,
}: WriteStreamToFileParams) => {
    try {
        await new Promise<void>((resolve, reject) => {
            fileStream
                .pipe(fs.createWriteStream(outputFilePath))
                .on('error', (err) => reject(err))
                .on('close', () => resolve());
        });
    } catch {
        throw new Error('Error while writting a stream to a file');
    }
};
