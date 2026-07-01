import type { Types } from 'mongoose';
import { createHmac, timingSafeEqual } from 'node:crypto';
import * as paymentRepository from './payment.repository.js';
import * as earningRepository from './earning.repository.js';
import * as bookingRepository from '../bookings/booking.repository.js';
import {
  BookingStatus,
  PaymentStatus as BookingPaymentStatus,
} from '../bookings/booking.types.js';
import {
  PaymentStatus,
  type IPayment,
  type PaginatedPaymentsResponse,
  type PaymentResponseDTO,
} from './payment.types.js';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  AppError,
} from '../../common/errors/AppError.js';
import { paymobConfig } from '../../config/paymob.config.js';
import { DEFAULT_CURRENCY } from './payment.model.js';
import { DEFAULT_COMMISSION_RATE } from '../bookings/booking.model.js';
import { logger } from '../../config/logger.js';
import mongoose from 'mongoose';
import { UserModel } from '../users/user.model.js';

/**
 * Payment service handles business logic for payment and Paymob checkout workflows.
 */

// ---------------------------------------------------------------------------
// Paymob Intention API helpers
// ---------------------------------------------------------------------------

interface PaymobIntentionResponse {
  client_secret: string;
  id: string;
}

interface PaymobBillingData {
  first_name: string;
  last_name: string;
  phone_number: string;
}

/**
 * Call the Paymob Intention API to create a payment intention.
 * Uses the Secret Key for server-to-server authentication.
 * Returns the client_secret used to build the hosted checkout URL.
 *
 * @param amountCents - Amount in the smallest currency unit (cents/piastres)
 * @param currency    - ISO currency code (e.g. 'EGP')
 * @param internalOrderId - Our internal reference (payment._id as string)
 */
async function createPaymobIntention(
  amountCents: number,
  currency: string,
  internalOrderId: string,
  billingData: PaymobBillingData,
): Promise<PaymobIntentionResponse> {
  const url = `${paymobConfig.baseUrl}/v1/intention/`;

  const body = {
    amount: amountCents,
    currency,
    payment_methods: [paymobConfig.integrationId],
    items: [],
    billing_data: billingData,
    special_reference: internalOrderId,
    notification_url: paymobConfig.notificationUrl,
    redirection_url: buildPaymobRedirectUrl(internalOrderId),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${paymobConfig.secretKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new AppError(
      'Paymob Intention API is unreachable',
      502,
      'PAYMENT_GATEWAY_ERROR',
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new AppError(
      `Paymob Intention API error (${response.status}): ${errorText}`,
      502,
      'PAYMENT_GATEWAY_ERROR',
    );
  }

  return response.json() as Promise<PaymobIntentionResponse>;
}

/**
 * Build the Paymob Unified Checkout (hosted) URL from a client_secret.
 */
function buildCheckoutUrl(clientSecret: string): string {
  return `${paymobConfig.baseUrl}/unifiedcheckout/?publicKey=${paymobConfig.publicKey}&clientSecret=${clientSecret}`;
}

function buildPaymobRedirectUrl(paymentId: string): string {
  if (!paymobConfig.redirectUrl) return '';

  const redirectUrl = new URL(paymobConfig.redirectUrl);
  redirectUrl.searchParams.set('paymentId', paymentId);
  return redirectUrl.toString();
}

async function getLearnerBillingData(
  learnerId: Types.ObjectId,
): Promise<PaymobBillingData> {
  const learner = await UserModel.findById(learnerId)
    .select('name phoneNumber')
    .lean();

  if (!learner) {
    throw new NotFoundError('Learner not found');
  }

  if (!learner.phoneNumber) {
    throw new AppError(
      'Phone number is required before starting checkout',
      400,
      'PAYMENT_BILLING_DATA_REQUIRED',
    );
  }

  const [firstName, ...restName] = learner.name.trim().split(/\s+/);

  return {
    first_name: firstName || 'Mentora',
    last_name: restName.join(' ') || firstName || 'Learner',
    phone_number: learner.phoneNumber,
  };
}

// ---------------------------------------------------------------------------
// Paymob webhook helpers
// ---------------------------------------------------------------------------

type JsonRecord = Record<string, unknown>;

interface PaymobWebhookData {
  providerTransactionId: string;
  providerOrderId: string;
  success: boolean;
  amountCents: number;
  failureReason?: string;
  internalPaymentId?: Types.ObjectId;
  rawProviderResponse: JsonRecord;
}

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

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeWebhookPayload(payload: unknown): JsonRecord {
  if (Buffer.isBuffer(payload)) {
    try {
      const parsed = JSON.parse(payload.toString('utf8')) as unknown;
      if (isRecord(parsed)) {
        return parsed;
      }
    } catch {
      throw new AppError(
        'Invalid Paymob webhook JSON payload',
        400,
        'INVALID_WEBHOOK_PAYLOAD',
      );
    }
  }

  if (!isRecord(payload)) {
    throw new AppError(
      'Invalid Paymob webhook payload',
      400,
      'INVALID_WEBHOOK_PAYLOAD',
    );
  }

  return payload;
}

function getWebhookObject(payload: JsonRecord): JsonRecord {
  return isRecord(payload.obj) ? payload.obj : payload;
}

function getPathValue(record: JsonRecord, path: string): unknown {
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

function buildPaymobHmacSource(webhookObject: JsonRecord): string {
  return PAYMOB_HMAC_FIELDS.map((field) =>
    stringifyHmacValue(getPathValue(webhookObject, field)),
  ).join('');
}

function verifyPaymobHmac(
  webhookObject: JsonRecord,
  hmacSignature: string,
): void {
  if (!hmacSignature) {
    throw new ForbiddenError('Missing Paymob HMAC signature');
  }

  const expectedSignature = createHmac('sha512', paymobConfig.hmacSecret)
    .update(buildPaymobHmacSource(webhookObject))
    .digest('hex');

  const provided = Buffer.from(hmacSignature.toLowerCase(), 'hex');
  const expected = Buffer.from(expectedSignature, 'hex');

  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    throw new ForbiddenError('Invalid Paymob HMAC signature');
  }
}

function parseBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return null;
}

function parsePositiveNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }

  return null;
}

