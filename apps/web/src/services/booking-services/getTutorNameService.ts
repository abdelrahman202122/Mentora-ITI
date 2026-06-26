 export async function getTutorName(tutorId: string): Promise<string> {
  const response = await fetch(`/api/tutors/${tutorId}/profile`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
  const body = await response.json()
  if (!response.ok || !body.success) throw new Error(body.message ?? "Failed to load tutor profile.")
  return body.data.userData.name
}