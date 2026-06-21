import mongoose, { type Types as MongooseTypes } from 'mongoose';

import { logger } from '../../config/logger.js';
import { AILogModel, type AILogStatus } from './ai-log.model.js';

const { Types } = mongoose;
type ObjectId = MongooseTypes.ObjectId;

type CreateAILogInput = {
  conversationId?: string | ObjectId | null;
  learnerId?: string | ObjectId | null;
  provider: string;
  model?: string | null;
  status: AILogStatus;
  latencyMs: number;
  promptMessagesCount: number;
  errorStatus?: number | null;
  errorCode?: string | null;
  errorType?: string | null;
};

function toOptionalObjectId(value?: string | ObjectId | null) {
  if (!value) {
    return null;
  }

  if (value instanceof Types.ObjectId) {
    return value;
  }

  if (!Types.ObjectId.isValid(value)) {
    return null;
  }

  return new Types.ObjectId(value);
}

export async function createAILog(input: CreateAILogInput) {
  try {
    await AILogModel.create({
      conversationId: toOptionalObjectId(input.conversationId),
      learnerId: toOptionalObjectId(input.learnerId),
      provider: input.provider,
      model: input.model ?? null,
      status: input.status,
      latencyMs: input.latencyMs,
      promptMessagesCount: input.promptMessagesCount,
      errorStatus: input.errorStatus ?? null,
      errorCode: input.errorCode ?? null,
      errorType: input.errorType ?? null,
    });
  } catch (error) {
    logger.error('Failed to create AI log', {
      error: error instanceof Error ? error.message : error,
    });
  }
}
