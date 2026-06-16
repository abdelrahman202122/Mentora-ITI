import { Router } from 'express';

const router = Router();

// TODO: POST  tutors/api/tutors/me/subjects
router.route('/me/subjects');

// TODO: PUT, DELETE  tutors/me/subjects/:subjectId
router.route('/me/subjects/:subjectId');

// TODO: GET tutors/:tutorId/subjects
router.route('/:tutorId/subjects');

export default router;
