import fs from 'fs';
import path from 'path';

import { ROOT_FOLDER } from '~/config';

export const getTempFilesDirName = () => {
    const result = path.join(ROOT_FOLDER, 'temp-files');

    if (!fs.existsSync(result)) {
        fs.mkdirSync(result);
    }

    return result;
};
