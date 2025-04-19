import { ApiError } from '~/errors/api-error';
import { withTryCatch } from '~/helpers/with-try-catch';
import { inputPresetListSchema, InputPreset } from '~/schema/preset';
import { Project, Preset } from '~/models';
import { deletePreset } from './delete-preset';
import { createPreset } from './create-preset';
import { updatePreset } from './update-preset';
import { validateProjectAccess } from '~/auth/validate-project-access';

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

    await validateProjectAccess(req, projectAlias, 'any');

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
    const oldPresetsDict: Record<string, Preset> = {};

    for (const oldPreset of oldPresetList) {
        if (oldPreset.alias in oldPresetsDict) {
            throw ApiError.badRequest(
                `Preset alias "${oldPreset.alias}" has multiple declarations`,
            );
        }
        oldPresetsDict[oldPreset.alias] = oldPreset;
    }

    const presetsToCreateAliases: string[] = [];
    const presetsToDeleteAliases: string[] = [];
    const presetsToUpdateAliases: string[] = [];

    for (const preset of Object.values(newPresetsDict)) {
        if (preset.alias in oldPresetsDict) {
            presetsToUpdateAliases.push(preset.alias);
        } else {
            presetsToCreateAliases.push(preset.alias);
        }
    }

    for (const preset of Object.values(oldPresetsDict)) {
        if (!(preset.alias in newPresetsDict)) {
            presetsToDeleteAliases.push(preset.alias);
        }
    }

    res.status(200).send();

    await Promise.all([
        ...presetsToDeleteAliases.map((presetAlias) =>
            deletePreset({ projectAlias, presetAlias }),
        ),
        ...presetsToCreateAliases.map((presetAlias) =>
            createPreset({ projectAlias, preset: newPresetsDict[presetAlias] }),
        ),
        ...presetsToUpdateAliases.map((presetAlias) =>
            updatePreset({
                newPreset: newPresetsDict[presetAlias],
                dbPreset: oldPresetsDict[presetAlias],
            }),
        ),
    ]);
});
