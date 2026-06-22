import { DateTime } from 'luxon';
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

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine(
    (value) => {
      const parsed = DateTime.fromISO(value, { zone: 'utc' });
      return parsed.isValid && parsed.toISODate() === value;
    },
    {
      message: 'Invalid date value',
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

export const getTutorAvailabilitySlotsQuerySchema = z
  .object({
    startDate: dateStringSchema,
    endDate: dateStringSchema,
  })
  .refine(
    ({ startDate, endDate }) =>
      DateTime.fromISO(endDate, { zone: 'utc' }) >=
      DateTime.fromISO(startDate, { zone: 'utc' }),
    {
      message: 'endDate must be on or after startDate',
      path: ['endDate'],
    },
  );

export type GetTutorAvailabilityParams = z.infer<
  typeof getTutorAvailabilityParamsSchema
>;

export type GetTutorAvailabilitySlotsQuery = z.infer<
  typeof getTutorAvailabilitySlotsQuerySchema
>;
