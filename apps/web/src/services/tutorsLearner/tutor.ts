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
  profileId?: string
  primarySubjectId?: string
  primarySubjectTitle?: string
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

type TutorProfileWithUser = TutorProfileData & {
  userData?: {
    name?: string
    avatar?: string
  }
}

function toTutorSummary(
  profile: TutorProfileWithUser,
  tutorId: string
): TutorSummary {
  return {
    id: tutorId,
    name: profile.userData?.name ?? "Tutor",
    title: profile.headline,
    subjects: profile.languages.length > 0 ? profile.languages : ["Tutoring"],
    rating: profile.rating,
    bio: profile.bio,
    hourlyRate: profile.hourlyRate,
    currency: "EGP",
    availability: profile.isAvailable ? ["Available"] : [],
    totalReviews: profile.totalReviews,
    totalStudents: 0,
    isAvailable: profile.isAvailable,
  }
}

function toTutorSummaryFromSearch(tutor: TutorSearchItem): TutorSummary {
  const primarySubject = tutor.subjects[0]

  return {
    id: tutor.userId,
    profileId: tutor.profile.id,
    primarySubjectId: primarySubject?.id,
    primarySubjectTitle: primarySubject?.title,
    name: tutor.name || "Tutor",
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

export async function getTutors(): Promise<TutorSummary[]> {
  try {
    const result = await searchTutors({ limit: 50, sortBy: "rating" })
    return result.tutors.map(toTutorSummaryFromSearch)
  } catch (error) {
    console.error("Failed to fetch tutors; using mock fallback", { error })
    return [
      {
        id: mockTutor.user._id,
        name: mockTutor.user.firstName + " " + mockTutor.user.lastName,
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
      },
    ]
  }
}

export async function getTutorById(id: string): Promise<TutorSummary | null> {
  try {
    const result = await searchTutors({ limit: 100, sortBy: "rating" })
    const matchedTutor = result.tutors.find(
      (tutor) =>
        tutor.userId === id || tutor.profile.id === id || tutor._id === id
    )

    if (matchedTutor) {
      return toTutorSummaryFromSearch(matchedTutor)
    }
  } catch (error) {
    console.error("Failed to resolve tutor profile from tutor search", {
      error,
      tutorId: id,
    })
  }

  try {
    const response = await api.get<ApiSuccess<TutorProfileWithUser>>(
      `/tutors/${id}/profile`
    )

    return toTutorSummary(response.data.data, id)
  } catch (error) {
    console.error("Failed to fetch tutor profile by user id", {
      error,
      tutorId: id,
    })
  }

  const tutors = await getTutors()
  return tutors.find((tutor) => tutor.id === id) || null
}

export async function getTutorReviews(_id: string) {
  void _id

  return [
    {
      id: "r1",
      learnerName: mockTutor.user.firstName + " " + mockTutor.user.lastName,
      rating: 5,
      comment: "Very helpful tutor.",
      date: "Jun 9, 2026",
    },
  ]
}
