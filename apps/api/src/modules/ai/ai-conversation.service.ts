import { Types } from 'mongoose';

import { AppError } from '../../utils/app-error.js';
import {
  AIConversationModel,
  type AIConversationMessageRole,
  type AIConversationStatus,
} from './ai-conversation.model.js';
import { AIConversationMessageModel } from './ai-conversation-message.model.js';

type Metadata = Record<string, unknown>;

type StartAIConversationInput = {
  learnerId: string | Types.ObjectId;
  locale?: string;
  goal?: string;
  extractedPreferences?: Metadata;
};

type AddAIMessageInput = {
  conversationId: string | Types.ObjectId;
  learnerId?: string | Types.ObjectId;
  content: string;
  metadata?: Metadata;
};

type GetAIConversationMessagesInput = {
  conversationId: string | Types.ObjectId;
  learnerId?: string | Types.ObjectId;
  limit?: number;
  before?: Date;
};

type UpdateAIConversationPreferencesInput = {
  conversationId: string | Types.ObjectId;
  learnerId?: string | Types.ObjectId;
  extractedPreferences: Metadata;
  recommendedTutorIds?: Array<string | Types.ObjectId>;
};

type CloseAIConversationInput = {
  conversationId: string | Types.ObjectId;
  learnerId?: string | Types.ObjectId;
  status?: Extract<AIConversationStatus, 'completed' | 'abandoned'>;
};

function toObjectId(value: string | Types.ObjectId, fieldName: string) {
  if (value instanceof Types.ObjectId) {
    return value;
  }

  if (!Types.ObjectId.isValid(value)) {
    throw new AppError(`${fieldName} must be a valid ObjectId`, 400);
  }

  return new Types.ObjectId(value);
}

function normalizeText(value: string, fieldName: string) {
  const text = value.trim();

  if (!text) {
    throw new AppError(`${fieldName} is required`, 400);
  }

  return text;
}

async function findConversation(
  conversationId: string | Types.ObjectId,
  learnerId?: string | Types.ObjectId,
) {
  const query: {
    _id: Types.ObjectId;
    learnerId?: Types.ObjectId;
  } = {
    _id: toObjectId(conversationId, 'conversationId'),
  };

  if (learnerId) {
    query.learnerId = toObjectId(learnerId, 'learnerId');
  }

  const conversation = await AIConversationModel.findOne(query);

  if (!conversation) {
    throw new AppError('AI conversation not found', 404);
  }

  return conversation;
}

async function createConversationMessage(
  input: AddAIMessageInput & { role: AIConversationMessageRole },
) {
  const conversation = await findConversation(input.conversationId, input.learnerId);

  if (conversation.status !== 'active') {
    throw new AppError('AI conversation is not active', 409);
  }

  const content = normalizeText(input.content, 'content');

  const message = await AIConversationMessageModel.create({
    conversationId: conversation._id,
    role: input.role,
    content,
    metadata: input.metadata ?? {},
  });

  conversation.lastMessage = {
    messageId: message._id,
    role: input.role,
    preview: content,
    sentAt: message.createdAt,
  };
  await conversation.save();

  return message;
}

export async function startAIConversation(input: StartAIConversationInput) {
  const conversation = await AIConversationModel.create({
    learnerId: toObjectId(input.learnerId, 'learnerId'),
    locale: input.locale?.trim() || 'en',
    goal: input.goal?.trim() || null,
    extractedPreferences: input.extractedPreferences ?? {},
  });

  return conversation;
}

export async function addUserMessage(input: AddAIMessageInput) {
  return createConversationMessage({
    ...input,
    role: 'user',
  });
}

export async function addAssistantMessage(input: AddAIMessageInput) {
  return createConversationMessage({
    ...input,
    role: 'assistant',
  });
}

export async function getAIConversationMessages(
  input: GetAIConversationMessagesInput,
) {
  await findConversation(input.conversationId, input.learnerId);

  const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
  const query: {
    conversationId: Types.ObjectId;
    createdAt?: { $lt: Date };
  } = {
    conversationId: toObjectId(input.conversationId, 'conversationId'),
  };

  if (input.before) {
    query.createdAt = {
      $lt: input.before,
    };
  }

  const messages = await AIConversationMessageModel.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);

  return messages.reverse();
}

export async function updateAIConversationPreferences(
  input: UpdateAIConversationPreferencesInput,
) {
  const conversation = await findConversation(input.conversationId, input.learnerId);

  conversation.extractedPreferences = {
    ...(conversation.extractedPreferences as Metadata),
    ...input.extractedPreferences,
  };

  if (input.recommendedTutorIds) {
    conversation.recommendedTutorIds = input.recommendedTutorIds.map((id) =>
      toObjectId(id, 'recommendedTutorId'),
    );
  }

  await conversation.save();
  return conversation;
}

export async function closeAIConversation(input: CloseAIConversationInput) {
  const conversation = await findConversation(input.conversationId, input.learnerId);

  conversation.status = input.status ?? 'completed';
  await conversation.save();

  return conversation;
}
