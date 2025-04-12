type Params = {
    projectAlias: string;
    imageId: string;
    presetAlias: string;
};

export const getOuterImageUrl = ({
    projectAlias,
    imageId,
    presetAlias,
}: Params) => {
    return `http://localhost:5001/${projectAlias}/${imageId}/${presetAlias}`; // TODO: move localhost to env
};
