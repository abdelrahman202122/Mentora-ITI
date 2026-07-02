import { env } from '../../../config/env.js';
import gemini from '../../../config/gemini.config.js';
import type { OpenAIMessage } from './openai.service.js';

export type GeminiMessage = {
  type: 'user_input' | 'model_output';
  content: {
    type: 'text';
    text: string;
  }[];
};

export const generateResponse = async (
  systemPrompt: string,
  messages: GeminiMessage[],
  timeout_ms: number,
) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeout_ms);

  const interaction = await gemini.interactions.create(
    {
      model: env.GEMINI_MODEL,
      store: false,
      input: messages,
      system_instruction: systemPrompt,
    },
    {
      fetchOptions: {
        signal: controller.signal,
      },
    },
  );

  // console.log(interaction);

  clearTimeout(timeout);
  return interaction;
};

export function formatGeminiMessages(
  messages: OpenAIMessage[],
): GeminiMessage[] {
  return messages.map((message: OpenAIMessage) => ({
    type: message.role === 'user' ? 'user_input' : 'model_output',
    content: [
      {
        type: 'text',
        text: message.content,
      },
    ],
  }));
}

interface GeminiError extends Error {
  rawResponse?: Response;
}

export function isGeminiError(error: unknown): error is GeminiError {
  return error instanceof Error;
}