function parseString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim() !== '') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

function parseObjectId(value: unknown): Types.ObjectId | undefined {
  const stringValue = parseString(value);
  if (!stringValue || !mongoose.Types.ObjectId.isValid(stringValue)) {
    return undefined;
  }
  return new mongoose.Types.ObjectId(stringValue);
}

function extractFailureReason(webhookObject: JsonRecord): string | undefined {
  const directReason =
    parseString(webhookObject['data.message']) ??
    parseString(webhookObject.message) ??
    parseString(webhookObject.error) ??
    parseString(webhookObject.failure_reason);

  if (directReason) return directReason;

  if (isRecord(webhookObject.data)) {
    return parseString(webhookObject.data.message) ?? undefined;
  }

  return undefined;
}

function parsePaymobWebhookData(payload: JsonRecord): PaymobWebhookData {
  const webhookObject = getWebhookObject(payload);
  const providerTransactionId =
    parseString(webhookObject.transaction_id) ?? parseString(webhookObject.id);
  const providerOrderId =
    parseString(webhookObject.order_id) ??
    parseString(webhookObject.order) ??
    parseString(getPathValue(webhookObject, 'order.id'));
  const success = parseBoolean(webhookObject.success);
  const amountCents = parsePositiveNumber(webhookObject.amount_cents);

  if (
    !providerTransactionId ||
    !providerOrderId ||
    success === null ||
    amountCents === null
  ) {
    throw new AppError(
      'Missing required Paymob webhook fields',
      400,
      'INVALID_WEBHOOK_PAYLOAD',
    );
  }

  return {
    providerTransactionId,
    providerOrderId,
    success,
    amountCents,
    failureReason: extractFailureReason(webhookObject),
    internalPaymentId:
      parseObjectId(webhookObject.special_reference) ??
      parseObjectId(webhookObject.merchant_order_id) ??
      parseObjectId(getPathValue(webhookObject, 'order.merchant_order_id')),
    rawProviderResponse: payload,
  };
}

