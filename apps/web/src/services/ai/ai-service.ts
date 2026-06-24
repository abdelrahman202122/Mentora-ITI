import api from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type {
  AIConversation,
  StartAIConversationInput,
  TutorRecommendationInput,
  TutorRecommendationResult,
} from "@/types/ai/ai-types";

export async function startAIConversation(
  input: StartAIConversationInput
): Promise<AIConversation> {
  const response = await api.post<ApiSuccess<AIConversation>>(
    "/ai/conversations",
    input
  );

  return response.data.data;
}

export async function getTutorRecommendations(
  input: TutorRecommendationInput
): Promise<TutorRecommendationResult> {
  const response = await api.post<ApiSuccess<TutorRecommendationResult>>(
    "/ai/recommendations",
    input
  );

  return response.data.data;
}
