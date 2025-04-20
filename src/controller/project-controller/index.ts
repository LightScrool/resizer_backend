import { setPresets } from './set-presets';
import { create } from './create';
import { getInfo } from './get-info';
import { getApiKey } from './api-key/get';
import { refreshApiKey } from './api-key/refresh';
import { remove } from './remove';
import { getPresetsList } from './get-presets-list';
import { getImagesList } from './get-images-list';

export const projectController = {
    create,
    getInfo,
    setPresets,
    remove,
    getApiKey,
    refreshApiKey,
    getPresetsList,
    getImagesList,
};
