import { z } from 'zod';
import { CATEGORY_VALUES } from '../constants/categories.js';
import { EDUCATION_LEVEL_VALUES } from '../constants/educationLevels.js';
import { CURRICULA_VALUES } from '../constants/curricula.js';

const emptyToUndefined = (val: unknown) => (val === '' ? undefined : val);

const baseTutorFiltersSchema = z.object({
  // search query
  q: z.string().trim().min(2).max(50).optional(),
  // filters
  category: z.enum(CATEGORY_VALUES as [string, ...string[]]).optional(),
  educationLevel: z
    .enum(EDUCATION_LEVEL_VALUES as [string, ...string[]])
    .optional(),
  curriculum: z.enum(CURRICULA_VALUES as [string, ...string[]]).optional(),
  minHourlyRate: z.preprocess(
    emptyToUndefined,
    z.coerce.number().positive().optional(),
  ),
  maxHourlyRate: z.preprocess(
    emptyToUndefined,
    z.coerce.number().positive().optional(),
  ),
  minRating: z.preprocess(
    emptyToUndefined,
    z.coerce.number().min(0).max(5).optional(),
  ),
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
  // pagination
  page: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).default(1),
  ),
  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(50).default(20),
  ),
});

export const tutorSearchParamsSchema = baseTutorFiltersSchema.refine(
  (data) => {
    if (data.minHourlyRate && data.maxHourlyRate) {
      return data.minHourlyRate <= data.maxHourlyRate;
    }
    return true;
  },
  {
    message: 'minHourlyRate must be less than maxHourlyRate',
    path: ['maxHourlyRate'],
  },
);

export type TutorSearchParams = z.infer<typeof tutorSearchParamsSchema>;

export const adminTutorSearchParamsSchema = baseTutorFiltersSchema
  .extend({
    profileStatus: z
      .preprocess(
        // always format as an array
        (val) => {
          if (!val) return [];
          if (Array.isArray(val)) return val;
          return [val];
        },
        z.array(z.enum(['approved', 'pending', 'rejected'])),
      )
      .optional(),
    activeStatus: z
      .preprocess(
        // always format as an array
        (val) => {
          if (!val) return [];
          if (Array.isArray(val)) return val;
          return [val];
        },
        z.array(z.enum(['active', 'inactive'])),
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.minHourlyRate && data.maxHourlyRate) {
        return data.minHourlyRate <= data.maxHourlyRate;
      }
      return true;
    },
    {
      message: 'minHourlyRate must be less than maxHourlyRate',
      path: ['maxHourlyRate'],
    },
  );

export type AdminTutorSearchParams = z.infer<
  typeof adminTutorSearchParamsSchema
>;
