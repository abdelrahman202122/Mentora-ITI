import api from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type {
  AIConversation,
  AIChatInput,
  AIChatResult,
  SendAIConversationMessageInput,
  SendAIConversationMessageResult,
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

export async function sendAIConversationMessage(
  conversationId: string,
  input: SendAIConversationMessageInput
): Promise<SendAIConversationMessageResult> {
  const response = await api.post<ApiSuccess<SendAIConversationMessageResult>>(
    `/ai/conversations/${conversationId}/messages`,
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

export async function sendAIChat(input: AIChatInput): Promise<AIChatResult> {
  const response = await api.post<ApiSuccess<AIChatResult>>("/ai/chat", input);

  return response.data.data;
}
