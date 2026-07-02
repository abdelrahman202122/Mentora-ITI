import type { TutorRecommendationInput } from '../../validators/ai-recommendation.js';

export type AIProviderMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type GeminiUsage = {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
};

export type GeminiTextResult = {
  content: string;
  provider: 'gemini';
  model: string;
  usage?: GeminiUsage;
};

export type ExtractedTutorPreferences = Partial<
  Pick<
    TutorRecommendationInput,
    'query' | 'category' | 'educationLevel' | 'curriculum' | 'languages' | 'maxHourlyRate'
  >
>;

export type RecommendedTutorForPrompt = {
  tutorProfileId: string;
  tutorId: string;
  profilePath: string;
  score: number;
  matchStrength: string;
  reasons: string[];
  profile: {
    headline: string;
    bio: string;
    hourlyRate: number;
    languages: string[];
    rating: number;
    totalReviews: number;
  };
  matchedSubjects: Array<{
    id: string;
    category: string;
    title: string;
    educationLevel: string;
    curriculum: string;
  }>;
};

export type AIChatResult = {
  reply: string;
  recommendedTutors: RecommendedTutorForPrompt[];
  conversationId: string;
};
