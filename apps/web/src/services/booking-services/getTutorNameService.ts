


import api from "@/lib/axios"
 
export async function getTutorName(tutorId: string): Promise<string> {
  const response = await api.get(`/tutors/${tutorId}/profile`)
  const body = response.data
 
  if (!body.success) {
    throw new Error(body.message ?? "Failed to load tutor profile.")
  }
 
  if (!body.data || !body.data.userData || typeof body.data.userData.name !== "string") {
    throw new Error("Failed to load tutor profile.")
  }
 
  return body.data.userData.name
}
 