import { GoogleGenAI } from '@google/genai';

import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { AppError } from '../../common/errors/AppError.js';
import type { GeminiTextResult, GeminiUsage } from './ai.types.js';

const GEMINI_TIMEOUT_MS = 12_000;
const GEMINI_MAX_ATTEMPTS = 2;

let geminiClient: GoogleGenAI | null = null;

type GenerateGeminiTextInput = {
  systemInstruction: string;
  prompt: string;
  temperature?: number;
};

type GeminiErrorDetails = {
  status?: number;
  code?: string;
  message?: string;
};

function getGeminiClient() {
  if (!env.GEMINI_API_KEY) {
    throw new AppError('Gemini API key is not configured', 503, 'AI_CONFIGURATION_ERROR');
  }

  geminiClient ??= new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY,
  });

  return geminiClient;
}

function getErrorDetails(error: unknown): GeminiErrorDetails {
  if (!error || typeof error !== 'object') {
    return {};
  }

  const record = error as Record<string, unknown>;
  return {
    status:
      typeof record.status === 'number'
        ? record.status
        : typeof record.statusCode === 'number'
          ? record.statusCode
          : undefined,
    code: typeof record.code === 'string' ? record.code : undefined,
    message:
      error instanceof Error
        ? error.message
        : typeof record.message === 'string'
          ? record.message
          : undefined,
  };
}

function isTransientGeminiError(error: unknown) {
  const details = getErrorDetails(error);

  if (details.status === 408 || details.status === 429) {
    return true;
  }

  if (details.status && details.status >= 500) {
    return true;
  }

  return details.code === 'ETIMEDOUT' || details.code === 'ECONNRESET';
}

function toProviderError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const details = getErrorDetails(error);

  if (details.status === 401 || details.status === 403) {
    return new AppError('Gemini authentication failed', 502, 'AI_AUTH_ERROR');
  }

  if (details.status === 429) {
    return new AppError('Gemini rate limit exceeded', 429, 'AI_RATE_LIMITED');
  }

  if (details.status && details.status >= 500) {
    return new AppError('Gemini service is unavailable', 503, 'AI_PROVIDER_UNAVAILABLE');
  }

  if (details.code === 'ABORT_ERR' || details.message?.includes('aborted')) {
    return new AppError('Gemini request timed out', 504, 'AI_TIMEOUT');
  }

  return new AppError('Gemini response could not be generated', 502, 'AI_PROVIDER_ERROR');
}

function normalizeUsage(usage: unknown): GeminiUsage | undefined {
  if (!usage || typeof usage !== 'object') {
    return undefined;
  }

  const record = usage as Record<string, unknown>;
  return {
    promptTokenCount:
      typeof record.promptTokenCount === 'number' ? record.promptTokenCount : undefined,
    candidatesTokenCount:
      typeof record.candidatesTokenCount === 'number'
        ? record.candidatesTokenCount
        : undefined,
    totalTokenCount:
      typeof record.totalTokenCount === 'number' ? record.totalTokenCount : undefined,
  };
}

function assertGeminiText(text: string | undefined) {
  const content = text?.trim();

  if (!content) {
    throw new AppError('Gemini returned an empty response', 502, 'AI_EMPTY_RESPONSE');
  }

  return content;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateGeminiText(
  input: GenerateGeminiTextInput,
): Promise<GeminiTextResult> {
  const client = getGeminiClient();
  let lastError: unknown;

  for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    try {
      const response = await client.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: input.prompt,
        config: {
          abortSignal: controller.signal,
          systemInstruction: input.systemInstruction,
          temperature: input.temperature ?? 0.4,
        },
      });

      return {
        content: assertGeminiText(response.text),
        provider: 'gemini',
        model: env.GEMINI_MODEL,
        usage: normalizeUsage(response.usageMetadata),
      };
    } catch (error) {
      lastError = error;

      if (attempt < GEMINI_MAX_ATTEMPTS && isTransientGeminiError(error)) {
        await sleep(250 * attempt);
        continue;
      }

      break;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  const providerError = toProviderError(lastError);
  logger.error('Gemini request failed', {
    code: providerError.code,
    statusCode: providerError.statusCode,
    model: env.GEMINI_MODEL,
  });
  throw providerError;
}
