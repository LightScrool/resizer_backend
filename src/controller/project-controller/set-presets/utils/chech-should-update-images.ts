import { IS_HORIZONTAL_DEFAULT_VALUE, Preset } from '~/models';
import { InputPreset } from '~/schema/preset';

type Params = {
    newPreset: InputPreset;
    dbPreset: Preset;
};

export const checkShouldUpdateImages = ({
    newPreset,
    dbPreset,
}: Params): boolean => {
    if (newPreset.size !== dbPreset.size) {
        return true;
    }

    if (
        (newPreset.isHorizontal ?? IS_HORIZONTAL_DEFAULT_VALUE) !==
        dbPreset.isHorizontal
    ) {
        return true;
    }

    return false;
};
