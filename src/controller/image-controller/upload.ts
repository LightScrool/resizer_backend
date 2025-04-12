import { v4 as uuidV4 } from 'uuid';
import fs from 'fs';
import sharp from 'sharp';

import { ApiError } from '~/errors/api-error';
import { withTryCatch } from '~/helpers/with-try-catch';
import { Image, Preset, CroppedImage } from '~/models';
import { ORIGINAL_PRESET_ALIAS } from '~/config';
import { s3Api } from '~/s3-api';
import { generateS3FileName } from '~/helpers/generate-s3-file-name';
import { getOuterImageUrl } from '~/helpers/get-outer-image-url';
import { checkIsAllowedExtension } from '~/helpers/check-is-allowed-extension';
import { getContentType } from '~/helpers/get-content-type';
import { getFileTempPath, getImageTempDirPath } from '~/helpers/temp-files';

export const upload = withTryCatch(async (req, res) => {
    const { projectAlias } = req.params;
    // TODO: auth

    const file = Array.isArray(req.files?.file)
        ? req.files?.file[0]
        : req.files?.file;
    if (!file) {
        throw ApiError.badRequest('No file attached');
    }

    const extension = file.name.split('.').pop();
    if (!checkIsAllowedExtension(extension)) {
        // TODO: sec extension check
        throw ApiError.badRequest(`Exteinsion "${extension}" is not allowed`);
    }

    let imageId = uuidV4();
    while (await Image.findOne({ where: { id: imageId } })) {
        console.log('New image uuidV4 collision, generating new id...');
        imageId = uuidV4();
    }

    const [imageTempDirPath, cleanUpImageTempDir] = getImageTempDirPath({
        projectAlias,
        imageId,
    });

    const originalFilePath = getFileTempPath({
        imageTempDirPath,
        presetAlias: ORIGINAL_PRESET_ALIAS,
        extension,
    });

    await file.mv(originalFilePath);

    const contentType = getContentType(extension);
    const { fileUrl } = await s3Api.uploadFile({
        fileName: generateS3FileName({
            projectAlias,
            imageId,
            presetAlias: ORIGINAL_PRESET_ALIAS,
            extension,
        }),
        filePath: originalFilePath,
        contentType,
    });

    const name: string | undefined =
        typeof req.body.name === 'string' ? req.body.name : undefined;
    const description: string | undefined =
        typeof req.body.description === 'string'
            ? req.body.description
            : undefined;

    await new Image({
        id: imageId,
        ProjectAlias: projectAlias,
        originalLink: fileUrl,
        name,
        description,
    }).save();

    const imageUrl = getOuterImageUrl({
        projectAlias,
        imageId,
        presetAlias: ORIGINAL_PRESET_ALIAS,
    });

    res.json({
        id: imageId,
        imageUrl,
    });

    const presets = await Preset.findAll({
        where: { ProjectAlias: projectAlias },
    });

    const handleResizeFunctions = presets.map((preset) => async () => {
        const currentFilePath = getFileTempPath({
            imageTempDirPath,
            presetAlias: preset.alias,
            extension,
        });

        await sharp(originalFilePath)
            .resize(
                preset.isHorizontal
                    ? { width: preset.size }
                    : { height: preset.size },
            )
            .toFile(currentFilePath);

        const { fileUrl } = await s3Api.uploadFile({
            fileName: generateS3FileName({
                projectAlias,
                imageId,
                presetAlias: preset.alias,
                extension,
            }),
            filePath: currentFilePath,
            contentType,
        });

        await new CroppedImage({
            PresetId: preset.id,
            ImageId: imageId,
            link: fileUrl,
        }).save();

        fs.rmSync(currentFilePath);
    });

    await Promise.all(handleResizeFunctions.map((fn) => fn()));

    fs.rmSync(originalFilePath);
    cleanUpImageTempDir();
});
