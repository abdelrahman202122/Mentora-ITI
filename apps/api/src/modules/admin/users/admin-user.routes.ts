import { Router } from 'express';
import * as AdminUserController from './admin-user.controller.js';
import { authMiddleware } from '../../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../../middleware/role.moddleware.js';
import { UserRole } from '../../users/user.interface.js';
import { validate } from '../../../middleware/validation.middleware.js';
import { changeUserStatusSchema } from './admin-user.validation.js';
import {
  createAdminUserSchema,
  updateAdminUserSchema
} from './admin-user.validation.js';

const router = Router();

/* Every route in this file requires:
   1. A valid access token (authMiddleware)
   2. The user to be an ADMIN (roleMiddleware) */
router.use(authMiddleware);
router.use(roleMiddleware(UserRole.ADMIN));

/* ───────── Route definitions ───────── */

/* IMPORTANT: /export must come BEFORE /:id, otherwise Express
   will treat "export" as a user ID */

router.get('/:id/audit-logs', AdminUserController.getUserAuditLogs);
router.get('/', AdminUserController.listUsers);
router.get('/export', AdminUserController.exportUsers);
router.get('/:id', AdminUserController.getUserDetail);

router.post(
  '/',
  validate(createAdminUserSchema),
  AdminUserController.createUser,
);




router.patch(
  '/:id/status',
  validate(changeUserStatusSchema),
  AdminUserController.changeUserStatus,
);


router.patch(
  '/:id',
  validate(updateAdminUserSchema),
  AdminUserController.updateUser,
);

export default router;