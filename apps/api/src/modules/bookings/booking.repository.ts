import mongoose, { type Types } from 'mongoose';
import Booking from './booking.model.js';
import { TutorAvailabilityModel } from '../tutor/availability/tutor-availability.model.js';
import { TutorProfileModel } from '../tutor/profile/tutor-profile.model.js';
import { NotFoundError } from '../../common/errors/AppError.js';
import type {
  IBooking,
  CreateBookingInput,
  UpdateBookingInput,
} from './booking.types.js';

const { connection } = mongoose;

/**
 * Booking repository handles all database operations for bookings
 */

/**
 * Check if a booking already exists for the same tutor within the requested time slot
 */
export async function findBookingsByTutorAndTime(
  tutorId: Types.ObjectId,
  startAt: Date,
  endAt: Date,
): Promise<IBooking[]> {
  return Booking.find({
    tutorId,
    startAt: { $lt: endAt },
    endAt: { $gt: startAt },
    bookingStatus: { $nin: ['canceled', 'rejected', 'expired'] },
  }).exec();
}

/**
 * Create a new booking
 */
export async function createBooking(
  data: CreateBookingInput,
): Promise<IBooking> {
  const booking = new Booking(data);
  return booking.save();
}

type SubjectPricingDocument = {
  price?: unknown;
  currency?: unknown;
};

/**
 * Fetch subject pricing from the Subject collection.
 *
 * This can be replaced with the BE2 Subject model once it exists in the API.
 */
export async function findSubjectPricing(
  subjectId: Types.ObjectId,
): Promise<{ price: number; currency?: string } | null> {
  const subject = await connection
    .collection<SubjectPricingDocument>('subjects')
    .findOne({ _id: subjectId }, { projection: { price: 1, currency: 1 } });

  if (!subject || typeof subject.price !== 'number') {
    return null;
  }

  return {
    price: subject.price,
    currency:
      typeof subject.currency === 'string' ? subject.currency : undefined,
  };
}

/**
 * Find a booking by ID
 */
export async function findBookingById(
  bookingId: Types.ObjectId,
): Promise<IBooking | null> {
  return Booking.findById(bookingId).exec();
}

/**
 * Find bookings by learner ID with pagination and optional filters
 */
export async function findBookingsByLearner(
  learnerId: Types.ObjectId,
  skip: number,
  limit: number,
  filters?: Record<string, unknown>,
): Promise<IBooking[]> {
  const query = { learnerId, ...filters };
  return Booking.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ startAt: -1 })
    .exec();
}

/**
 * Count bookings by learner ID with optional filters
 */
export async function countLearnerBookingsWithFilters(
  learnerId: Types.ObjectId,
  filters?: Record<string, unknown>,
): Promise<number> {
  const query = { learnerId, ...filters };
  return Booking.countDocuments(query);
}

/**
 * Find tutor availability by tutor ID
 */
export async function findTutorAvailability(tutorId: Types.ObjectId) {
  return TutorAvailabilityModel.findOne({ tutorId }).lean();
}

/**
 * Find bookings by tutor ID with pagination and optional filters
 */
export async function findBookingsByTutor(
  tutorId: Types.ObjectId,
  skip: number,
  limit: number,
  filters?: Record<string, unknown>,
): Promise<IBooking[]> {
  const query = { tutorId, ...filters };
  return Booking.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ startAt: -1 })
    .exec();
}

/**
 * Count bookings by tutor ID with optional filters
 */
export async function countTutorBookingsWithFilters(
  tutorId: Types.ObjectId,
  filters?: Record<string, unknown>,
): Promise<number> {
  const query = { tutorId, ...filters };
  return Booking.countDocuments(query);
}

/**
 * Find all bookings with pagination and optional filters (admin)
 */
export async function findAllBookings(
  skip: number,
  limit: number,
  filters?: Record<string, unknown>,
): Promise<IBooking[]> {
  const query = { ...filters };
  return Booking.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ startAt: -1 })
    .exec();
}

/**
 * Count all bookings with optional filters (admin)
 */
export async function countAllBookings(
  filters?: Record<string, unknown>,
): Promise<number> {
  const query = { ...filters };
  return Booking.countDocuments(query);
}

/**
 * Update a booking
 */
export async function updateBooking(
  bookingId: Types.ObjectId,
  updates: UpdateBookingInput,
): Promise<IBooking | null> {
  return Booking.findByIdAndUpdate(bookingId, updates, { new: true }).exec();
}

/**
 * Count total bookings by learner
 */
export async function countLearnerBookings(
  learnerId: Types.ObjectId,
): Promise<number> {
  return Booking.countDocuments({ learnerId });
}

/**
 * Count total bookings by tutor
 */
export async function countTutorBookings(
  tutorId: Types.ObjectId,
): Promise<number> {
  return Booking.countDocuments({ tutorId });
}

/**
 * Get the tutor's user ID from a tutor profile ID
 * @param tutorProfileId - The tutor profile ID
 * @returns The tutor's user ID
 * @throws NotFoundError if the tutor profile doesn't exist
 */
export async function getTutorIdFromProfile(
  tutorProfileId: Types.ObjectId,
): Promise<Types.ObjectId> {
  const tutorProfile = await TutorProfileModel.findById(tutorProfileId)
    .select('userId')
    .lean();

  if (!tutorProfile) {
    throw new NotFoundError('Tutor profile not found');
  }

  return tutorProfile.userId as Types.ObjectId;
}

/**
 * Get the tutor's hourly rate from a tutor profile ID
 * @param tutorProfileId - The tutor profile ID
 * @returns The tutor's hourly rate
 * @throws NotFoundError if the tutor profile doesn't exist
 */
export async function getTutorHourlyRate(
  tutorProfileId: Types.ObjectId,
): Promise<number> {
  const tutorProfile = await TutorProfileModel.findById(tutorProfileId)
    .select('hourlyRate')
    .lean();

  if (!tutorProfile) {
    throw new NotFoundError('Tutor profile not found');
  }

  return tutorProfile.hourlyRate as number;
}
