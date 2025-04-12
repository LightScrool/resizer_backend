import { z } from 'zod';

export const aliasSchema = z.string().regex(/^[a-zA-Z\d-]{2,50}$/);
