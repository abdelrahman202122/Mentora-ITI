
"use client"

import { initiateCheckout } from "@/services/payment/paymentService"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Calendar, Clock, Hourglass, ArrowLeft, AlertCircle, Loader2, BadgeCheck, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { BookingDetails } from "@/types/bookingProcess/booking"
import { getBookingById } from "@/services/booking-services/bookingDetailsService"
import { cancelBooking } from "@/services/booking-services/cancelBooking"
import { useTranslations } from "next-intl"
import { LearnerReviewCard } from "@/components/reviews/LearnerReviewCard"

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", { 
    day: "2-digit", 
    month: "long", 
    year: "numeric" 
  })
}

function formatTime(iso: string, locale: string) {
  return new Date(iso).toLocaleTimeString(locale === "ar" ? "ar-EG" : "en-GB", { 
    hour: "2-digit", 
    minute: "2-digit" 
  })
}

function StatusBadge({ status }: { status: BookingDetails["bookingStatus"] }) {
  const t = useTranslations("BookingDetails")
  const map: Record<string, { label: string; className: string }> = {
    pending:   { label: t("statuses.pending"),   className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    confirmed: { label: t("statuses.confirmed"), className: "bg-green-100 text-green-700 border-green-200" },
    completed: { label: t("statuses.completed"), className: "bg-blue-100 text-blue-700 border-blue-200" },
    canceled:  { label: t("statuses.canceled"),  className: "bg-red-100 text-red-600 border-red-200" },
  }
  const s = map[status] ?? map.pending
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${s.className}`}>
      {s.label}
    </span>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b last:border-0 gap-1 sm:gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground sm:text-end">{value}</span>
    </div>
  )
}

export default function BookingDetailsPage() {
  const t = useTranslations("BookingDetails")
  const params = useParams()
  const bookingId = params.bookingId as string | undefined
  const locale = (params.locale as string) ?? "en"
  const isRtl = locale === "ar"

  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(Boolean(bookingId))
  const [error, setError] = useState<string | null>(() =>
    bookingId ? null : t("bookingIdNotFound")
  )

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [canceling, setCanceling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  const [isPaying, setIsPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  useEffect(() => {
    if (!bookingId) {
      return
    }

    getBookingById(bookingId)
      .then(setBooking)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [bookingId, t])

  async function handleCancel() {
    if (!bookingId) {
      setCancelError(t("bookingIdNotFound"))
      return
    }

    if (!cancelReason.trim()) {
      setCancelError(t("cancelReasonError"))
      return
    }

    setCanceling(true)
    setCancelError(null)

    try {
      const updatedData = await cancelBooking(bookingId, cancelReason)
      
      setBooking((prevBooking) => {
        if (!prevBooking) return null
        return {
          ...prevBooking,
          ...updatedData,
          bookingStatus: updatedData?.bookingStatus ?? "canceled",
          canceledBy: updatedData?.canceledBy ?? prevBooking.canceledBy,
          cancelReason: updatedData?.cancelReason ?? cancelReason,
          canceledAt: updatedData?.canceledAt ?? new Date().toISOString(),
        }
      })

      setShowCancelModal(false)
      setCancelReason("")
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : t("genericError"))
    } finally {
      setCanceling(false)
    }
  }

  async function handlePayNow() {
    if (!booking) return
    setIsPaying(true)
    setPayError(null)
    try {
      const { checkoutUrl } = await initiateCheckout(booking._id)

      if (!checkoutUrl || typeof checkoutUrl !== "string" || !checkoutUrl.startsWith("http")) {
        setPayError(t("paymentInitError"))
        setIsPaying(false)
        return
      }

      window.location.assign(checkoutUrl)
    } catch (err) {
      setPayError(err instanceof Error ? err.message : t("paymentFailedError"))
      setIsPaying(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-12 font-sans">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-2 text-sidebar-primary hover:underline px-0">
            <Link href={`/${locale}/dashboard`}>
              <ArrowLeft size={16} className={cn(isRtl && "rotate-180")} aria-hidden />
              {t("backToBookings")}
            </Link>
          </Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
            <Loader2 size={20} className="animate-spin" />
            <span>{t("loading")}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {!loading && !error && booking && (
          <>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xl font-bold">{t("title")}</CardTitle>
                <StatusBadge status={booking.bookingStatus} />
              </CardHeader>

              <CardContent className="space-y-1">

                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t("session")}</p>
                <Row label={t("date")} value={
                  <span className="flex items-center gap-2">
                    <Calendar size={14} className="text-muted-foreground" />
                    {formatDate(booking.startAt, locale)}
                  </span>
                } />
                <Row label={t("time")} value={
                  <span className="flex items-center gap-2">
                    <Clock size={14} className="text-muted-foreground" />
                    {formatTime(booking.startAt, locale)} - {formatTime(booking.endAt, locale)}
                  </span>
                } />
                <Row label={t("duration")} value={
                  <span className="flex items-center gap-2">
                    <Hourglass size={14} className="text-muted-foreground" />
                    {booking.durationMinutes} {t("minutes")}
                  </span>
                } />

                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">{t("payment")}</p>
                <Row label={t("price")} value={`${booking.price} ${booking.currency}`} />
                <Row label={t("paymentStatus")} value={
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    booking.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}>
                    {booking.paymentStatus === "paid"
                      ? <><BadgeCheck size={12} /> {t("paid")}</>
                      : <><XCircle size={12} /> {t("unpaid")}</>
                    }
                  </span>
                } />

                {booking.learnerNote && (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">{t("yourNote")}</p>
                    <p className="text-sm text-foreground bg-sidebar/30 rounded-xl px-4 py-3">{booking.learnerNote}</p>
                  </>
                )}

                {booking.bookingStatus === "canceled" && (
                  <>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">{t("cancellation")}</p>
                    {booking.canceledBy && <Row label={t("canceledBy")} value={booking.canceledBy} />}
                    {booking.cancelReason && <Row label={t("reason")} value={booking.cancelReason} />}
                    {booking.canceledAt && <Row label={t("canceledAt")} value={formatDate(booking.canceledAt, locale)} />}
                  </>
                )}

                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">{t("info")}</p>
                <Row label={t("bookingId")} value={<span className="font-mono text-xs">{booking._id}</span>} />
                <Row label={t("createdAt")} value={formatDate(booking.createdAt, locale)} />

              </CardContent>
            </Card>

            {payError && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mt-4">
                <AlertCircle size={16} className="shrink-0" />
                <span>{payError}</span>
              </div>
            )}

            {booking.bookingStatus !== "canceled" && booking.bookingStatus !== "completed" && (
              <div className="flex gap-3 mt-4">
                {booking.bookingStatus === "confirmed" && booking.paymentStatus === "unpaid" && (
                  <Button onClick={handlePayNow} disabled={isPaying} className="flex-1 h-12 rounded-xl">
                    {isPaying ? (
                      <><Loader2 size={16} className="animate-spin" /> {t("processing")}</>
                    ) : (
                      t("payNow")
                    )}
                  </Button>
                )}

                {(booking.bookingStatus === "pending" || booking.bookingStatus === "confirmed") && (
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelModal(true)}
                    className="flex-1 h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                    disabled={isPaying}
                  >
                    {t("cancelBooking")}
                  </Button>
                )}
              </div>
            )}

            {booking.bookingStatus === "completed" && (
              <LearnerReviewCard
                bookingId={booking._id}
                alreadyReviewed={Boolean(booking.reviewId)}
                onReviewCreated={(reviewId) => {
                  setBooking((currentBooking) =>
                    currentBooking ? { ...currentBooking, reviewId } : currentBooking
                  )
                }}
              />
            )}
          </>
        )}

        {/* Modal الإلغاء */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="cancel-modal-title"
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <h3
                id="cancel-modal-title"
                className="text-lg font-bold text-foreground mb-1"
              >
                {t("cancelModalTitle")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("cancelModalDesc")}
              </p>

              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={t("cancelPlaceholder")}
                className="min-h-24 resize-none rounded-xl"
              />

              {cancelError && (
                <p className="text-red-600 text-xs mt-2">{cancelError}</p>
              )}

              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => { setShowCancelModal(false); setCancelReason(""); setCancelError(null) }}
                  className="flex-1 h-11 rounded-xl"
                  disabled={canceling}
                >
                  {t("goBack")}
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={canceling}
                  className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white"
                >
                  {canceling ? (
                    <><Loader2 size={14} className="animate-spin" /> {t("canceling")}</>
                  ) : (
                    t("confirmCancel")
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
