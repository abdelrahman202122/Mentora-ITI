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
import type {
  PaginatedReviewsResponse,
  ReviewResponse,
} from './review.types.js';

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

  // The pre-transaction findReviewByBookingId check has been removed — it was
  // racy under concurrent requests. Uniqueness is now enforced inside the
  // transaction by two complementary mechanisms:
  //   1. The unique index on Review.bookingId causes a duplicate insert to
  //      throw an E11000 error, which is caught and re-raised as ConflictError.
  //   2. linkReviewToBooking uses a conditional findOneAndUpdate that only
  //      matches bookings where reviewId is unset, returning null when a
  //      concurrent request has already claimed the slot.

  const review = await withTransaction(async (session) => {
    let createdReview: ReviewResponse;

    try {
      createdReview = await reviewRepository.createReview(
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
    } catch (err: unknown) {
      // MongoDB duplicate key on the Review.bookingId unique index.
      if (
        typeof err === 'object' &&
        err !== null &&
        (err as { code?: number }).code === 11000
      ) {
        throw new ConflictError('A review already exists for this booking');
      }
      throw err;
    }

    const updatedBooking = await bookingRepository.linkReviewToBooking(
      input.bookingId,
      createdReview._id,
      session,
    );

    if (!updatedBooking) {
      // Booking was not found, or its reviewId was already set by a concurrent
      // request that beat us to the conditional update.
      throw new ConflictError('A review already exists for this booking');
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
export async function listTutorReviews(
  tutorProfileId: Types.ObjectId,
  query: {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
  },
): Promise<PaginatedReviewsResponse> {
  const tutorProfile = await reviewRepository.findTutorProfileById(
    tutorProfileId,
  );

  if (!tutorProfile || tutorProfile.status !== 'approved') {
    throw new NotFoundError('Tutor not found');
  }

  const skip = (query.page - 1) * query.limit;
  const sortBy = query.sortBy ?? 'createdAt';

  const [reviews, total] = await Promise.all([
    reviewRepository.findReviewsByTutorProfileId(
      tutorProfileId,
      skip,
      query.limit,
      sortBy,
      query.sortOrder,
    ),
    reviewRepository.countReviewsByTutorProfileId(tutorProfileId),
  ]);

  return {
    reviews,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

/**
 * List reviews created by a learner.
 */
export async function listMyReviews(
  learnerId: Types.ObjectId,
  query: {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
    tutorProfileId?: Types.ObjectId;
  },
): Promise<PaginatedReviewsResponse> {
  const skip = (query.page - 1) * query.limit;
  const sortBy = query.sortBy ?? 'createdAt';

  const [reviews, total] = await Promise.all([
    reviewRepository.findReviewsByLearnerId(
      learnerId,
      skip,
      query.limit,
      sortBy,
      query.sortOrder,
      query.tutorProfileId,
    ),
    reviewRepository.countReviewsByLearnerId(
      learnerId,
      query.tutorProfileId,
    ),
  ]);

  return {
    reviews,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
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
