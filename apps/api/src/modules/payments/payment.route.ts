import { Router } from 'express';
import { validate } from '../../middleware/validation.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { authRateLimit } from '../../middleware/rateLimit.middleware.js';
import { roleMiddleware } from '../../middleware/role.moddleware.js';
import { UserRole } from '../users/user.interface.js';
import {
    createCheckoutSchema,
    listPaymentsSchema,
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
 * GET /api/payments/me
 * List the authenticated learner's payments.
 * Query: listPaymentsSchema { page, limit, status }
 * Auth: learner only
 */
router.get(
    '/me',
    authMiddleware,
    authRateLimit,
    validate({ query: listPaymentsSchema }),
    roleMiddleware(UserRole.LEARNER),
    paymentController.listMyPayments,
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



export default router;
