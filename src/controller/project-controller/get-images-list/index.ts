import { withTryCatch } from '~/helpers/with-try-catch';
import { validateProjectAccess } from '~/auth/validate-project-access';
import { Image } from '~/models';
import { OutputImage } from '~/schema/preset';
import { getOuterImageUrl } from '~/helpers/get-outer-image-url';
import { ORIGINAL_PRESET_ALIAS } from '~/config';

export const getImagesList = withTryCatch(async (req, res) => {
    const { projectAlias } = req.params;

    await validateProjectAccess(req, projectAlias, 'any');

    const images = await Image.findAll({
        where: { ProjectAlias: projectAlias },
        order: [['updatedAt', 'DESC']],
    });

    const result: OutputImage[] = images.map((imageDb) => ({
        id: imageDb.id,
        link: getOuterImageUrl({
            projectAlias,
            imageId: imageDb.id,
            presetAlias: ORIGINAL_PRESET_ALIAS,
        }),
        name: imageDb.name,
        description: imageDb.description,
    }));

    res.json(result);
});
