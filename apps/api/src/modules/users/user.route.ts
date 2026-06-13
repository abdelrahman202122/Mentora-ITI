

import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { authRateLimit } from '../../middleware/rateLimit.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { loginSchema, registerSchema } from './user.validation.js';

const router = Router();

router.post(
  '/register',
  validate(registerSchema),
  authRateLimit,
  UserController.register
);

router.post(
  '/login',
  validate(loginSchema),
  authRateLimit,
  UserController.login
);

router.post(
  '/logout',
  authMiddleware,
  UserController.logout
);



router.post(
  '/refresh-token',
  authRateLimit,
  UserController.refreshToken
);
export default router;
