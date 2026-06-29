import { mockTutor } from "@/mocks/mock-data"
import {
  searchTutors,
  type TutorSearchItem,
} from "@/services/tutorsLearner/tutor-search"

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

function getMockTutor(): TutorSummary {
  return {
    id: mockTutor._id,
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
  const tutors = await getTutors()
  return tutors.find((tutor) => tutor.id === id) || null
}

export async function getTutorReviews(_id: string) {
  void _id

  return [
    {
      id: "r1",
      learnerName: `${mockTutor.user.firstName} ${mockTutor.user.lastName}`,
      rating: 5,
      comment: "Very helpful tutor.",
      date: "Jun 9, 2026",
    },
  ]
}
