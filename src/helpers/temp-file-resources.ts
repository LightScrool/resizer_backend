import fs from 'fs';
import EventEmitter from 'node:events';

const FILES_USAGE = new Set<string>();

const CUSTOM_EVENT_NAME = 'tempFileRealease';

const eventEmitter = new EventEmitter();

export const captureTempFile = async (fileName: string) => {
    if (!FILES_USAGE.has(fileName)) {
        FILES_USAGE.add(fileName);
        return;
    }

    await new Promise<void>((resolve) => {
        const listener = (releasedFileName: string) => {
            if (releasedFileName !== fileName) {
                return;
            }

            if (FILES_USAGE.has(fileName)) {
                return;
            }

            FILES_USAGE.add(fileName);
            eventEmitter.removeListener(CUSTOM_EVENT_NAME, listener);
            return resolve();
        };

        eventEmitter.addListener(CUSTOM_EVENT_NAME, listener);
    });
};

export const clenupTempFile = (fileName: string) => {
    fs.rmSync(fileName);
    FILES_USAGE.delete(fileName);
    eventEmitter.emit(CUSTOM_EVENT_NAME, fileName);
};
