import { z } from 'zod';
import { ianaTimezoneSchema, objectIdSchema } from './common.js';

const timeSlotSchema = z
  .object({
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  })
  .refine((slot) => slot.startTime < slot.endTime, {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  });

const daysSchema = z.array(timeSlotSchema).default([]);

const slotsSchema = z
  .object({
    monday: daysSchema.optional(),
    tuesday: daysSchema.optional(),
    wednesday: daysSchema.optional(),
    thursday: daysSchema.optional(),
    friday: daysSchema.optional(),
    saturday: daysSchema.optional(),
    sunday: daysSchema.optional(),
  })
  .refine(
    (slots) =>
      Object.values(slots).some(
        (daySlots) => Array.isArray(daySlots) && daySlots.length > 0,
      ),
    {
      message: 'At least one availability slot is required',
    },
  );

export const tutorAvailabilitySchema = z.object({
  slots: slotsSchema,
  timezone: ianaTimezoneSchema,
});

export type CreateTutorAvailabilityInput = z.infer<
  typeof tutorAvailabilitySchema
>;

export const getTutorAvailabilityParamsSchema = z.object({
  tutorId: objectIdSchema,
});

export type GetTutorAvailabilityParams = z.infer<
  typeof getTutorAvailabilityParamsSchema
>;
