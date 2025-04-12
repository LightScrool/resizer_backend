import { ApiError } from '~/errors/api-error';
import { withTryCatch } from '~/helpers/with-try-catch';
import { inputPresetListSchema, InputPreset } from '~/schema/preset';
import { Project, Preset } from '~/models';
import { deletePreset } from './delete-preset';
import { createPreset } from './create-preset';

export const setPresets = withTryCatch(async (req, res) => {
    const { projectAlias } = req.params;

    const parsedBody = inputPresetListSchema.safeParse(req.body);

    if (!parsedBody.success) {
        const { error } = parsedBody;
        throw ApiError.badRequest(error.message);
    }

    const newPresetsList = parsedBody.data;

    const newPresetsDict: Record<string, InputPreset> = {};

    for (const newPreset of newPresetsList) {
        if (newPreset.alias in newPresetsDict) {
            throw ApiError.badRequest(
                `Preset alias "${newPreset.alias}" has multiple declarations`,
            );
        }
        newPresetsDict[newPreset.alias] = newPreset;
    }

    const project = await Project.findOne({
        where: { alias: projectAlias },
    });

    if (!project) {
        throw ApiError.notFound('Project not found');
    }

    if (project.presetsLimit < newPresetsList.length) {
        throw ApiError.badRequest('Presets quantity limit exceeded');
    }

    const oldPresetList = await Preset.findAll({
        where: { ProjectAlias: projectAlias },
    });
    const oldPresetAliases = new Set(
        oldPresetList.map((preset) => preset.alias),
    );

    const presetsToCreateAliases: string[] = [];
    const presetsToDeleteAliases: string[] = [];
    const presetsToEditAliases: string[] = [];

    for (const preset of Object.values(newPresetsDict)) {
        if (oldPresetAliases.has(preset.alias)) {
            presetsToEditAliases.push(preset.alias);
        } else {
            presetsToCreateAliases.push(preset.alias);
        }
    }

    for (const preset of oldPresetAliases) {
        if (!(preset in newPresetsDict)) {
            presetsToDeleteAliases.push(preset);
        }
    }

    presetsToDeleteAliases.forEach((presetAlias) =>
        deletePreset({ projectAlias, presetAlias }),
    );

    presetsToCreateAliases.forEach((presetAlias) =>
        createPreset({ projectAlias, preset: newPresetsDict[presetAlias] }),
    );

    res.status(200).send();
});
