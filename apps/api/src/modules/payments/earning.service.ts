import mongoose, { type Types } from 'mongoose';
import * as earningRepository from './earning.repository.js';
import { EarningStatus, type IEarning } from './earning.types.js';
import { ValidationError } from '../../common/errors/AppError.js';

/**
 * Earning service handles business logic for tutor earning queries.
 */

/**
 * GET /api/earnings/me
 * List paginated earnings for the authenticated tutor.
 *
 * Steps to implement:
 * 1. Convert userId string to Types.ObjectId for tutorId.
 * 2. Parse pagination params (page, limit) and compute skip = (page - 1) * limit.
 * 3. Apply optional status filter from query params (validate against EarningStatus enum).
 * 4. Fetch earnings via earningRepository.findEarningsByTutorId(tutorId, skip, limit, status).
 * 5. Count total via earningRepository.countEarningsByTutorId(tutorId, status).
 * 6. Return { earnings, total, page, totalPages }.
 */
export async function listMyEarnings(
  tutorId: Types.ObjectId,
  page: number,
  limit: number,
  status?: string,
): Promise<{ earnings: IEarning[]; total: number; page: number; totalPages: number }> {
  // 1. Convert userId string to Types.ObjectId for tutorId.
  const tutorObjectId = new mongoose.Types.ObjectId(tutorId.toString());

  // 2. Parse pagination params (page, limit) and compute skip = (page - 1) * limit.
  const skip = (page - 1) * limit;

  // 3. Apply optional status filter from query params (validate against EarningStatus enum).
  if (status && !Object.values(EarningStatus).includes(status as EarningStatus)) {
    throw new ValidationError(`Invalid earning status: ${status}`);
  }

  // 4. Fetch earnings via earningRepository.findEarningsByTutorId(tutorId, skip, limit, status).
  // 5. Count total via earningRepository.countEarningsByTutorId(tutorId, status).
  const [earnings, total] = await Promise.all([
    earningRepository.findEarningsByTutorId(tutorObjectId, skip, limit, status),
    earningRepository.countEarningsByTutorId(tutorObjectId, status),
  ]);

  // 6. Return { earnings, total, page, totalPages }.
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return { earnings, total, page, totalPages };
}

/**
 * GET /api/earnings/summary
 * Return an earnings summary for the authenticated tutor showing totals by status.
 *
 * Steps to implement:
 * 1. Convert userId string to Types.ObjectId for tutorId.
 * 2. Fetch the aggregation via earningRepository.aggregateEarningsSummaryByTutorId(tutorId).
 * 3. Transform the aggregation result into a friendly summary object:
 *    { pending: { count, totalAmount }, available: { count, totalAmount }, paid_out: { count, totalAmount } }.
 * 4. Return the summary.
 */
export async function getEarningsSummary(
  tutorId: Types.ObjectId,
): Promise<{
  pending: { count: number; totalAmount: number };
  available: { count: number; totalAmount: number };
  paid_out: { count: number; totalAmount: number };
}> {
  // 1. Convert userId string to Types.ObjectId for tutorId.
  const tutorObjectId = new mongoose.Types.ObjectId(tutorId.toString());

  // 2. Fetch the aggregation via earningRepository.aggregateEarningsSummaryByTutorId(tutorId).
  const aggregation = await earningRepository.aggregateEarningsSummaryByTutorId(tutorObjectId);

  // 3. Transform the aggregation result into a friendly summary object:
  //    { pending: { count, totalAmount }, available: { count, totalAmount }, paid_out: { count, totalAmount } }.
  const summary = {
    pending: { count: 0, totalAmount: 0 },
    available: { count: 0, totalAmount: 0 },
    paid_out: { count: 0, totalAmount: 0 },
  };

  for (const group of aggregation) {
    const status = String(group._id);
    if (status in summary) {
      summary[status as keyof typeof summary] = {
        count: typeof group.count === 'number' ? group.count : 0,
        totalAmount: typeof group.totalTutorAmount === 'number' ? group.totalTutorAmount : 0,
      };
    }
  }

  // 4. Return the summary.
  return summary;
}