function getCommissionRate(): number {
  const rawRate = process.env.MENTORA_COMMISSION_RATE?.trim();
  if (rawRate) {
    const configuredRate = Number(rawRate);
    if (
      Number.isFinite(configuredRate) &&
      configuredRate >= 0 &&
      configuredRate <= 1
    ) {
      return configuredRate;
    }
  }
  return DEFAULT_COMMISSION_RATE;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatPaymentForResponse(payment: IPayment): PaymentResponseDTO {
  const paymentObj = payment.toObject();

  return {
    _id: paymentObj._id,
    bookingId: paymentObj.bookingId,
    amount: paymentObj.amount,
    currency: paymentObj.currency,
    status: paymentObj.status,
    paidAt: paymentObj.paidAt ?? null,
    failedAt: paymentObj.failedAt ?? null,
    refundedAt: paymentObj.refundedAt ?? null,
    failureReason: paymentObj.failureReason ?? null,
    createdAt: paymentObj.createdAt,
    updatedAt: paymentObj.updatedAt,
  };
}

function sanitizeProviderResponse(payload: JsonRecord): JsonRecord {
  const sanitized = JSON.parse(JSON.stringify(payload)) as JsonRecord;
  const webhookObject = getWebhookObject(sanitized);
  if (isRecord(webhookObject.source_data)) {
    delete webhookObject.source_data.pan;
  }
  return sanitized;
}

async function reconcileSuccessfulPaymentSideEffects(
  payment: IPayment,
): Promise<void> {
  const booking = await bookingRepository.findBookingById(payment.bookingId);
  if (!booking) {
    logger.warn(
      `Payment ${payment._id} succeeded but booking ${payment.bookingId} was not found`,
    );
    return;
  }

  await bookingRepository.updateBooking(payment.bookingId, {
    paymentStatus: BookingPaymentStatus.PAID,
  });

  const existingEarning = await earningRepository.findEarningByBookingId(
    payment.bookingId,
  );
  if (existingEarning) {
    return;
  }

  const commissionRate = getCommissionRate();
  const grossAmount = payment.amount;
  const commissionAmount = roundMoney(grossAmount * commissionRate);
  const tutorAmount = roundMoney(grossAmount - commissionAmount);

  await earningRepository.createEarning({
    bookingId: payment.bookingId,
    paymentId: payment._id as Types.ObjectId,
    tutorId: payment.tutorId,
    grossAmount,
    commissionRate,
    commissionAmount,
    tutorAmount,
    currency: payment.currency,
  });
}

// ---------------------------------------------------------------------------
// Exported service functions
// ---------------------------------------------------------------------------

/**
 * POST /api/payments/checkout
 * Initiate a Paymob checkout session for a confirmed, unpaid booking.
 *
 * Steps:
 * 1. Fetch the booking by bookingId and verify it exists.
 * 2. Verify the requesting learner owns the booking.
 * 3. Verify booking.bookingStatus === 'confirmed'.
 * 4. Verify booking.paymentStatus === 'unpaid' or 'failed' (recoverable states).
 * 5. Ensure no existing successful payment already exists for this booking.
 * 6. Derive the payment amount server-side from booking.price (never trust client-provided amount).
 * 7. Create a local payment record via paymentRepository.createPayment with status 'pending'.
 * 8. Call Paymob Intention API to register a payment order.
 * 9. Build the hosted-checkout URL from the returned client_secret.
 * 10. Save Paymob providerOrderId (intention id) and providerCheckoutUrl on the local payment record.
 * 11. Update booking.paymentId with the new payment document ID.
 * 12. Return only frontend-safe checkout data: { paymentId, checkoutUrl } to the controller.
 */
export async function initiateCheckout(
  bookingId: Types.ObjectId,
  learnerId: Types.ObjectId,
): Promise<{ paymentId: string; checkoutUrl: string }> {
  // Step 1: Fetch the booking
  const booking = await bookingRepository.findBookingById(bookingId);
  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  // Step 2: Verify learner ownership
  if (!booking.learnerId.equals(learnerId)) {
    throw new ForbiddenError(
      'You do not have permission to pay for this booking',
    );
  }

  // Step 3: Verify booking is confirmed
  if (booking.bookingStatus !== BookingStatus.CONFIRMED) {
    throw new ConflictError(
      `Only confirmed bookings can be paid. Current booking status: ${booking.bookingStatus}`,
    );
  }

  // Step 4: Verify payment status is unpaid or failed (recoverable)
  const recoverableStatuses: BookingPaymentStatus[] = [
    BookingPaymentStatus.UNPAID,
    BookingPaymentStatus.FAILED,
  ];
  if (
    !recoverableStatuses.includes(booking.paymentStatus as BookingPaymentStatus)
  ) {
    throw new ConflictError(
      `Cannot initiate checkout. Current payment status: ${booking.paymentStatus}`,
    );
  }

  // Step 5: Ensure no existing payment (in any status) exists for this booking.
  // Rejecting all statuses — not just SUCCESS — prevents a race condition where two
  // concurrent requests both pass this check and both create a pending payment record.
  const existingPayment =
    await paymentRepository.findPaymentByBookingId(bookingId);
  if (existingPayment) {
    if (existingPayment.status === PaymentStatus.SUCCESS) {
      throw new ConflictError(
        'This booking has already been paid successfully',
      );
    }
    if (existingPayment.status !== PaymentStatus.FAILED) {
      throw new ConflictError(
        `A payment for this booking is already in progress (status: ${existingPayment.status}). ` +
          'Please wait for it to complete or contact support.',
      );
    }
  }

  // Step 6: Derive amount server-side from booking (never trust client)
  const amount = booking.price; // decimal (e.g. 250.00)
  const currency = (booking.currency ?? DEFAULT_CURRENCY) as
    | 'EGP'
    | 'USD'
    | 'EUR';
  const amountCents = Math.round(amount * 100); // Paymob expects smallest unit
  const billingData = await getLearnerBillingData(learnerId);

  let payment: IPayment | null = null;

  try {
    // Step 7: Create a local payment record, or reuse the failed attempt.
    // Payment.bookingId is unique, so failed retries must reset the existing
    // row instead of inserting a second document for the same booking.
    payment =
      existingPayment?.status === PaymentStatus.FAILED
        ? await paymentRepository.updatePaymentById(
            existingPayment._id as Types.ObjectId,
            {
              status: PaymentStatus.PENDING,
              providerTransactionId: null,
              providerOrderId: null,
              providerCheckoutUrl: null,
              paidAt: null,
              failedAt: null,
              failureReason: null,
              rawProviderResponse: null,
            },
          )
        : await paymentRepository.createPayment({
            bookingId,
            learnerId,
            tutorId: booking.tutorId,
            amount,
            currency,
            provider: 'paymob',
          });

    if (!payment) {
      throw new AppError('Failed to prepare payment', 500, 'PAYMENT_ERROR');
    }

    // Step 8: Call Paymob Intention API
    const intention = await createPaymobIntention(
      amountCents,
      currency,
      (payment._id as Types.ObjectId).toString(),
      billingData,
    );

    // Step 9: Build the hosted checkout URL
    const checkoutUrl = buildCheckoutUrl(intention.client_secret);

    // Step 10: Persist the Paymob intention id and checkout URL on the payment record
    await paymentRepository.updatePaymentById(payment._id as Types.ObjectId, {
      providerOrderId: intention.id,
      providerCheckoutUrl: checkoutUrl,
    });

    // Step 11: Link the payment ID to the booking
    await bookingRepository.updateBooking(bookingId, {
      paymentId: payment._id as Types.ObjectId,
    });
    // Step 12: Return only frontend-safe data
    return {
      paymentId: (payment._id as Types.ObjectId).toString(),
      checkoutUrl,
    };
  } catch (error) {
    if (payment) {
      await paymentRepository.updatePaymentById(payment._id as Types.ObjectId, {
        status: PaymentStatus.FAILED,
        failedAt: new Date(),
        failureReason:
          error instanceof Error ? error.message : 'Failed to create payment',
      });
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Failed to create payment', 500, 'PAYMENT_ERROR');
  }
}

/**
 * GET /api/payments/:paymentId
 * Retrieve a payment by ID with role-based access control.
 *
 * Steps to implement:
 * 1. Fetch the payment via paymentRepository.findPaymentById(paymentId).
 * 2. Throw NotFoundError if the payment does not exist.
 * 3. If the requesting user is a learner, verify payment.learnerId matches userId.
 * 4. If the requesting user is a tutor, verify payment.tutorId matches userId.
 * 5. Strip rawProviderResponse before returning to non-admin users.
 * 6. Return the sanitized payment document.
 */
export async function getPaymentById(
  paymentId: Types.ObjectId,
  userId: string,
  role: string,
): Promise<PaymentResponseDTO> {
  // Step 1: Fetch the payment
  const payment = await paymentRepository.findPaymentById(paymentId);

  // Step 2: Throw NotFoundError if the payment does not exist.
  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  // Step 3: If the requesting user is a learner, verify payment.learnerId matches userId.
  if (role === 'learner') {
    if (payment.learnerId.toString() !== userId) {
      throw new ForbiddenError(
        'You do not have permission to view this payment',
      );
    }
  }
  // Step 4: If the requesting user is a tutor, verify payment.tutorId matches userId.
  else if (role === 'tutor') {
    if (payment.tutorId.toString() !== userId) {
      throw new ForbiddenError(
        'You do not have permission to view this payment',
      );
    }
  }
  // If the user has a role other than learner or tutor, deny access.
  else {
    throw new ForbiddenError('You do not have permission to view this payment');
  }

  // Step 5: Return only the learner-safe payment fields.
  return formatPaymentForResponse(payment);
}

/**
 * GET /api/payments/me
 * Return paginated payments for the authenticated learner.
 *
 * Steps:
 * 1. Convert userId string to Types.ObjectId.
 * 2. Parse pagination values and optional status filter.
 * 3. Fetch learner payments from the repository.
 * 4. Count matching payments for pagination metadata.
 * 5. Return a safe payment summary list with pagination.
 */
export async function listMyPayments(
  learnerId: Types.ObjectId,
  page: number,
  limit: number,
  status?: string,
): Promise<PaginatedPaymentsResponse> {
  const learnerObjectId = new mongoose.Types.ObjectId(learnerId.toString());
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    paymentRepository.findPaymentsByLearnerId(
      learnerObjectId,
      skip,
      limit,
      status,
    ),
    paymentRepository.countPaymentsByLearnerId(learnerObjectId, status),
  ]);

  return {
    payments: payments.map(formatPaymentForResponse),
    pagination: {
      page,
      limit,
      total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
    },
  };
}

