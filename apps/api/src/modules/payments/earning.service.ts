import type { Types } from 'mongoose';
import * as earningRepository from './earning.repository.js';

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
): Promise<unknown> {
  // TODO: implement
  void earningRepository;
  void tutorId;
  void page;
  void limit;
  void status;
  throw new Error('listMyEarnings: not yet implemented');
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
): Promise<unknown> {
  // TODO: implement
  void earningRepository;
  void tutorId;
  throw new Error('getEarningsSummary: not yet implemented');
}
