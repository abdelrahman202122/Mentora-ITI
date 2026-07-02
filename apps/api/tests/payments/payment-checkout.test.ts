import mongoose from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/config/paymob.config.js', () => ({
  paymobConfig: {
    baseUrl: 'https://paymob.test',
    hmacSecret: 'test_hmac_secret',
    integrationId: 123456,
    notificationUrl: 'https://api.test/api/payments/webhook',
    publicKey: 'public_test_key',
    redirectUrl: 'https://web.test/en/payment/success',
    secretKey: 'secret_test_key',
  },
}));

vi.mock('../../src/config/logger.js', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('../../src/modules/bookings/booking.repository.js', () => ({
  findBookingById: vi.fn(),
  updateBooking: vi.fn(),
}));

vi.mock('../../src/modules/payments/payment.repository.js', () => ({
  createPayment: vi.fn(),
  findPaymentByBookingId: vi.fn(),
  updatePaymentById: vi.fn(),
}));

vi.mock('../../src/modules/users/user.repository.js', () => ({
  findUserById: vi.fn(),
}));

const fakeSession = {
  startTransaction: vi.fn(),
  abortTransaction: vi.fn(),
  endSession: vi.fn(),
};

vi.spyOn(mongoose, 'startSession').mockResolvedValue(fakeSession as never);

const bookingRepository = await import(
  '../../src/modules/bookings/booking.repository.js'
);
const paymentRepository = await import(
  '../../src/modules/payments/payment.repository.js'
);
const userRepository = await import(
  '../../src/modules/users/user.repository.js'
);
const { initiateCheckout } = await import(
  '../../src/modules/payments/payment.service.js'
);

describe('Payment checkout', () => {
  const bookingId = new mongoose.Types.ObjectId();
  const learnerId = new mongoose.Types.ObjectId();
  const paymentId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    vi.mocked(bookingRepository.findBookingById).mockResolvedValue({
      _id: bookingId,
      bookingStatus: 'confirmed',
      currency: 'EGP',
      learnerId,
      paymentStatus: 'unpaid',
      price: 250,
      tutorId: new mongoose.Types.ObjectId(),
      toObject: vi.fn(),
    } as never);

    vi.mocked(paymentRepository.findPaymentByBookingId).mockResolvedValue(null);
    vi.mocked(paymentRepository.createPayment).mockResolvedValue({
      _id: paymentId,
    } as never);
    vi.mocked(paymentRepository.updatePaymentById).mockResolvedValue(null);
    vi.mocked(bookingRepository.updateBooking).mockResolvedValue(null);
    vi.mocked(userRepository.findUserById).mockResolvedValue({
      _id: learnerId,
      name: 'Sara Ahmed',
      phoneNumber: '01012345678',
    } as never);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          client_secret: 'client_secret_123',
          id: 'intention_123',
        }),
      })) as never,
    );
  });

  it('uses the learner profile for Paymob billing data', async () => {
    await initiateCheckout(bookingId, learnerId);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const fetchArgs = vi.mocked(global.fetch).mock.calls[0];
    expect(fetchArgs[0]).toBe('https://paymob.test/v1/intention/');

    const requestBody = JSON.parse(String(fetchArgs[1]?.body)) as {
      billing_data: {
        first_name: string;
        last_name: string;
        phone_number: string;
      };
    };

    expect(requestBody.billing_data).toEqual({
      first_name: 'Sara',
      last_name: 'Ahmed',
      phone_number: '01012345678',
    });
  });
});
