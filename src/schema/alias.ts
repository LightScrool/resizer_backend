import { z } from 'zod';

export const aliasSchema = z.string().regex(/^[a-z\d-_]{2,50}$/);