/**
 * POST /api/payments/webhook
 * Handle Paymob payment callback / webhook and update payment and booking state.
 *
 * Steps to implement:
 * 1. Verify the HMAC signature from Paymob using PAYMOB_HMAC_SECRET to reject forged requests.
 * 2. Parse and validate the webhook payload fields (transaction_id, order_id, success, amount_cents, etc.).
 * 3. Locate the local payment record via paymentRepository.findPaymentByProviderOrderId(providerOrderId).
 * 4. If the payment record is not found, log a warning and return 200 to acknowledge the webhook.
 * 5. If payment.status is already 'success', treat this as a duplicate and reconcile side effects.
 * 6. If Paymob reports success === true:
 *    a. Atomically update payment: status → 'success', paidAt → now, providerTransactionId, rawProviderResponse.
 *    b. Update the linked booking: paymentStatus → 'paid'.
 *    c. Generate a unique confirmation code and set booking.confirmationCode.
 *    d. Create an Earning record for the tutor (grossAmount, commissionRate from env, commissionAmount, tutorAmount).
 * 7. If Paymob reports success === false:
 *    a. Update payment: status → 'failed', failedAt → now, failureReason, rawProviderResponse.
 *    b. Update the linked booking: paymentStatus → 'failed'.
 * 8. Return 200 to acknowledge the webhook regardless of outcome.
 */
