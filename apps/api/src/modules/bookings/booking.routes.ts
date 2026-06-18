import { Router } from 'express';

import { validate } from '../../middleware/validation.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { authRateLimit } from '../../middleware/rateLimit.middleware.js';
import {
  createBookingSchema,
  bookingIdSchema,
  listBookingsSchema,
  acceptBookingSchema,
  rejectBookingSchema,
  cancelBookingSchema,
  confirmBookingCodeSchema,
} from '../../validators/booking.js';
import * as bookingController from './booking.controller.js';
import { roleMiddleware } from '../../middleware/role.moddleware.js';
import { UserRole } from '../users/user.interface.js';

const router = Router();
router.use(authMiddleware);
/**
 * POST /api/bookings
 * Create a new booking request
 * Body: createBookingSchema (tutorProfileId, subjectId, startAt, endAt, durationMinutes, learnerNote)
 */
router.post(
  '/',
  authRateLimit,
  validate({ body: createBookingSchema }),
  roleMiddleware(UserRole.LEARNER),
  bookingController.createBooking,
);

/**
 * GET /api/bookings/me
 * List the authenticated user's bookings with optional filters and pagination
 * Query: listBookingsSchema
 */
router.get(
  '/me',
  authRateLimit,
  validate({ query: listBookingsSchema }),
  roleMiddleware(UserRole.LEARNER, UserRole.TUTOR),
  bookingController.listMyBookings,
);

/**
 * GET /api/bookings/:bookingId
 * Get a specific booking by ID
 * Params: bookingIdSchema
 */
router.get(
  '/:bookingId',
  authRateLimit,
  validate({ params: bookingIdSchema }),
  roleMiddleware(UserRole.LEARNER, UserRole.TUTOR),
  bookingController.getBookingById,
);

/**
 * PATCH /api/bookings/:bookingId/accept
 * Accept a pending booking request
 * Params: bookingIdSchema
 * Body: acceptBookingSchema
 */
router.patch(
  '/:bookingId/accept',
  authRateLimit,
  validate({ params: bookingIdSchema, body: acceptBookingSchema }),
  roleMiddleware(UserRole.TUTOR),
  bookingController.acceptBooking,
);

/**
 * PATCH /api/bookings/:bookingId/reject
 * Reject a pending booking request
 * Params: bookingIdSchema
 * Body: rejectBookingSchema
 */
router.patch(
  '/:bookingId/reject',
  authRateLimit,
  validate({ params: bookingIdSchema, body: rejectBookingSchema }),
  roleMiddleware(UserRole.TUTOR),
  bookingController.rejectBooking,
);

/**
 * PATCH /api/bookings/:bookingId/cancel
 * Cancel a booking before completion
 * Params: bookingIdSchema
 * Body: cancelBookingSchema
 */
router.patch(
  '/:bookingId/cancel',
  authRateLimit,
  validate({ params: bookingIdSchema, body: cancelBookingSchema }),
  roleMiddleware(UserRole.LEARNER, UserRole.TUTOR),
  bookingController.cancelBooking,
);

/**
 * POST /api/bookings/:bookingId/confirm-code
 * Confirm session completion with the learner-provided code
 * Params: bookingIdSchema
 * Body: confirmBookingCodeSchema
 */
router.post(
  '/:bookingId/confirm-code',
  authRateLimit,
  validate({ params: bookingIdSchema, body: confirmBookingCodeSchema }),
  roleMiddleware(UserRole.TUTOR),
  bookingController.confirmBookingCode,
);

export default router;
