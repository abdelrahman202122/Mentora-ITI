import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../../utils/api-response.js';
import { UnauthorizedError } from '../../common/errors/AppError.js';
import type {
  CreateReviewInput,
  ListReviewsQuery,
  ReviewIdParam,
  TutorIdParam,
  UpdateReviewInput,
} from '../../validators/review.js';
import * as reviewService from './review.service.js';

const { Types } = mongoose;

/**
 * Review controller handles HTTP requests for review operations.
 */

/**
 * POST /api/reviews
 * Create a verified review for a completed booking.
 */
export async function createReview(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { bookingId, rating, comment } = req.body as CreateReviewInput;

    const review = await reviewService.createReview(
      new Types.ObjectId(req.user.userId),
      {
        bookingId: new Types.ObjectId(bookingId),
        rating,
        comment,
      },
    );

    sendSuccess(res, 201, 'Review created successfully', review);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reviews/tutors/:tutorProfileId
 * List public visible reviews for a tutor profile.
 */
export async function listTutorReviews(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tutorProfileId } = req.params as TutorIdParam;
    const query = req.query as unknown as ListReviewsQuery;

    const result = await reviewService.listTutorReviews(
      new Types.ObjectId(tutorProfileId),
      {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
    );

    sendSuccess(res, 200, 'Reviews retrieved successfully', result);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reviews/me
 * List reviews created by the authenticated learner.
 */
export async function listMyReviews(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    const query = req.query as unknown as ListReviewsQuery;
    const learnerId = new Types.ObjectId(req.user.userId);
    const tutorProfileId = query.tutorProfileId
      ? new Types.ObjectId(query.tutorProfileId)
      : undefined;

    const result = await reviewService.listMyReviews(learnerId, {
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      tutorProfileId,
    });

    sendSuccess(res, 200, 'Reviews retrieved successfully', result);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/reviews/:reviewId
 * Update a review owned by the authenticated learner.
 */
export async function updateReview(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { reviewId } = req.params as ReviewIdParam;
    const updates = req.body as UpdateReviewInput;

    const review = await reviewService.updateReview(
      new Types.ObjectId(req.user.userId),
      new Types.ObjectId(reviewId),
      updates,
    );

    sendSuccess(res, 200, 'Review updated successfully', review);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/reviews/:reviewId
 * Delete a review owned by the authenticated learner.
 */
export async function deleteReview(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user?.userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    const { reviewId } = req.params as ReviewIdParam;

    await reviewService.deleteReview(
      new Types.ObjectId(req.user.userId),
      new Types.ObjectId(reviewId),
    );

    sendSuccess(res, 200, 'Review deleted successfully');
  } catch (error) {
    next(error);
  }
}
