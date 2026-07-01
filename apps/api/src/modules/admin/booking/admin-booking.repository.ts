
import mongoose from 'mongoose';
import Booking from '../../bookings/booking.model.js';
import type { BookingResponse } from '../../bookings/booking.types.js';
import type { AdminBookingListQuery } from './admin-booking.validation.js';
import { TutorSubjectModel } from '../../tutor/subject/tutor-subject.model.js';

type AdminBookingListResult = {
  bookings: BookingResponse[];
  total: number;
  page: number;
  totalPages: number;
};

function toBookingResponse(booking: unknown): BookingResponse {
  return booking as BookingResponse;
}

export async function listBookings(
  filters: AdminBookingListQuery,
): Promise<AdminBookingListResult> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const skip = (page - 1) * limit;

  const mongoFilters: Record<string, unknown> = {};

  if (filters.bookingStatus) {
    mongoFilters.bookingStatus = filters.bookingStatus;
  }

  if (filters.paymentStatus) {
    mongoFilters.paymentStatus = filters.paymentStatus;
  }

  if (filters.learnerId) {
    mongoFilters.learnerId = new mongoose.Types.ObjectId(filters.learnerId);
  }

  if (filters.tutorId) {
    mongoFilters.tutorId = new mongoose.Types.ObjectId(filters.tutorId);
  }

  if (filters.subjectId) {
    mongoFilters.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
  }

  if (filters.startAtFrom || filters.startAtTo) {
    mongoFilters.startAt = {};

    if (filters.startAtFrom) {
      (mongoFilters.startAt as Record<string, unknown>).$gte = new Date(
        filters.startAtFrom,
      );
    }

    if (filters.startAtTo) {
      (mongoFilters.startAt as Record<string, unknown>).$lte = new Date(
        filters.startAtTo,
      );
    }
  }

  const sortBy = filters.sortBy?.trim() || 'startAt';
  const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder } as Record<string, 1 | -1>;

  /* ─── Execute queries in parallel ─────────────────────────────────── */
  const [bookings, total] = await Promise.all([
    Booking.find(mongoFilters)
      .populate({
        path: 'learnerId',
        select: 'name',
      })
      .populate({
        path: 'tutorId',
        select: 'name',
      })
      .populate({
        path: 'subjectId',
        model: TutorSubjectModel,
        select: 'title name',
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec(),
    Booking.countDocuments(mongoFilters).exec(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    bookings: bookings.map(toBookingResponse),
    total,
    page,
    totalPages,
  };
}
