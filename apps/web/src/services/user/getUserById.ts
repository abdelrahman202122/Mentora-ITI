
import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
export interface PublicUser {
  id: string;
  name: string;
  avatar: string;
  role: "learner" | "tutor" | "admin";
}

export async function getPublicUser(
  userId: string
): Promise<PublicUser> {
  try {
    const response = await api.get<ApiSuccess<PublicUser>>(
      `/users/${userId}/public`
    );

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error.message);
    }

    throw error;
  }
}