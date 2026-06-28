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
export type CreateTutorProfilePayload = {
  headline: string;
  bio: string;
  languages: string[];
  hourlyRate: number;

  education: education[];

  experience: experience[];
};
export type TutorProfile = {
  userId: string;
  headline: string;
  bio: string;
  hourlyRate: number;
  languages: string[];

  education: {
    degree: string;
    field: string;
    institution: string;
    graduationYear: number;
  }[];

  experience: {
    title: string;
    startYear: number;
    startMonth: number;
    endYear: number | null;
    endMonth: number | null;
    isCurrent: boolean;
  }[];

  isAvailable: boolean;
  rating: number;
  totalReviews: number;

  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export async function createTutorProfile(
  payload: CreateTutorProfilePayload
): Promise<TutorProfile> {
  try {
    const response = await api.post<ApiSuccess<TutorProfile>>(
      "/tutors/me/profile",
      payload
    );
     console.log(response.data.data)
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error.message);
    }

    throw error;
  }
}