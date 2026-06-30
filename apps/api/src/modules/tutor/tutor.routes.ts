import { Router } from 'express';
import tutorProfileRouter from './profile/tutor-profile.routes.js';
import tutorAvailabilityRouter from './availability/tutor-availability.routes.js';
import tutorSubjectsRouter from './subject/tutor-subject.routes.js';
import {
  getTutorsController,
  getTutorStatsController,
} from './tutor.controller.js';
import { validate } from '../../middleware/validation.middleware.js';
import { tutorSearchParamsSchema } from '../../validators/tutor-search.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.moddleware.js';

const router = Router();

router.get(
  '/',
  validate({ query: tutorSearchParamsSchema }),
  getTutorsController,
);

router.get(
  '/me/stats',
  authMiddleware,
  roleMiddleware('tutor'),
  getTutorStatsController,
);

router.use('/', tutorProfileRouter);
router.use('/', tutorAvailabilityRouter);
router.use('/', tutorSubjectsRouter);

export default router;
