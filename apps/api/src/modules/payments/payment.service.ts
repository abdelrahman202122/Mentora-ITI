import type { Types } from 'mongoose';
import * as paymentRepository from './payment.repository.js';
import * as bookingRepository from '../bookings/booking.repository.js';
import { BookingStatus, PaymentStatus as BookingPaymentStatus } from '../bookings/booking.types.js';
import { PaymentStatus } from './payment.types.js';
import { NotFoundError, ForbiddenError, ConflictError, AppError } from '../../common/errors/AppError.js';
import { paymobConfig } from '../../config/paymob.config.js';
import { DEFAULT_CURRENCY } from './payment.model.js';

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
): Promise<PaymobIntentionResponse> {
  const url = `${paymobConfig.baseUrl}/v1/intention/`;

  const body = {
    amount: amountCents,
    currency,
    payment_methods: [paymobConfig.integrationId],
    items: [],
    billing_data: {},
    special_reference: internalOrderId,
    notification_url: '',   // Configured in the Paymob dashboard
    redirection_url: '',    // Configured in the Paymob dashboard
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
    throw new ForbiddenError('You do not have permission to pay for this booking');
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
  if (!recoverableStatuses.includes(booking.paymentStatus as BookingPaymentStatus)) {
    throw new ConflictError(
      `Cannot initiate checkout. Current payment status: ${booking.paymentStatus}`,
    );
  }

  // Step 5: Ensure no existing successful payment exists for this booking
  const existingPayment = await paymentRepository.findPaymentByBookingId(bookingId);
  if (existingPayment && existingPayment.status === PaymentStatus.SUCCESS) {
    throw new ConflictError('This booking has already been paid successfully');
  }

  // Step 6: Derive amount server-side from booking (never trust client)
  const amount = booking.price;                              // decimal (e.g. 250.00)
  const currency = (booking.currency ?? DEFAULT_CURRENCY) as 'EGP' | 'USD' | 'EUR';
  const amountCents = Math.round(amount * 100);              // Paymob expects smallest unit

  // Step 7: Create a local payment record with status 'pending'
  const payment = await paymentRepository.createPayment({
    bookingId,
    learnerId,
    tutorId: booking.tutorId,
    amount,
    currency,
    provider: 'paymob',
  });

  // Step 8: Call Paymob Intention API
  const intention = await createPaymobIntention(
    amountCents,
    currency,
    (payment._id as Types.ObjectId).toString(),
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
): Promise<unknown> {
  // TODO: implement
  void paymentRepository;
  void paymentId;
  void userId;
  void role;
  throw new Error('getPaymentById: not yet implemented');
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
 * 5. If payment.status is already 'success', treat this as a duplicate and return 200 (idempotent).
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
  // TODO: implement
  void paymentRepository;
  void payload;
  void hmacSignature;
  throw new Error('handlePaymobWebhook: not yet implemented');
}
