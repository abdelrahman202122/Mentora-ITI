import { Router } from 'express';
import { authMiddleware } from '../../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../../middleware/role.moddleware.js';
import { validate } from '../../../middleware/validation.middleware.js';
import {
  createAvailabilityController,
  getAvailabilityController,
  getAvailabilitySlotsController,
  replaceAvailabilityController,
} from './tutor-availability.controller.js';
import {
  getTutorAvailabilityParamsSchema,
  getTutorAvailabilitySlotsQuerySchema,
  tutorAvailabilitySchema,
} from '../../../validators/tutor-availability.js';

const router = Router();

router
  .route('/me/availability')
  .post(
    authMiddleware,
    roleMiddleware('tutor'),
    validate(tutorAvailabilitySchema),
    createAvailabilityController,
  )
  .put(
    authMiddleware,
    roleMiddleware('tutor'),
    validate(tutorAvailabilitySchema),
    replaceAvailabilityController,
  );

router
  .route('/:tutorId/availability')
  .get(
    validate({ params: getTutorAvailabilityParamsSchema }),
    getAvailabilityController,
  );

router.route('/:tutorId/availability/slots').get(
  validate({
    params: getTutorAvailabilityParamsSchema,
    query: getTutorAvailabilitySlotsQuerySchema,
  }),
  getAvailabilitySlotsController,
);

export default router;
