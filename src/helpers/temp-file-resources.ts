import fs from 'fs';

const FILES_USAGE = new Set<string>();

export const captureTempFile = async (fileName: string) => {
    // TODO: events
    if (!FILES_USAGE.has(fileName)) {
        FILES_USAGE.add(fileName);
        return;
    }

    await new Promise<void>((resolve) => {
        const intervalId = setInterval(() => {
            if (!FILES_USAGE.has(fileName)) {
                FILES_USAGE.add(fileName);
                clearInterval(intervalId);
                return resolve();
            }
        }, 50);
    });
};

export const clenupTempFile = (fileName: string) => {
    fs.rmSync(fileName);
    FILES_USAGE.delete(fileName);
};
