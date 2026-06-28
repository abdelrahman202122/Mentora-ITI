


import api from "@/lib/axios"

export async function getSubjectTitle(tutorId: string, subjectId: string): Promise<string> {
  const response = await api.get(`/tutors/${tutorId}/subjects/${subjectId}`)
  const body = response.data

  if (!body.success) {
    throw new Error(body.message ?? "Failed to load subject.")
  }

  if (!body.data || typeof body.data.title !== "string") {
    throw new Error("Failed to load subject.")
  }

  return body.data.title
}