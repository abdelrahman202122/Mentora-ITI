import { z } from 'zod';

import { CATEGORY_VALUES } from '../constants/categories.js';
import { CURRICULA_VALUES } from '../constants/curricula.js';
import { EDUCATION_LEVEL_VALUES } from '../constants/educationLevels.js';
import { objectIdSchema } from './common.js';

export const tutorRecommendationSchema = z.object({
  conversationId: objectIdSchema.optional(),
  query: z.string().trim().min(1).max(200).optional(),
  category: z.enum(CATEGORY_VALUES as [string, ...string[]]).optional(),
  educationLevel: z
    .enum(EDUCATION_LEVEL_VALUES as [string, ...string[]])
    .optional(),
  curriculum: z.enum(CURRICULA_VALUES as [string, ...string[]]).optional(),
  languages: z.array(z.string().trim().min(1).max(50)).max(10).optional(),
  maxHourlyRate: z.number().positive().optional(),
  limit: z.number().int().positive().max(20).default(5),
});

export type TutorRecommendationInput = z.infer<
  typeof tutorRecommendationSchema
>;
