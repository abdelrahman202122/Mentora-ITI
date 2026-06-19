import type { Types } from 'mongoose';
import Earning from './earning.model.js';
import type { IEarning, CreateEarningInput, UpdateEarningInput } from './earning.types.js';

/**
 * Earning repository handles all database operations for tutor earnings.
 */

/**
 * Create a new earning record (called after successful payment).
 */
export async function createEarning(
  data: CreateEarningInput,
): Promise<IEarning> {
  const earning = new Earning(data);
  return earning.save();
}

/**
 * Find an earning record by its ID.
 */
export async function findEarningById(
  earningId: Types.ObjectId,
): Promise<IEarning | null> {
  return Earning.findById(earningId).exec();
}

/**
 * Find the earning record linked to a specific booking.
 */
export async function findEarningByBookingId(
  bookingId: Types.ObjectId,
): Promise<IEarning | null> {
  return Earning.findOne({ bookingId }).exec();
}

/**
 * Find paginated earning records for a specific tutor, with optional status filter.
 */
export async function findEarningsByTutorId(
  tutorId: Types.ObjectId,
  skip: number,
  limit: number,
  status?: string,
): Promise<IEarning[]> {
  const filter: Record<string, unknown> = { tutorId };
  if (status) filter.status = status;

  return Earning.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .exec();
}

/**
 * Count earning records for a specific tutor, with optional status filter.
 */
export async function countEarningsByTutorId(
  tutorId: Types.ObjectId,
  status?: string,
): Promise<number> {
  const filter: Record<string, unknown> = { tutorId };
  if (status) filter.status = status;
  return Earning.countDocuments(filter);
}

/**
 * Aggregate earnings summary totals for a tutor.
 * Returns total gross, commission, and tutor amounts grouped by status.
 */
export async function aggregateEarningsSummaryByTutorId(
  tutorId: Types.ObjectId,
): Promise<Record<string, unknown>[]> {
  return Earning.aggregate([
    { $match: { tutorId } },
    {
      $group: {
        _id: '$status',
        totalGross: { $sum: '$grossAmount' },
        totalCommission: { $sum: '$commissionAmount' },
        totalTutorAmount: { $sum: '$tutorAmount' },
        count: { $sum: 1 },
      },
    },
  ]);
}

/**
 * Atomically update an earning matching an arbitrary filter.
 * Use for status transitions (e.g. pending → available when booking completes).
 */
export async function updateEarningAtomically(
  filter: Record<string, unknown>,
  updates: UpdateEarningInput,
): Promise<IEarning | null> {
  return Earning.findOneAndUpdate(
    filter,
    { $set: updates },
    { new: true },
  ).exec();
}
