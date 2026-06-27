import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";

export type UpdateAvatarResponse = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  isEmailVerified: boolean;
};

export async function uploadUserAvatar(file: File): Promise<UpdateAvatarResponse> {
  try {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await api.post<ApiSuccess<UpdateAvatarResponse>>(
      "/users/me/avatar",
      formData
    );

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error.message);
    }
    throw error;
  }
}