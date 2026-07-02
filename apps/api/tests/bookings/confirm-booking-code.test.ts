import mongoose from 'mongoose';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { encryptConfirmationCode } from '../../src/modules/bookings/confirmation-code.util.js';
import { BookingStatus, PaymentStatus } from '../../src/modules/bookings/booking.types.js';
import { EarningStatus } from '../../src/modules/payments/earning.types.js';

vi.mock('../../src/modules/bookings/booking.repository.js', () => ({
  findBookingById: vi.fn(),
  completeConfirmedBooking: vi.fn(),
}));

vi.mock('../../src/modules/payments/earning.repository.js', () => ({
  updateEarningAtomically: vi.fn(),
}));

const bookingRepository = await import(
  '../../src/modules/bookings/booking.repository.js'
);
const earningRepository = await import(
  '../../src/modules/payments/earning.repository.js'
);
const { confirmBookingCode } = await import(
  '../../src/modules/bookings/booking.service.js'
);

describe('confirmBookingCode', () => {
  const bookingId = new mongoose.Types.ObjectId();
  const tutorId = new mongoose.Types.ObjectId();
  const plainCode = 'AB12CD34';
  const now = new Date('2026-07-01T12:00:00.000Z');
  const completedAt = now;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    vi.mocked(bookingRepository.findBookingById).mockReset();
    vi.mocked(bookingRepository.completeConfirmedBooking).mockReset();
    vi.mocked(earningRepository.updateEarningAtomically).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('marks the booking completed and promotes the related earning to available', async () => {
    vi.mocked(bookingRepository.findBookingById).mockResolvedValue({
      _id: bookingId,
      tutorId,
      bookingStatus: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      startAt: new Date('2026-07-01T11:00:00.000Z'),
      endAt: new Date('2026-07-01T13:00:00.000Z'),
      confirmationCode: encryptConfirmationCode(plainCode),
    } as Awaited<ReturnType<typeof bookingRepository.findBookingById>>);
    vi.mocked(bookingRepository.completeConfirmedBooking).mockResolvedValue({
      _id: bookingId,
      tutorId,
      bookingStatus: BookingStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
      startAt: new Date('2026-07-01T11:00:00.000Z'),
      endAt: new Date('2026-07-01T13:00:00.000Z'),
      completedAt,
      confirmationCodeUsedAt: completedAt,
    } as Awaited<ReturnType<typeof bookingRepository.completeConfirmedBooking>>);
    vi.mocked(earningRepository.updateEarningAtomically).mockResolvedValue(
      {} as Awaited<ReturnType<typeof earningRepository.updateEarningAtomically>>,
    );

    await confirmBookingCode(bookingId, tutorId, plainCode);

    expect(bookingRepository.completeConfirmedBooking).toHaveBeenCalledWith(
      bookingId,
      expect.any(Date),
    );
    expect(earningRepository.updateEarningAtomically).toHaveBeenCalledWith(
      {
        bookingId,
        status: EarningStatus.PENDING,
      },
      {
        status: EarningStatus.AVAILABLE,
        availableAt: completedAt,
      },
    );
  });
});
