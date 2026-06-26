import { z } from 'zod';

export const tutorSearchParamsSchema = z
  .object({
    q: z.string().trim().min(2).max(50),
  })
  .partial();

export type TutorSearchParams = z.infer<typeof tutorSearchParamsSchema>;
