import { mockTutor } from "@/mocks/mock-data"

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

export async function getTutors(): Promise<TutorSummary[]> {
  // ✅ لما الـ backend يخلص
  // const res = await api.get("/tutors")
  // return res.data

  return [
    {
      id: mockTutor._id,
      name: mockTutor.user.firstName + " " + mockTutor.user.lastName,
      title: mockTutor.headline,
      subjects: mockTutor.subjects.map((s) => s.nameEn),
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
  // ✅ لما الـ backend يخلص
  // const res = await api.get(`/tutors/${id}`)
  // return res.data

  const tutors = await getTutors()
  return tutors.find((t) => t.id === id) || null
}

export async function getTutorReviews(_id: string) {
  void _id

  // ✅ لما الـ backend يخلص
  // const res = await api.get(`/tutors/${id}/reviews`)
  // return res.data

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
