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
import { captureTempFile, clenupTempFile } from '~/helpers/temp-file-resources';

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

    // Дальше await не используем, чтобы отпустить запрос
    Image.findAll({
        where: { ProjectAlias: projectAlias },
    }).then((images) => {
        images.forEach(async (image) => {
            const extension = image.originalLink.split('.').pop();

            if (!checkIsAllowedExtension(extension)) {
                throw new Error(
                    `Unallowed extension in image with id "${image.id}" of project "${projectAlias}"`,
                );
            }

            const imageTempDirPath = getImageTempDirPath({
                projectAlias,
                imageId: image.id,
            });

            const originalFilePath = getFileTempPath({
                imageTempDirPath,
                presetAlias: ORIGINAL_PRESET_ALIAS,
                extension,
            });
            await captureTempFile(originalFilePath);

            if (!fs.existsSync(originalFilePath)) {
                await s3Api.downloadFileByUrl({
                    fileUrl: image.originalLink,
                    outputFilePath: originalFilePath,
                });
            }

            const croppedFilePath = getFileTempPath({
                imageTempDirPath,
                presetAlias: preset.alias,
                extension,
            });
            await captureTempFile(croppedFilePath);

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

            clenupTempFile(originalFilePath);
            clenupTempFile(croppedFilePath);
        });
    });
};
