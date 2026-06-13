import type { Types } from 'mongoose';
import { AppError } from '../../utils/app-error.js';
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

/**
 * Validate that the user is a learner
 */
export function validateLearnerRole(user: UserContext): void {
  if (user.role !== 'learner') {
    throw new AppError('Only learners can create bookings', 403);
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
    throw new AppError('You cannot book yourself as a tutor', 400);
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
    throw new AppError(
      'A booking already exists for this tutor at this time slot',
      409,
    );
  }
}

/**
 * Check if tutor is available at the requested time
 * PLACEHOLDER: This method will be implemented when tutorAvailability collection is ready
 * @param tutorId - The tutor's user ID
 * @param startAt - Booking start time
 * @param endAt - Booking end time
 */
export async function checkTutorAvailability(
  _tutorId: Types.ObjectId,
  _startAt: Date,
  _endAt: Date,
): Promise<void> {
  // TODO: Implement tutor availability check when BE2 provides the tutorAvailability collection
  // Expected logic:
  // 1. Fetch tutor availability from tutorAvailability collection
  // 2. Get day of week from startAt and endAt
  // 3. Check if the requested slot fits within the tutor's weekly slots
  // 4. Throw AppError if not available

  // Placeholder: assume available for now
  return;
}

/**
 * Get tutor ID from tutor profile
 * PLACEHOLDER: This method will be called when BE2 provides the TutorProfile model
 * @param tutorProfileId - The tutor profile ID
 */
export async function getTutorIdFromProfile(
  tutorProfileId: Types.ObjectId,
): Promise<Types.ObjectId> {
  // TODO: Implement this when BE2 provides TutorProfile model
  // Expected logic:
  // 1. Fetch TutorProfile by ID
  // 2. Return the tutorId/userId field

  // Placeholder: return the tutorProfileId as tutorId for now
  // This will need to be updated when TutorProfile model is available
  return tutorProfileId;
}

/**
 * Get server-side subject pricing.
 */
export async function getSubjectPricing(
  subjectId: Types.ObjectId,
): Promise<{ price: number; currency?: string }> {
  const pricing = await bookingRepository.findSubjectPricing(subjectId);

  if (!pricing) {
    throw new AppError('Subject pricing is not available', 404);
  }

  if (pricing.price <= 0) {
    throw new AppError('Subject price must be greater than 0', 500);
  }

  return pricing;
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

  // Get price from trusted subject data
  const { price, currency } = await getSubjectPricing(subjectId);

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
