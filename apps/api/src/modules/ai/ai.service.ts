import { CATEGORY_VALUES } from '../../constants/categories.js';
import { CURRICULA_VALUES } from '../../constants/curricula.js';
import { EDUCATION_LEVEL_VALUES } from '../../constants/educationLevels.js';
import { AppError } from '../../common/errors/AppError.js';
import { logger } from '../../config/logger.js';
import type { AIChatInput } from '../../validators/ai-conversation.js';
import type { TutorRecommendationInput } from '../../validators/ai-recommendation.js';
import {
  addAssistantMessage,
  addUserMessage,
  startAIConversation,
} from './ai-conversation.service.js';
import { createAILog } from './ai-log.service.js';
import { generateGeminiText } from './gemini.service.js';
import {
  buildMentoraSystemPrompt,
  buildPreferenceExtractionPrompt,
  buildTutorExplanationPrompt,
} from './prompt.service.js';
import {
  recommendTutors,
  type TutorRecommendation,
} from './tutor-recommendation.service.js';
import type {
  AIChatResult,
  ExtractedTutorPreferences,
  RecommendedTutorForPrompt,
} from './ai.types.js';

const DEFAULT_RECOMMENDATION_LIMIT = 5;

function isAllowedValue(
  value: unknown,
  allowedValues: readonly string[],
): value is string {
  return typeof value === 'string' && allowedValues.includes(value);
}

function parseJsonObject(value: string): Record<string, unknown> {
  const trimmed = value.trim();
  const cleaned = trimmed
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned) as unknown;

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new AppError('Gemini returned malformed preferences', 502, 'AI_MALFORMED_RESPONSE');
  }

  return parsed as Record<string, unknown>;
}

function normalizeExtractedPreferences(
  raw: Record<string, unknown>,
): ExtractedTutorPreferences {
  const preferences: ExtractedTutorPreferences = {};

  if (typeof raw.query === 'string' && raw.query.trim()) {
    preferences.query = raw.query.trim().slice(0, 200);
  }

  if (isAllowedValue(raw.category, CATEGORY_VALUES)) {
    preferences.category = raw.category;
  }

  if (isAllowedValue(raw.educationLevel, EDUCATION_LEVEL_VALUES)) {
    preferences.educationLevel = raw.educationLevel;
  }

  if (isAllowedValue(raw.curriculum, CURRICULA_VALUES)) {
    preferences.curriculum = raw.curriculum;
  }

  if (Array.isArray(raw.languages)) {
    const languages = raw.languages
      .filter((language): language is string => typeof language === 'string')
      .map((language) => language.trim())
      .filter(Boolean)
      .slice(0, 10);

    if (languages.length > 0) {
      preferences.languages = languages;
    }
  }

  if (typeof raw.maxHourlyRate === 'number' && raw.maxHourlyRate > 0) {
    preferences.maxHourlyRate = raw.maxHourlyRate;
  }

  return preferences;
}

function toRecommendationInput(
  preferences: ExtractedTutorPreferences,
  conversationId: string,
): TutorRecommendationInput {
  return {
    ...preferences,
    conversationId,
    limit: DEFAULT_RECOMMENDATION_LIMIT,
  };
}

function toPromptTutors(
  recommendations: TutorRecommendation[],
): RecommendedTutorForPrompt[] {
  return recommendations.map((recommendation) => ({
    tutorProfileId: recommendation.tutorProfileId,
    tutorId: recommendation.tutorId,
    profilePath: `/tutor-match/${recommendation.tutorId}`,
    score: recommendation.score,
    matchStrength: recommendation.matchStrength,
    reasons: recommendation.reasons,
    profile: recommendation.profile,
    matchedSubjects: recommendation.matchedSubjects,
  }));
}

