import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
export type education = {
    degree: string;
    field: string;
    institution: string;
    graduationYear: number;
}
export type experience ={
        title: string;
    startYear: number;
    startMonth: number;
    endYear: number | null;
    endMonth: number | null;
    isCurrent: boolean;

}
export interface UserData {
  name: string;
}

export type UpdateTutorProfilePayload = {
  headline: string;
  bio: string;
  languages: string[];
  hourlyRate: number;
  education: education[];
  experience: experience[];
userData: UserData;

};
export type TutorProfile = {
  userId: string;
  headline: string;
  bio: string;
  hourlyRate: number;
  languages: string[];
  education: education[];
  experience: experience[];
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export async function updateTutorProfile(
  payload: UpdateTutorProfilePayload
): Promise<TutorProfile> {
  try {
    const response = await api.patch<ApiSuccess<TutorProfile>>(
      "/tutors/me/profile",
      payload
    );
    console.log("patch response")
    console.log(response.data.data)
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error.message);
    }

    throw error;
  }
}