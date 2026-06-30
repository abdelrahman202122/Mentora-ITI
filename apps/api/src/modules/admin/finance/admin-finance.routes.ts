import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../../middleware/role.moddleware.js';
import { UserRole } from '../../users/user.interface.js';
import * as adminFinanceController from './admin-finance.controller.js';

const router = Router();

router.use(authMiddleware, roleMiddleware(UserRole.ADMIN));

router.get('/stats', adminFinanceController.getFinanceStats);
router.get('/withdrawals', adminFinanceController.listWithdrawals);
router.post(
  '/withdrawals/:earningId/approveAll',
  adminFinanceController.approveAllWithdrawals,
);
router.post(
  '/withdrawals/:earningId/approve',
  adminFinanceController.approveWithdrawal,
);
router.post(
  '/withdrawals/:earningId/cancel',
  adminFinanceController.cancelWithdrawal,
);

export default router;