async function extractPreferences(input: {
  conversationId: string;
  learnerId: string;
  message: string;
}) {
  const startedAt = Date.now();

  try {
    const result = await generateGeminiText({
      systemInstruction: buildMentoraSystemPrompt(),
      prompt: buildPreferenceExtractionPrompt(input.message),
      temperature: 0,
    });

    await createAILog({
      conversationId: input.conversationId,
      learnerId: input.learnerId,
      provider: result.provider,
      model: result.model,
      status: 'success',
      latencyMs: Date.now() - startedAt,
      promptMessagesCount: 1,
    });

    logger.info('Gemini preferences extracted', {
      conversationId: input.conversationId,
      learnerId: input.learnerId,
      model: result.model,
      latencyMs: Date.now() - startedAt,
      totalTokenCount: result.usage?.totalTokenCount,
    });

    return normalizeExtractedPreferences(parseJsonObject(result.content));
  } catch (error) {
    logger.error('Gemini preference extraction failed', {
      conversationId: input.conversationId,
      learnerId: input.learnerId,
      error: error instanceof Error ? error.message : error,
    });

    await createAILog({
      conversationId: input.conversationId,
      learnerId: input.learnerId,
      provider: 'gemini',
      model: null,
      status: 'failed',
      latencyMs: Date.now() - startedAt,
      promptMessagesCount: 1,
      errorCode: 'preference_extraction_failed',
      errorType: 'exception',
    });

    return {};
  }
}

async function generateTutorExplanation(input: {
  conversationId: string;
  learnerId: string;
  locale?: string;
  message: string;
  preferences: ExtractedTutorPreferences;
  tutors: RecommendedTutorForPrompt[];
}) {
  const startedAt = Date.now();
  const result = await generateGeminiText({
    systemInstruction: buildMentoraSystemPrompt(input.locale),
    prompt: buildTutorExplanationPrompt({
      message: input.message,
      preferences: input.preferences,
      tutors: input.tutors,
    }),
    temperature: 0.35,
  });

  await createAILog({
    conversationId: input.conversationId,
    learnerId: input.learnerId,
    provider: result.provider,
    model: result.model,
    status: 'success',
    latencyMs: Date.now() - startedAt,
    promptMessagesCount: 1,
  });

  logger.info('Gemini tutor explanation generated', {
    conversationId: input.conversationId,
    learnerId: input.learnerId,
    model: result.model,
    latencyMs: Date.now() - startedAt,
    totalTokenCount: result.usage?.totalTokenCount,
    recommendedTutorCount: input.tutors.length,
  });

  return result;
}

export async function runAIChat(
  learnerId: string,
  input: AIChatInput,
): Promise<AIChatResult> {
  const startedAt = Date.now();
  logger.info('AI chat request started', {
    learnerId,
    hasConversationId: Boolean(input.conversationId),
  });

  const conversation = input.conversationId
    ? { _id: input.conversationId }
    : await startAIConversation({
        learnerId,
        locale: input.locale,
        extractedPreferences: {},
      });
  const conversationId = conversation._id.toString();

  const userMessage = await addUserMessage({
    conversationId,
    learnerId,
    content: input.message,
    metadata: {
      source: 'ai_chat',
    },
  });

  const preferences = await extractPreferences({
    conversationId,
    learnerId,
    message: input.message,
  });
  const recommendationInput = toRecommendationInput(preferences, conversationId);
  const recommendationResult = await recommendTutors(learnerId, recommendationInput);
  const recommendedTutors = toPromptTutors(recommendationResult.recommendations);
  const explanation = await generateTutorExplanation({
    conversationId,
    learnerId,
    message: input.message,
    preferences,
    tutors: recommendedTutors,
  });

  await addAssistantMessage({
    conversationId,
    learnerId,
    content: explanation.content,
    metadata: {
      provider: explanation.provider,
      model: explanation.model,
      usage: explanation.usage,
      userMessageId: userMessage._id.toString(),
      recommendedTutorCount: recommendedTutors.length,
    },
  });

  logger.info('AI chat request finished', {
    learnerId,
    conversationId,
    latencyMs: Date.now() - startedAt,
    recommendedTutorCount: recommendedTutors.length,
  });

  return {
    reply: explanation.content,
    recommendedTutors,
    conversationId,
  };
}
