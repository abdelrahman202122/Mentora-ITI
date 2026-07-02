import { z } from 'zod';

import { objectIdSchema } from './common.js';

export const startAIConversationSchema = z.object({
  locale: z.string().trim().min(2).max(20).optional(),
  goal: z.string().trim().min(1).max(300).optional(),
  extractedPreferences: z.record(z.unknown()).optional(),
});

export const aiConversationParamsSchema = z.object({
  conversationId: objectIdSchema,
});

export const sendAIConversationMessageSchema = z.object({
  content: z.string().trim().min(1).max(10000),
  metadata: z.record(z.unknown()).optional(),
});

export type SendAIConversationMessageInput = z.infer<
  typeof sendAIConversationMessageSchema
>;

export const aiChatSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  conversationId: objectIdSchema.optional(),
  locale: z.string().trim().min(2).max(20).optional(),
});

export type AIChatInput = z.infer<typeof aiChatSchema>;
