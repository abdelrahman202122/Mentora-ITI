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

type TutorSearchUser =
  | string
  | {
      _id?: string;
      id?: string;
      name?: string;
      avatar?: string;
    };

export type TutorSearchItem = {
  _id?: string;
  userId: string;
  name: string;
  avatar?: string;
  profile: TutorSearchProfile;
  subjects: TutorSearchSubject[];
};

type RawTutorSearchItem = Omit<
  TutorSearchItem,
  "userId" | "name" | "avatar" | "profile" | "subjects"
> & {
  userId: TutorSearchUser;
  name?: string;
  avatar?: string;
  profile?: Partial<TutorSearchProfile> | null;
  subjects?: TutorSearchSubject[];
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

function getUserId(userId: TutorSearchUser): string {
  if (typeof userId === "string") {
    return userId;
  }

  return userId._id ?? userId.id ?? "";
}

function normalizeTutorSearchItem(tutor: RawTutorSearchItem): TutorSearchItem {
  const populatedUser = typeof tutor.userId === "string" ? null : tutor.userId;
  const userId = getUserId(tutor.userId);
  const profileId = tutor.profile?.id ?? tutor._id ?? userId;

  return {
    ...tutor,
    userId,
    name: tutor.name ?? populatedUser?.name ?? "",
    avatar: tutor.avatar ?? populatedUser?.avatar,
    profile: {
      id: profileId,
      headline: tutor.profile?.headline ?? "",
      bio: tutor.profile?.bio ?? "",
      hourlyRate: tutor.profile?.hourlyRate ?? 0,
      languages: tutor.profile?.languages ?? [],
      rating: tutor.profile?.rating,
      totalReviews: tutor.profile?.totalReviews,
      isAvailable: tutor.profile?.isAvailable,
    },
    subjects: tutor.subjects ?? [],
  };
}

export async function searchTutors(
  params: TutorSearchParams,
): Promise<TutorSearchResult> {
  const response = await api.get<
    ApiSuccess<Omit<TutorSearchResult, "tutors"> & { tutors: RawTutorSearchItem[] }>
  >("/tutors", {
    params,
    paramsSerializer: {
      indexes: null,
    },
  });

  return {
    ...response.data.data,
    tutors: response.data.data.tutors.map(normalizeTutorSearchItem),
  };
}
