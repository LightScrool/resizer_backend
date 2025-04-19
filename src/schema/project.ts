import { z, TypeOf } from 'zod';

import { aliasSchema } from './alias';

export const inputProjectSchema = z
    .object({
        alias: aliasSchema,
        name: z.string().max(255),
        description: z.string().max(255),
    })
    .partial()
    .required({
        alias: true,
    });

export type InputProject = TypeOf<typeof inputProjectSchema>;

export type ProjectListItem = {
    alias: string;
    name: string | null;
    description: string | null;
};

export type ProjectInfo = {
    alias: string;
    presetsLimit: number;
    imagesLimit: number;
    name: string | null;
    description: string | null;
};
