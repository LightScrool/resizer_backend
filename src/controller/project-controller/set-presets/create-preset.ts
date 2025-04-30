import sharp from 'sharp';

import { InputPreset } from '~/schema/preset';
import { Preset, Image, CroppedImage } from '~/models';
import { s3Api } from '~/s3-api';
import { ORIGINAL_PRESET_ALIAS } from '~/config';
import { getFileTempPath, getImageTempDirPath } from '~/helpers/temp-files';
import { generateS3FileName } from '~/helpers/generate-s3-file-name';
import { getExtension } from '~/helpers/get-content-type';
import { captureTempFile, clenupTempFile } from '~/helpers/temp-file-resources';
import { ApiError } from '~/errors/api-error';
import { writeStreamToFile } from '~/helpers/write-stream-to-file';

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

    const images = await Image.findAll({
        where: { ProjectAlias: projectAlias },
    });

    const promises = images.map(async (image) => {
        const imageTempDirPath = getImageTempDirPath({
            projectAlias,
            imageId: image.id,
        });

        const { contentType, fileStream } = await s3Api.downloadFileByUrl({
            fileUrl: image.originalLink,
        });

        if (!contentType) {
            throw ApiError.internal(
                'Result of downloadFileByUrl do not include contentType',
            );
        }

        const extension = getExtension(contentType);

        if (!extension) {
            throw ApiError.internal(
                'Result of downloadFileByUrl include unexpected contentType',
            );
        }

        const originalTempFilePath = getFileTempPath({
            imageTempDirPath,
            presetAlias: ORIGINAL_PRESET_ALIAS,
            extension,
        });
        await captureTempFile(originalTempFilePath);

        await writeStreamToFile({
            fileStream,
            outputFilePath: originalTempFilePath,
        });

        const croppedFilePath = getFileTempPath({
            imageTempDirPath,
            presetAlias: preset.alias,
            extension,
        });
        await captureTempFile(croppedFilePath);

        await sharp(originalTempFilePath)
            .resize(
                preset.isHorizontal
                    ? { width: preset.size }
                    : { height: preset.size },
            )
            .toFile(croppedFilePath);

        const { fileUrl } = await s3Api.uploadFile({
            fileName: generateS3FileName({
                projectAlias,
                imageId: image.id,
                presetAlias: preset.alias,
            }),
            filePath: croppedFilePath,
            contentType,
        });

        await new CroppedImage({
            PresetId: presetId,
            ImageId: image.id,
            link: fileUrl,
        }).save();

        clenupTempFile(originalTempFilePath);
        clenupTempFile(croppedFilePath);
    });

    await Promise.all(promises);
};
