

import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { authRateLimit } from '../../middleware/rateLimit.middleware.js';
// import { validate } from '../../middlewares/validate.middleware';
// import { createUserSchema } from './user.validation';

const router = Router();

router.post(
  '/register',
//   validate(createUserSchema),
  authRateLimit,
  UserController.register
);

router.post(
  '/login',
  // validate(loginSchema),
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