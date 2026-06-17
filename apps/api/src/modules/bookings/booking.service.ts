import mongoose, { type Types } from 'mongoose';
import { AppError, NotFoundError } from '../../common/errors/AppError.js';
import type { CreateBookingInput, IBooking } from './booking.types.js';
import * as bookingRepository from './booking.repository.js';

/**
 * Booking service handles business logic for booking operations
 */

type CreateBookingPayload = Omit<
  CreateBookingInput,
  'tutorId' | 'price' | 'currency'
> & {
  learnerId: Types.ObjectId;
};

interface UserContext {
  id: string | Types.ObjectId;
  role: string;
}

function createBookingError(message: string, statusCode: number) {
  return new AppError(message, statusCode, 'BOOKING_ERROR');
}

/**
 * Validate that the user is a learner
 */
export function validateLearnerRole(user: UserContext): void {
  if (user.role !== 'learner') {
    throw createBookingError('Only learners can create bookings', 403);
  }
}

/**
 * Validate that learner is not booking themselves
 * @param learnerId - The learner's user ID
 * @param tutorId - The tutor's user ID
 */
export function validateLearnerIsNotSelf(
  learnerId: Types.ObjectId,
  tutorId: Types.ObjectId,
): void {
  if (learnerId.equals(tutorId)) {
    throw createBookingError('You cannot book yourself as a tutor', 400);
  }
}

/**
 * Check if a duplicate booking exists for the same tutor at the same time
 * @param tutorId - The tutor's user ID
 * @param startAt - Booking start time
 * @param endAt - Booking end time
 */
export async function checkDuplicateBooking(
  tutorId: Types.ObjectId,
  startAt: Date,
  endAt: Date,
): Promise<void> {
  const existingBookings = await bookingRepository.findBookingsByTutorAndTime(
    tutorId,
    startAt,
    endAt,
  );

  if (existingBookings.length > 0) {
    throw createBookingError(
      'A booking already exists for this tutor at this time slot',
      409,
    );
  }
}

/**
 * Helper: Convert Date to HH:MM string
 */
