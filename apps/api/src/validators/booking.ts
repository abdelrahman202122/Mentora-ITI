import { z } from 'zod';
import { objectIdSchema, isoDateSchema, paginationSchema } from './common.js';

/**
 * Booking validation schemas for BE3 booking management.
 * These schemas will be expanded during Phase 5: Booking Management.
 */

/**
 * Schema for creating a new booking request
 * TODO: Finalize fields after BE2 provides TutorProfile and Subject models
 */
export const createBookingSchema = z.object({
  tutorProfileId: objectIdSchema,
  subjectId: objectIdSchema,
  startAt: isoDateSchema,
  endAt: isoDateSchema,
  learnerNote: z
    .string()
    .max(500, 'Learner note cannot exceed 500 characters')
    .optional(),
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
  status: z.string().optional(),
});

export type ListBookingsQuery = z.infer<typeof listBookingsSchema>;

/**
 * Schema for accepting a booking
 */
export const acceptBookingSchema = z.object({
  tutorResponseNote: z
    .string()
    .max(500, 'Response note cannot exceed 500 characters')
    .optional(),
});

export type AcceptBookingInput = z.infer<typeof acceptBookingSchema>;

/**
 * Schema for rejecting a booking
 */
export const rejectBookingSchema = z.object({
  tutorResponseNote: z
    .string()
    .max(500, 'Response note cannot exceed 500 characters'),
});

export type RejectBookingInput = z.infer<typeof rejectBookingSchema>;

/**
 * Schema for canceling a booking
 */
export const cancelBookingSchema = z.object({
  cancelReason: z
    .string()
    .max(500, 'Cancel reason cannot exceed 500 characters')
    .optional(),
});

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

/**
 * Schema for updating booking status
 */
export const updateBookingStatusSchema = z.object({
  status: z.enum([
    'pending',
    'accepted',
    'rejected',
    'payment_pending',
    'scheduled',
    'in_progress',
    'completed',
    'canceled',
    'no_show',
  ]),
});

export type UpdateBookingStatusInput = z.infer<
  typeof updateBookingStatusSchema
>;
