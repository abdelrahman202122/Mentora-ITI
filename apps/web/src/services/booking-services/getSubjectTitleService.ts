export async function getSubjectTitle(tutorId: string, subjectId: string): Promise<string> {
  const response = await fetch(`/api/tutors/${tutorId}/subjects/${subjectId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
  const body = await response.json()

  if (!response.ok || !body.success) {
    throw new Error(body.message ?? "Failed to load subject.")
  }

  // success === true should always come with data.title as a string — if it
  // doesn't, the API broke its own contract, and silently returning undefined
  // here would later render as "undefined" in the booking card instead of
  // failing loudly where the bug actually is
  if (!body.data || typeof body.data.title !== "string") {
    throw new Error("Failed to load subject.")
  }

  return body.data.title
}