import api from "@/lib/axios"
import { mockTutor } from "@/mocks/mock-data"
import {
  searchTutors,
  type TutorSearchItem,
} from "@/services/tutorsLearner/tutor-search"
import type { ApiSuccess } from "@/types/apis/api-success"
import type { TutorProfileData } from "@/types/tutor/tutor-profile"

export type TutorSummary = {
  id: string
  name: string
  title: string
  subjects: string[]
  rating: number
  bio: string
  hourlyRate: number
  currency: string
  availability: string[]
  totalReviews: number
  totalStudents: number
  isAvailable: boolean
}

export type TutorReview = {
  id: string
  learnerName: string
  rating: number
  comment: string
  date: string
}

type TutorProfileWithUser = TutorProfileData & {
  userData?: {
    name?: string
    avatar?: string
  }
}

function toTutorSummary(tutor: TutorSearchItem): TutorSummary {
  return {
    id: tutor.userId,
    name: tutor.name,
    title: tutor.profile.headline,
    subjects: tutor.subjects.map((subject) => subject.title),
    rating: tutor.profile.rating ?? 0,
    bio: tutor.profile.bio,
    hourlyRate: tutor.profile.hourlyRate,
    currency: "EGP",
    availability: tutor.profile.isAvailable ? ["Available"] : [],
    totalReviews: tutor.profile.totalReviews ?? 0,
    totalStudents: 0,
    isAvailable: tutor.profile.isAvailable ?? false,
  }
}

function toTutorSummaryFromProfile(
  profile: TutorProfileWithUser,
  requestedTutorId: string
): TutorSummary {
  return {
    id: profile.userId ?? requestedTutorId,
    name: profile.userData?.name ?? "Tutor",
    title: profile.headline,
    subjects: profile.languages.length > 0 ? profile.languages : ["Tutoring"],
    rating: profile.rating ?? 0,
    bio: profile.bio,
    hourlyRate: profile.hourlyRate,
    currency: "EGP",
    availability: profile.isAvailable ? ["Available"] : [],
    totalReviews: profile.totalReviews ?? 0,
    totalStudents: 0,
    isAvailable: profile.isAvailable ?? false,
  }
}

function getMockTutor(): TutorSummary {
  return {
    id: mockTutor.user._id,
    name: `${mockTutor.user.firstName} ${mockTutor.user.lastName}`,
    title: mockTutor.headline,
    subjects: mockTutor.subjects.map((subject) => subject.nameEn),
    rating: mockTutor.averageRating,
    bio: mockTutor.bio,
    hourlyRate: mockTutor.hourlyRate,
    currency: mockTutor.currency,
    availability: ["Monday", "Wednesday", "Friday"],
    totalReviews: mockTutor.totalReviews,
    totalStudents: 120,
    isAvailable: mockTutor.isAvailable,
  }
}

export async function getTutors(): Promise<TutorSummary[]> {
  try {
    const result = await searchTutors({ limit: 50, sortBy: "rating" })
    return result.tutors.map(toTutorSummary)
  } catch (error) {
    console.error("Failed to fetch tutors; using mock fallback", { error })
    return [getMockTutor()]
  }
}

export async function getTutorById(id: string): Promise<TutorSummary | null> {
  try {
    const response = await api.get<ApiSuccess<TutorProfileWithUser>>(
      `/tutors/${id}/profile`
    )

    return toTutorSummaryFromProfile(response.data.data, id)
  } catch (error) {
    console.error("Failed to fetch tutor profile by user id", {
      error,
      tutorId: id,
    })
  }

  try {
    const result = await searchTutors({ limit: 100, sortBy: "rating" })
    const matchedTutor = result.tutors.find(
      (tutor) =>
        tutor.userId === id || tutor.profile.id === id || tutor._id === id
    )

    if (matchedTutor) {
      return toTutorSummary(matchedTutor)
    }
  } catch (error) {
    console.error("Failed to resolve tutor profile from tutor search", {
      error,
      tutorId: id,
    })
  }

  const mockSummary = getMockTutor()
  return mockSummary.id === id ? mockSummary : null
}

type ReviewResponse = {
  _id: string
  rating: number
  comment?: string
  createdAt: string
}

type ReviewsData = {
  reviews: ReviewResponse[]
}

async function resolveTutorProfileId(id: string): Promise<string> {
  try {
    const response = await api.get<ApiSuccess<TutorProfileWithUser>>(
      `/tutors/${id}/profile`
    )

    return response.data.data._id
  } catch {
    const result = await searchTutors({ limit: 100, sortBy: "rating" })
    const matchedTutor = result.tutors.find(
      (tutor) =>
        tutor.userId === id || tutor.profile.id === id || tutor._id === id
    )

    return matchedTutor?.profile.id ?? id
  }
}

export async function getTutorReviews(id: string): Promise<TutorReview[]> {
  const tutorProfileId = await resolveTutorProfileId(id)
  const response = await api.get<ApiSuccess<ReviewsData>>(
    `/reviews/tutors/${tutorProfileId}`,
    {
      params: {
        limit: 20,
        page: 1,
      },
    }
  )

  return response.data.data.reviews.map((review) => ({
    id: review._id,
    learnerName: "Learner",
    rating: review.rating,
    comment: review.comment ?? "",
    date: new Date(review.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }))
}
