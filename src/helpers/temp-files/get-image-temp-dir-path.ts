import path from 'path';
import fs from 'fs';

import { getProjectTempDirPath } from './get-project-temp-dir-path';

type Params = {
    projectAlias: string;
    imageId: string;
};

export const getImageTempDirPath = ({ projectAlias, imageId }: Params) => {
    const projectTempDirPath = getProjectTempDirPath({
        projectAlias,
    });
    const result = path.join(projectTempDirPath, imageId);

    if (!fs.existsSync(result)) {
        fs.mkdirSync(result);
    }

    return result;
};
