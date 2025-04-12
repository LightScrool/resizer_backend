import { v4 as uuidV4 } from 'uuid';

import { Preset, Project, User, Image, CroppedImage } from './models';
import { Op } from 'sequelize';

export const fillWithMockData = async () => {
    console.log('WARNING! Filling database with mock data.\n');

    if (!(await User.findOne({ where: { name: 'test-user' } }))) {
        await User.create({
            name: 'test-user',
        });
    }

    if (!(await Project.findOne({ where: { alias: 'test-project1' } }))) {
        await Project.create({
            UserName: 'test-user',
            alias: 'test-project1',
            apiKey: uuidV4(),
        });
    }

    if (!(await Project.findOne({ where: { alias: 'test-project2' } }))) {
        await Project.create({
            UserName: 'test-user',
            alias: 'test-project2',
            apiKey: uuidV4(),
        });
    }

    if (
        !(await Preset.findOne({
            where: {
                [Op.and]: { alias: 'preset1', ProjectAlias: 'test-project1' },
            },
        }))
    ) {
        await Preset.create({
            ProjectAlias: 'test-project1',
            alias: 'preset1',
            size: 500,
        });
    }

    if (
        !(await Preset.findOne({
            where: {
                [Op.and]: { alias: 'preset2', ProjectAlias: 'test-project1' },
            },
        }))
    ) {
        await Preset.create({
            ProjectAlias: 'test-project1',
            alias: 'preset2',
            size: 400,
            isHorizontal: false,
        });
    }

    if (
        !(await Preset.findOne({
            where: {
                [Op.and]: { alias: 'preset1', ProjectAlias: 'test-project2' },
            },
        }))
    ) {
        await Preset.create({
            ProjectAlias: 'test-project2',
            alias: 'preset1',
            size: 500,
        });
    }

    const imageId = '6e4b589b-bdc1-4c8a-b002-891e222f2727';
    if (!(await Image.findOne({ where: { id: imageId } }))) {
        await Image.create({
            ProjectAlias: 'test-project1',
            id: imageId,
            originalLink:
                'https://storage.yandexcloud.net/resizer-alpha-1gb/1500.jpg',
        });
    }

    const preset = await Preset.findOne({
        where: {
            [Op.and]: { ProjectAlias: 'test-project1', alias: 'preset1' },
        },
    });
    if (
        preset &&
        !(await CroppedImage.findOne({
            where: { ImageId: imageId, PresetId: preset.id },
        }))
    ) {
        await CroppedImage.create({
            ImageId: imageId,
            PresetId: preset.id,
            link: 'https://storage.yandexcloud.net/resizer-alpha-1gb/750.webp',
        });
    }
};
