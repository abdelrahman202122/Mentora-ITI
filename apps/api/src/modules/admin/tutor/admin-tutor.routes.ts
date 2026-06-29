import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../../middleware/role.moddleware.js';
import { UserRole } from '../../users/user.interface.js';
import * as adminController from './admin-tutor.controller.js';
import { validate } from '../../../middleware/validation.middleware.js';
import {
  adminUpdateTutorProfileSchema,
  getProfileParamsSchema,
} from '../../../validators/tutor-profile.js';
import { adminTutorSearchParamsSchema } from '../../../validators/tutor-search.js';

const router = Router();

router.use(authMiddleware, roleMiddleware(UserRole.ADMIN));

// Admin dashboard stats
router.route('/stats').get(adminController.getTutorStats);

// Approve a tutor profile
router
  .route('/:tutorId/approve')
  .post(
    validate({ params: getProfileParamsSchema }),
    adminController.approveTutor,
  );

// Reject a tutor profile
router
  .route('/:tutorId/reject')
  .post(
    validate({ params: getProfileParamsSchema }),
    adminController.rejectTutor,
  );

// Patch (update) tutor profile
router
  .route('/:tutorId')
  .patch(
    validate({ params: getProfileParamsSchema }),
    validate(adminUpdateTutorProfileSchema),
    adminController.patchTutor,
  );

// Admin tutor search
router.get(
  '/',
  validate({ query: adminTutorSearchParamsSchema }),
  adminController.getTutors,
);

export default router;
