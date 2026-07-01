
'use client'

import { CreditCard, School, Timer, Video } from "lucide-react";
import StatCard from "@/components/tutor/StatCard";
import BookingCard from "@/components/tutor/BookingCard";
import { useMyBookings } from "@/hooks/booking/booking";
import { useAcceptBooking } from "@/hooks/booking/approveBooking";
import { useRejectBooking } from "@/hooks/booking/rejectBooking";
import { useCancelBooking } from "@/hooks/booking/cancelBooking";
import { useCurrentUser } from "@/hooks/auth/use-auth";
import { useTutorStats } from "@/hooks/tutor/useTutorStats";
import type { BookingStatus } from "@/services/booking-services/getMyBooking";
import { useState } from "react";
import { useTranslations } from "next-intl";

// ─── helpers ────────────────────────────────────────────────────────────────

// function minutesToHours(totalHours: number): string {
//   const h = Math.floor(totalHours);
//   const m = Math.round((totalHours - h) * 60);
//   return m > 0 ? `${h}h ${m}m` : `${h}h`;
// }

function formatCurrency(amount: number | undefined, currency: string = "USD"): string {
  try {
    if (typeof(amount) === "undefined") {
      return "faild to load"
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    if (typeof(amount) === "undefined") {
      return "faild to load"
    }
    return `${currency} ${amount.toLocaleString()}`;
  }
}

// ─── filter tabs ─────────────────────────────────────────────────────────────
// ─── component ───────────────────────────────────────────────────────────────

export default function InstructorDashboard() {
  const tStatus = useTranslations("bookingStatus");

const STATUS_FILTERS: { label: string; value: BookingStatus | "all" }[] = [
{ label: tStatus("all"),       value: "all"       },
  { label: tStatus("pending"),   value: "pending"   },
  { label: tStatus("confirmed"), value: "confirmed" },
  { label: tStatus("completed"), value: "completed" },
  { label: tStatus("canceled"),  value: "canceled"  },
  { label: tStatus("rejected"),  value: "rejected"  },
  { label: tStatus("expired"),   value: "expired"   },];


  const [activeFilter, setActiveFilter] = useState<BookingStatus | "all">("all");
  const [currentPage, setCurrentPage]   = useState(1);

  function handleFilterChange(value: BookingStatus | "all") {
    setActiveFilter(value);
    setCurrentPage(1);
  }

  // main bookings query (filtered + paginated)
  const { data, isLoading, isError } = useMyBookings(
    activeFilter !== "all"
      ? { bookingStatus: activeFilter, page: currentPage, limit: 10 }
      : { page: currentPage, limit: 10 }
  );

  const { data: currentUser } = useCurrentUser();

  // ── stats from dedicated endpoint ──────────────────────────────────────
  const { data: stats, isLoading: isStatsLoading } = useTutorStats();

  const {
    mutate: acceptBooking,
    isPending: isAccepting,
    variables: acceptingId,
  } = useAcceptBooking();

  const {
    mutate: rejectBooking,
    isPending: isRejecting,
    variables: rejectingId,
  } = useRejectBooking();

  const {
    mutate: cancelBooking,
    isPending: isCanceling,
    variables: cancelingVariables,
  } = useCancelBooking();

  const bookings   = data?.bookings ?? [];
  const totalPages = Math.max(data?.pagination?.totalPages ?? 1, 1);

  const displayName = currentUser?.name;

const t = useTranslations("tutorDashboard");

return (
  <div className="min-h-screen bg-background text-foreground">
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">

      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold">
          {t("welcomeBack") + (displayName ? `, ${displayName}` : "")}
        </h1>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={CreditCard}
          label={t("stats.totalEarnings")}
          value={isStatsLoading ? "…" : formatCurrency(stats?.totalEarnings)}
        />
        <StatCard
          icon={School}
          label={t("stats.totalSessions")}
          value={isStatsLoading ? "…" : String(stats?.totalSessions ?? t("stats.failedToLoad"))}
        />
        <StatCard
          icon={Timer}
          label={t("stats.hoursTaught")}
          value={isStatsLoading ? "…" : stats?.totalHours != null ? `${stats.totalHours}h` : t("stats.failedToLoad")}
        />
      </section>

      {/* Start Session */}
      <section className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground p-8">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-2">
            <Video className="w-6 h-6" />
            <h3 className="text-xl font-bold">{t("startSession.title")}</h3>
          </div>
          <p className="font-medium">Organic Chemistry with Alex Harrison</p>
          <p className="text-sm text-white/80 max-w-lg">
            {t("startSession.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <input
              placeholder={t("startSession.inputPlaceholder")}
              className="flex-1 rounded-xl px-4 py-3 bg-white/10 border border-white/20 placeholder:text-white/60 outline-none focus-visible:ring-primary"
            />
            <button className="btn-primary bg-white text-primary hover:bg-white/90">
              {t("startSession.verifyButton")}
            </button>
          </div>
        </div>
      </section>

      {/* Bookings */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{t("bookings.title")}</h2>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handleFilterChange(value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeFilter === value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="text-muted-foreground text-sm py-6 text-center">
            {t("bookings.loading")}
          </div>
        )}
        {isError && (
          <div className="text-red-500 text-sm py-6 text-center">
            {t("bookings.error")}
          </div>
        )}
        {!isLoading && !isError && bookings.length === 0 && (
          <div className="text-muted-foreground text-sm py-6 text-center">
            {t("bookings.empty")}
          </div>
        )}

        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onApprove={() => acceptBooking(booking._id)}
              onReject={() => rejectBooking(booking._id)}
              onCancel={() =>
                cancelBooking({
                  bookingId: booking._id,
                  cancelReason: t("bookings.cancelReason"),
                })
              }
              isApproving={isAccepting && acceptingId === booking._id}
              isRejecting={isRejecting && rejectingId === booking._id}
              isCanceling={isCanceling && cancelingVariables?.bookingId === booking._id}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
            >
              {t("bookings.previous")}
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                    page === currentPage
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:border-primary hover:text-primary"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
            >
              {t("bookings.next")}
            </button>
          </div>
        )}
      </section>

    </div>
  </div>
);}