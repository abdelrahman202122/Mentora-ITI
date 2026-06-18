import type { TutorSummary } from "@/lib/api/tutors"

export default function TutorProfile({ tutor }: { tutor: TutorSummary | null }) {
  if (!tutor) return <div className="p-6 text-gray-500">Tutor not found.</div>

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* Hero */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-semibold">
          {tutor.name?.charAt(0) ?? '?'}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{tutor.name}</h1>
          <p className="text-gray-500">{tutor.title}</p>
          <span>⭐ {tutor.rating} ({tutor.totalReviews} reviews)</span>
        </div>
        <button className="ml-auto border px-4 py-2 rounded-lg">
          Chat with {tutor.name}
        </button>
      </div>

      {/* About */}
      {tutor.bio && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">About Me</h2>
          <p className="text-gray-600">{tutor.bio}</p>
        </section>
      )}

      {/* Subjects */}
      {tutor.subjects?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Courses Offered</h2>
          <div className="flex gap-2 flex-wrap">
            {tutor.subjects.map((s: string) => (
              <span key={s} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Book button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg">
          Book a Session — ${tutor.hourlyRate}/hr
        </button>
      </div>

    </div>
  )
}
