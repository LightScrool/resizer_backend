import { z, TypeOf } from 'zod';

import { aliasSchema } from './alias';

export const inputPresetSchema = z
    .object({
        alias: aliasSchema,
        size: z.number().int().positive().max(5000),
        isHorizontal: z.boolean(),
        name: z.string().max(255).nullable(),
        description: z.string().max(255).nullable(),
    })
    .partial()
    .required({
        alias: true,
        size: true,
    });

export type InputPreset = TypeOf<typeof inputPresetSchema>;

export const inputPresetListSchema = z.array(inputPresetSchema);

export type OutputPreset = {
    alias: string;
    size: number;
    isHorizontal: boolean;
    name?: string | null;
    description?: string | null;
};
