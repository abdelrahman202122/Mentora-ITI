import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.moddleware.js';
import { UserRole } from '../users/user.interface.js';
import tutorRoutes from './tutor/admin-tutor.routes.js';

const router = Router();

router.use(authMiddleware, roleMiddleware(UserRole.ADMIN));
router.use('/tutors', tutorRoutes);

// router.use;
export default router;
