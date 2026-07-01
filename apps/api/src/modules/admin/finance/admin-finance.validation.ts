import { z } from 'zod';
import { objectIdSchema, paginationSchema } from '../../../validators/common.js';
import { BookingStatus } from '../../bookings/booking.types.js';
import { EarningStatus } from '../../payments/earning.types.js';

export const adminWithdrawalListQuerySchema = paginationSchema
  .extend({
    bookingStatus: z.nativeEnum(BookingStatus).optional(),
    status: z.nativeEnum(EarningStatus).optional(),
    learnerId: objectIdSchema.optional(),
    tutorId: objectIdSchema.optional(),
    subjectId: objectIdSchema.optional(),
    createdAtFrom: z.string().datetime().optional(),
    createdAtTo: z.string().datetime().optional(),
    minAmount: z.coerce.number().nonnegative().optional(),
    maxAmount: z.coerce.number().nonnegative().optional(),
  })
  .superRefine((value, ctx) => {
    if (
      value.createdAtFrom !== undefined &&
      value.createdAtTo !== undefined &&
      new Date(value.createdAtFrom) > new Date(value.createdAtTo)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'createdAtFrom must be before or equal to createdAtTo',
        path: ['createdAtTo'],
      });
    }

    if (
      value.minAmount !== undefined &&
      value.maxAmount !== undefined &&
      value.minAmount > value.maxAmount
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'minAmount must be less than or equal to maxAmount',
        path: ['maxAmount'],
      });
    }
  });

export type AdminWithdrawalListQuery = z.infer<
  typeof adminWithdrawalListQuerySchema
>;

export const adminEarningIdParamsSchema = z.object({
  earningId: objectIdSchema,
});

export type AdminEarningIdParams = z.infer<typeof adminEarningIdParamsSchema>;
