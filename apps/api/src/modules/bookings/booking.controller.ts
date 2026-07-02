import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../../utils/api-response.js';
import { AppError, UnauthorizedError } from '../../common/errors/AppError.js';
import type { CreateBookingInput } from '../../validators/booking.js';
import * as bookingService from './booking.service.js';
import { hasRole } from '../users/role.utils.js';
import { UserRole } from '../users/user.interface.js';

const { Types } = mongoose;

/**
 * Booking controller handles HTTP requests for booking operations
 */

/**
 * POST /api/bookings
 * Create a new booking request
 */
export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Validate user is authenticated
    if (!req.user?.userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    // Validate learner role
    bookingService.validateLearnerRole({
      id: req.user.userId,
      role: req.user.role,
      roles: req.user.roles,
    });

    // Get request body
    const {
      tutorProfileId,
      subjectId,
      startAt,
      endAt,
      durationMinutes,
      learnerNote,
    } = req.body as CreateBookingInput;

    // Convert string IDs to ObjectIds
    const learnerId = new Types.ObjectId(req.user.userId);
    const tutorProfileObjectId = new Types.ObjectId(tutorProfileId);
    const subjectObjectId = new Types.ObjectId(subjectId);

    // Create booking with service
    const booking = await bookingService.createBooking({
      learnerId,
      tutorProfileId: tutorProfileObjectId,
      subjectId: subjectObjectId,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      durationMinutes,
      learnerNote,
    });

    sendSuccess(res, 201, 'Booking created successfully', booking);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/bookings/me
 * List the authenticated user's bookings (learner or tutor)
 */
export async function listMyBookings(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Validate user is authenticated
    if (!req.user?.userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    // Get pagination parameters from query
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(
      1,
      Math.min(100, parseInt(req.query.limit as string) || 10),
    );

    // Get filter parameters from query
    const filters = {
      bookingStatus: req.query.bookingStatus as string | undefined,
      paymentStatus: req.query.paymentStatus as string | undefined,
      tutorProfileId: req.query.tutorProfileId as string | undefined,
      subjectId: req.query.subjectId as string | undefined,
    };

    const userId = new Types.ObjectId(req.user.userId);
    const mode =
      req.query.mode === 'tutor' || req.query.mode === 'admin'
        ? req.query.mode
        : 'learner';

    let result;
    if (mode === 'tutor') {
      if (!hasRole(req.user, UserRole.TUTOR)) {
        throw new AppError('Only tutors can list tutor bookings', 403, 'FORBIDDEN');
      }

      result = await bookingService.listTutorBookings(userId, page, limit, {
        bookingStatus: filters.bookingStatus,
        paymentStatus: filters.paymentStatus,
        subjectId: filters.subjectId,
      });
    } else if (mode === 'admin') {
      if (!hasRole(req.user, UserRole.ADMIN)) {
        throw new AppError('Only admins can list all bookings', 403, 'FORBIDDEN');
      }

      result = await bookingService.listAdminBookings(page, limit, filters);
    } else {
      bookingService.validateLearnerRole({
        id: req.user.userId,
        role: req.user.role,
        roles: req.user.roles,
      });

      result = await bookingService.listLearnerBookings(
        userId,
        page,
        limit,
        filters,
      );
    }

    sendSuccess(res, 200, 'Bookings retrieved successfully', {
      bookings: result.bookings,
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/bookings/:bookingId
 * Get a specific booking by ID
 */
export async function getBookingById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Validate user is authenticated
    if (!req.user?.userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    // Get booking ID from params
    const { bookingId } = req.params as { bookingId: string };
    const bookingObjectId = new Types.ObjectId(bookingId);

    // Get booking with authorization check
    const booking = await bookingService.getBookingByIdWithAuth(
      bookingObjectId,
      req.user.userId,
      req.user.roles,
    );

    sendSuccess(res, 200, 'Booking retrieved successfully', booking);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/bookings/:bookingId/accept
 * Accept a pending booking request
 */
export async function acceptBooking(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Validate user is authenticated
    if (!req.user?.userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    // Validate tutor role
    bookingService.validateTutorRole({
      id: req.user.userId,
      role: req.user.role,
      roles: req.user.roles,
    });

    // Get booking ID from params
    const { bookingId } = req.params as { bookingId: string };
    const bookingObjectId = new Types.ObjectId(bookingId);

    // Accept booking service
    const booking = await bookingService.acceptBooking(
      bookingObjectId,
      req.user.userId,
    );

    sendSuccess(res, 200, 'Booking accepted successfully', booking);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/bookings/:bookingId/reject
 * Reject a pending booking request
 */
export async function rejectBooking(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Validate user is authenticated
    if (!req.user?.userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    // Validate tutor role
    bookingService.validateTutorRole({
      id: req.user.userId,
      role: req.user.role,
      roles: req.user.roles,
    });

    // Get booking ID from params
    const { bookingId } = req.params as { bookingId: string };
    const bookingObjectId = new Types.ObjectId(bookingId);

    // Reject booking service
    const booking = await bookingService.rejectBooking(
      bookingObjectId,
      req.user.userId,
    );

    sendSuccess(res, 200, 'Booking rejected successfully', booking);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/bookings/:bookingId/cancel
 * Cancel a booking before completion
 */
export async function cancelBooking(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Validate user is authenticated
    if (!req.user?.userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    // Get booking ID from params
    const { bookingId } = req.params as { bookingId: string };
    const bookingObjectId = new Types.ObjectId(bookingId);

    const { cancelReason } = req.body as { cancelReason?: string };

    const booking = await bookingService.cancelBooking(
      bookingObjectId,
      req.user.userId,
      req.user.roles,
      cancelReason,
    );

    sendSuccess(res, 200, 'Booking canceled successfully', booking);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/bookings/:bookingId/confirm-code
 * Confirm session completion with the learner-provided code
 */
export async function confirmBookingCode(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Validate user is authenticated
    if (!req.user?.userId) {
      throw new UnauthorizedError('User not authenticated');
    }

    // Validate tutor role
    bookingService.validateTutorRole({
      id: req.user.userId,
      role: req.user.role,
      roles: req.user.roles,
    });

    // Get booking ID from params
    const { bookingId } = req.params as { bookingId: string };
    const bookingObjectId = new Types.ObjectId(bookingId);

    // Get confirmation code from request body
    const { code } = req.body;

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      throw new AppError('Confirmation code is required', 400, 'INVALID_INPUT');
    }

    // Confirm booking code service
    const booking = await bookingService.confirmBookingCode(
      bookingObjectId,
      req.user.userId,
      code.trim(),
    );

    sendSuccess(res, 200, 'Booking confirmed successfully', booking);
  } catch (error) {
    next(error);
  }
}
