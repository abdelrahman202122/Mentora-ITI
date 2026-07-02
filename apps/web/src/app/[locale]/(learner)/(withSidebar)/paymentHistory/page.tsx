"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Download, Loader2, AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { getMyPayments, type Payment } from "@/services/payment/paymentHistory"
import { getMyBookings } from "@/services/booking-services/getMyBookingService"
import { getSubjectTitle } from "@/services/booking-services/getSubjectTitleService"
import { getTutorName } from "@/services/booking-services/getTutorNameService"
import PaymentFilter from "@/components/learner/PaymentFilter"
import PaymentTable from "@/components/learner/paymentTable"
import PaymentMobileList from "@/components/learner/PaymentMobileList"
import { exportCSV, exportInvoicePDF } from "@/utils/learner/exportUtils"
import { type Transaction } from "@/services/paymentHistory/payment-history-service"
import { Button } from "@/components/ui/button"

const ITEMS_PER_PAGE = 4

function formatDate(iso: string | null, locale = "en"): string {
  if (!iso) return "-"
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const statusLabelMap: Record<Payment["status"], Transaction["status"]> = {
  success: "Completed",
  failed: "Failed",
  refunded: "Refunded",
  pending: "Pending",
}

const statusTranslationKeys: Record<Payment["status"], string> = {
  success: "status.success",
  failed: "status.failed",
  refunded: "status.refunded",
  pending: "status.pending",
}

function StatusBadge({
  status,
  t,
}: {
  status: Payment["status"]
  t: ReturnType<typeof useTranslations<"Payments">>
}) {
  const map: Record<string, { color: string }> = {
    success: { color: "text-green-600" },
    failed: { color: "text-red-500" },
    refunded: { color: "text-yellow-600" },
    pending: { color: "text-yellow-400" },
  }
  const s = map[status] ?? map.pending
  const label = t(statusTranslationKeys[status])
  return (
    <span className={`flex items-center gap-1 font-semibold text-sm ${s.color}`}>
      <span className="w-2 h-2 rounded-full bg-current" />
      {label}
    </span>
  )
}

function subjectKey(tutorId: string, subjectId: string): string {
  return `${tutorId}_${subjectId}`
}

export default function PaymentsPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) ?? "en"
  const t = useTranslations("Payments")

  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const [subjectTitles, setSubjectTitles] = useState<Record<string, string>>({})
  const [tutorNames, setTutorNames] = useState<Record<string, string>>({})
  const [durations, setDurations] = useState<Record<string, number>>({})

  const [showFilter, setShowFilter] = useState(false)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [appliedFrom, setAppliedFrom] = useState("")
  const [appliedTo, setAppliedTo] = useState("")
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const [paymentsData, bookingsData] = await Promise.all([
          getMyPayments(),
          getMyBookings(),
        ])

        const bookingMap = new Map(bookingsData.map((b) => [b._id, b]))
        const uniqueTutorIds = [...new Set(bookingsData.map((b) => b.tutorId))]
        const uniquePairs = [
          ...new Map(bookingsData.map((b) => [subjectKey(b.tutorId, b.subjectId), b])).values()
        ]

        const [tutorResults, subjectResults] = await Promise.all([
          Promise.allSettled(
            uniqueTutorIds.map((id) => getTutorName(id).then((name) => ({ id, name })))
          ),
          Promise.allSettled(
            uniquePairs.map((b) =>
              getSubjectTitle(b.tutorId, b.subjectId).then((title) => ({
                key: subjectKey(b.tutorId, b.subjectId),
                title,
              }))
            )
          ),
        ])

        const tutorNameMap: Record<string, string> = {}
        tutorResults.forEach((r) => {
          if (r.status === "fulfilled") tutorNameMap[r.value.id] = r.value.name
        })

        const subjectTitleMap: Record<string, string> = {}
        subjectResults.forEach((r) => {
          if (r.status === "fulfilled") subjectTitleMap[r.value.key] = r.value.title
        })

        const newTutorNames: Record<string, string> = {}
        const newSubjectTitles: Record<string, string> = {}
        const newDurations: Record<string, number> = {}

        paymentsData.forEach((payment) => {
          const booking = bookingMap.get(payment.bookingId)
          if (!booking) return
          newDurations[payment._id] = booking.durationMinutes
          if (tutorNameMap[booking.tutorId]) newTutorNames[payment._id] = tutorNameMap[booking.tutorId]
          const key = subjectKey(booking.tutorId, booking.subjectId)
          if (subjectTitleMap[key]) newSubjectTitles[payment._id] = subjectTitleMap[key]
        })

        setTutorNames(newTutorNames)
        setSubjectTitles(newSubjectTitles)
        setDurations(newDurations)
        setPayments(paymentsData)

      } catch (err) {
        setError(err instanceof Error ? err.message : t("genericError"))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [t])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = payments.filter((p) => {
    const date = new Date(p.paidAt ?? p.createdAt)
    if (appliedFrom && date < new Date(appliedFrom)) return false
    if (appliedTo) {
      const toDateEnd = new Date(appliedTo)
      toDateEnd.setHours(23, 59, 59, 999)
      if (date > toDateEnd) return false
    }
    return true
  })

  const isFiltered = !!(appliedFrom || appliedTo)

  function handleApply() {
    setAppliedFrom(fromDate)
    setAppliedTo(toDate)
    setCurrentPage(1)
    setShowFilter(false)
  }

  function handleClear() {
    setFromDate(""); setToDate("")
    setAppliedFrom(""); setAppliedTo("")
    setCurrentPage(1)
    setShowFilter(false)
  }

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentPayments = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  function getDescription(payment: Payment) {
    const tutor = tutorNames[payment._id]
    const subject = subjectTitles[payment._id]
    const duration = durations[payment._id]
    const durationText = duration ? t("durationHours", { count: duration / 60 }) : ""
    return {
      title: tutor ? t("sessionWith", { tutorName: tutor }) : t("session"),
      subtitle: [subject, durationText].filter(Boolean).join(" · "),
    }
  }

  function toTransaction(payment: Payment): Transaction {
    return {
      id: payment._id,
      date: formatDate(payment.paidAt ?? payment.createdAt, locale),
      tutorName: tutorNames[payment._id] ?? t("fallbackTutor"),
      subject: subjectTitles[payment._id] ?? t("session"),
      duration: durations[payment._id] ?? 0,
      amount: payment.amount,
      currency: payment.currency,
      status: statusLabelMap[payment.status] ?? payment.status,
    }
  }

  function handleExportCSV() { exportCSV(filtered.map(toTransaction)) }
  function handleExportInvoice(payment: Payment) { exportInvoicePDF(toTransaction(payment)) }
  function handleRowClick(payment: Payment) { router.push(`/${locale}/paymentHistory/${payment._id}`) }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 relative">

        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100 rounded-t-2xl bg-white relative z-20">
          <h2 className="text-base font-bold text-gray-800">{t("recentTransactions")}</h2>
          <div className="flex items-center gap-2">

            <PaymentFilter
              showFilter={showFilter}
              setShowFilter={setShowFilter}
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
              isFiltered={isFiltered}
              filterRef={filterRef}
              handleApply={handleApply}
              handleClear={handleClear}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={filtered.length === 0}
              className="gap-1.5"
            >
              <Download size={13} />
              <span className="hidden sm:inline">{t("exportCSV")}</span>
            </Button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm py-16">
            <Loader2 size={18} className="animate-spin text-indigo-500" />
            <span>{t("loadingTransactions")}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-3 text-sm border-b border-red-100">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <div className="min-h-[220px] rounded-b-2xl overflow-hidden">
          {/* Desktop Table */}
          <PaymentTable
            loading={loading}
            error={error}
            filtered={filtered}
            currentPayments={currentPayments}
            formatDate={(iso) => formatDate(iso, locale)}
            getDescription={getDescription}
            handleRowClick={handleRowClick}
            handleExportInvoice={handleExportInvoice}
            StatusBadge={({ status }) => <StatusBadge status={status} t={t} />}
          />

          {/* Mobile Cards */}
          <PaymentMobileList
            loading={loading}
            error={error}
            filtered={filtered}
            currentPayments={currentPayments}
            formatDate={(iso) => formatDate(iso, locale)}
            getDescription={getDescription}
            handleRowClick={handleRowClick}
            handleExportInvoice={handleExportInvoice}
            StatusBadge={({ status }) => <StatusBadge status={status} t={t} />}
          />
        </div>

        {/* Pagination */}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 md:px-5 py-4 border-t border-gray-100 rounded-b-2xl bg-white">
            <p className="text-xs md:text-sm text-gray-400">
              {t("pagination.showing", {
                from: startIndex + 1,
                to: Math.min(startIndex + ITEMS_PER_PAGE, filtered.length),
                total: filtered.length,
              })}
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                aria-label={t("pagination.previous")}
              >‹</Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                aria-label={t("pagination.next")}
              >›</Button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
