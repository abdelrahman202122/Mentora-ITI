 export async function getSubjectTitle(tutorId: string, subjectId: string): Promise<string> {
  const response = await fetch(`/api/tutors/${tutorId}/subjects/${subjectId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
  const body = await response.json()
  if (!response.ok || !body.success) throw new Error(body.message ?? "Failed to load subject.")
  return body.data.title
}