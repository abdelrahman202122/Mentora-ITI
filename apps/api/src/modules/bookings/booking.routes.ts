import { Router } from 'express';

import { validate } from '../../middleware/validation.middleware.js';
import {
  createBookingSchema,
  bookingIdSchema,
  listBookingsSchema,
  acceptBookingSchema,
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
 * GET /api/bookings
 * List bookings with optional filters and pagination
 * Query: listBookingsSchema (status, page, limit)
 */
router.get('/', validate({ query: listBookingsSchema }), (req, res) => {
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
 * PATCH /api/bookings/:bookingId
 * Update booking status (e.g., accept, reject, cancel)
 * Params: bookingIdSchema
 * Body: acceptBookingSchema
 */
router.patch(
  '/:bookingId',
  validate({ params: bookingIdSchema, body: acceptBookingSchema }),
  (req, res) => {
    // Controller method will be implemented
    res.status(200).json({ message: 'Booking updated' });
  },
);

export default router;
