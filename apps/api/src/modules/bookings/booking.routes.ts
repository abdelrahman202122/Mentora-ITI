import { Router } from 'express';

import { validate } from '../../middleware/validation.middleware.js';
import {
  createBookingSchema,
  bookingIdSchema,
  listBookingsSchema,
  acceptBookingSchema,
  rejectBookingSchema,
  cancelBookingSchema,
  confirmBookingCodeSchema,
} from '../../validators/booking.js';

const router = Router();

/**
 * POST /api/bookings
 * Create a new booking request
 * Body: createBookingSchema
 */
router.post('/', validate({ body: createBookingSchema }), (req, res) => {
  // Controller method will be implemented
  res.status(201).json({ message: 'Booking created' });
});

/**
 * GET /api/bookings/me
 * List the authenticated user's bookings with optional filters and pagination
 * Query: listBookingsSchema
 */
router.get('/me', validate({ query: listBookingsSchema }), (req, res) => {
  // Controller method will be implemented
  res.status(200).json({ message: 'Bookings list' });
});

/**
 * GET /api/bookings/:bookingId
 * Get a specific booking by ID
 * Params: bookingIdSchema
 */
router.get('/:bookingId', validate({ params: bookingIdSchema }), (req, res) => {
  // Controller method will be implemented
  res.status(200).json({ message: 'Booking details' });
});

/**
 * PATCH /api/bookings/:bookingId/accept
 * Accept a pending booking request
 * Params: bookingIdSchema
 * Body: acceptBookingSchema
 */
router.patch(
  '/:bookingId/accept',
  validate({ params: bookingIdSchema, body: acceptBookingSchema }),
  (req, res) => {
    // Controller method will be implemented
    res.status(200).json({ message: 'Booking accepted' });
  },
);

/**
 * PATCH /api/bookings/:bookingId/reject
 * Reject a pending booking request
 * Params: bookingIdSchema
 * Body: rejectBookingSchema
 */
router.patch(
  '/:bookingId/reject',
  validate({ params: bookingIdSchema, body: rejectBookingSchema }),
  (req, res) => {
    // Controller method will be implemented
    res.status(200).json({ message: 'Booking rejected' });
  },
);

/**
 * PATCH /api/bookings/:bookingId/cancel
 * Cancel a booking before completion
 * Params: bookingIdSchema
 * Body: cancelBookingSchema
 */
router.patch(
  '/:bookingId/cancel',
  validate({ params: bookingIdSchema, body: cancelBookingSchema }),
  (req, res) => {
    // Controller method will be implemented
    res.status(200).json({ message: 'Booking canceled' });
  },
);

/**
 * POST /api/bookings/:bookingId/confirm-code
 * Confirm session completion with the learner-provided code
 * Params: bookingIdSchema
 * Body: confirmBookingCodeSchema
 */
router.post(
  '/:bookingId/confirm-code',
  validate({ params: bookingIdSchema, body: confirmBookingCodeSchema }),
  (req, res) => {
    // Controller method will be implemented
    res.status(200).json({ message: 'Booking code confirmed' });
  },
);

export default router;
