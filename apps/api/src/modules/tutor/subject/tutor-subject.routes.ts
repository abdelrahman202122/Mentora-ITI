import { Router } from 'express';
import {
  authMiddleware,
  optionalAuthMiddleware,
} from '../../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../../middleware/role.moddleware.js';
import { validate } from '../../../middleware/validation.middleware.js';
import {
  createTutorSubjectController,
  deleteTutorSubjectController,
  getTutorSubjectController,
  getTutorSubjectsController,
  updateTutorSubjectController,
} from './tutor-subject.controller.js';
import {
  editTutorSubjectSchema,
  getTutorSubjectParamsSchema,
  getTutorSubjectsParamsSchema,
  tutorSubjectBaseSchema,
} from '../../../validators/tutor-subject.js';

const router = Router();

router
  .route('/me/subjects')
  .post(
    authMiddleware,
    roleMiddleware('tutor'),
    validate(tutorSubjectBaseSchema),
    createTutorSubjectController,
  );

router
  .route('/me/subjects/:subjectId')
  .put(
    authMiddleware,
    roleMiddleware('tutor'),
    validate({
      body: tutorSubjectBaseSchema,
      params: editTutorSubjectSchema,
    }),
    updateTutorSubjectController,
  )
  .delete(
    authMiddleware,
    roleMiddleware('tutor'),
    validate({ params: editTutorSubjectSchema }),
    deleteTutorSubjectController,
  );

router
  .route('/:tutorId/subjects')
  .get(
    optionalAuthMiddleware,
    validate({ params: getTutorSubjectsParamsSchema }),
    getTutorSubjectsController,
  );

router
  .route('/:tutorId/subjects/:subjectId')
  .get(
    optionalAuthMiddleware,
    validate({ params: getTutorSubjectParamsSchema }),
    getTutorSubjectController,
  );

export default router;
