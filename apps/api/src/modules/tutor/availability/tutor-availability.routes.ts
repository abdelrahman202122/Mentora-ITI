import { Router } from 'express';

const router = Router();

// TODO: POST , PUT tutors/api/tutors/me/availability
router.route('/me/availability');

// TODO: GET tutors/:tutorId/availability
router.route('/:tutorId/availability');

export default router;
