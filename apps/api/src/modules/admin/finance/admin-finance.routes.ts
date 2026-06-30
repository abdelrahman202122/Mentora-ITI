import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../../middleware/role.moddleware.js';
import { validate } from '../../../middleware/validation.middleware.js';
import { UserRole } from '../../users/user.interface.js';
import * as adminFinanceController from './admin-finance.controller.js';
import {
  adminEarningIdParamsSchema,
  adminWithdrawalListQuerySchema,
} from './admin-finance.validation.js';

const router = Router();

router.use(authMiddleware, roleMiddleware(UserRole.ADMIN));

router.get('/stats', adminFinanceController.getFinanceStats);
router.get(
  '/withdrawals',
  validate({ query: adminWithdrawalListQuerySchema }),
  adminFinanceController.listWithdrawals,
);
router.post('/withdrawals/approveAll', adminFinanceController.approveAllWithdrawals);
router.post(
  '/withdrawals/:earningId/approve',
  validate({ params: adminEarningIdParamsSchema }),
  adminFinanceController.approveWithdrawal,
);
router.post(
  '/withdrawals/:earningId/cancel',
  validate({ params: adminEarningIdParamsSchema }),
  adminFinanceController.cancelWithdrawal,
);

export default router;
