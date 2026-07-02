
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
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

import { Button } from "@/components/ui/button"
import { useCreateChat } from "@/hooks/chat/use-chat"
import { getTutorById, type TutorSummary } from "@/services/tutorsLearner/tutor"
import { getLocalePath } from "@/utils/i18n/locale-path"
import { useTranslations } from "next-intl"

function getAvatarSrc(avatar?: string) {
  const rawAvatar = avatar?.trim()

  if (!rawAvatar) {
    return null
  }

  if (rawAvatar.startsWith("http")) {
    try {
      const url = new URL(rawAvatar)
      return `${url.pathname}${url.search}`
    } catch {
      return rawAvatar
    }
  }

  if (rawAvatar.startsWith("/api/files/avatars/")) {
    return rawAvatar
  }

  if (rawAvatar.startsWith("/files/avatars/")) {
    return `/api${rawAvatar}`
  }

  if (rawAvatar.startsWith("/")) {
    return rawAvatar
  }

  return `/api/files/avatars/${rawAvatar}`
}

export default function TutorProfilePage() {
  const t = useTranslations("TutorProfile")
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = params.locale as string
  const [tutor, setTutor] = useState<TutorSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const createChat = useCreateChat()

  useEffect(() => {
    async function fetchData() {
      try {
        const tutorData = await getTutorById(params.id as string, locale)
        setTutor(tutorData)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [locale, params.id])

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
  const generalSessionLabel = t("generalSession")
  const bookingHref =
    getLocalePath(locale, "/booking") +
    `?tutorProfileId=${tutor.profileId}` +
    `&tutorId=${tutor.id}` +
    `&tutorName=${encodeURIComponent(tutor.name)}` +
    `&hourlyRate=${tutor.hourlyRate}` +
    `&currency=${encodeURIComponent(tutor.currency)}` +
    `&subject=${encodeURIComponent(primarySubject?.title || generalSessionLabel)}` +
    `&subjectId=${primarySubject?.id ?? ""}`
  const backToTutorsHref = `${getLocalePath(locale, "/find-tutor")}?${
    searchParams.toString() || "mode=browse"
  }`

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back to Tutors Link */}
      <Button
        asChild
        variant="ghost"
        className="mb-4 px-0 text-muted-foreground hover:text-primary"
      >
        <Link href={backToTutorsHref}>
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("backToTutors")}
        </Link>
      </Button>

      <div className="mb-4 rounded-xl bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-gray-100 bg-gray-100 md:h-20 md:w-20">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={`${tutor.name} avatar`}
                fill
                unoptimized
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
              {tutor.totalStudents > 0 ? (
                <div className="flex items-center gap-1 text-gray-500">
                  <Users size={12} />
                  <span className="text-xs">{t("students", { count: tutor.totalStudents })}</span>
                </div>
              ) : null}
              <div className="flex items-center gap-1 text-gray-500">
                <Clock size={12} />
                <span className="text-xs">
                  {t("hourlyRate", { rate: tutor.hourlyRate, currency: tutor.currency })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Button
          disabled={createChat.isPending}
          onClick={() => void handleStartChat()}
          type="button"
          variant="outline"
          className="w-full"
        >
          {createChat.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MessageSquare className="size-4" />
          )}
          {createChat.isPending ? t("startingChat") : t("chatWith", { name: tutor.name })}
        </Button>

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
                {t("availabilityEmpty")}
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
          {tutor.subjects.length > 0 ? tutor.subjects.map((subject) => (
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
                  {subject.description ||
                    [subject.educationLevel, subject.curriculum, subject.gradeNote]
                      .filter(Boolean)
                      .join(" • ")}
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
          )) : (
            <p className="text-sm text-muted-foreground">{t("noSubjects")}</p>
          )}
        </div>
      </div>

      {/* Booking Floating Action Button */}
      <div className="fixed bottom-6 ltr:right-6 rtl:left-6 z-50 animate-fade-in">
        {canBook ? (
          <Button asChild size="lg" className="h-auto px-6 py-4 shadow-xl">
            <Link href={bookingHref}>
              <span>{t("bookSession", { rate: tutor.hourlyRate, currency: tutor.currency })}</span>
            </Link>
          </Button>
        ) : (
          <Button
            disabled
            type="button"
            size="lg"
            variant="secondary"
            className="h-auto px-6 py-4 shadow-xl"
          >
            {t("noBookableSubject")}
          </Button>
        )}
      </div>
    </div>
  )
}
