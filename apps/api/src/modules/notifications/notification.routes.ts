import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import {
  listNotificationsSchema,
  notificationIdParamsSchema,
} from '../../validators/notification.js';
import * as notificationController from './notification.controller.js';

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  validate({ query: listNotificationsSchema }),
  notificationController.listNotifications,
);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllNotificationsRead);
router.patch(
  '/:notificationId/read',
  validate({ params: notificationIdParamsSchema }),
  notificationController.markNotificationRead,
);

export default router;
