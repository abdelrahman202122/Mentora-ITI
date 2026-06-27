export async function getTutorName(tutorId: string): Promise<string> {
  const response = await fetch(`/api/tutors/${tutorId}/profile`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
  const body = await response.json()

  if (!response.ok || !body.success) {
    throw new Error(body.message ?? "Failed to load tutor profile.")
  }

  // success === true should always come with data.userData.name as a string
  // — if the nested payload is incomplete, dereferencing straight through
  // (data.userData.name) would throw a raw "Cannot read properties of
  // undefined" instead of a clear, contract-style error
  if (!body.data || !body.data.userData || typeof body.data.userData.name !== "string") {
    throw new Error("Failed to load tutor profile.")
  }

  return body.data.userData.name
}