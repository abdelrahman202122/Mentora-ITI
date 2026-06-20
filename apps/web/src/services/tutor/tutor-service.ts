// export async function getTutors() {
//   return [
//     {
//       id: 1,
//       name: "Dr. Sarah Jenkins",
//       title: "PhD in Computer Science",
//       subjects: ["Advanced Python", "Machine Learning"],
//       rating: 4.9,
//       bio: "I have 10 years of experience teaching Computer Science and Machine Learning at university level.",
//       hourlyRate: 45,
//       availability: ["Monday", "Wednesday", "Friday"],
//       totalReviews: 128,
//       totalStudents: 340,
//     },
//     {
//       id: 2,
//       name: "Marcus Thorne",
//       title: "Master of Pure Mathematics",
//       subjects: ["Calculus", "Linear Algebra"],
//       rating: 4.8,
//       bio: "Passionate mathematics tutor with 7 years of experience helping students achieve their goals.",
//       hourlyRate: 35,
//       availability: ["Tuesday", "Thursday", "Saturday"],
//       totalReviews: 95,
//       totalStudents: 210,
//     },
//     {
//       id: 3,
//       name: "Elena Rodriguez",
//       title: "Senior Frontend Architect",
//       subjects: ["React JS", "Tailwind CSS"],
//       rating: 5.0,
//       bio: "Senior frontend developer with 8 years of experience in React and modern web technologies.",
//       hourlyRate: 55,
//       availability: ["Monday", "Tuesday", "Thursday"],
//       totalReviews: 76,
//       totalStudents: 180,
//     },
//     {
//       id: 4,
//       name: "David Chen",
//       title: "Astrophysicist & Educator",
//       subjects: ["Quantum Mechanics", "Thermodynamics"],
//       rating: 4.7,
//       bio: "PhD in Astrophysics with a passion for making complex science accessible to everyone.",
//       hourlyRate: 50,
//       availability: ["Wednesday", "Friday", "Sunday"],
//       totalReviews: 60,
//       totalStudents: 145,
//     },
//      {
//       id: 5,
//       name: "Dr. lydia  Jenkins",
//       title: "PhD in Computer Science",
//       subjects: ["Advanced Python", "Machine Learning"],
//       rating: 4.9,
//       bio: "I have 10 years of experience teaching Computer Science and Machine Learning at university level.",
//       hourlyRate: 45,
//       availability: ["Monday", "Wednesday", "Friday"],
//       totalReviews: 128,
//       totalStudents: 340,
//     },
//   ]
// }

// export async function getTutorById(id: number) {
//   const tutors = await getTutors()
//   console.log('looking for id:', id, typeof id)        // 👈 add this
//   console.log('available ids:', tutors.map(t => ({ id: t.id, type: typeof t.id })))  // 👈 add this
//   return tutors.find((t) => t.id === id) || null
// }


// export async function getTutorReviews(id: number) {
//   return [
//     {
//       id: 1,
//       learnerName: "Ahmed Hassan",
//       rating: 5,
//       comment: "Excellent tutor! Very clear explanations and patient.",
//       date: "Oct 15, 2025",
//     },
//     {
//       id: 2,
//       learnerName: "Sara Mohamed",
//       rating: 4,
//       comment: "Great sessions, very knowledgeable and helpful.",
//       date: "Oct 10, 2025",
//     },
//     {
//       id: 3,
//       learnerName: "Omar Khaled",
//       rating: 5,
//       comment: "Best tutor I've had. Highly recommend!",
//       date: "Oct 5, 2025",
//     },
//   ]
// }


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
