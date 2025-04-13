import { IS_HORIZONTAL_DEFAULT_VALUE, Preset } from '~/models';
import { InputPreset } from '~/schema/preset';

type Params = {
    newPreset: InputPreset;
    dbPreset: Preset;
};

const FIELDS_TO_CHECK: Array<keyof InputPreset & keyof Preset> = [
    'alias',
    'size',
    'isHorizontal',
    'name',
    'description',
];

const DEFAULT_VALUES = {
    isHorizontal: IS_HORIZONTAL_DEFAULT_VALUE,
    name: null,
    description: null,
} satisfies Partial<Record<keyof InputPreset, unknown>>;

export const checkIsEqual = ({ newPreset, dbPreset }: Params): boolean => {
    for (const field of FIELDS_TO_CHECK) {
        const oldValue = dbPreset[field];

        const newValue =
            field in DEFAULT_VALUES
                ? (newPreset[field] ??
                  DEFAULT_VALUES[field as keyof typeof DEFAULT_VALUES])
                : newPreset[field];

        if (newValue !== oldValue) {
            return false;
        }
    }
    return true;
};
