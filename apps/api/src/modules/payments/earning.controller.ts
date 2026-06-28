import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../../utils/api-response.js';
import { UnauthorizedError, ValidationError } from '../../common/errors/AppError.js';
import * as earningService from './earning.service.js';
import { EarningStatus } from './earning.types.js';

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
    // Verify req.user?.userId exists, throw UnauthorizedError if not
    if (!req.user?.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    // Parse page and limit from req.query (default: page=1, limit=10, max=100)
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));

    // Extract optional status filter from req.query (validate against EarningStatus enum)
    const status = req.query.status as string | undefined;
    if (status && !Object.values(EarningStatus).includes(status as EarningStatus)) {
      throw new ValidationError(`Invalid earning status: ${status}`);
    }

    // Convert req.user.userId to Types.ObjectId for tutorId
    const tutorId = new Types.ObjectId(req.user.userId);

    // Call earningService.listMyEarnings(tutorId, page, limit, status)
    const result = await earningService.listMyEarnings(tutorId, page, limit, status);

    // Return sendSuccess(res, 200, 'Earnings retrieved successfully', { earnings, pagination })
    sendSuccess(res, 200, 'Earnings retrieved successfully', {
      earnings: result.earnings,
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
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
    // Verify req.user?.userId exists, throw UnauthorizedError if not
    if (!req.user?.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    // Convert req.user.userId to Types.ObjectId for tutorId
    const tutorId = new Types.ObjectId(req.user.userId);

    // Call earningService.getEarningsSummary(tutorId)
    const summary = await earningService.getEarningsSummary(tutorId);

    // Return sendSuccess(res, 200, 'Earnings summary retrieved successfully', summary)
    sendSuccess(res, 200, 'Earnings summary retrieved successfully', summary);
  } catch (error) {
    next(error);
  }
}
