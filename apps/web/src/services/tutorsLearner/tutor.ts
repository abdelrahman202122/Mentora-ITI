import api from "@/lib/axios"
import { mockTutor } from "@/mocks/mock-data"
import {
  searchTutors,
  type TutorSearchItem,
  type TutorSearchSubject,
} from "@/services/tutorsLearner/tutor-search"
import type { ApiSuccess } from "@/types/apis/api-success"
import type { TutorProfileData } from "@/types/tutor/tutor-profile"

export type TutorSubjectSummary = Pick<
  TutorSearchSubject,
  "category" | "curriculum" | "educationLevel" | "id" | "title"
>

export type TutorSummary = {
  id: string
  profileId: string
  name: string
  avatar?: string
  title: string
  subjects: TutorSubjectSummary[]
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

type TutorAvailabilityResponse = {
  slots?: Record<string, { startTime: string; endTime: string }[]>
}

const dayLabels: Record<string, string> = {
  friday: "Friday",
  monday: "Monday",
  saturday: "Saturday",
  sunday: "Sunday",
  thursday: "Thursday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
}

function toSubjectSummary(subject: TutorSearchSubject): TutorSubjectSummary {
  return {
    category: subject.category,
    curriculum: subject.curriculum,
    educationLevel: subject.educationLevel,
    id: subject.id,
    title: subject.title,
  }
}

function fallbackSubject(title: string): TutorSubjectSummary {
  return {
    category: "",
    curriculum: "",
    educationLevel: "",
    id: "",
    title,
  }
}

function getAvatarFromProfile(profile: TutorProfileWithUser): string | undefined {
  return profile.userData?.avatar || undefined
}

function toTutorSummary(
  profile: TutorProfileWithUser,
  tutorId: string,
  searchTutor?: TutorSearchItem
): TutorSummary {
  return {
    id: tutorId,
    profileId: profile._id,
    name: profile.userData?.name ?? "Tutor",
    avatar: getAvatarFromProfile(profile) ?? searchTutor?.avatar,
    title: profile.headline,
    subjects:
      searchTutor?.subjects.map(toSubjectSummary) ??
      (profile.languages.length > 0
        ? profile.languages.map(fallbackSubject)
        : [fallbackSubject("Tutoring")]),
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
  return {
    id: tutor.userId,
    profileId: tutor.profile.id || tutor._id || tutor.userId,
    name: tutor.name || "Tutor",
    avatar: tutor.avatar,
    title: tutor.profile.headline,
    subjects: tutor.subjects.map(toSubjectSummary),
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
        profileId: mockTutor._id,
        name: mockTutor.user.firstName + " " + mockTutor.user.lastName,
        avatar: undefined,
        title: mockTutor.headline,
        subjects: mockTutor.subjects.map((subject) =>
          fallbackSubject(subject.nameEn)
        ),
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

async function getSearchTutorById(id: string): Promise<TutorSearchItem | null> {
  const result = await searchTutors({ limit: 100, sortBy: "rating" })
  return (
    result.tutors.find(
      (tutor) =>
        tutor.userId === id || tutor.profile.id === id || tutor._id === id
    ) ?? null
  )
}

async function getAvailabilityLabels(tutorId: string): Promise<string[]> {
  try {
    const response = await api.get<ApiSuccess<TutorAvailabilityResponse>>(
      `/tutors/${tutorId}/availability`
    )
    const slots = response.data.data.slots ?? {}

    return Object.entries(slots)
      .filter(([, daySlots]) => daySlots.length > 0)
      .map(([day, daySlots]) => {
        const firstSlot = daySlots[0]
        return `${dayLabels[day] ?? day} ${firstSlot.startTime}-${firstSlot.endTime}`
      })
  } catch (error) {
    console.error("Failed to fetch tutor availability", { error, tutorId })
    return []
  }
}

export async function getTutorById(id: string): Promise<TutorSummary | null> {
  let searchTutor: TutorSearchItem | null = null

  try {
    searchTutor = await getSearchTutorById(id)
  } catch (error) {
    console.error("Failed to resolve tutor from tutor search", {
      error,
      tutorId: id,
    })
  }

  try {
    const response = await api.get<ApiSuccess<TutorProfileWithUser>>(
      `/tutors/${id}/profile`
    )

    const summary = toTutorSummary(response.data.data, id, searchTutor ?? undefined)
    const availability = await getAvailabilityLabels(summary.id)
    return {
      ...summary,
      availability:
        availability.length > 0
          ? availability
          : summary.isAvailable
            ? ["Available"]
            : [],
    }
  } catch (error) {
    console.error("Failed to fetch tutor profile by user id", {
      error,
      tutorId: id,
    })
  }

  if (searchTutor) {
    const summary = toTutorSummaryFromSearch(searchTutor)
    const availability = await getAvailabilityLabels(summary.id)
    return {
      ...summary,
      availability:
        availability.length > 0
          ? availability
          : summary.isAvailable
            ? ["Available"]
            : [],
    }
  }

  const tutors = await getTutors()
  return tutors.find((tutor) => tutor.id === id) || null
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
