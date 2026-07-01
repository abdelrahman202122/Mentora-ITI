"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Loader2,
  MessageSquare,
  Star,
  Users,
} from "lucide-react"
import { useCreateChat } from "@/hooks/chat/use-chat"
import { getTutorById, type TutorSummary } from "@/services/tutorsLearner/tutor"
import { getLocalePath } from "@/utils/i18n/locale-path"

function getAvatarSrc(avatar?: string) {
  if (!avatar) {
    return null
  }

  if (avatar.startsWith("http") || avatar.startsWith("/")) {
    return avatar
  }

  return `/api/files/avatars/${avatar}`
}

export default function TutorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const locale = params.locale as string
  const [tutor, setTutor] = useState<TutorSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const createChat = useCreateChat()

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
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!tutor) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-400">Tutor not found.</p>
      </div>
    )
  }

  async function handleStartChat() {
    if (!tutor) {
      return
    }

    try {
      const chat = await createChat.mutateAsync({ tutorId: tutor.id })
      router.push(getLocalePath(locale, `/messages/${chat.id}`))
    } catch (error) {
      console.error("Failed to start tutor chat", {
        error,
        tutorId: tutor.id,
      })
    }
  }

  const avatarSrc = getAvatarSrc(tutor.avatar)
  const primarySubject = tutor.subjects[0]
  const canBook = Boolean(tutor.profileId && primarySubject?.id)
  const bookingHref =
    getLocalePath(locale, "/booking") +
    `?tutorProfileId=${tutor.profileId}` +
    `&tutorId=${tutor.id}` +
    `&tutorName=${encodeURIComponent(tutor.name)}` +
    `&hourlyRate=${tutor.hourlyRate}` +
    `&currency=${encodeURIComponent(tutor.currency)}` +
    `&subject=${encodeURIComponent(primarySubject?.title || "General Session")}` +
    `&subjectId=${primarySubject?.id ?? ""}`

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={getLocalePath(locale, "/find-tutor?mode=browse")}
        className="mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600"
      >
        <ArrowLeft size={16} />
        Back to Tutors
      </Link>

      <div className="mb-4 rounded-xl bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-gray-100 bg-gray-100 md:h-20 md:w-20">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={`${tutor.name} avatar`}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-gray-500">
                {tutor.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold leading-tight text-gray-800 md:text-xl">
              {tutor.name}
            </h1>
            <p className="mb-2 text-xs text-gray-500 md:text-sm">
              {tutor.title}
            </p>
            <div className="flex flex-wrap items-center gap-1">
              <Star size={13} className="fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700">
                {tutor.rating}
              </span>
              <span className="text-xs text-indigo-500">
                ({tutor.totalReviews} reviews)
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              <div className="flex items-center gap-1 text-gray-500">
                <Users size={12} />
                <span className="text-xs">{tutor.totalStudents} students</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock size={12} />
                <span className="text-xs">
                  {tutor.hourlyRate} {tutor.currency}/hr
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          disabled={createChat.isPending}
          onClick={() => void handleStartChat()}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
        >
          {createChat.isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <MessageSquare size={15} />
          )}
          {createChat.isPending ? "Starting chat..." : `Chat with ${tutor.name}`}
        </button>

        {createChat.error ? (
          <p className="mt-2 text-sm font-medium text-red-600">
            {createChat.error.message}
          </p>
        ) : null}

        <div className="mt-4 border-t border-gray-100 pt-4">
          <h2 className="mb-2 text-sm font-bold text-gray-800">About Me</h2>
          <p className="text-sm leading-relaxed text-gray-500">{tutor.bio}</p>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-4">
          <h2 className="mb-2 text-sm font-bold text-gray-800">
            <Calendar size={13} className="mr-1 inline" />
            Availability
          </h2>
          <div className="flex flex-wrap gap-2">
            {tutor.availability.length > 0 ? (
              tutor.availability.map((day) => (
                <span
                  key={day}
                  className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-600"
                >
                  {day}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">
                Availability not published yet.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-xl bg-white p-4 shadow-sm md:p-6">
        <h2 className="mb-4 text-base font-bold text-gray-800">
          Courses Offered
        </h2>
        <div className="flex flex-col gap-4">
          {tutor.subjects.map((subject) => (
            <div
              key={subject.id || subject.title}
              className="flex items-start gap-3 rounded-xl border border-gray-100 p-3"
            >
              <div className="flex h-14 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <BookOpen size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-sm font-semibold text-gray-800">
                  {subject.title}
                </p>
                <p className="mb-1 text-xs font-medium text-indigo-600">
                  {tutor.hourlyRate} {tutor.currency} / hour session
                </p>
                <p className="mb-2 text-xs text-gray-400">
                  {[subject.educationLevel, subject.curriculum]
                    .filter(Boolean)
                    .join(" • ") || "Personalized tutoring session"}
                </p>
                <div className="flex flex-wrap gap-1">
                  {tutor.availability.slice(0, 3).map((day) => (
                    <span
                      key={day}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
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
        {canBook ? (
          <Link
            href={bookingHref}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-sidebar-primary px-6 py-4 text-sm font-bold text-sidebar-primary-foreground shadow-xl transition-opacity hover:opacity-90 md:text-base"
          >
            <span>
              Book a Session - {tutor.hourlyRate} {tutor.currency}/hr
            </span>
          </Link>
        ) : (
          <button
            className="flex cursor-not-allowed items-center gap-2 rounded-xl bg-gray-300 px-6 py-4 text-sm font-bold text-gray-600 shadow-xl md:text-base"
            disabled
            type="button"
          >
            No bookable subject available
          </button>
        )}
      </div>
    </div>
  )
}
