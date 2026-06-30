import { z } from 'zod';
import { objectIdSchema, paginationSchema, isoDateSchema } from '../../../validators/common.js';
import {
  BookingStatus,
  PaymentStatus,
} from '../../bookings/booking.types.js';

export const adminBookingListQuerySchema = paginationSchema
  .extend({
    bookingStatus: z.nativeEnum(BookingStatus).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    learnerId: objectIdSchema.optional(),
    tutorId: objectIdSchema.optional(),
    subjectId: objectIdSchema.optional(),
    startAtFrom: isoDateSchema.optional(),
    startAtTo: isoDateSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.startAtFrom && value.startAtTo) {
      const from = new Date(value.startAtFrom);
      const to = new Date(value.startAtTo);

      if (from > to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'startAtFrom must be before or equal to startAtTo',
          path: ['startAtTo'],
        });
      }
    }
  });

export type AdminBookingListQuery = z.infer<typeof adminBookingListQuerySchema>;
