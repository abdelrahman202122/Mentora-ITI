import type { Request, Response } from 'express';

import { sendSuccess } from '../../utils/api-response.js';
import {
  addAssistantMessage,
  addUserMessage,
  getAIConversationMessages,
  startAIConversation,
} from './ai-conversation.service.js';
import {
  generateAIReply,
  type AIProviderMessage,
} from './ai-provider.service.js';
import { runAIChat } from './ai.service.js';
import { recommendTutors } from './tutor-recommendation.service.js';

type ConversationMessage = {
  role: string;
  content: string;
};

function toProviderRole(role: string): AIProviderMessage['role'] {
  return role === 'assistant' || role === 'system' ? role : 'user';
}

function toProviderMessages(
  messages: ConversationMessage[],
): AIProviderMessage[] {
  return messages.map((message) => ({
    role: toProviderRole(message.role),
    content: message.content,
  }));
}

function getParam(value: string | string[] | undefined, name: string) {
  if (typeof value !== 'string') {
    throw new Error(`${name} parameter is required`);
  }

  return value;
}

export async function startAIConversationController(
  req: Request,
  res: Response,
) {
  const learnerId = req.user?.userId;

  if (!learnerId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  const conversation = await startAIConversation({
    learnerId,
    locale: req.body.locale,
    goal: req.body.goal,
    extractedPreferences: req.body.extractedPreferences,
  });

  return sendSuccess(
    res,
    201,
    'AI conversation started successfully',
    conversation,
  );
}

export async function sendAIConversationMessageController(
  req: Request,
  res: Response,
) {
  const learnerId = req.user?.userId;

  if (!learnerId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  const conversationId = getParam(req.params.conversationId, 'conversationId');
  const userMessage = await addUserMessage({
    conversationId,
    learnerId,
    content: req.body.content,
    metadata: req.body.metadata,
  });
  const messages = await getAIConversationMessages({
    conversationId,
    learnerId,
    limit: 20,
  });
  const reply = await generateAIReply({
    conversationId,
    learnerId,
    messages: toProviderMessages(messages),
  });
  const assistantMessage = await addAssistantMessage({
    conversationId,
    learnerId,
    content: reply.content,
    metadata: {
      provider: reply.provider,
      model: reply.model,
    },
  });

  return sendSuccess(res, 201, 'AI message sent successfully', {
    userMessage,
    assistantMessage,
  });
}

export async function recommendTutorsController(req: Request, res: Response) {
  const learnerId = req.user?.userId;

  if (!learnerId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  const result = await recommendTutors(learnerId, req.body);

  return sendSuccess(
    res,
    200,
    'Tutor recommendations fetched successfully',
    result,
  );
}

export async function aiChatController(req: Request, res: Response) {
  const learnerId = req.user?.userId;

  if (!learnerId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  const result = await runAIChat(learnerId, req.body);

  return sendSuccess(
    res,
    200,
    'AI response generated successfully.',
    result,
  );
}
