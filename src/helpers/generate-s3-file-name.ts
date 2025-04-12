type Params = {
    projectAlias: string;
    imageId: string;
    presetAlias: string;
    extension: string;
};

export const generateS3FileName = ({
    projectAlias,
    imageId,
    presetAlias,
    extension,
}: Params) => {
    return [projectAlias, imageId, `${presetAlias}.${extension}`].join('/');
};
