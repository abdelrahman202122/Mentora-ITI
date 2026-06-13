import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../../middleware/role.moddleware.js';
import { validate } from '../../../middleware/validation.middleware.js';
import {
  createProfileController,
  getProfileController,
  updateOwnProfileController,
} from './tutor-profile.controller.js';
import {
  createTutorProfileSchema,
  updateTutorProfileSchema,
} from '../../../validators/tutor-profile.js';

const router = Router();

router
  .route('/profile')
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

router.route('/:tutorId').get(getProfileController);

export default router;
