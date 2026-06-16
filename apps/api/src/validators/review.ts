import { z } from 'zod';
import { objectIdSchema, ratingSchema, paginationSchema } from './common.js';

/**
 * Review validation schemas for BE3 review management.
 * These schemas will be expanded during Phase 8: Reviews & Ratings.
 */

/**
 * Schema for creating a new review
 */
export const createReviewSchema = z.object({
  bookingId: objectIdSchema,
  rating: ratingSchema,
  comment: z
    .string()
    .max(1000, 'Comment cannot exceed 1000 characters')
    .optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

/**
 * Schema for review ID parameters
 */
export const reviewIdSchema = z.object({
  reviewId: objectIdSchema,
});

export type ReviewIdParam = z.infer<typeof reviewIdSchema>;

/**
 * Schema for tutor ID parameters (for public review list)
 */
export const tutorIdSchema = z.object({
  tutorProfileId: objectIdSchema,
});

export type TutorIdParam = z.infer<typeof tutorIdSchema>;

/**
 * Schema for listing reviews with filters
 */
export const listReviewsSchema = paginationSchema.extend({
  tutorProfileId: objectIdSchema.optional(),
});

export type ListReviewsQuery = z.infer<typeof listReviewsSchema>;

/**
 * Schema for updating a review
 */
export const updateReviewSchema = z.object({
  rating: ratingSchema.optional(),
  comment: z
    .string()
    .max(1000, 'Comment cannot exceed 1000 characters')
    .optional(),
});

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
