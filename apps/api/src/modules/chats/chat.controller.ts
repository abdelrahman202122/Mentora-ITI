import type { NextFunction, Request, Response } from 'express';

import { UnauthorizedError } from '../../common/errors/AppError.js';
import { sendSuccess } from '../../utils/api-response.js';
import type {
  CreateChatInput,
  ListChatsQuery,
  ListMessagesQuery,
} from '../../validators/chat.js';
import * as chatService from './chat.service.js';

function getAuthenticatedUserId(req: Request) {
  if (!req.user?.userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  return req.user.userId;
}

export async function createChat(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const learnerId = getAuthenticatedUserId(req);
    const { tutorId } = req.body as CreateChatInput;
    const chat = await chatService.createOrGetChat(learnerId, tutorId);

    return sendSuccess(res, 200, 'Chat ready', chat);
  } catch (error) {
    next(error);
  }
}

export async function listChats(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getAuthenticatedUserId(req);
    const result = await chatService.listChats(
      userId,
      req.query as unknown as ListChatsQuery,
    );

    return sendSuccess(res, 200, 'Chats retrieved successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function listMessages(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getAuthenticatedUserId(req);
    const { chatId } = req.params as { chatId: string };
    const result = await chatService.listMessages(
      chatId,
      userId,
      req.query as unknown as ListMessagesQuery,
    );

    return sendSuccess(res, 200, 'Messages retrieved successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function archiveChat(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getAuthenticatedUserId(req);
    const { chatId } = req.params as { chatId: string };
    const chat = await chatService.archiveChat(chatId, userId);

    return sendSuccess(res, 200, 'Chat archived successfully', chat);
  } catch (error) {
    next(error);
  }
}
