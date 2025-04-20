import { z } from 'zod';

export const aliasSchema = z.string().regex(/^[a-z\d-_]{1,50}$/);
