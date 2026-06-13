import { connection } from 'mongoose';
import type { Types } from 'mongoose';
import Booking from './booking.model.js';
import type {
  IBooking,
  CreateBookingInput,
  UpdateBookingInput,
} from './booking.types.js';

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
 * Find bookings by learner ID with pagination
 */
export async function findBookingsByLearner(
  learnerId: Types.ObjectId,
  skip: number,
  limit: number,
): Promise<IBooking[]> {
  return Booking.find({ learnerId })
    .skip(skip)
    .limit(limit)
    .sort({ startAt: -1 })
    .exec();
}

/**
 * Find bookings by tutor ID with pagination
 */
export async function findBookingsByTutor(
  tutorId: Types.ObjectId,
  skip: number,
  limit: number,
): Promise<IBooking[]> {
  return Booking.find({ tutorId })
    .skip(skip)
    .limit(limit)
    .sort({ startAt: -1 })
    .exec();
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
