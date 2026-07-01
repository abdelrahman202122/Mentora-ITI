import { createHmac } from 'node:crypto';
import mongoose from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IPayment } from '../../src/modules/payments/payment.types.js';
import { PaymentStatus } from '../../src/modules/payments/payment.types.js';
import { PaymentStatus as BookingPaymentStatus } from '../../src/modules/bookings/booking.types.js';

vi.mock('../../src/config/paymob.config.js', () => ({
  paymobConfig: {
    baseUrl: 'https://paymob.test',
    hmacSecret: 'test_hmac_secret',
    integrationId: '123456',
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

vi.mock('../../src/modules/payments/payment.repository.js', () => ({
  createPayment: vi.fn(),
  findPaymentByBookingId: vi.fn(),
  findPaymentById: vi.fn(),
  findPaymentByProviderOrderId: vi.fn(),
  updatePaymentById: vi.fn(),
  updatePaymentAtomically: vi.fn(),
}));

vi.mock('../../src/modules/bookings/booking.repository.js', () => ({
  findBookingById: vi.fn(),
  updateBooking: vi.fn(),
}));

vi.mock('../../src/modules/payments/earning.repository.js', () => ({
  createEarning: vi.fn(),
  findEarningByBookingId: vi.fn(),
}));

vi.mock('../../src/modules/users/user.model.js', () => ({
  UserModel: {
    findById: vi.fn(),
  },
}));

const paymentRepository = await import(
  '../../src/modules/payments/payment.repository.js'
);
const bookingRepository = await import(
  '../../src/modules/bookings/booking.repository.js'
);
const earningRepository = await import(
  '../../src/modules/payments/earning.repository.js'
);
const { handlePaymobWebhook, initiateCheckout } = await import(
  '../../src/modules/payments/payment.service.js'
);
const { UserModel } = await import('../../src/modules/users/user.model.js');

const PAYMOB_HMAC_FIELDS = [
  'amount_cents',
  'created_at',
  'currency',
  'error_occured',
  'has_parent_transaction',
  'id',
  'integration_id',
  'is_3d_secure',
  'is_auth',
  'is_capture',
  'is_refunded',
  'is_standalone_payment',
  'is_voided',
  'order.id',
  'owner',
  'pending',
  'source_data.pan',
  'source_data.sub_type',
  'source_data.type',
  'success',
] as const;

type WebhookRecord = Record<string, unknown>;

function isRecord(value: unknown): value is WebhookRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getPathValue(record: WebhookRecord, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (!isRecord(current)) return undefined;
    return current[key];
  }, record);
}

function stringifyHmacValue(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

function signPaymobWebhook(webhookObject: WebhookRecord): string {
  const source = PAYMOB_HMAC_FIELDS.map((field) =>
    stringifyHmacValue(getPathValue(webhookObject, field)),
  ).join('');

  return createHmac('sha512', 'test_hmac_secret').update(source).digest('hex');
}

describe('Paymob webhook handling', () => {
  const bookingId = new mongoose.Types.ObjectId();
  const learnerId = new mongoose.Types.ObjectId();
  const paymentId = new mongoose.Types.ObjectId();
  const tutorId = new mongoose.Types.ObjectId();

  function buildSuccessfulWebhookObject(): WebhookRecord {
    return {
      amount_cents: 25000,
      created_at: '2026-06-30T00:00:00.000Z',
      currency: 'EGP',
      error_occured: false,
      has_parent_transaction: false,
      id: 'txn_123',
      integration_id: 123456,
      is_3d_secure: false,
      is_auth: false,
      is_capture: false,
      is_refunded: false,
      is_standalone_payment: true,
      is_voided: false,
      order: {
        id: 'paymob_order_123',
        merchant_order_id: paymentId.toString(),
      },
      owner: 123,
      pending: false,
      source_data: {
        pan: '4242',
        sub_type: 'MasterCard',
        type: 'card',
      },
      success: true,
    };
  }

  beforeEach(() => {
    process.env.MENTORA_COMMISSION_RATE = '0.2';
    vi.restoreAllMocks();
    vi.mocked(paymentRepository.findPaymentById).mockResolvedValue(null);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          client_secret: 'client_secret_test',
          id: 'paymob_order_retry',
        }),
        ok: true,
      }),
    );
  });

  it('marks the payment successful, marks the booking paid, and creates tutor earning', async () => {
    const payment = {
      _id: paymentId,
      amount: 250,
      bookingId,
      currency: 'EGP',
      learnerId,
      provider: 'paymob',
      providerOrderId: 'paymob_order_123',
      status: PaymentStatus.PENDING,
      tutorId,
    } as IPayment;
    const updatedPayment = {
      ...payment,
      status: PaymentStatus.SUCCESS,
    } as IPayment;
    const webhookObject = buildSuccessfulWebhookObject();

    vi.mocked(paymentRepository.findPaymentByProviderOrderId).mockResolvedValue(
      payment,
    );
    vi.mocked(paymentRepository.updatePaymentAtomically).mockResolvedValue(
      updatedPayment,
    );
    vi.mocked(bookingRepository.findBookingById).mockResolvedValue({
      _id: bookingId,
    } as Awaited<ReturnType<typeof bookingRepository.findBookingById>>);
    vi.mocked(bookingRepository.updateBooking).mockResolvedValue(null);
    vi.mocked(earningRepository.findEarningByBookingId).mockResolvedValue(null);
    vi.mocked(earningRepository.createEarning).mockResolvedValue(
      {} as Awaited<ReturnType<typeof earningRepository.createEarning>>,
    );

    await handlePaymobWebhook(
      { obj: webhookObject },
      signPaymobWebhook(webhookObject),
    );

    expect(paymentRepository.findPaymentByProviderOrderId).toHaveBeenCalledWith(
      'paymob_order_123',
    );
    expect(paymentRepository.updatePaymentAtomically).toHaveBeenCalledWith(
      {
        _id: paymentId,
        status: { $ne: PaymentStatus.SUCCESS },
      },
      expect.objectContaining({
        failedAt: null,
        failureReason: null,
        providerTransactionId: 'txn_123',
        status: PaymentStatus.SUCCESS,
      }),
    );
    expect(bookingRepository.updateBooking).toHaveBeenCalledWith(bookingId, {
      paymentStatus: BookingPaymentStatus.PAID,
    });
    expect(earningRepository.createEarning).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId,
        commissionAmount: 50,
        commissionRate: 0.2,
        currency: 'EGP',
        grossAmount: 250,
        paymentId,
        tutorAmount: 200,
        tutorId,
      }),
    );
  });

  it('rejects forged callbacks before changing payment or booking state', async () => {
    const webhookObject = buildSuccessfulWebhookObject();

    await expect(
      handlePaymobWebhook({ obj: webhookObject }, 'bad-signature'),
    ).rejects.toThrow('Invalid Paymob HMAC signature');

    expect(paymentRepository.updatePaymentAtomically).not.toHaveBeenCalled();
    expect(bookingRepository.updateBooking).not.toHaveBeenCalled();
    expect(earningRepository.createEarning).not.toHaveBeenCalled();
  });

  it('reuses a failed payment record when retrying checkout for the same booking', async () => {
    const failedPayment = {
      _id: paymentId,
      amount: 250,
      bookingId,
      currency: 'EGP',
      learnerId,
      provider: 'paymob',
      providerOrderId: 'old_order',
      status: PaymentStatus.FAILED,
      tutorId,
    } as IPayment;
    const resetPayment = {
      ...failedPayment,
      providerOrderId: null,
      status: PaymentStatus.PENDING,
    } as IPayment;

    vi.mocked(bookingRepository.findBookingById).mockResolvedValue({
      _id: bookingId,
      bookingStatus: 'confirmed',
      currency: 'EGP',
      learnerId,
      paymentStatus: BookingPaymentStatus.FAILED,
      price: 250,
      tutorId,
    } as Awaited<ReturnType<typeof bookingRepository.findBookingById>>);
    vi.mocked(paymentRepository.findPaymentByBookingId).mockResolvedValue(
      failedPayment,
    );
    vi.mocked(paymentRepository.updatePaymentById)
      .mockResolvedValueOnce(resetPayment)
      .mockResolvedValueOnce({
        ...resetPayment,
        providerCheckoutUrl:
          'https://paymob.test/unifiedcheckout/?publicKey=public_test_key&clientSecret=client_secret_test',
        providerOrderId: 'paymob_order_retry',
      } as IPayment);
    vi.mocked(bookingRepository.updateBooking).mockResolvedValue(null);
    vi.mocked(UserModel.findById).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue({
        name: 'Learner One',
        phoneNumber: '01012345678',
      }),
    } as never);

    const result = await initiateCheckout(bookingId, learnerId);

    expect(paymentRepository.createPayment).not.toHaveBeenCalled();
    expect(paymentRepository.updatePaymentById).toHaveBeenNthCalledWith(
      1,
      paymentId,
      expect.objectContaining({
        failedAt: null,
        providerOrderId: null,
        status: PaymentStatus.PENDING,
      }),
    );
    expect(result).toEqual({
      checkoutUrl:
        'https://paymob.test/unifiedcheckout/?publicKey=public_test_key&clientSecret=client_secret_test',
      paymentId: paymentId.toString(),
    });

    const fetchMock = vi.mocked(fetch);
    const [, request] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(request?.body));
    expect(body.billing_data).toEqual({
      first_name: 'Learner',
      last_name: 'One',
      phone_number: '01012345678',
    });
    expect(body.redirection_url).toBe(
      `https://web.test/en/payment/success?paymentId=${paymentId.toString()}`,
    );
    expect(body.special_reference).toBe(paymentId.toString());
  });
});
