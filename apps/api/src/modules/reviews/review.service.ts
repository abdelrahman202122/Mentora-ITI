import { type Types } from 'mongoose';
import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../common/errors/AppError.js';
import { withTransaction } from '../../common/transactionHelper.js';
import { BookingStatus } from '../bookings/booking.types.js';
import * as bookingRepository from '../bookings/booking.repository.js';
import * as reviewRepository from './review.repository.js';
import type { ReviewResponse } from './review.types.js';

function createReviewError(message: string, statusCode: number): AppError {
  return new AppError(message, statusCode, 'REVIEW_ERROR');
}

/**
 * Create a verified review for a completed booking.
 */
export async function createReview(
  learnerId: Types.ObjectId,
  input: {
    bookingId: Types.ObjectId;
    rating: number;
    comment?: string;
  },
): Promise<ReviewResponse> {
  const booking = await bookingRepository.findBookingById(input.bookingId);

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  if (!booking.learnerId.equals(learnerId)) {
    throw new ForbiddenError('You can only review your own bookings');
  }

  if (booking.bookingStatus !== BookingStatus.COMPLETED) {
    throw createReviewError('Only completed bookings can be reviewed', 409);
  }

  if (booking.reviewId) {
    throw new ConflictError('A review already exists for this booking');
  }

  const existingReview = await reviewRepository.findReviewByBookingId(
    input.bookingId,
  );

  if (existingReview) {
    throw new ConflictError('A review already exists for this booking');
  }

  const review = await withTransaction(async (session) => {
    const createdReview = await reviewRepository.createReview(
      {
        bookingId: input.bookingId,
        learnerId,
        tutorId: booking.tutorId,
        tutorProfileId: booking.tutorProfileId,
        rating: input.rating,
        comment: input.comment,
      },
      session,
    );

    const updatedBooking = await bookingRepository.updateBooking(
      input.bookingId,
      {
        reviewId: createdReview._id,
      },
      session,
    );

    if (!updatedBooking) {
      throw new NotFoundError('Booking not found');
    }

    await reviewRepository.calculateTutorRatingAggregate(
      booking.tutorProfileId,
      session,
    );

    return createdReview;
  });

  return review;
}

/**
 * List public visible reviews for a tutor profile.
 */
export async function listTutorReviews(): Promise<void> {
  // TODO: Validate tutor profile access/display requirements.
  // TODO: Delegate pagination and filtering to reviewRepository.findReviewsByTutorProfileId.
  // TODO: Return public-safe review data and pagination metadata.
}

/**
 * List reviews created by a learner.
 */
export async function listMyReviews(): Promise<void> {
  // TODO: Confirm the learner is authenticated.
  // TODO: Delegate pagination and filtering to reviewRepository.findReviewsByLearnerId.
  // TODO: Return learner-owned review data and pagination metadata.
}

/**
 * Update a learner-owned review.
 */
export async function updateReview(): Promise<void> {
  // TODO: Load the review by ID.
  // TODO: Ensure the review belongs to the authenticated learner.
  // TODO: Apply rating/comment updates through reviewRepository.updateReviewById.
  // TODO: Recalculate tutor aggregate rating and total review count.
}

/**
 * Delete a learner-owned review.
 */
export async function deleteReview(): Promise<void> {
  // TODO: Load the review by ID.
  // TODO: Ensure the review belongs to the authenticated learner.
  // TODO: Delete or hide the review through reviewRepository.deleteReviewById.
  // TODO: Recalculate tutor aggregate rating and total review count.
}
