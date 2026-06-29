import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.moddleware.js';
import { UserRole } from '../users/user.interface.js';
import tutorRoutes from './tutor/admin-tutor.routes.js';
import userRoutes from './users/admin-user.routes.js';

const router = Router();

router.use(authMiddleware, roleMiddleware(UserRole.ADMIN));

router.use('/users', userRoutes);
router.use('/tutors', tutorRoutes);

export default router;
