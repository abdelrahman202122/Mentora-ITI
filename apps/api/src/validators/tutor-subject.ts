import { z } from 'zod';

import { CATEGORY_VALUES } from '../constants/categories.js';
import { CURRICULA_VALUES } from '../constants/curricula.js';
import { EDUCATION_LEVEL_VALUES } from '../constants/educationLevels.js';
import { objectIdSchema } from './common.js';

export const tutorSubjectBaseSchema = z.object({
  category: z.enum(CATEGORY_VALUES as [string, ...string[]]),
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1000).optional().nullable().default(null),
  educationLevel: z.enum(EDUCATION_LEVEL_VALUES as [string, ...string[]]),
  curriculum: z.enum(CURRICULA_VALUES as [string, ...string[]]),
  gradeNote: z.string().trim().max(100).optional().nullable().default(null),
});

export const getTutorSubjectsParamsSchema = z.object({
  tutorId: objectIdSchema,
});

export const getTutorSubjectParamsSchema = z.object({
  tutorId: objectIdSchema,
  subjectId: objectIdSchema,
});

export const editTutorSubjectSchema = z.object({
  subjectId: objectIdSchema,
});

export type tutorSubjectInput = z.infer<typeof tutorSubjectBaseSchema>;
export type GetTutorSubjectsParams = z.infer<
  typeof getTutorSubjectsParamsSchema
>;
export type GetTutorSubjectParams = z.infer<typeof getTutorSubjectParamsSchema>;
