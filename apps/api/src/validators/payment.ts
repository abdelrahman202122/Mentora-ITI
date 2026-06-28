import { z } from 'zod';
import { objectIdSchema, paginationSchema } from './common.js';
import { PaymentStatus } from '../modules/payments/payment.types.js';

/**
 * Payment validation schemas for BE3 payment management.
 * These schemas will be expanded during Phase 6: Payments & Earnings.
 */

/**
 * Schema for initiating payment checkout
 * TODO: Finalize after BE1 provides auth context and payment provider is selected
 */
export const createCheckoutSchema = z.object({
  bookingId: objectIdSchema,
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;

/**
 * Schema for payment ID parameters
 */
export const paymentIdSchema = z.object({
  paymentId: objectIdSchema,
});

export type PaymentIdParam = z.infer<typeof paymentIdSchema>;

/**
 * Schema for listing payments with filters
 */
export const listPaymentsSchema = paginationSchema.extend({
  status: z.enum(Object.values(PaymentStatus) as [PaymentStatus, ...PaymentStatus[]]).optional(),
});

export type ListPaymentsQuery = z.infer<typeof listPaymentsSchema>;

/**
 * Schema for payment webhook from provider
 * TODO: Add provider-specific fields after payment provider is selected
 */
export const paymentWebhookSchema = z.object({
  // Placeholder for webhook payload
  // Will be updated based on payment provider (Stripe, Paymob, Fawry, etc.)
});

export type PaymentWebhookInput = z.infer<typeof paymentWebhookSchema>;

/**
 * Schema for listing tutor earnings
 */
export const listEarningsSchema = paginationSchema.extend({
  status: z.enum(['pending', 'available', 'paid_out', 'canceled']).optional(),
});

export type ListEarningsQuery = z.infer<typeof listEarningsSchema>;
