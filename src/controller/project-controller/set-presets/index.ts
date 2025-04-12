import { ApiError } from '~/errors/api-error';
import { withTryCatch } from '~/helpers/with-try-catch';
import { inputPresetListSchema } from '~/schema/preset';
import { Preset } from '~/models';
import { deletePreset } from './delete-preset';

export const setPresets = withTryCatch(async (req, res) => {
    const { projectAlias } = req.params;

    const parsedBody = inputPresetListSchema.safeParse(req.body);

    if (!parsedBody.success) {
        const { error } = parsedBody;
        throw ApiError.badRequest(error.message);
    }

    const newPresetList = parsedBody.data;

    const oldPresetList = await Preset.findAll({
        where: { ProjectAlias: projectAlias },
    });

    const newPresetAliases = new Set(
        newPresetList.map((preset) => preset.alias),
    );

    const oldPresetAliases = new Set(
        oldPresetList.map((preset) => preset.alias),
    );

    const presetsToCreateAliases: string[] = [];
    const presetsToDeleteAliases: string[] = [];
    const presetsToEditAliases: string[] = [];

    for (const preset of newPresetAliases) {
        if (oldPresetAliases.has(preset)) {
            presetsToEditAliases.push(preset);
        } else {
            presetsToCreateAliases.push(preset);
        }
    }

    for (const preset of oldPresetAliases) {
        if (!newPresetAliases.has(preset)) {
            presetsToDeleteAliases.push(preset);
        }
    }

    const promises = [
        ...presetsToDeleteAliases.map((presetToDeleteAlias) =>
            deletePreset({ projectAlias, presetAlias: presetToDeleteAlias }),
        ),
    ];

    await Promise.all(promises);

    res.status(200).send();
});
