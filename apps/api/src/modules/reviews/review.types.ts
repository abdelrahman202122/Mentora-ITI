import type { Types } from 'mongoose';

export interface ReviewResponse {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  learnerId: Types.ObjectId;
  tutorId: Types.ObjectId;
  tutorProfileId: Types.ObjectId;
  rating: number;
  comment?: string;
  isVisible: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewInput {
  bookingId: Types.ObjectId;
  learnerId: Types.ObjectId;
  tutorId: Types.ObjectId;
  tutorProfileId: Types.ObjectId;
  rating: number;
  comment?: string;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}

export interface PaginatedReviewsResponse {
  reviews: ReviewResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TutorRatingAggregate {
  rating: number;
  totalReviews: number;
}
