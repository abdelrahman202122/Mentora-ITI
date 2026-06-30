import { Router } from 'express';
import {
  authMiddleware,
  optionalAuthMiddleware,
} from '../../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../../middleware/role.moddleware.js';
import { validate } from '../../../middleware/validation.middleware.js';
import {
  createProfileController,
  getProfileController,
  updateOwnProfileController,
} from './tutor-profile.controller.js';
import {
  createTutorProfileSchema,
  getProfileParamsSchema,
  updateTutorProfileSchema,
} from '../../../validators/tutor-profile.js';

const router = Router();

router
  .route('/me/profile')
  .post(
    authMiddleware,
    validate(createTutorProfileSchema),
    createProfileController,
  )
  .patch(
    authMiddleware,
    roleMiddleware('tutor'),
    validate(updateTutorProfileSchema),
    updateOwnProfileController,
  );

router
  .route('/:tutorId/profile')
  .get(
    optionalAuthMiddleware,
    validate({ params: getProfileParamsSchema }),
    getProfileController,
  );

export default router;
