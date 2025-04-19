import { setPresets } from './set-presets';
import { create } from './create';
import { getInfo } from './get-info';
import { getApiKey } from './api-key/get';
import { refreshApiKey } from './api-key/refresh';
import { remove } from './remove';

export const projectController = {
    create,
    getInfo,
    setPresets,
    remove,
    getApiKey,
    refreshApiKey,
};
