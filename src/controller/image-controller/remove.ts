import { withTryCatch } from '~/helpers/with-try-catch';
import { validateProjectAccess } from '~/auth/validate-project-access';
import { Image, Preset } from '~/models';
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
    const { projectAlias, imageId } = req.params;

    await validateProjectAccess(req, projectAlias, 'web-only');

    // @ts-expect-error Кривая типизация ORM
    const image: ImageWithPresets | undefined = await Image.findOne({
        where: { id: imageId, ProjectAlias: projectAlias },
        include: [{ model: Preset }],
    });

    if (!image) {
        throw ApiError.notFound('Image not found');
    }

    const imagesToDeleteLinks = [
        image.originalLink,
        ...image.Presets.map((preset) => preset.CroppedImage.link),
    ];

    await Promise.all(
        imagesToDeleteLinks.map((link) => s3Api.deleteFileByUrl(link)),
    );

    await image.destroy();

    res.status(200).send();
});
