import { DateTime } from 'luxon';
import {
  ConflictError,
  NotFoundError,
} from '../../../common/errors/AppError.js';
import { type CreateTutorAvailabilityInput } from '../../../validators/tutor-availability.js';
import {
  findByTutorId,
  create,
  replaceByTutorId,
} from './tutor-availability.repository.js';
import type { TimeSlot, Weekday } from './tutor-availability.model.js';
import { findConfirmedBookingsByTutorAndRange } from '../../bookings/booking.repository.js';

export const getAvailability = async (tutorId: string) => {
  const availability = await findByTutorId(tutorId);

  if (!availability) {
    throw new NotFoundError('Tutor availability not found');
  }

  return availability;
};

export const createAvailability = async (
  userId: string,
  data: CreateTutorAvailabilityInput,
) => {
  const existingAvailability = await findByTutorId(userId);

  if (existingAvailability) {
    throw new ConflictError('Tutor availability already exists');
  }

  return create({
    tutorId: userId,
    slots: data.slots,
    timezone: data.timezone,
  });
};

export const replaceAvailability = async (
  userId: string,
  data: CreateTutorAvailabilityInput,
) => {
  const existingAvailability = await findByTutorId(userId);

  if (!existingAvailability) {
    throw new NotFoundError('Tutor availability not found');
  }

  const updated = await replaceByTutorId(userId, {
    slots: data.slots,
    timezone: data.timezone,
  });

  if (!updated) {
    throw new NotFoundError('Tutor availability not found');
  }

  return updated;
};

/*
 * Returns the available time slots for a tutor over a date range
 * as UTC ISO strings.
 */
export async function getAvailabilityForDateRange(
  tutorId: string,
  startDate: string, // "YYYY-MM-DD"
  endDate: string, // "YYYY-MM-DD"
) {
  const availability = await findByTutorId(tutorId);

  if (!availability) {
    return null;
  }

  const { timezone, slots } = availability;

  // get the start and end dates in the tutor's timezone
  const start = DateTime.fromISO(startDate, { zone: timezone }).startOf('day');
  const end = DateTime.fromISO(endDate, { zone: timezone }).startOf('day');

  if (!start.isValid || !end.isValid) {
    throw new Error('Invalid date range provided');
  }

  if (end < start) {
    throw new Error('endDate must be on or after startDate');
  }

  // iterate over each day and get the utc dates for that day
  const result = [];
  let current = start; // luxon datetime object

  while (current <= end) {
    const dayKey = current.weekdayLong!.toLowerCase() as Weekday; // day of the week
    const daySlots: TimeSlot[] = slots?.[dayKey] ?? [];

    // Anchor each HH:mm slot to this specific calendar date, then convert to UTC.
    const utcSlots = daySlots.map((slot: TimeSlot) => {
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);

      // Create Luxon DateTime objects for start and end dates
      const startLocal = current.set({
        hour: startHour,
        minute: startMin,
        second: 0,
        millisecond: 0,
      });
      const endLocal = current.set({
        hour: endHour,
        minute: endMin,
        second: 0,
        millisecond: 0,
      });

      // Convert to UTC and return ISO strings
      return {
        startTime: startLocal.toUTC().toISO(),
        endTime: endLocal.toUTC().toISO(),
      };
    });

    // Add the date and its UTC slots to the result array
    result.push({
      date: current.toISODate()!,
      slots: utcSlots,
    });

    current = current.plus({ days: 1 });
  }

  return {
    tutorId,
    availability: result,
  };
}

/*
 * Returns the available time slots for a tutor over a date range
 * as UTC ISO strings, excluding any slots that overlap with
 * confirmed bookings.
 */
export const getFilteredAvailabilityForDateRange = async (
  tutorId: string,
  startDate: string,
  endDate: string,
) => {
  // get tutor availability, normalized to UTC ISO strings
  const availability = await getAvailabilityForDateRange(
    tutorId,
    startDate,
    endDate,
  );

  if (!availability) {
    return null;
  }

  // get confirmed bookings for the tutor in this date range
  const bookings = await findConfirmedBookingsByTutorAndRange(
    tutorId,
    DateTime.fromISO(startDate, { zone: 'utc' }).startOf('day').toJSDate(),
    DateTime.fromISO(endDate, { zone: 'utc' }).endOf('day').toJSDate(),
  );

  // filter out any slots that overlap with confirmed bookings
  const filteredAvailability = availability.availability.map((day) => ({
    date: day.date,
    slots: day.slots.flatMap((slot) => {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);

      // find bookings that overlap with this slot
      const overlapping = bookings.filter(
        (booking) => slotStart < booking.endAt && booking.startAt < slotEnd,
      );

      // no bookings in this slot, return the slot as is
      if (overlapping.length === 0) {
        return [{ startAt: slot.startTime, endAt: slot.endTime }];
      }

      // sort bookings by start time so we can walk through them in order
      const sorted = overlapping.sort(
        (a, b) => a.startAt.getTime() - b.startAt.getTime(),
      );

      const result = [];
      let cursor = slotStart; // cursor starts at the beginning of the slot

      for (const booking of sorted) {
        if (cursor < booking.startAt) {
          // there's a free time before this booking
          result.push({
            startAt: cursor.toISOString(),
            endAt: booking.startAt.toISOString(),
          });
        }
        // move cursor past this booking
        cursor = booking.endAt > cursor ? booking.endAt : cursor;
      }

      // any remaining time after the last booking
      if (cursor < slotEnd) {
        result.push({
          startAt: cursor.toISOString(),
          endAt: slotEnd.toISOString(),
        });
      }

      return result;
    }),
  }));

  return {
    tutorId,
    startDate,
    endDate,
    availability: filteredAvailability,
  };
};