export async function handlePaymobWebhook(
  payload: Record<string, unknown>,
  hmacSignature: string,
): Promise<void> {
  const normalizedPayload = normalizeWebhookPayload(payload);
  const webhookObject = getWebhookObject(normalizedPayload);

  // Step 1: Verify callback authenticity before trusting any fields.
  verifyPaymobHmac(webhookObject, hmacSignature);

  // Step 2: Parse the normalized Paymob transaction callback.
  const webhookData = parsePaymobWebhookData(normalizedPayload);

  // Step 3: Locate the local payment record using Paymob's order reference.
  const payment =
    (await paymentRepository.findPaymentByProviderOrderId(
      webhookData.providerOrderId,
    )) ??
    (webhookData.internalPaymentId
      ? await paymentRepository.findPaymentById(webhookData.internalPaymentId)
      : null);

  // Step 4: Unknown payments are acknowledged to prevent endless provider retries.
  if (!payment) {
    logger.warn(
      `Paymob webhook acknowledged for unknown order ${webhookData.providerOrderId}`,
    );
    return;
  }

  // Step 5: Successful callbacks are idempotent.
  if (payment.status === PaymentStatus.SUCCESS) {
    logger.info(
      `Duplicate Paymob webhook acknowledged for payment ${payment._id}`,
    );
    await reconcileSuccessfulPaymentSideEffects(payment);
    return;
  }

  const expectedAmountCents = Math.round(payment.amount * 100);
  if (webhookData.amountCents !== expectedAmountCents) {
    logger.warn(
      `Paymob webhook amount mismatch for payment ${payment._id}: expected ${expectedAmountCents}, received ${webhookData.amountCents}`,
    );
    return;
  }

  const now = new Date();

  if (webhookData.success) {
    // Step 6a: Atomically move the payment into success so duplicate callbacks
    // cannot create duplicate booking/earning side effects.
    const updatedPayment = await paymentRepository.updatePaymentAtomically(
      {
        _id: payment._id,
        status: { $ne: PaymentStatus.SUCCESS },
      },
      {
        status: PaymentStatus.SUCCESS,
        paidAt: now,
        failedAt: null,
        failureReason: null,
        providerTransactionId: webhookData.providerTransactionId,
        rawProviderResponse: sanitizeProviderResponse(
          webhookData.rawProviderResponse,
        ),
      },
    );

    if (!updatedPayment) {
      logger.info(
        `Duplicate Paymob success webhook acknowledged for payment ${payment._id}`,
      );
      await reconcileSuccessfulPaymentSideEffects(payment);
      return;
    }

    // Steps 6b-6d: Reconcile idempotent booking and earning side effects.
    await reconcileSuccessfulPaymentSideEffects(updatedPayment);

    return;
  }

  // Step 7: Failed payments keep the booking recoverable.
  const updatedPayment = await paymentRepository.updatePaymentAtomically(
    {
      _id: payment._id,
      status: { $ne: PaymentStatus.SUCCESS },
    },
    {
      status: PaymentStatus.FAILED,
      failedAt: now,
      failureReason:
        webhookData.failureReason ?? 'Paymob reported payment failure',
      providerTransactionId: webhookData.providerTransactionId,
      rawProviderResponse: webhookData.rawProviderResponse,
    },
  );
  if (!updatedPayment) {
    logger.info(
      `Paymob failure webhook ignored because payment ${payment._id} is already successful`,
    );
    return;
  }
  await bookingRepository.updateBooking(payment.bookingId, {
    paymentStatus: BookingPaymentStatus.FAILED,
  });
}
