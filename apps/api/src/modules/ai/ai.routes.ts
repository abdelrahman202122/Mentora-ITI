import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import {
  aiChatSchema,
  aiConversationParamsSchema,
  sendAIConversationMessageSchema,
  startAIConversationSchema,
} from '../../validators/ai-conversation.js';
import { tutorRecommendationSchema } from '../../validators/ai-recommendation.js';
import {
  aiChatController,
  recommendTutorsController,
  sendAIConversationMessageController,
  startAIConversationController,
} from './ai.controller.js';

const router = Router();

router.post(
  '/chat',
  authMiddleware,
  validate(aiChatSchema),
  aiChatController,
);

router.post(
  '/conversations',
  authMiddleware,
  validate(startAIConversationSchema),
  startAIConversationController,
);

router.post(
  '/conversations/:conversationId/messages',
  authMiddleware,
  validate({
    params: aiConversationParamsSchema,
    body: sendAIConversationMessageSchema,
  }),
  sendAIConversationMessageController,
);

router.post(
  '/recommendations',
  authMiddleware,
  validate(tutorRecommendationSchema),
  recommendTutorsController,
);

export default router;
