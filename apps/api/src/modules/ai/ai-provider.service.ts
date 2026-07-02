import { APIError as OpenAIAPIError } from 'openai';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import * as openaiService from './models/openai.service.js';
import * as geminiService from './models/gemini.service.js';
import { createAILog, type CreateAILogInput } from './ai-log.service.js';
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

  // missing api keys, return fallback reply
  if (!env.OPENAI_API_KEY && !env.GEMINI_API_KEY) {
    await createAILog(
      buildFallbackLog(input, startedAt, 'missing_api_key', 'configuration'),
    );

    return {
      content: fallbackReply,
      provider: 'fallback',
      model: null,
    };
  }

  const TIMEOUT_MS = 10_000;
  const systemPrompt = buildSystemPrompt(input);

  // OPTION 1: OpenAI API
  if (!env.OPENAI_API_KEY) {
    // log missing openai api key
    await createAILog(
      buildModelFailedLog(
        input,
        startedAt,
        'openai',
        env.OPENAI_MODEL,
        null,
        'missing_api_key',
        'configuration',
      ),
    );
  } else {
    try {
      const response = await openaiService.generateResponse(
        systemPrompt,
        input.messages,
        TIMEOUT_MS,
      );

      // log openai success
      await createAILog(
        buildModelSuccessLog(input, startedAt, 'openai', response.model),
      );

      // return, skip gemini call
      return {
        content: response.output_text,
        provider: 'openai',
        model: response.model,
      };
    } catch (error) {
      // log openai failure
      logger.warn('OpenAI request failed, trying Gemini..', {
        error: error instanceof Error ? error.message : error,
      });
      if (error instanceof OpenAIAPIError) {
        await createAILog(
          buildModelFailedLog(
            input,
            startedAt,
            'openai',
            env.OPENAI_MODEL,
            error.status,
            error.code ?? null,
            error.type ?? null,
          ),
        );
      }
    }
  }

  // OPTION 2: Gemini API
  if (!env.GEMINI_API_KEY) {
    // log missing gemini api key
    await createAILog(
      buildModelFailedLog(
        input,
        startedAt,
        'gemini',
        env.GEMINI_MODEL,
        null,
        'missing_api_key',
        'configuration',
      ),
    );
  } else {
    try {
      const interaction = await geminiService.generateResponse(
        systemPrompt,
        geminiService.formatGeminiMessages(input.messages),
        TIMEOUT_MS,
      );

      // log gemini success
      await createAILog(
        buildModelSuccessLog(
          input,
          startedAt,
          'gemini',
          interaction.model ?? env.GEMINI_MODEL,
        ),
      );

      // return, skip fallback reply
      return {
        content: interaction.output_text ?? '',
        provider: 'gemini',
        model: interaction.model ?? env.GEMINI_MODEL,
      };
    } catch (error) {
      // log gemini failure
      logger.error('Failed to generate AI reply', {
        error: error instanceof Error ? error.message : error,
      });

      if (geminiService.isGeminiError(error)) {
        await createAILog(
          buildModelFailedLog(
            input,
            startedAt,
            'gemini',
            env.GEMINI_MODEL,
            error.rawResponse?.status ?? null,
            error.rawResponse?.statusText ?? null,
            error.rawResponse?.type ?? null,
          ),
        );
      }
    }
  }

  // OPTION 3: Fallback reply
  await createAILog(
    buildFallbackLog(input, startedAt, 'provider_failed', 'exception'),
  );

  return {
    content: fallbackReply,
    provider: 'fallback',
    model: null,
  };
}

function buildFallbackLog(
  input: GenerateAIReplyInput,
  startedAt: number,
  errorCode: string,
  errorType: string,
): CreateAILogInput {
  return {
    conversationId: input.conversationId,
    learnerId: input.learnerId,
    provider: 'fallback',
    model: null,
    status: 'fallback',
    latencyMs: Date.now() - startedAt,
    promptMessagesCount: input.messages.length,
    errorCode: errorCode,
    errorType: errorType,
  };
}

function buildModelSuccessLog(
  input: GenerateAIReplyInput,
  startedAt: number,
  provider: string,
  model: string | null | undefined,
): CreateAILogInput {
  return {
    conversationId: input.conversationId,
    learnerId: input.learnerId,
    provider: provider,
    model: model,
    status: 'success',
    latencyMs: Date.now() - startedAt,
    promptMessagesCount: input.messages.length,
  };
}

function buildModelFailedLog(
  input: GenerateAIReplyInput,
  startedAt: number,
  provider: string,
  model: string | null | undefined,
  errorStatus: number | null | undefined,
  errorCode: string | null | undefined,
  errorType: string | null | undefined,
): CreateAILogInput {
  return {
    conversationId: input.conversationId,
    learnerId: input.learnerId,
    provider: provider,
    model: model,
    status: 'failed',
    latencyMs: Date.now() - startedAt,
    promptMessagesCount: input.messages.length,
    errorStatus: errorStatus,
    errorCode: errorCode,
    errorType: errorType,
  };
}
