import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.moddleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import {
  chatIdParamsSchema,
  createChatSchema,
  listChatsSchema,
  listMessagesSchema,
} from '../../validators/chat.js';
import { UserRole } from '../users/user.interface.js';
import * as chatController from './chat.controller.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  roleMiddleware(UserRole.LEARNER),
  validate({ body: createChatSchema }),
  chatController.createChat,
);

router.get(
  '/',
  roleMiddleware(UserRole.LEARNER, UserRole.TUTOR),
  validate({ query: listChatsSchema }),
  chatController.listChats,
);

router.get(
  '/:chatId/messages',
  roleMiddleware(UserRole.LEARNER, UserRole.TUTOR),
  validate({ params: chatIdParamsSchema, query: listMessagesSchema }),
  chatController.listMessages,
);

router.patch(
  '/:chatId/archive',
  roleMiddleware(UserRole.LEARNER, UserRole.TUTOR),
  validate({ params: chatIdParamsSchema }),
  chatController.archiveChat,
);

export default router;
