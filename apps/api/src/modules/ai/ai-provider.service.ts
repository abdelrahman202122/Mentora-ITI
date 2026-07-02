import { logger } from '../../config/logger.js';
import { createAILog } from './ai-log.service.js';
import { generateGeminiText } from './gemini.service.js';
import {
  buildConversationReplyPrompt,
  buildMentoraSystemPrompt,
} from './prompt.service.js';
import type { AIProviderMessage } from './ai.types.js';

type GenerateAIReplyInput = {
  conversationId?: string;
  learnerId?: string;
  messages: AIProviderMessage[];
  locale?: string;
  goal?: string | null;
};

const fallbackReply =
  'I can help you describe your learning goals and find suitable tutors. Tell me the subject, level, preferred language, and budget you have in mind.';

export type { AIProviderMessage };

export async function generateAIReply(input: GenerateAIReplyInput) {
  const startedAt = Date.now();

  try {
    const result = await generateGeminiText({
      systemInstruction: buildMentoraSystemPrompt(input.locale),
      prompt: buildConversationReplyPrompt(input.messages),
      temperature: 0.5,
    });

    await createAILog({
      conversationId: input.conversationId,
      learnerId: input.learnerId,
      provider: result.provider,
      model: result.model,
      status: 'success',
      latencyMs: Date.now() - startedAt,
      promptMessagesCount: input.messages.length,
    });

    logger.info('Gemini AI reply generated', {
      conversationId: input.conversationId,
      learnerId: input.learnerId,
      model: result.model,
      latencyMs: Date.now() - startedAt,
      totalTokenCount: result.usage?.totalTokenCount,
    });

    return {
      content: result.content,
      provider: result.provider,
      model: result.model,
    };
  } catch (error) {
    logger.error('Failed to generate Gemini AI reply', {
      conversationId: input.conversationId,
      learnerId: input.learnerId,
      error: error instanceof Error ? error.message : error,
    });

    await createAILog({
      conversationId: input.conversationId,
      learnerId: input.learnerId,
      provider: 'fallback',
      model: null,
      status: 'fallback',
      latencyMs: Date.now() - startedAt,
      promptMessagesCount: input.messages.length,
      errorCode: 'provider_failed',
      errorType: 'exception',
    });

    return {
      content: fallbackReply,
      provider: 'fallback',
      model: null,
    };
  }
}