function dateToTimeString(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Helper: Compare time strings (HH:MM format)
 * Returns true if time1 <= time2
 */
function isTimeLeOrEqual(time1: string, time2: string): boolean {
  return time1.localeCompare(time2) <= 0;
}

/**
 * Helper: Get day name from Date
 */
function getDayName(date: Date): string {
  const days = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return days[date.getDay()];
}

/**
 * Check if tutor is available at the requested time
 * @param tutorId - The tutor's user ID
 * @param startAt - Booking start time
 * @param endAt - Booking end time
 */
export async function checkTutorAvailability(
  tutorId: Types.ObjectId,
  startAt: Date,
  endAt: Date,
): Promise<void> {
  const availability = await bookingRepository.findTutorAvailability(tutorId);

  if (!availability) {
    throw new NotFoundError('Tutor availability not found');
  }

  const dayName = getDayName(startAt);
  const bookingStartTime = dateToTimeString(startAt);
  const bookingEndTime = dateToTimeString(endAt);

  // Get slots for the day (e.g., availability.slots.monday)
  const daySlots =
    availability.slots[dayName as keyof typeof availability.slots] || [];

  if (daySlots.length === 0) {
    throw createBookingError('Tutor is not available on this day', 409);
  }

  // Check if booking time fits within any of the available slots
  const isAvailable = daySlots.some((slot: any) => {
    return (
      isTimeLeOrEqual(slot.startTime, bookingStartTime) &&
      isTimeLeOrEqual(bookingEndTime, slot.endTime)
    );
  });

  if (!isAvailable) {
    throw createBookingError(
      'Requested time slot is not within tutor availability',
      409,
    );
  }
}

/**
 * Get tutor ID from tutor profile
 * @param tutorProfileId - The tutor profile ID
 * @returns The tutor's user ID
 * @throws NotFoundError if the tutor profile doesn't exist
 */
export async function getTutorIdFromProfile(
  tutorProfileId: Types.ObjectId,
): Promise<Types.ObjectId> {
  return bookingRepository.getTutorIdFromProfile(tutorProfileId);
}

/**
 * Get tutor pricing based on hourly rate and booking duration
 * @param tutorProfileId - The tutor profile ID
 * @param durationMinutes - The booking duration in minutes
 * @returns The calculated booking price and currency
 * @throws AppError if price calculation fails
 * @throws NotFoundError if the tutor profile doesn't exist
 */
export async function getTutorPricing(
  tutorProfileId: Types.ObjectId,
  durationMinutes: number,
): Promise<{ price: number; currency: string }> {
  const hourlyRate = await bookingRepository.getTutorHourlyRate(tutorProfileId);

  if (hourlyRate <= 0) {
    throw createBookingError('Tutor hourly rate must be greater than 0', 500);
  }

  if (durationMinutes <= 0) {
    throw createBookingError('Booking duration must be greater than 0', 400);
  }

  // Calculate price: hourlyRate * (durationMinutes / 60)
  const price = (hourlyRate * durationMinutes) / 60;

  // Use default currency EGP
  const currency = 'EGP';

  return { price, currency };
}

/**
 * Create a new booking with full validation
 */
export async function createBooking(
  payload: CreateBookingPayload,
): Promise<IBooking> {
  const {
    learnerId,
    tutorProfileId,
    subjectId,
    startAt,
    endAt,
    durationMinutes,
    learnerNote,
  } = payload;

  // Get tutor ID from profile
  const tutorId = await getTutorIdFromProfile(tutorProfileId);

  // Get price from tutor hourly rate
  const { price, currency } = await getTutorPricing(
    tutorProfileId,
    durationMinutes,
  );

  // Validate learner is not booking themselves
  validateLearnerIsNotSelf(learnerId, tutorId);

  // Check for duplicate bookings
  await checkDuplicateBooking(tutorId, startAt, endAt);

  // Check tutor availability
  await checkTutorAvailability(tutorId, startAt, endAt);

  // Create the booking
  const bookingData: CreateBookingInput = {
    learnerId,
    tutorId,
    tutorProfileId,
    subjectId,
    startAt,
    endAt,
    durationMinutes,
    price,
    currency,
    learnerNote,
  };

  return bookingRepository.createBooking(bookingData);
}

/**
 * List learner bookings with optional filters and pagination
 */
export async function listLearnerBookings(
  learnerId: Types.ObjectId,
  page: number,
  limit: number,
  filters?: {
    bookingStatus?: string;
    paymentStatus?: string;
    tutorProfileId?: string;
    subjectId?: string;
  },
): Promise<{
  bookings: IBooking[];
  total: number;
  page: number;
  totalPages: number;
}> {
  // Build MongoDB filter query from provided filters
  const mongoFilters: Record<string, unknown> = {};

  if (filters?.bookingStatus) {
    mongoFilters.bookingStatus = filters.bookingStatus;
  }

  if (filters?.paymentStatus) {
    mongoFilters.paymentStatus = filters.paymentStatus;
  }

  if (filters?.tutorProfileId) {
    mongoFilters.tutorProfileId = new mongoose.Types.ObjectId(
      filters.tutorProfileId,
    );
  }

  if (filters?.subjectId) {
    mongoFilters.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
  }

  const skip = (page - 1) * limit;

  // Fetch paginated bookings
  const bookings = await bookingRepository.findBookingsByLearner(
    learnerId,
    skip,
    limit,
    mongoFilters,
  );

  // Get total count for pagination metadata
  const total = await bookingRepository.countLearnerBookingsWithFilters(
    learnerId,
    mongoFilters,
  );

  const totalPages = Math.ceil(total / limit);

  return {
    bookings,
    total,
    page,
    totalPages,
  };
}

/**
 * List tutor bookings with optional filters and pagination
 */
export async function listTutorBookings(
  tutorId: Types.ObjectId,
  page: number,
  limit: number,
  filters?: {
    bookingStatus?: string;
    paymentStatus?: string;
    subjectId?: string;
  },
): Promise<{
  bookings: IBooking[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const mongoFilters: Record<string, unknown> = {};

  if (filters?.bookingStatus) {
    mongoFilters.bookingStatus = filters.bookingStatus;
  }

  if (filters?.paymentStatus) {
    mongoFilters.paymentStatus = filters.paymentStatus;
  }

  if (filters?.subjectId) {
    if (!mongoose.Types.ObjectId.isValid(filters.subjectId)) {
      throw new AppError('Invalid subjectId', 400, 'VALIDATION_ERROR');
    }
    mongoFilters.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
  }

  const skip = (page - 1) * limit;

  const bookings = await bookingRepository.findBookingsByTutor(
    tutorId,
    skip,
    limit,
    mongoFilters,
  );

  const total = await bookingRepository.countTutorBookingsWithFilters(
    tutorId,
    mongoFilters,
  );

  const totalPages = Math.ceil(total / limit);

  return { bookings, total, page, totalPages };
}

/**
 * List all bookings with optional filters and pagination (admin)
 */
export async function listAdminBookings(
  page: number,
  limit: number,
  filters?: {
    bookingStatus?: string;
    paymentStatus?: string;
    tutorProfileId?: string;
    subjectId?: string;
  },
): Promise<{
  bookings: IBooking[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const mongoFilters: Record<string, unknown> = {};

  if (filters?.bookingStatus) {
    mongoFilters.bookingStatus = filters.bookingStatus;
  }

  if (filters?.paymentStatus) {
    mongoFilters.paymentStatus = filters.paymentStatus;
  }

  if (filters?.tutorProfileId) {
    mongoFilters.tutorProfileId = new mongoose.Types.ObjectId(
      filters.tutorProfileId,
    );
  }

  if (filters?.subjectId) {
    mongoFilters.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
  }

  const skip = (page - 1) * limit;

  const bookings = await bookingRepository.findAllBookings(
    skip,
    limit,
    mongoFilters,
  );

  const total = await bookingRepository.countAllBookings(mongoFilters);

  const totalPages = Math.ceil(total / limit);

  return { bookings, total, page, totalPages };
}

/**
 * Get a booking by ID with authorization check
 * For tutors, the confirmationCode field is excluded from the response
 * @param bookingId - The booking ID

 * @param userRole - The authenticated user's role
 * @returns The booking if the user is authorized
 * @throws NotFoundError if booking does not exist
 * @throws UnauthorizedError if user is not authorized to view the booking
 */
export async function getBookingByIdWithAuth(
  bookingId: Types.ObjectId,
  userId: Types.ObjectId | string,
  userRole: string,
): Promise<IBooking> {
  const booking = await bookingRepository.findBookingById(bookingId);

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  // Convert userId to ObjectId for comparison
  const userObjectId =
    userId instanceof mongoose.Types.ObjectId
      ? userId
      : new mongoose.Types.ObjectId(userId as string);

  // Check authorization: user must be learner, tutor, or admin for this booking
  const isLearner = booking.learnerId.equals(userObjectId);
  const isTutor = booking.tutorId.equals(userObjectId);
  const isAdmin = userRole === 'admin';

  if (!isLearner && !isTutor && !isAdmin) {
    throw new AppError(
      'You do not have permission to view this booking',
      403,
      'FORBIDDEN',
    );
  }

  // For tutors, exclude confirmationCode from response
  if (isTutor && !isAdmin) {
    const bookingObj =
      booking instanceof mongoose.Model ? booking.toObject() : booking;
    const bookingWithoutCode = { ...(bookingObj as Record<string, unknown>) };
    delete bookingWithoutCode.confirmationCode;
    return bookingWithoutCode as unknown as IBooking;
  }

  return booking;
}
