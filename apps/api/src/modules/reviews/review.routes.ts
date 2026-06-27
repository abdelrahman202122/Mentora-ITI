import { Router } from 'express';

import { validate } from '../../middleware/validation.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { authRateLimit } from '../../middleware/rateLimit.middleware.js';
import { roleMiddleware } from '../../middleware/role.moddleware.js';
import { UserRole } from '../users/user.interface.js';
import {
  createReviewSchema,
  listReviewsSchema,
  reviewIdSchema,
  tutorIdSchema,
  updateReviewSchema,
} from '../../validators/review.js';
import * as reviewController from './review.controller.js';

const router = Router();

/**
 * POST /api/reviews
 * Create a verified review for a completed booking.
 * Body: createReviewSchema { bookingId, rating, comment }
 * Auth: learner only
 */
router.post(
  '/',
  authMiddleware,
  authRateLimit,
  validate({ body: createReviewSchema }),
  roleMiddleware(UserRole.LEARNER),
  reviewController.createReview,
);

/**
 * GET /api/reviews/tutors/:tutorProfileId
 * List public reviews for a tutor profile.
 * Params: tutorIdSchema { tutorProfileId }
 * Query: listReviewsSchema
 * Auth: public
 */
router.get(
  '/tutors/:tutorProfileId',
  authRateLimit,
  validate({ params: tutorIdSchema, query: listReviewsSchema }),
  reviewController.listTutorReviews,
);

/**
 * GET /api/reviews/me
 * List reviews owned by the authenticated learner.
 * Query: listReviewsSchema
 * Auth: learner only
 */
router.get(
  '/me',
  authMiddleware,
  authRateLimit,
  validate({ query: listReviewsSchema }),
  roleMiddleware(UserRole.LEARNER),
  reviewController.listMyReviews,
);

/**
 * PATCH /api/reviews/:reviewId
 * Update a review owned by the authenticated learner.
 * Params: reviewIdSchema { reviewId }
 * Body: updateReviewSchema { rating, comment }
 * Auth: learner only
 */
router.patch(
  '/:reviewId',
  authMiddleware,
  authRateLimit,
  validate({ params: reviewIdSchema, body: updateReviewSchema }),
  roleMiddleware(UserRole.LEARNER),
  reviewController.updateReview,
);

/**
 * DELETE /api/reviews/:reviewId
 * Delete a review owned by the authenticated learner.
 * Params: reviewIdSchema { reviewId }
 * Auth: learner only
 */
router.delete(
  '/:reviewId',
  authMiddleware,
  authRateLimit,
  validate({ params: reviewIdSchema }),
  roleMiddleware(UserRole.LEARNER),
  reviewController.deleteReview,
);

export default router;
