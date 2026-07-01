import { env } from '../../../config/env.js';
import openai from '../../../config/openai.config.js';

export type OpenAIMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export const generateResponse = async (
  systemPrompt: string,
  messages: OpenAIMessage[],
  abortSignal: AbortSignal,
) => {
  const response = await openai.responses.create(
    {
      model: env.OPENAI_MODEL,
      input: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
    },
    {
      signal: abortSignal,
    },
  );

  return response;
};
