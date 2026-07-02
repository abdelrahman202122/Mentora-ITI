import mongoose, { type Types } from 'mongoose';
import { AppError, NotFoundError } from '../../common/errors/AppError.js';
import type {
  BookingResponse,
  CreateBookingInput,
  IBooking,
} from './booking.types.js';
import { PaymentStatus } from './booking.types.js';
import * as bookingRepository from './booking.repository.js';
import * as earningRepository from '../payments/earning.repository.js';
import { EarningStatus } from '../payments/earning.types.js';
import {
  decryptConfirmationCode,
  encryptConfirmationCode,
  generateConfirmationCode,
  isConfirmationCodeMatch,
} from './confirmation-code.util.js';
import { hasRole } from '../users/role.utils.js';
import { UserRole } from '../users/user.interface.js';

/**
 * Booking service handles business logic for booking operations
 */

type ViewerRole = 'learner' | 'tutor' | 'admin';

function toBookingResponse(booking: IBooking): BookingResponse {
  if (booking instanceof mongoose.Document) {
    return booking.toObject() as BookingResponse;
  }

  return booking as unknown as BookingResponse;
}

function formatBookingForResponse(
  booking: IBooking,
  viewerRole: ViewerRole,
): BookingResponse {
  const bookingObj = toBookingResponse(booking);

  if (
    viewerRole === 'tutor' ||
    (viewerRole === 'learner' && bookingObj.paymentStatus !== 'paid')
  ) {
    const bookingWithoutCode = { ...bookingObj };
    delete bookingWithoutCode.confirmationCode;
    return bookingWithoutCode;
  }

  const { confirmationCode } = bookingObj;

  if (typeof confirmationCode === 'string' && confirmationCode.length > 0) {
    return {
      ...bookingObj,
      confirmationCode: decryptConfirmationCode(confirmationCode),
    };
  }

  return bookingObj;
}

function formatBookingsForResponse(
  bookings: IBooking[],
  viewerRole: ViewerRole,
): BookingResponse[] {
  return bookings.map((booking) =>
    formatBookingForResponse(booking, viewerRole),
  );
}

async function promoteBookingEarningToAvailable(
  bookingId: Types.ObjectId,
  availableAt: Date,
): Promise<void> {
  const updatedEarning = await earningRepository.updateEarningAtomically(
    {
      bookingId,
      status: EarningStatus.PENDING,
    },
    {
      status: EarningStatus.AVAILABLE,
      availableAt,
    },
  );

  if (!updatedEarning) {
    // The booking can still complete, but this should be investigated because
    // the earning should have been created when the payment succeeded.
    return;
  }
}

async function expirePastUnpaidBookings(): Promise<void> {
  await bookingRepository.expirePastPendingBookings();
}

type CreateBookingPayload = Omit<
  CreateBookingInput,
  'tutorId' | 'price' | 'currency'
> & {
  learnerId: Types.ObjectId;
};

interface UserContext {
  id: string | Types.ObjectId;
  role?: string;
  roles?: string[];
}

function createBookingError(message: string, statusCode: number) {
  return new AppError(message, statusCode, 'BOOKING_ERROR');
}

/**
 * Validate that the user is a learner
 */
