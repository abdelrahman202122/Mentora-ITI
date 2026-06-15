import { Router } from 'express';
import { getAudits } from './audit.controller.js';

import { UserRole } from '../users/user.interface.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.moddleware.js';

const router = Router();

router.get(
  '/',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  getAudits
);

export default router;