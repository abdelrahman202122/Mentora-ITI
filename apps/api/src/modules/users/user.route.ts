import { Router } from 'express';
import * as UserController from './user.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { authRateLimit } from '../../middleware/rateLimit.middleware.js';
import { uploadAvatarMiddleware } from '../../middleware/upload.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
  updateUserByAdminSchema,
} from './user.validation.js';
import { roleMiddleware } from '../../middleware/role.moddleware.js';
import { UserRole } from './user.interface.js';

const router = Router();

router.post(
  '/register',
  authRateLimit,
  validate(registerSchema),
  UserController.register,
);

router.post(
  '/login',
  authRateLimit,
  validate(loginSchema),
  UserController.login,
);

router.post('/logout', authMiddleware, UserController.logout);

router.post('/refresh-token', authRateLimit, UserController.refreshToken);

router.get('/me', authMiddleware, UserController.getMe);

router.post(
  '/me/avatar',
  authMiddleware,
  uploadAvatarMiddleware,
  UserController.uploadAvatar,
);

router.delete('/me/avatar', authMiddleware, UserController.deleteAvatar);

// for public user data (name + avatar)
router.get('/:id/public', authMiddleware, UserController.getUserProfileById);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  UserController.getUserById,
);

router.get(
  '/',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  UserController.getUsers,
);

router.patch(
  '/change-password',
  authMiddleware,
  validate(changePasswordSchema), // ← added
  UserController.changePassword,
);

router.patch(
  '/profile',
  authMiddleware,
  validate(updateProfileSchema), // ← added
  UserController.updateProfile,
);

router.patch(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validate(updateUserByAdminSchema),
  UserController.updateUserById,
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  UserController.deleteUserById,
);

export default router;
