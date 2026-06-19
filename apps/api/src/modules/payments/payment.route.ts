import { Router } from 'express';
import { validate } from '../../middleware/validation.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { authRateLimit } from '../../middleware/rateLimit.middleware.js';
import { roleMiddleware } from '../../middleware/role.moddleware.js';
import { UserRole } from '../users/user.interface.js';
import {
  createCheckoutSchema,
  paymentIdSchema,
} from '../../validators/payment.js';
import * as paymentController from './payment.controller.js';

const router = Router();

/**
 * POST /api/payments/checkout
 * Learner initiates a Paymob checkout for a confirmed, unpaid booking.
 * Body: createCheckoutSchema { bookingId }
 * Auth: learner only
 */
router.post(
  '/checkout',
  authMiddleware,
  authRateLimit,
  validate({ body: createCheckoutSchema }),
  roleMiddleware(UserRole.LEARNER),
  paymentController.initiateCheckout,
);

/**
 * GET /api/payments/:paymentId
 * Retrieve a single payment by ID.
 * Params: paymentIdSchema { paymentId }
 * Auth: learner or tutor (ownership check done in service)
 */
router.get(
  '/:paymentId',
  authMiddleware,
  authRateLimit,
  validate({ params: paymentIdSchema }),
  roleMiddleware(UserRole.LEARNER, UserRole.TUTOR),
  paymentController.getPaymentById,
);

/**
 * POST /api/payments/webhook
 * Public endpoint for Paymob payment callbacks/webhooks.
 * No cookie auth - authenticity is verified via HMAC inside the service.
 * Note: This route must be mounted BEFORE any body-parsing middleware that
 * would consume the raw body needed for HMAC verification.
 */
router.post('/webhook', paymentController.handleWebhook);

export default router;
