type Params = {
    projectAlias: string;
    imageId: string;
    presetAlias: string;
};

export const generateS3FileName = ({
    projectAlias,
    imageId,
    presetAlias,
}: Params) => {
    return [projectAlias, imageId, presetAlias].join('/');
};
