import { z } from 'zod';
import { objectIdSchema, paginationSchema } from '../../../validators/common.js';
import { EarningStatus } from '../../payments/earning.types.js';

export const adminWithdrawalListQuerySchema = paginationSchema
  .extend({
    status: z.nativeEnum(EarningStatus).optional(),
    tutorId: objectIdSchema.optional(),
    minAmount: z.coerce.number().nonnegative().optional(),
    maxAmount: z.coerce.number().nonnegative().optional(),
  })
  .superRefine((value, ctx) => {
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
