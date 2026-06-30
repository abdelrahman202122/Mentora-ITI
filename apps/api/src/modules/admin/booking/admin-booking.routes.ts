import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../../middleware/role.moddleware.js';
import { UserRole } from '../../users/user.interface.js';
import * as adminBookingController from './admin-booking.controller.js';

const router = Router();

router.use(authMiddleware, roleMiddleware(UserRole.ADMIN));

router.get('/', adminBookingController.listBookings);

export default router;
