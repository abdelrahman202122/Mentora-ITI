import { Router } from 'express';
import tutorProfileRouter from './profile/tutor-profile.routes.js';
import tutorAvailabilityRouter from './availability/tutor-availability.routes.js';
import tutorSubjectsRouter from './subject/tutor-subject.routes.js';
import { getTutorsController } from './tutor.controller.js';

const router = Router();

router.get('/', getTutorsController);

router.use('/', tutorProfileRouter);
router.use('/', tutorAvailabilityRouter);
router.use('/', tutorSubjectsRouter);

export default router;
