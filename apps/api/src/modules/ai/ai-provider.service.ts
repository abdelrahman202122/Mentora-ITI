import { APIError } from 'openai';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import openai from '../../config/openai.config.js';
import { createAILog } from './ai-log.service.js';

export type AIProviderMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type GenerateAIReplyInput = {
  conversationId?: string;
  learnerId?: string;
  messages: AIProviderMessage[];
  locale?: string;
  goal?: string | null;
};

// type OpenAIResponse = {
//   output_text?: string;
//   output?: Array<{
//     content?: Array<{
//       text?: string;
//       type?: string;
//     }>;
//   }>;
// };

// type OpenAIErrorResponse = {
//   error?: {
//     code?: string | null;
//     type?: string | null;
//     message?: string;
//   };
// };

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

// function extractText(response: OpenAIResponse) {
//   if (response.output_text?.trim()) {
//     return response.output_text.trim();
//   }

//   const text = response.output
//     ?.flatMap((item) => item.content ?? [])
//     .map((content) => content.text)
//     .filter((content): content is string => Boolean(content?.trim()))
//     .join('\n')
//     .trim();

//   return text || fallbackReply;
// }

export async function generateAIReply(input: GenerateAIReplyInput) {
  const startedAt = Date.now();

  // missing api keys, return fallback
  if (!env.OPENAI_API_KEY) {
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await openai.responses.create(
      {
        model: env.OPENAI_MODEL,
        input: [
          {
            role: 'system',
            content: buildSystemPrompt(input),
          },
          ...input.messages,
        ],
      },
      {
        signal: controller.signal,
      },
    );

    clearTimeout(timeout);

    await createAILog({
      conversationId: input.conversationId,
      learnerId: input.learnerId,
      provider: 'openai',
      model: env.OPENAI_MODEL,
      status: 'success',
      latencyMs: Date.now() - startedAt,
      promptMessagesCount: input.messages.length,
    });

    return {
      content: response.output_text,
      provider: 'openai',
      model: env.OPENAI_MODEL,
    };
  } catch (error) {
    clearTimeout(timeout);
    logger.error('Failed to generate AI reply', {
      error: error instanceof Error ? error.message : error,
    });

    if (error instanceof APIError) {
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
