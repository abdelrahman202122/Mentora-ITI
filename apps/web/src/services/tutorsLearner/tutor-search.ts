import api from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";

export type TutorSearchSort = "relevance" | "rating" | "price_asc" | "price_desc";

export type TutorSearchParams = {
  q?: string;
  category?: string;
  educationLevel?: string;
  curriculum?: string;
  minHourlyRate?: number;
  maxHourlyRate?: number;
  minRating?: number;
  languages?: string[];
  sortBy?: TutorSearchSort;
  page?: number;
  limit?: number;
};

export type TutorSearchSubject = {
  id: string;
  title: string;
  category: string;
  educationLevel: string;
  curriculum: string;
  gradeNote?: string;
  description?: string;
};

export type TutorSearchProfile = {
  id: string;
  headline: string;
  bio: string;
  hourlyRate: number;
  languages: string[];
  rating?: number;
  totalReviews?: number;
  isAvailable?: boolean;
};

export type TutorSearchItem = {
  _id?: string;
  userId: string;
  name: string;
  avatar?: string;
  profile: TutorSearchProfile;
  subjects: TutorSearchSubject[];
};

export type TutorSearchPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type TutorSearchResult = {
  tutors: TutorSearchItem[];
  pagination: TutorSearchPagination;
};

export async function searchTutors(
  params: TutorSearchParams,
): Promise<TutorSearchResult> {
  const response = await api.get<ApiSuccess<TutorSearchResult>>("/tutors", {
    params,
    paramsSerializer: {
      indexes: null,
    },
  });

  return response.data.data;
}
