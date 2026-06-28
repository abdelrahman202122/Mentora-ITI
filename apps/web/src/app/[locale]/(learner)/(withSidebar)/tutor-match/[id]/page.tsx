"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Star, MessageSquare, ArrowLeft, Clock, Users, Calendar } from "lucide-react"
import { getTutorById, type TutorSummary } from "@/services/tutorsLearner/tutor"

export default function TutorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const [tutor, setTutor] = useState<TutorSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const tutorData = await getTutorById(params.id as string)
        setTutor(tutorData)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!tutor) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Tutor not found.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Back */}
      <Link
        href={`/${locale}/tutor-match`}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-4"
      >
        <ArrowLeft size={16} />
        Back to Tutors
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-4">

        <div className="flex items-start gap-3 mb-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="text-base md:text-xl font-bold text-gray-800 leading-tight">
              {tutor.name}
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mb-2">
              {tutor.title}
            </p>
            <div className="flex items-center gap-1 flex-wrap">
              <Star size={13} className="text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-gray-700">
                {tutor.rating}
              </span>
              <span className="text-xs text-indigo-500">
                ({tutor.totalReviews} reviews)
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              <div className="flex items-center gap-1 text-gray-500">
                <Users size={12} />
                <span className="text-xs">{tutor.totalStudents} students</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock size={12} />
                <span className="text-xs">{tutor.hourlyRate} {tutor.currency}/hr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Button */}
        <button
          onClick={async () => {
            // const chatId = await startConversation(tutor.id, tutor.name)
            const qs = new URLSearchParams({ tutorName: tutor.name }).toString()
            // router.push(`/${locale}/learner/messages/${chatId}?${qs}`)
          }}
          className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
        >
          <MessageSquare size={15} />
          Chat with {tutor.name}
        </button>

        {/* About Me */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h2 className="text-sm font-bold text-gray-800 mb-2">About Me</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{tutor.bio}</p>
        </div>

        {/* Availability */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h2 className="text-sm font-bold text-gray-800 mb-2">
            <Calendar size={13} className="inline mr-1" />
            Availability
          </h2>
          <div className="flex flex-wrap gap-2">
            {tutor.availability.map((day: string) => (
              <span
                key={day}
                className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full"
              >
                {day}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Courses Offered */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-4">
        <h2 className="text-base font-bold text-gray-800 mb-4">
          Courses Offered
        </h2>
        <div className="flex flex-col gap-4">
          {tutor.subjects.map((subject: string) => (
            <div
              key={subject}
              className="flex items-start gap-3 border border-gray-100 rounded-xl p-3"
            >
              <div className="w-16 h-14 rounded-lg bg-gray-200 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  {subject}
                </p>
                <p className="text-xs text-indigo-600 font-medium mb-1">
                  {tutor.hourlyRate} {tutor.currency} / hour session
                </p>
                <p className="text-xs text-gray-400 mb-2">
                  A deep dive into {subject.toLowerCase()} concepts for all levels.
                </p>
                <div className="flex flex-wrap gap-1">
                  {tutor.availability.slice(0, 3).map((day: string) => (
                    <span
                      key={day}
                      className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

 
<div className="fixed bottom-6 right-6 z-50 animate-fade-in">
  <Link
    href={
      `/${locale}/booking` +
      `?tutorId=${tutor.id}` +
      `&tutorName=${encodeURIComponent(tutor.name)}` +
      `&hourlyRate=${tutor.hourlyRate}` +
      `&currency=${encodeURIComponent(tutor.currency)}` +
      `&subject=${encodeURIComponent(tutor.subjects[0] || "General Session")}`
    }
    className="bg-sidebar-primary text-sidebar-primary-foreground px-6 py-4 rounded-xl shadow-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer text-sm md:text-base"
  >
    <span>Book a Session — {tutor.hourlyRate} {tutor.currency}/hr</span>
  </Link>
</div>
    </div>
  )
}