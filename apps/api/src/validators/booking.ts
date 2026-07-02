import { z } from 'zod';
import { objectIdSchema, isoDateSchema, paginationSchema } from './common.js';
import {
  BookingStatus,
  PaymentStatus,
} from '../modules/bookings/booking.types.js';

/**
 * Booking validation schemas for BE3 booking management.
 */

const bookingStatusSchema = z.nativeEnum(BookingStatus);
const paymentStatusSchema = z.nativeEnum(PaymentStatus);
const bookingListModeSchema = z.enum(['learner', 'tutor', 'admin']);

const noteSchema = z.string().trim().max(500);
const durationMinutesSchema = z
  .number()
  .int('Duration must be a whole number of minutes')
  .min(15, 'Minimum session duration is 15 minutes')
  .max(480, 'Maximum session duration is 480 minutes');

/**
 * Schema for creating a new booking request
 */
export const createBookingSchema = z
  .object({
    tutorProfileId: objectIdSchema,
    subjectId: objectIdSchema,
    startAt: isoDateSchema,
    endAt: isoDateSchema,
    durationMinutes: durationMinutesSchema,
    learnerNote: noteSchema
      .max(500, 'Learner note cannot exceed 500 characters')
      .optional(),
  })
  .superRefine((value, ctx) => {
    const startAt = new Date(value.startAt);
    const endAt = new Date(value.endAt);

    if (startAt <= new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start time must be in the future',
        path: ['startAt'],
      });
    }

    if (endAt <= startAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End time must be after start time',
        path: ['endAt'],
      });
      return;
    }

    const actualDurationMinutes =
      (endAt.getTime() - startAt.getTime()) / (60 * 1000);

    if (actualDurationMinutes !== value.durationMinutes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Duration must match the start and end time',
        path: ['durationMinutes'],
      });
    }
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

/**
 * Schema for booking ID parameters
 */
export const bookingIdSchema = z.object({
  bookingId: objectIdSchema,
});

export type BookingIdParam = z.infer<typeof bookingIdSchema>;

/**
 * Schema for listing bookings with filters
 */
export const listBookingsSchema = paginationSchema.extend({
  bookingStatus: bookingStatusSchema.optional(),
  mode: bookingListModeSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  tutorProfileId: objectIdSchema.optional(),
  subjectId: objectIdSchema.optional(),
});

export type ListBookingsQuery = z.infer<typeof listBookingsSchema>;

/**
 * Schema for accepting a booking
 */
export const acceptBookingSchema = z.object({}).strict();

export type AcceptBookingInput = z.infer<typeof acceptBookingSchema>;

/**
 * Schema for rejecting a booking
 */
export const rejectBookingSchema = z.object({}).strict();

export type RejectBookingInput = z.infer<typeof rejectBookingSchema>;

/**
 * Schema for canceling a booking
 */
export const cancelBookingSchema = z.object({
  cancelReason: noteSchema
    .max(500, 'Cancel reason cannot exceed 500 characters')
    .optional(),
});

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

/**
 * Schema for confirming a completed session with the learner-provided code
 */
export const confirmBookingCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Confirmation code is required')
    .max(64, 'Confirmation code cannot exceed 64 characters'),
});

export type ConfirmBookingCodeInput = z.infer<typeof confirmBookingCodeSchema>;

/**
 * Schema for updating booking status
 */
export const updateBookingStatusSchema = z.object({
  bookingStatus: bookingStatusSchema,
});

export type UpdateBookingStatusInput = z.infer<
  typeof updateBookingStatusSchema
>;
