import sharp from 'sharp';

import { InputPreset } from '~/schema/preset';
import {
    Preset,
    CroppedImage,
    Image,
    IS_HORIZONTAL_DEFAULT_VALUE,
} from '~/models';
import { checkIsEqual } from './utils/check-is-equal';
import { checkShouldUpdateImages } from './utils/chech-should-update-images';
import { getFileTempPath, getImageTempDirPath } from '~/helpers/temp-files';
import { ORIGINAL_PRESET_ALIAS } from '~/config';
import { captureTempFile, clenupTempFile } from '~/helpers/temp-file-resources';
import { s3Api } from '~/s3-api';
import { getExtension } from '~/helpers/get-content-type';
import { generateS3FileName } from '~/helpers/generate-s3-file-name';
import { ApiError } from '~/errors/api-error';
import { writeStreamToFile } from '~/helpers/write-stream-to-file';

type Params = {
    newPreset: InputPreset;
    dbPreset: Preset;
};

export const updatePreset = async ({ newPreset, dbPreset }: Params) => {
    if (checkIsEqual({ newPreset, dbPreset })) {
        console.log(
            `Preset with alias "${dbPreset.alias}" in project "${dbPreset.ProjectAlias}" was not changed`,
        );
        return;
    }

    console.log(
        `Updating preset with alias "${dbPreset.alias}" in project "${dbPreset.ProjectAlias}"`,
    );

    const shouldUpdateImages = checkShouldUpdateImages({ newPreset, dbPreset });

    dbPreset.size = newPreset.size;
    dbPreset.isHorizontal =
        newPreset.isHorizontal ?? IS_HORIZONTAL_DEFAULT_VALUE;
    dbPreset.name = newPreset.name ?? null;
    dbPreset.description = newPreset.description ?? null;

    await dbPreset.save();

    if (!shouldUpdateImages) {
        return;
    }

    const croppedImages = await CroppedImage.findAll({
        where: { PresetId: dbPreset.id },
    });

    const promises = croppedImages.map(async (croppedImage) => {
        const image = await Image.findOne({
            where: { id: croppedImage.ImageId },
        });

        if (!image) {
            throw new Error('Get Image error');
        }

        const imageTempDirPath = getImageTempDirPath({
            projectAlias: dbPreset.ProjectAlias,
            imageId: image.id,
        });

        const [{ fileStream, contentType }] = await Promise.all([
            s3Api.downloadFileByUrl({ fileUrl: image.originalLink }),
            s3Api.deleteFileByUrl(croppedImage.link),
        ]);

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
            presetAlias: dbPreset.alias,
            extension,
        });
        await captureTempFile(croppedFilePath);

        await sharp(originalTempFilePath)
            .resize(
                dbPreset.isHorizontal
                    ? { width: dbPreset.size }
                    : { height: dbPreset.size },
            )
            .toFile(croppedFilePath);

        const { fileUrl } = await s3Api.uploadFile({
            fileName: generateS3FileName({
                projectAlias: image.ProjectAlias,
                imageId: image.id,
                presetAlias: dbPreset.alias,
            }),
            filePath: croppedFilePath,
            contentType,
        });

        croppedImage.link = fileUrl;
        await croppedImage.save();

        clenupTempFile(originalTempFilePath);
        clenupTempFile(croppedFilePath);
    });

    await Promise.all(promises);
};
