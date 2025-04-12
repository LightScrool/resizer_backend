import path from 'path';

type Params = {
    imageTempDirPath: string;
    presetAlias: string;
    extension: string;
};

export const getFileTempPath = ({
    imageTempDirPath,
    presetAlias,
    extension,
}: Params) => {
    return path.join(imageTempDirPath, [presetAlias, extension].join('.'));
};
