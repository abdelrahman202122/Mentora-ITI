import { z } from 'zod';
import { objectIdSchema } from './common.js';

export const createTutorProfileSchema = z.object({
  headline: z.string().trim().min(1).max(200),
  bio: z.string().trim().min(1).max(500),
  hourlyRate: z.number().positive(),
  languages: z.array(z.string().trim().min(1)).min(1),
  isAvailable: z.boolean().optional(),
  experience: z
    .array(
      z.object({
        title: z.string().trim().min(1),
        startYear: z.number().int().min(1900).max(2100),
        startMonth: z.number().int().min(1).max(12),
        endYear: z.number().int().min(1900).max(2100).optional().nullable(),
        endMonth: z.number().int().min(1).max(12).optional().nullable(),
        isCurrent: z.boolean().optional(),
      }),
    )
    .optional(),
  education: z
    .array(
      z.object({
        degree: z.string().trim().min(1),
        field: z.string().trim().min(1),
        institution: z.string().trim().min(1),
        graduationYear: z
          .number()
          .int()
          .min(1900)
          .max(2100)
          .optional()
          .nullable(),
      }),
    )
    .optional(),
});

export type CreateTutorProfileInput = z.infer<typeof createTutorProfileSchema>;

export const updateTutorProfileSchema = z.object({
  headline: z.string().trim().min(1).max(200).optional(),
  bio: z.string().trim().min(1).max(500).optional(),
  hourlyRate: z.number().positive().optional(),
  languages: z.array(z.string().trim().min(1)).min(1).optional(),
  isAvailable: z.boolean().optional(),
  experience: z
    .array(
      z.object({
        title: z.string().trim().min(1),
        startYear: z.number().int().min(1900).max(2100),
        startMonth: z.number().int().min(1).max(12),
        endYear: z.number().int().min(1900).max(2100).optional().nullable(),
        endMonth: z.number().int().min(1).max(12).optional().nullable(),
        isCurrent: z.boolean().optional(),
      }),
    )
    .optional(),
  education: z
    .array(
      z.object({
        degree: z.string().trim().min(1),
        field: z.string().trim().min(1),
        institution: z.string().trim().min(1),
        graduationYear: z
          .number()
          .int()
          .min(1900)
          .max(2100)
          .optional()
          .nullable(),
      }),
    )
    .optional(),
});

export type UpdateTutorProfileInput = z.infer<typeof updateTutorProfileSchema>;

export const getProfileParamsSchema = z.object({
  tutorId: objectIdSchema,
});

export type GetProfileParams = z.infer<typeof getProfileParamsSchema>;
