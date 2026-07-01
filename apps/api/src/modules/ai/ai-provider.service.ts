import { APIError as OpenAIAPIError } from 'openai';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import * as openaiService from './models/openai.service.js';
import * as geminiService from './models/gemini.service.js';
import { createAILog } from './ai-log.service.js';
import type { OpenAIMessage } from './models/openai.service.js';

type GenerateAIReplyInput = {
  conversationId?: string;
  learnerId?: string;
  messages: OpenAIMessage[];
  locale?: string;
  goal?: string | null;
};

const fallbackReply =
  'I can help you describe your learning goals and find suitable tutors. Tell me the subject, level, preferred language, and budget you have in mind.';

function buildSystemPrompt(input: GenerateAIReplyInput) {
  const localeInstruction =
    input.locale && input.locale !== 'en'
      ? `Reply in the learner locale: ${input.locale}.`
      : 'Reply in clear English.';
  const goalInstruction = input.goal
    ? `The learner goal is: ${input.goal}.`
    : 'Help the learner clarify their tutoring needs.';

  return [
    'You are Mentora AI, a helpful education marketplace assistant.',
    goalInstruction,
    localeInstruction,
    'Ask concise follow-up questions when needed.',
    'Do not invent tutor names or availability. The backend matching engine handles tutor ranking separately.',
  ].join(' ');
}

export async function generateAIReply(input: GenerateAIReplyInput) {
  const startedAt: number = Date.now();

  // missing api keys, return fallback
  if (!env.OPENAI_API_KEY && !env.GEMINI_API_KEY) {
    await createAILog({
      conversationId: input.conversationId,
      learnerId: input.learnerId,
      provider: 'fallback',
      model: null,
      status: 'fallback',
      latencyMs: Date.now() - startedAt,
      promptMessagesCount: input.messages.length,
      errorCode: 'missing_api_key',
      errorType: 'configuration',
    });

    return {
      content: fallbackReply,
      provider: 'fallback',
      model: null,
    };
  }

  // call llm api
  const TIMEOUT_MS = 10_000;
  const systemPrompt = buildSystemPrompt(input);

  let output_text: string;
  let provider: string;
  let model: string;

  // try calling OpenAI API
  try {
    const response = await openaiService.generateResponse(
      systemPrompt,
      input.messages,
      TIMEOUT_MS,
    );
    output_text = response.output_text;
    provider = 'openai';
    model = response.model;

    await createAILog({
      conversationId: input.conversationId,
      learnerId: input.learnerId,
      provider: provider,
      model: model,
      status: 'success',
      latencyMs: Date.now() - startedAt,
      promptMessagesCount: input.messages.length,
    });

    return {
      content: output_text,
      provider: provider,
      model: model,
    };
  } catch (error) {
    // log openapi failure
    logger.warn('OpenAI request failed, trying Gemini..', {
      error: error instanceof Error ? error.message : error,
    });
    if (error instanceof OpenAIAPIError) {
      await createAILog({
        conversationId: input.conversationId,
        learnerId: input.learnerId,
        provider: 'openai',
        model: env.OPENAI_MODEL,
        status: 'failed',
        latencyMs: Date.now() - startedAt,
        promptMessagesCount: input.messages.length,
        errorStatus: error.status,
        errorCode: error.code ?? null,
        errorType: error.type ?? null,
      });
    }

    // fallback to Gemini API
    try {
      const interaction = await geminiService.generateResponse(
        systemPrompt,
        geminiService.formatGeminiMessages(input.messages),
        TIMEOUT_MS,
      );
      output_text = interaction.output_text ?? '';
      provider = 'gemini';
      model = interaction.model ?? env.GEMINI_MODEL;

      await createAILog({
        conversationId: input.conversationId,
        learnerId: input.learnerId,
        provider: provider,
        model: model,
        status: 'success',
        latencyMs: Date.now() - startedAt,
        promptMessagesCount: input.messages.length,
      });

      return {
        content: output_text,
        provider: provider,
        model: model,
      };
    } catch (error) {
      // if they both fail, fallback to generic message
      logger.error('Failed to generate AI reply', {
        error: error instanceof Error ? error.message : error,
      });

      if (geminiService.isGeminiError(error)) {
        await createAILog({
          conversationId: input.conversationId,
          learnerId: input.learnerId,
          provider: 'gemini',
          model: env.GEMINI_MODEL,
          status: 'failed',
          latencyMs: Date.now() - startedAt,
          promptMessagesCount: input.messages.length,
          errorStatus: error.rawResponse?.status ?? null,
          errorCode: error.rawResponse?.statusText ?? null,
          errorType: error.rawResponse?.type ?? null,
        });
      }

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
}
