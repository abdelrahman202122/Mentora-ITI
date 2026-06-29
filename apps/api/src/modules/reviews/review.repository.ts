import mongoose, { type ClientSession, type Types } from 'mongoose';
import ReviewModel from './review.model.js';
import { TutorProfileModel } from '../tutor/profile/tutor-profile.model.js';
import type {
  CreateReviewInput,
  ReviewResponse,
  TutorRatingAggregate,
  UpdateReviewInput,
} from './review.types.js';

const { Types: MongooseTypes } = mongoose;

function toReviewResponse(review: any): ReviewResponse {
  if (review && typeof review.toObject === 'function') {
    return review.toObject() as ReviewResponse;
  }

  return review as ReviewResponse;
}

/**
 * Create and persist a review document.
 */
export async function createReview(
  data: CreateReviewInput,
  session?: ClientSession,
): Promise<ReviewResponse> {
  const [review] = await ReviewModel.create([data], { session });
  return toReviewResponse(review);
}

/**
 * Find a review document by its ID.
 */
export async function findReviewById(
  reviewId: Types.ObjectId,
): Promise<ReviewResponse | null> {
  const review = await ReviewModel.findById(reviewId).exec();
  return review ? toReviewResponse(review) : null;
}

/**
 * Find a review document by booking ID.
 */
export async function findReviewByBookingId(
  bookingId: Types.ObjectId,
): Promise<ReviewResponse | null> {
  const review = await ReviewModel.findOne({ bookingId }).exec();
  return review ? toReviewResponse(review) : null;
}

/**
 * Find a tutor profile by its ID with review visibility metadata.
 */
export async function findTutorProfileById(
  tutorProfileId: Types.ObjectId,
): Promise<{ _id: Types.ObjectId; status: string } | null> {
  return TutorProfileModel.findById(tutorProfileId)
    .select('_id status')
    .lean<{ _id: Types.ObjectId; status: string }>()
    .exec();
}

/**
 * Find paginated visible reviews for a tutor profile.
 */
export async function findReviewsByTutorProfileId(
  tutorProfileId: Types.ObjectId,
  skip: number,
  limit: number,
  sortBy = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc',
): Promise<ReviewResponse[]> {
  return ReviewModel.find({ tutorProfileId, isVisible: true })
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .lean<ReviewResponse[]>()
    .exec();
}

/**
 * Count visible reviews for a tutor profile.
 */
export async function countReviewsByTutorProfileId(
  tutorProfileId: Types.ObjectId,
): Promise<number> {
  return ReviewModel.countDocuments({ tutorProfileId, isVisible: true }).exec();
}

/**
 * Find paginated reviews created by a learner.
 */
export async function findReviewsByLearnerId(
  learnerId: Types.ObjectId,
  skip: number,
  limit: number,
  sortBy = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc',
): Promise<ReviewResponse[]> {
  return ReviewModel.find({ learnerId })
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .lean<ReviewResponse[]>()
    .exec();
}

/**
 * Count reviews created by a learner.
 */
export async function countReviewsByLearnerId(
  learnerId: Types.ObjectId,
): Promise<number> {
  return ReviewModel.countDocuments({ learnerId }).exec();
}

/**
 * Update a review document by ID.
 */
export async function updateReviewById(
  reviewId: Types.ObjectId,
  updates: UpdateReviewInput,
  session?: ClientSession,
): Promise<ReviewResponse | null> {
  const review = await ReviewModel.findByIdAndUpdate(
    reviewId,
    { $set: updates },
    { new: true, runValidators: true, session },
  ).exec();

  return review ? toReviewResponse(review) : null;
}

/**
 * Delete or hide a review document by ID.
 */
export async function deleteReviewById(
  reviewId: Types.ObjectId,
  session?: ClientSession,
): Promise<ReviewResponse | null> {
  const review = await ReviewModel.findByIdAndUpdate(
    reviewId,
    {
      $set: {
        isVisible: false,
        deletedAt: new Date(),
      },
    },
    { new: true, session },
  ).exec();

  return review ? toReviewResponse(review) : null;
}

/**
 * Calculate rating aggregate values for a tutor profile.
 */
export async function calculateTutorRatingAggregate(
  tutorProfileId: Types.ObjectId,
  session?: ClientSession,
): Promise<TutorRatingAggregate> {
  const aggregation = ReviewModel.aggregate<{
    _id: Types.ObjectId | null;
    rating: number;
    totalReviews: number;
  }>([
    {
      $match: {
        tutorProfileId: new MongooseTypes.ObjectId(tutorProfileId),
        isVisible: true,
      },
    },
    {
      $group: {
        _id: '$tutorProfileId',
        rating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (session) {
    aggregation.session(session);
  }

  const [result] = await aggregation.exec();

  const aggregate = {
    rating: result?.rating ?? 0,
    totalReviews: result?.totalReviews ?? 0,
  };

  await TutorProfileModel.findByIdAndUpdate(
    tutorProfileId,
    {
      $set: aggregate,
    },
    { new: true, runValidators: true, session },
  ).exec();

  return aggregate;
}
