import { CroppedImage, Preset } from '~/models';
import { s3Api } from '~/s3-api';

type Params = {
    projectAlias: string;
    presetAlias: string;
};

export const deletePreset = async ({ projectAlias, presetAlias }: Params) => {
    console.log(
        `Removing preset with alias "${presetAlias}" in project "${projectAlias}"`,
    );

    const preset = await Preset.findOne({
        where: { ProjectAlias: projectAlias, alias: presetAlias },
    });

    if (!preset) {
        return;
    }

    const croppedImages = await CroppedImage.findAll({
        where: { PresetId: preset.id },
    });

    await preset.destroy();

    await Promise.all(
        croppedImages.map((croppedImage) =>
            s3Api.deleteFileByUrl(croppedImage.link),
        ),
    );
};
