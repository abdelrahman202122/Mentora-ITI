import { env } from '../../../config/env.js';
import openai from '../../../config/openai.config.js';

export type OpenAIMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export const generateResponse = async (
  systemPrompt: string,
  messages: OpenAIMessage[],
  timeout_ms: number,
) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeout_ms);

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
      signal: controller.signal,
    },
  );

  // console.log(response);

  clearTimeout(timeout);
  return response;
};
