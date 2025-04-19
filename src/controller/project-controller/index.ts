import { setPresets } from './set-presets';
import { create } from './create';
import { getInfo } from './get-info';
import { getApiKey } from './api-key/get';
import { refreshApiKey } from './api-key/refresh';

export const projectController = {
    setPresets,
    create,
    getInfo,
    getApiKey,
    refreshApiKey,
};
