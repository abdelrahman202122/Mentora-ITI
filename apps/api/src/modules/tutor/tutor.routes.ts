import { Router } from 'express';
import tutorProfileRouter from './profile/tutor-profile.routes.js';

const router = Router();

router.use('/', tutorProfileRouter);

export default router;
