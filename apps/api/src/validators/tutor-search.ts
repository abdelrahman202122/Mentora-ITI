import { z } from 'zod';
import { CATEGORY_VALUES } from '../constants/categories.js';
import { EDUCATION_LEVEL_VALUES } from '../constants/educationLevels.js';
import { CURRICULA_VALUES } from '../constants/curricula.js';

export const tutorSearchParamsSchema = z
  .object({
    // search query
    q: z.string().trim().min(2).max(50).optional(),
    // filters
    category: z.enum(CATEGORY_VALUES as [string, ...string[]]).optional(),
    educationLevel: z
      .enum(EDUCATION_LEVEL_VALUES as [string, ...string[]])
      .optional(),
    curriculum: z.enum(CURRICULA_VALUES as [string, ...string[]]).optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    minHourlyRate: z.coerce.number().positive().optional(),
    maxHourlyRate: z.coerce.number().positive().optional(),
    languages: z
      .preprocess(
        // always format as an array
        (val) => {
          if (!val) return [];
          if (Array.isArray(val)) return val;
          return [val];
        },
        z.array(z.string().trim().min(2)),
      )
      .optional(),
    // sort by
    sortBy: z
      .enum(['relevance', 'rating', 'price_asc', 'price_desc'])
      .default('relevance'),
  })
  .refine(
    (data) => {
      if (data.minHourlyRate && data.maxHourlyRate) {
        return data.minHourlyRate < data.maxHourlyRate;
      }
      return true;
    },
    {
      message: 'minHourlyRate must be less than maxHourlyRate',
      path: ['minHourlyRate', 'maxHourlyRate'],
    },
  );

export type TutorSearchParams = z.infer<typeof tutorSearchParamsSchema>;
