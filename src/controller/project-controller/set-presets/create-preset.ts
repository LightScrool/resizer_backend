import fs from 'fs';
import sharp from 'sharp';

import { InputPreset } from '~/schema/preset';
import { Preset, Image, CroppedImage } from '~/models';
import { s3Api } from '~/s3-api';
import { ORIGINAL_PRESET_ALIAS } from '~/config';
import { getFileTempPath, getImageTempDirPath } from '~/helpers/temp-files';
import { checkIsAllowedExtension } from '~/helpers/check-is-allowed-extension';
import { generateS3FileName } from '~/helpers/generate-s3-file-name';
import { getContentType } from '~/helpers/get-content-type';

type Params = {
    projectAlias: string;
    preset: InputPreset;
};

export const createPreset = async ({ projectAlias, preset }: Params) => {
    console.log(
        `Creating preset with alias "${preset.alias}" in project "${projectAlias}"`,
    );

    const { id: presetId } = await new Preset({
        ProjectAlias: projectAlias,
        alias: preset.alias,
        size: preset.size,
        isHorizontal: preset.isHorizontal,
        name: preset.name,
        description: preset.description,
    }).save();

    // TODO: let go request
    const images = await Image.findAll({
        where: { ProjectAlias: projectAlias },
    });

    for (const image of images) {
        const extension = image.originalLink.split('.').pop();

        if (!checkIsAllowedExtension(extension)) {
            throw new Error(
                `Unallowed extension in image with id "${image.id}" of project "${projectAlias}"`,
            );
        }

        const [imageTempDirPath, cleanUpImageTempDir] = getImageTempDirPath({
            projectAlias,
            imageId: image.id,
        });

        const originalFilePath = getFileTempPath({
            imageTempDirPath,
            presetAlias: ORIGINAL_PRESET_ALIAS,
            extension,
        });

        // TODO: await in loop
        await s3Api.downloadFileByUrl({
            fileUrl: image.originalLink,
            outputFilePath: originalFilePath,
        });

        const croppedFilePath = getFileTempPath({
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
            .toFile(croppedFilePath);

        const contentType = getContentType(extension);
        const { fileUrl } = await s3Api.uploadFile({
            fileName: generateS3FileName({
                projectAlias,
                imageId: image.id,
                presetAlias: preset.alias,
                extension,
            }),
            filePath: croppedFilePath,
            contentType,
        });

        await new CroppedImage({
            PresetId: presetId,
            ImageId: image.id,
            link: fileUrl,
        }).save();

        // TODO race (один пресет удаляет originalFilePath, пока другому он ещё нужен)
        fs.rmSync(originalFilePath);
        fs.rmSync(croppedFilePath);
        cleanUpImageTempDir();
    }
};
