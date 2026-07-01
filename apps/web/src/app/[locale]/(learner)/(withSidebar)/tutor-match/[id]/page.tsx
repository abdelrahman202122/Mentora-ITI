
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
import { useTranslations } from "next-intl"

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
  const t = useTranslations("TutorProfile")
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
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <p className="text-gray-400">{t("loading")}</p>
      </div>
    )
  }

  if (!tutor) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <p className="text-gray-400">{t("tutorNotFound")}</p>
      </div>
    )
  }

  async function handleStartChat() {
    if (!tutor) return

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
      {/* Back to Tutors Link */}
      <Link
        href={getLocalePath(locale, "/find-tutor?mode=browse")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-4 inline-flex"
      >
        <ArrowLeft size={16} className="rtl:rotate-180" />
        {t("backToTutors")}
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
                {t("reviews", { count: tutor.totalReviews })}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              <div className="flex items-center gap-1 text-gray-500">
                <Users size={12} />
                <span className="text-xs">{t("students", { count: tutor.totalStudents })}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock size={12} />
                <span className="text-xs">
                  {t("hourlyRate", { rate: tutor.hourlyRate, currency: tutor.currency })}
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
          {createChat.isPending ? t("startingChat") : t("chatWith", { name: tutor.name })}
        </button>

        {createChat.error ? (
          <p className="mt-2 text-sm font-medium text-red-600">
            {createChat.error.message}
          </p>
        ) : null}

        {/* About Me */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h2 className="text-sm font-bold text-gray-800 mb-2">{t("aboutMe")}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{tutor.bio}</p>
        </div>

        {/* Availability */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h2 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1">
            <Calendar size={13} />
            {t("availability")}
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

      {/* Courses Offered */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm mb-4">
        <h2 className="text-base font-bold text-gray-800 mb-4">
          {t("coursesOffered")}
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
                <p className="text-xs text-indigo-600 font-medium mb-1">
                  {t("hourSession", { rate: tutor.hourlyRate, currency: tutor.currency })}
                </p>
                <p className="text-xs text-gray-400 mb-2">
                  {t("deepDive", { subject: subject.title.toLowerCase() })}
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

      {/* Booking Floating Action Button */}
      <div className="fixed bottom-6 ltr:right-6 rtl:left-6 z-50 animate-fade-in">
        {canBook ? (
          <Link
            href={bookingHref}
            className="bg-sidebar-primary text-sidebar-primary-foreground px-6 py-4 rounded-xl shadow-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer text-sm md:text-base"
          >
            <span>{t("bookSession", { rate: tutor.hourlyRate, currency: tutor.currency })}</span>
          </Link>
        ) : (
          <button
            className="bg-gray-300 text-gray-600 px-6 py-4 rounded-xl shadow-xl font-bold flex items-center gap-2 text-sm md:text-base cursor-not-allowed"
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
