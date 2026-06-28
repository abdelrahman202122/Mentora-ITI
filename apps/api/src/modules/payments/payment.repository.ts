import type { Types } from 'mongoose';
import Payment from './payment.model.js';
import type { IPayment, CreatePaymentInput, UpdatePaymentInput } from './payment.types.js';

/**
 * Payment repository handles all database operations for payments.
 */

/**
 * Find a payment document by its ID.
 */
export async function findPaymentById(
  paymentId: Types.ObjectId,
): Promise<IPayment | null> {
  return Payment.findById(paymentId).exec();
}

/**
 * Find the most recent payment record linked to a booking.
 * Used to prevent duplicate successful payments.
 */
export async function findPaymentByBookingId(
  bookingId: Types.ObjectId,
): Promise<IPayment | null> {
  return Payment.findOne({ bookingId }).sort({ createdAt: -1 }).exec();
}

/**
 * Find a payment by the provider-assigned order ID.
 * Used for idempotent webhook processing so re-delivered events are deduplicated.
 */
export async function findPaymentByProviderOrderId(
  providerOrderId: string,
): Promise<IPayment | null> {
  return Payment.findOne({ providerOrderId }).exec();
}

/**
 * Find a payment by the provider-assigned transaction ID.
 * An alternative idempotency key for Paymob transaction callbacks.
 */
export async function findPaymentByProviderTransactionId(
  providerTransactionId: string,
): Promise<IPayment | null> {
  return Payment.findOne({ providerTransactionId }).exec();
}

/**
 * Create and persist a new payment record with status `pending`.
 */
export async function createPayment(
  data: CreatePaymentInput,
): Promise<IPayment> {
  const payment = new Payment(data);
  return payment.save();
}

/**
 * Update a payment document by ID and return the updated document.
 */
export async function updatePaymentById(
  paymentId: Types.ObjectId,
  updates: UpdatePaymentInput,
): Promise<IPayment | null> {
  return Payment.findByIdAndUpdate(
    paymentId,
    { $set: updates },
    { new: true },
  ).exec();
}

/**
 * Atomically update a payment document matching an arbitrary filter.
 * Use this for idempotent, conditional updates (e.g. only update if status is still pending).
 */
export async function updatePaymentAtomically(
  filter: Record<string, unknown>,
  updates: UpdatePaymentInput,
): Promise<IPayment | null> {
  return Payment.findOneAndUpdate(
    filter,
    { $set: updates },
    { new: true },
  ).exec();
}

/**
 * Find paginated payments for a specific learner.
 */
export async function findPaymentsByLearnerId(
  learnerId: Types.ObjectId,
  skip: number,
  limit: number,
  status?: string,
): Promise<IPayment[]> {
  const filter: Record<string, unknown> = { learnerId };
  if (status) filter.status = status;

  return Payment.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .exec();
}

/**
 * Count total payments belonging to a learner.
 */
export async function countPaymentsByLearnerId(
  learnerId: Types.ObjectId,
  status?: string,
): Promise<number> {
  const filter: Record<string, unknown> = { learnerId };
  if (status) filter.status = status;
  return Payment.countDocuments(filter);
}

/**
 * Find paginated payments for a specific tutor.
 */
export async function findPaymentsByTutorId(
  tutorId: Types.ObjectId,
  skip: number,
  limit: number,
): Promise<IPayment[]> {
  return Payment.find({ tutorId })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .exec();
}
