import {
    Model,
    InferAttributes,
    InferCreationAttributes,
    DataTypes,
    ForeignKey,
    CreationOptional,
} from 'sequelize';

import { sequelize } from './db';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare name: string;

    declare projectsLimit: CreationOptional<number>;

    declare yandexId: string | null;
}

User.init(
    {
        name: { type: DataTypes.STRING, primaryKey: true },

        projectsLimit: { type: DataTypes.INTEGER, defaultValue: 5 },

        yandexId: { type: DataTypes.BIGINT, allowNull: true },
    },
    { sequelize },
);

class Project extends Model<
    InferAttributes<Project>,
    InferCreationAttributes<Project>
> {
    declare alias: string;

    declare presetsLimit: CreationOptional<number>;
    declare imagesLimit: CreationOptional<number>;
    declare apiKey: string;

    declare name: string | null;
    declare description: string | null;

    declare UserName: ForeignKey<string>;
}

Project.init(
    {
        alias: { type: DataTypes.STRING, primaryKey: true },

        presetsLimit: { type: DataTypes.INTEGER, defaultValue: 10 },
        imagesLimit: { type: DataTypes.INTEGER, defaultValue: 10 },
        apiKey: { type: DataTypes.STRING, allowNull: false },

        name: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.STRING, allowNull: true },
    },
    { sequelize },
);

class Preset extends Model<
    InferAttributes<Preset>,
    InferCreationAttributes<Preset>
> {
    declare id: CreationOptional<string>;
    declare alias: string;

    declare size: number;
    declare isHorizontal: CreationOptional<boolean>;

    declare name: string | null;
    declare description: string | null;

    declare ProjectAlias: ForeignKey<string>;
}

Preset.init(
    {
        id: { type: DataTypes.BIGINT, autoIncrement: true, unique: true },
        alias: { type: DataTypes.STRING, primaryKey: true },

        size: { type: DataTypes.INTEGER, allowNull: false },
        isHorizontal: { type: DataTypes.BOOLEAN, defaultValue: true },

        name: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.STRING, allowNull: true },

        ProjectAlias: { type: DataTypes.STRING, primaryKey: true },
    },
    { sequelize },
);

class Image extends Model<
    InferAttributes<Image>,
    InferCreationAttributes<Image>
> {
    declare id: string;

    declare originalLink: string;

    declare name: string | null;
    declare description: string | null;

    declare ProjectAlias: ForeignKey<string>;
}

Image.init(
    {
        id: { type: DataTypes.UUID, primaryKey: true },

        originalLink: { type: DataTypes.STRING, allowNull: false },

        name: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.STRING, allowNull: true },
    },
    { sequelize },
);

class CroppedImage extends Model<
    InferAttributes<CroppedImage>,
    InferCreationAttributes<CroppedImage>
> {
    declare link: string;

    declare PresetId: ForeignKey<string>;
    declare ImageId: ForeignKey<string>;
}

CroppedImage.init(
    {
        link: { type: DataTypes.STRING, allowNull: false },
    },
    { sequelize },
);

User.hasMany(Project, { as: 'projects' });
Project.belongsTo(User);

Project.hasMany(Preset, { as: 'presets' });
Preset.belongsTo(Project);

Project.hasMany(Image, { as: 'images' });
Image.belongsTo(Project);

Preset.belongsToMany(Image, { through: CroppedImage });
Image.belongsToMany(Preset, {
    through: CroppedImage,
    otherKey: 'PresetId',
    targetKey: 'id',
});

export { User, Project, Preset, Image, CroppedImage };
