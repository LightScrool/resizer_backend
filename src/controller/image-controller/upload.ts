import { v4 as uuidV4 } from 'uuid';
import fs from 'fs';
import path from 'path';

import { ApiError } from '~/errors/api-error';
import { withTryCatch } from '~/helpers/with-try-catch';
import { Image } from '~/models';
import { getTempFilesDirName } from '~/helpers/get-temp-files-dir-name';
import { ALLOWED_FILES_EXTENSIONS, ORIGINAL_PRESET_ALIAS } from '~/config';
import { s3Api } from '~/s3-api';
import { generateS3FileName } from '~/helpers/generate-s3-file-name';
import { getOuterImageUrl } from '~/helpers/get-outer-image-url';

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
    if (!extension || !ALLOWED_FILES_EXTENSIONS.includes(extension)) {
        // TODO: sec extension check
        throw ApiError.badRequest(`Exteinsion "${extension}" is not allowed`);
    }

    let imageId = uuidV4();
    while (await Image.findOne({ where: { id: imageId } })) {
        console.log('New image uuidV4 collision, generating new id...');
        imageId = uuidV4();
    }

    const dirPath = path.join(getTempFilesDirName(), projectAlias, imageId);
    fs.mkdirSync(dirPath, { recursive: true });

    const originalFilePath = path.join(
        dirPath,
        [ORIGINAL_PRESET_ALIAS, extension].join(''),
    );

    await file.mv(originalFilePath);

    const { fileUrl } = await s3Api.uploadFile({
        fileName: generateS3FileName({
            projectAlias,
            imageId,
            presetAlias: ORIGINAL_PRESET_ALIAS,
            extension,
        }),
        filePath: originalFilePath,
    });

    await new Image({
        id: imageId,
        ProjectAlias: projectAlias,
        originalLink: fileUrl,
        name: req.body.name,
        description: req.body.description,
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
});
