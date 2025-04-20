import { withTryCatch } from '~/helpers/with-try-catch';
import { validateProjectAccess } from '~/auth/validate-project-access';
import { Preset } from '~/models';
import { OutputPreset } from '~/schema/preset';

export const getPresetsList = withTryCatch(async (req, res) => {
    const { projectAlias } = req.params;

    await validateProjectAccess(req, projectAlias, 'any');

    const presets = await Preset.findAll({
        where: { ProjectAlias: projectAlias },
    });

    const result: OutputPreset[] = presets.map((presetDb) => ({
        alias: presetDb.alias,
        size: presetDb.size,
        isHorizontal: presetDb.isHorizontal,
        name: presetDb.name,
        description: presetDb.description,
    }));

    res.json(result);
});
