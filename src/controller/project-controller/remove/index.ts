import { withTryCatch } from '~/helpers/with-try-catch';
import { validateProjectAccess } from '~/auth/validate-project-access';
import { Project, Image, Preset } from '~/models';
import { ApiError } from '~/errors/api-error';
import { s3Api } from '~/s3-api';

type ImageWithPresets = Image & {
    Presets: Array<{
        CroppedImage: {
            link: string;
        };
    }>;
};

export const remove = withTryCatch(async (req, res) => {
    const { projectAlias } = req.params;

    await validateProjectAccess(req, projectAlias, 'web-only');

    const project = await Project.findOne({ where: { alias: projectAlias } });

    if (!project) {
        throw ApiError.notFound('Project not found');
    }

    // @ts-expect-error Кривая типизация ORM
    const images: ImageWithPresets[] = await Image.findAll({
        where: { ProjectAlias: projectAlias },
        include: [{ model: Preset }],
    });

    const imagesToDeleteLinks = images.reduce<Array<string>>(
        (result, image) => {
            result.push(image.originalLink);

            image.Presets.forEach((preset) => {
                result.push(preset.CroppedImage.link);
            });

            return result;
        },
        [],
    );

    await Promise.all(
        imagesToDeleteLinks.map((link) => s3Api.deleteFileByUrl(link)),
    );

    await project.destroy();

    res.status(200).json(images);
});
