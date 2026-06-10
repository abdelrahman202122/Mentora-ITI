import { z } from 'zod';

/**
 * Common validation schemas used across BE3 modules.
 * These are shared patterns for IDs, pagination, and common fields.
 */

/**
 * MongoDB ObjectId validation
 */
export const objectIdSchema = z
  .string()
  .min(24, 'Invalid ID format')
  .max(24, 'Invalid ID format');

/**
 * Common pagination query parameters
 */
export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive('Page must be a positive integer')
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .positive('Limit must be a positive integer')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

/**
 * Standard path parameter schema for resource IDs
 */
export const idParamSchema = z.object({
  id: objectIdSchema,
});

export type IdParam = z.infer<typeof idParamSchema>;

/**
 * Rating validation (1-5 stars)
 */
export const ratingSchema = z
  .number()
  .int()
  .min(1, 'Rating must be at least 1')
  .max(5, 'Rating cannot exceed 5');

/**
 * Currency code validation
 */
export const currencySchema = z
  .string()
  .length(3, 'Currency must be 3 characters')
  .toUpperCase();

/**
 * Common ISO date string validation
 */
export const isoDateSchema = z.string().datetime('Invalid date format');
