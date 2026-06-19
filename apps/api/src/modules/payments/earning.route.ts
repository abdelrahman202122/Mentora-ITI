import { Router } from 'express';
import { validate } from '../../middleware/validation.middleware.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { authRateLimit } from '../../middleware/rateLimit.middleware.js';
import { roleMiddleware } from '../../middleware/role.moddleware.js';
import { UserRole } from '../users/user.interface.js';
import { listEarningsSchema } from '../../validators/payment.js';
import * as earningController from './earning.controller.js';

const router = Router();

// All earnings routes require authentication
router.use(authMiddleware);

/**
 * GET /api/earnings/me
 * List the authenticated tutor's paginated earnings with optional status filter.
 * Query: listEarningsSchema { page, limit, status }
 * Auth: tutor only
 */
router.get(
  '/me',
  authRateLimit,
  validate({ query: listEarningsSchema }),
  roleMiddleware(UserRole.TUTOR),
  earningController.listMyEarnings,
);

/**
 * GET /api/earnings/summary
 * Return an aggregated earnings summary (pending, available, paid_out totals) for the tutor.
 * Auth: tutor only
 */
router.get(
  '/summary',
  authRateLimit,
  roleMiddleware(UserRole.TUTOR),
  earningController.getEarningsSummary,
);

export default router;
