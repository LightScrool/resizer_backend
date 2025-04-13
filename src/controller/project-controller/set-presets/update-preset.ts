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
import { checkIsAllowedExtension } from '~/helpers/check-is-allowed-extension';
import { captureTempFile, clenupTempFile } from '~/helpers/temp-file-resources';
import { s3Api } from '~/s3-api';
import { getContentType } from '~/helpers/get-content-type';
import { generateS3FileName } from '~/helpers/generate-s3-file-name';

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

        const extension = image.originalLink.split('.').pop();
        if (!checkIsAllowedExtension(extension)) {
            throw new Error(
                `Unallowed extension in image with id "${image.id}" of project "${image.ProjectAlias}"`,
            );
        }

        const imageTempDirPath = getImageTempDirPath({
            projectAlias: dbPreset.ProjectAlias,
            imageId: image.id,
        });

        const originalFilePath = getFileTempPath({
            imageTempDirPath,
            presetAlias: ORIGINAL_PRESET_ALIAS,
            extension,
        });
        await captureTempFile(originalFilePath);

        await Promise.all([
            s3Api.downloadFileByUrl({
                fileUrl: image.originalLink,
                outputFilePath: originalFilePath,
            }),
            s3Api.deleteFileByUrl(croppedImage.link),
        ]);

        const croppedFilePath = getFileTempPath({
            imageTempDirPath,
            presetAlias: dbPreset.alias,
            extension,
        });
        await captureTempFile(croppedFilePath);

        await sharp(originalFilePath)
            .resize(
                dbPreset.isHorizontal
                    ? { width: dbPreset.size }
                    : { height: dbPreset.size },
            )
            .toFile(croppedFilePath);

        const contentType = getContentType(extension);
        const { fileUrl } = await s3Api.uploadFile({
            fileName: generateS3FileName({
                projectAlias: image.ProjectAlias,
                imageId: image.id,
                presetAlias: dbPreset.alias,
                extension,
            }),
            filePath: croppedFilePath,
            contentType,
        });

        croppedImage.link = fileUrl;
        await croppedImage.save();

        clenupTempFile(originalFilePath);
        clenupTempFile(croppedFilePath);
    });

    await Promise.all(promises);
};
