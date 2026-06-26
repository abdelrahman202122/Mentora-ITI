import api from "@/lib/axios"
import { mockTutor } from "@/mocks/mock-data"
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

export async function getTutors(): Promise<TutorSummary[]> {
  return [
    {
      id: mockTutor._id,
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

export async function getTutorById(id: string): Promise<TutorSummary | null> {
  try {
    const response = await api.get<ApiSuccess<TutorProfileWithUser>>(
      `/tutors/${id}/profile`
    )

    return toTutorSummary(response.data.data, id)
  } catch (error) {
    console.error("Failed to fetch tutor profile; using mock fallback", {
      error,
      tutorId: id,
    })
    // Keep the existing mock fallback for frontend-only tutor-match pages.
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
