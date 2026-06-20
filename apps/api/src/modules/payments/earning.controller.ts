import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../../utils/api-response.js';
import { UnauthorizedError } from '../../common/errors/AppError.js';
import * as earningService from './earning.service.js';

const { Types } = mongoose;

/**
 * Earning controller handles HTTP requests for tutor earnings operations.
 */

/**
 * GET /api/earnings/me
 * List paginated earnings for the authenticated tutor.
 */
export async function listMyEarnings(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // TODO: Verify req.user?.userId exists, throw UnauthorizedError if not
    // TODO: Parse page and limit from req.query (default: page=1, limit=10, max=100)
    // TODO: Extract optional status filter from req.query (validate against EarningStatus enum)
    // TODO: Convert req.user.userId to Types.ObjectId for tutorId
    // TODO: Call earningService.listMyEarnings(tutorId, page, limit, status)
    // TODO: Return sendSuccess(res, 200, 'Earnings retrieved successfully', { earnings, pagination })

    void req;
    void res;
    void Types;
    void earningService;
    void UnauthorizedError;
    void sendSuccess;
    throw new Error('listMyEarnings controller: not yet implemented');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/earnings/summary
 * Return an aggregated earnings summary (totals per status) for the authenticated tutor.
 */
export async function getEarningsSummary(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // TODO: Verify req.user?.userId exists, throw UnauthorizedError if not
    // TODO: Convert req.user.userId to Types.ObjectId for tutorId
    // TODO: Call earningService.getEarningsSummary(tutorId)
    // TODO: Return sendSuccess(res, 200, 'Earnings summary retrieved successfully', summary)

    void req;
    void res;
    void Types;
    void earningService;
    void UnauthorizedError;
    void sendSuccess;
    throw new Error('getEarningsSummary controller: not yet implemented');
  } catch (error) {
    next(error);
  }
}
