import { z } from 'zod';

import { chatStatuses } from '../modules/chats/chat.model.js';
import { objectIdSchema } from './common.js';

export const createChatSchema = z
  .object({
    tutorId: objectIdSchema,
  })
  .strict();

export const chatIdParamsSchema = z.object({
  chatId: objectIdSchema,
});

export const listChatsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(chatStatuses).default('active'),
});

export const listMessagesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type CreateChatInput = z.infer<typeof createChatSchema>;
export type ListChatsQuery = z.infer<typeof listChatsSchema>;
export type ListMessagesQuery = z.infer<typeof listMessagesSchema>;
