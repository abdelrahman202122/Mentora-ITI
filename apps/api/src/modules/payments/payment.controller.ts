import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../../utils/api-response.js';
import { UnauthorizedError } from '../../common/errors/AppError.js';
import * as paymentService from './payment.service.js';
import type {
  CreateCheckoutInput,
  PaymentIdParam,
} from '../../validators/payment.js';
import { logger } from '../../config/logger.js';

const { Types } = mongoose;

/**
 * Payment controller handles HTTP requests for payment operations.
 */

/**
 * POST /api/payments/checkout
 * Learner initiates a Paymob checkout session for their own confirmed, unpaid booking.
 */
export async function initiateCheckout(
  req: Request<object, object, CreateCheckoutInput>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Verify the authenticated user exists
    if (!req.user?.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    // Extract bookingId from req.body (validated by createCheckoutSchema)
    const { bookingId } = req.body;

    // Convert bookingId string to Types.ObjectId
    const bookingObjectId = new Types.ObjectId(bookingId);

    // Convert req.user.userId string to Types.ObjectId for learnerId
    const learnerObjectId = new Types.ObjectId(req.user.userId);

    // Call paymentService.initiateCheckout and get safe checkout data
    const { paymentId, checkoutUrl } = await paymentService.initiateCheckout(
      bookingObjectId,
      learnerObjectId,
    );

    // Return the checkout data to the client
    sendSuccess(res, 201, 'Checkout initiated successfully', { paymentId, checkoutUrl });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/payments/:paymentId
 * Retrieve a payment by ID. Accessible by the owning learner or the tutor of that booking.
 */
export async function getPaymentById(
  req: Request<PaymentIdParam>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Verify the authenticated user exists
    if (!req.user?.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    // Extract paymentId from req.params (validated by paymentIdSchema)
    const { paymentId } = req.params;

    // Convert paymentId string to Types.ObjectId
    const paymentObjectId = new Types.ObjectId(paymentId);

    // Delegate to service with role-based access control
    const payment = await paymentService.getPaymentById(
      paymentObjectId,
      req.user.userId,
      req.user.role,
    );

    sendSuccess(res, 200, 'Payment retrieved successfully', payment);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/payments/webhook
 * Receive and process Paymob payment callbacks. This route is public (no cookie auth).
 * Authenticity must be verified inside the service using HMAC.
 */
export async function handleWebhook(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Extract the HMAC signature from the query string
    const hmacSignature = typeof req.query['hmac'] === 'string' ? req.query['hmac'] : '';

    // Extract the raw webhook payload from req.body
    const payload = req.body as Record<string, unknown>;

    // Process the webhook — service handles validation and idempotency internally
    await paymentService.handlePaymobWebhook(payload, hmacSignature);

    // Always respond 200 to acknowledge the webhook regardless of processing outcome
  } catch (error) {
    logger.error('Error handling webhook', error);
  }
  sendSuccess(res, 200, 'Webhook received');
}
