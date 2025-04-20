import { IMAGE_PROXY_HOST } from '~/config';

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
    return `${IMAGE_PROXY_HOST}/${projectAlias}/${imageId}/${presetAlias}`; // TODO: move localhost to env
};
