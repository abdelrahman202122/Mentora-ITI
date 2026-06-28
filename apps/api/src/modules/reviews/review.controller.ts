import type { NextFunction, Request, Response } from 'express';

import * as reviewService from './review.service.js';

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
  // TODO: Verify the authenticated learner exists on req.user.
  // TODO: Read bookingId, rating, and optional comment from the validated body.
  // TODO: Call reviewService.createReview with learner identity and review input.
  // TODO: Return the created review with sendSuccess.
  await reviewService.createReview();
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
  // TODO: Read tutorProfileId from validated params.
  // TODO: Read pagination and sorting values from validated query.
  // TODO: Call reviewService.listTutorReviews.
  // TODO: Return reviews and pagination metadata with sendSuccess.
  await reviewService.listTutorReviews();
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
  // TODO: Verify the authenticated learner exists on req.user.
  // TODO: Read pagination and filtering values from validated query.
  // TODO: Call reviewService.listMyReviews with learner identity.
  // TODO: Return reviews and pagination metadata with sendSuccess.
  await reviewService.listMyReviews();
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
  // TODO: Verify the authenticated learner exists on req.user.
  // TODO: Read reviewId from validated params.
  // TODO: Read rating/comment updates from validated body.
  // TODO: Call reviewService.updateReview with learner identity.
  // TODO: Return the updated review with sendSuccess.
  await reviewService.updateReview();
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
  // TODO: Verify the authenticated learner exists on req.user.
  // TODO: Read reviewId from validated params.
  // TODO: Call reviewService.deleteReview with learner identity.
  // TODO: Return a success response with sendSuccess.
  await reviewService.deleteReview();
}
