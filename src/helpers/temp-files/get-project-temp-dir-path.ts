import path from 'path';
import fs from 'fs';

import { getTempFilesDirName } from './get-temp-files-dir-name';

type Params = {
    projectAlias: string;
};

export const getProjectTempDirPath = ({ projectAlias }: Params) => {
    const result = path.join(getTempFilesDirName(), projectAlias);

    if (!fs.existsSync(result)) {
        fs.mkdirSync(result);
    }

    return result;
};
