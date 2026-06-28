export type AIConversationStatus = "active" | "completed" | "abandoned";

export interface AIConversation {
  _id: string;
  learnerId: string;
  status: AIConversationStatus;
  locale: string;
  goal: string | null;
  extractedPreferences: Record<string, unknown>;
  recommendedTutorIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StartAIConversationInput {
  locale?: string;
  goal?: string;
  extractedPreferences?: Record<string, unknown>;
}

export type AIConversationMessageRole = "user" | "assistant" | "system";

export interface AIConversationMessage {
  _id: string;
  conversationId: string;
  role: AIConversationMessageRole;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SendAIConversationMessageInput {
  content: string;
  metadata?: Record<string, unknown>;
}

export interface SendAIConversationMessageResult {
  userMessage: AIConversationMessage;
  assistantMessage: AIConversationMessage;
}

export type TutorMatchStrength = "strong" | "good" | "partial" | "weak";

export interface TutorRecommendationInput {
  conversationId?: string;
  query?: string;
  category?: string;
  educationLevel?: string;
  curriculum?: string;
  languages?: string[];
  maxHourlyRate?: number;
  limit?: number;
}

export interface TutorRecommendation {
  tutorProfileId: string;
  tutorId: string;
  score: number;
  matchStrength: TutorMatchStrength;
  scoreBreakdown: {
    subject: number;
    category: number;
    educationLevel: number;
    curriculum: number;
    language: number;
    price: number;
    quality: number;
  };
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
}

export interface TutorRecommendationResult {
  recommendations: TutorRecommendation[];
  criteria: TutorRecommendationInput;
}

export interface TutorRecommendationFlowResult
  extends TutorRecommendationResult {
  conversation: AIConversation;
  userMessage?: AIConversationMessage;
  assistantMessage?: AIConversationMessage;
}