export function validateLearnerRole(user: UserContext): void {
  if (!hasRole(user, UserRole.LEARNER)) {
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
  return time1 <= time2;
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
 * Validate that the user is a tutor
 */
export function validateTutorRole(user: UserContext): void {
  if (!hasRole(user, UserRole.TUTOR)) {
    throw createBookingError('Only tutors can accept or reject bookings', 403);
  }
}

/**
 * Validate that the booking belongs to the tutor
 * @param bookingTutorId - The tutor ID from the booking document
 * @param requestingUserId - The ID of the user making the request
 */
export function validateBookingBelongsToTutor(
  bookingTutorId: Types.ObjectId,
  requestingUserId: string | Types.ObjectId,
): void {
  const requestingId =
    typeof requestingUserId === 'string'
      ? new mongoose.Types.ObjectId(requestingUserId)
      : requestingUserId;

  if (!bookingTutorId.equals(requestingId)) {
    throw createBookingError('This booking does not belong to you', 403);
  }
}

/**
 * Validate that the booking belongs to the learner
 * @param bookingLearnerId - The learner ID from the booking document
 * @param requestingUserId - The ID of the user making the request
 */
export function validateBookingBelongsToLearner(
  bookingLearnerId: Types.ObjectId,
  requestingUserId: string | Types.ObjectId,
): void {
  const requestingId =
    typeof requestingUserId === 'string'
      ? new mongoose.Types.ObjectId(requestingUserId)
      : requestingUserId;

  if (!bookingLearnerId.equals(requestingId)) {
    throw createBookingError('This booking does not belong to you', 403);
  }
}

/**
 * Accept a pending booking request (tutor action)
 * @param bookingId - The booking ID
 * @param tutorId - The tutor's user ID
 * @throws AppError if booking not found or doesn't belong to tutor
 * @returns The updated booking with confirmation code generated
 */
export async function acceptBooking(
  bookingId: Types.ObjectId,
  tutorId: string | Types.ObjectId,
): Promise<BookingResponse> {
  await expirePastUnpaidBookings();

  // Find booking
  const booking = await bookingRepository.findBookingById(bookingId);

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  // Verify booking belongs to tutor
  validateBookingBelongsToTutor(booking.tutorId, tutorId);

  // Check if booking is in PENDING status
  if (booking.bookingStatus !== 'pending') {
    throw createBookingError(
      `Cannot accept booking with status: ${booking.bookingStatus}`,
      409,
    );
  }

  // Check if booking is expired
  if (booking.startAt <= new Date()) {
    throw createBookingError(
      'Cannot accept a booking that has already passed',
      400,
    );
  }

  const plainCode = generateConfirmationCode();

  const updatedBooking = await bookingRepository.acceptPendingBooking(
    bookingId,
    encryptConfirmationCode(plainCode),
  );

  if (!updatedBooking) {
    throw createBookingError(
      'Cannot accept booking. The booking status may have changed.',
      409,
    );
  }

  return formatBookingForResponse(updatedBooking, 'tutor');
}

/**
 * Reject a pending booking request (tutor action)
 * @param bookingId - The booking ID
 * @param tutorId - The tutor's user ID
 * @throws AppError if booking not found or doesn't belong to tutor
 * @returns The updated booking
 */
export async function rejectBooking(
  bookingId: Types.ObjectId,
  tutorId: string | Types.ObjectId,
): Promise<BookingResponse> {
  await expirePastUnpaidBookings();

  // Find booking
  const booking = await bookingRepository.findBookingById(bookingId);

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  // Verify booking belongs to tutor
  validateBookingBelongsToTutor(booking.tutorId, tutorId);

  // Check if booking is in PENDING status
  if (booking.bookingStatus !== 'pending') {
    throw createBookingError(
      `Cannot reject booking with status: ${booking.bookingStatus}`,
      409,
    );
  }

  const updatedBooking =
    await bookingRepository.rejectPendingBooking(bookingId);

  if (!updatedBooking) {
    throw createBookingError(
      'Cannot reject booking. The booking status may have changed.',
      409,
    );
  }

  return formatBookingForResponse(updatedBooking, 'tutor');
}

/**
 * Cancel a confirmed booking (learner or tutor action)
 * @param bookingId - The booking ID
 * @param userId - The authenticated user ID
 * @param userRole - The authenticated user role
 * @param cancelReason - Optional cancellation reason
 * @throws AppError if booking not found, user unauthorized, or invalid status
 * @returns The updated booking
 */
export async function cancelBooking(
  bookingId: Types.ObjectId,
  userId: string | Types.ObjectId,
  userRoles: string[],
  cancelReason?: string,
): Promise<BookingResponse> {
  const booking = await bookingRepository.findBookingById(bookingId);

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  const userContext = { roles: userRoles };
  const canCancelAsLearner =
    hasRole(userContext, UserRole.LEARNER) &&
    booking.learnerId.equals(
      typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId,
    );
  const canCancelAsTutor =
    hasRole(userContext, UserRole.TUTOR) &&
    booking.tutorId.equals(
      typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId,
    );

  if (!canCancelAsLearner && !canCancelAsTutor) {
    throw createBookingError(
      'This booking does not belong to you',
      403,
    );
  }

  const cancelRole: 'learner' | 'tutor' = canCancelAsLearner
    ? 'learner'
    : 'tutor';

  if (cancelRole === 'learner') {
    validateBookingBelongsToLearner(booking.learnerId, userId);
  } else {
    validateBookingBelongsToTutor(booking.tutorId, userId);
  }

  if (booking.bookingStatus !== 'confirmed') {
    throw createBookingError(
      `Only confirmed bookings can be canceled. Current status: ${booking.bookingStatus}`,
      409,
    );
  }
  if (new Date() >= booking.startAt) {
    throw createBookingError(
      'Cannot cancel a booking that has already started',
      400,
    );
  }

  const updatedBooking = await bookingRepository.cancelConfirmedBooking(
    bookingId,
    {
      canceledAt: new Date(),
      canceledBy: cancelRole,
      cancelReason,
    },
  );

  if (!updatedBooking) {
    throw createBookingError(
      'Only confirmed bookings can be canceled. The booking status may have changed.',
      409,
    );
  }

  return formatBookingForResponse(updatedBooking, cancelRole);
}

/**
 * Confirm a booking with the learner-provided code (tutor action)
 * @param bookingId - The booking ID
 * @param tutorId - The tutor's user ID
 * @param plainCode - The confirmation code provided by the learner
 * @throws AppError if booking not found, doesn't belong to tutor, or code doesn't match
 * @returns The updated booking with COMPLETED status
 */
export async function confirmBookingCode(
  bookingId: Types.ObjectId,
  tutorId: string | Types.ObjectId,
  plainCode: string,
): Promise<BookingResponse> {
  const booking = await bookingRepository.findBookingById(bookingId);

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  // Verify booking belongs to tutor
  validateBookingBelongsToTutor(booking.tutorId, tutorId);

  // Check if booking is in CONFIRMED status
  if (booking.bookingStatus !== 'confirmed') {
    throw createBookingError(
      `Booking must be in confirmed status to verify code. Current status: ${booking.bookingStatus}`,
      409,
    );
  }

  if (booking.paymentStatus !== PaymentStatus.PAID) {
    throw createBookingError(
      `Booking must be paid before verifying the session code. Current payment status: ${booking.paymentStatus}`,
      409,
    );
  }

  const now = new Date();
  if (now < booking.startAt || now > booking.endAt) {
    throw createBookingError(
      'Session code can only be verified during the scheduled session time',
      409,
    );
  }

  // Check if confirmation code exists
  if (!booking.confirmationCode) {
    throw createBookingError(
      'No confirmation code found for this booking',
      400,
    );
  }

  // Compare provided code with stored encrypted code
  const isCodeValid = isConfirmationCodeMatch(
    plainCode,
    booking.confirmationCode,
  );

  if (!isCodeValid) {
    throw createBookingError('Invalid confirmation code', 401);
  }

  const completedAt = new Date();
  const updatedBooking = await bookingRepository.completeConfirmedBooking(
    bookingId,
    completedAt,
  );

  if (!updatedBooking) {
    throw createBookingError(
      'Booking must be in confirmed status to verify code. The booking status may have changed.',
      409,
    );
  }

  await promoteBookingEarningToAvailable(
    bookingId,
    updatedBooking.completedAt ?? completedAt,
  );

  return formatBookingForResponse(updatedBooking, 'tutor');
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
  bookings: BookingResponse[];
  total: number;
  page: number;
  totalPages: number;
}> {
  await expirePastUnpaidBookings();

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
    bookings: formatBookingsForResponse(bookings, 'learner'),
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
  bookings: BookingResponse[];
  total: number;
  page: number;
  totalPages: number;
}> {
  await expirePastUnpaidBookings();

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

  return {
    bookings: formatBookingsForResponse(bookings, 'tutor'),
    total,
    page,
    totalPages,
  };
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
  bookings: BookingResponse[];
  total: number;
  page: number;
  totalPages: number;
}> {
  await expirePastUnpaidBookings();

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

  return {
    bookings: formatBookingsForResponse(bookings, 'admin'),
    total,
    page,
    totalPages,
  };
}

/**
 * Get a booking by ID with authorization check
 * For tutors, the confirmationCode field is excluded from the response
 * @param bookingId - The booking ID

 * @param userRoles - The authenticated user's roles
 * @returns The booking if the user is authorized
 * @throws NotFoundError if booking does not exist
 * @throws UnauthorizedError if user is not authorized to view the booking
 */
export async function getBookingByIdWithAuth(
  bookingId: Types.ObjectId,
  userId: Types.ObjectId | string,
  userRoles: string[],
): Promise<BookingResponse> {
  await expirePastUnpaidBookings();

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
  const userContext = { roles: userRoles };
  const isAdmin = hasRole(userContext, UserRole.ADMIN);

  if (!isLearner && !isTutor && !isAdmin) {
    throw new AppError(
      'You do not have permission to view this booking',
      403,
      'FORBIDDEN',
    );
  }

  const viewerRole: ViewerRole = isLearner
    ? 'learner'
    : isTutor
      ? 'tutor'
      : 'admin';

  return formatBookingForResponse(booking, viewerRole);
}
