import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { tutorRecommendationSchema } from '../../validators/ai-recommendation.js';
import { recommendTutorsController } from './ai.controller.js';

const router = Router();

router.post(
  '/recommendations',
  authMiddleware,
  validate(tutorRecommendationSchema),
  recommendTutorsController,
);

export default router;
