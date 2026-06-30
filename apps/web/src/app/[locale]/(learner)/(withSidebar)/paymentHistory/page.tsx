

"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Download, Loader2, AlertCircle } from "lucide-react"
import { getMyPayments, type Payment } from "@/services/payment/paymentHistory"
import { getMyBookings } from "@/services/booking-services/getMyBookingService"
import { getSubjectTitle } from "@/services/booking-services/getSubjectTitleService"
import { getTutorName } from "@/services/booking-services/getTutorNameService"
import PaymentFilter from "@/components/learner/PaymentFilter"
import PaymentTable from "@/components/learner/paymentTable"
import PaymentMobileList from "@/components/learner/PaymentMobileList"
import { exportCSV, exportInvoicePDF } from "@/utils/learner/exportUtils"
import { type Transaction } from "@/services/paymentHistory/payment-history-service"

const ITEMS_PER_PAGE = 4

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const statusLabelMap: Record<Payment["status"], string> = {
  success: "Completed",
  failed: "Failed",
  refunded: "Refunded",
  pending: "Pending",
}

function StatusBadge({ status }: { status: Payment["status"] }) {
  const map: Record<string, { label: string; color: string }> = {
    success:  { label: "Completed", color: "text-green-600" },
    failed:   { label: "Failed",    color: "text-red-500" },
    refunded: { label: "Refunded",  color: "text-yellow-600" },
    pending:  { label: "Pending",   color: "text-yellow-400" },
  }
  const s = map[status] ?? map.pending
  return (
    <span className={`flex items-center gap-1 font-semibold text-sm ${s.color}`}>
      <span className="w-2 h-2 rounded-full bg-current" />
      {s.label}
    </span>
  )
}

// composite key so two different tutors who happen to share a subjectId
// never collide in the title lookup map
function subjectKey(tutorId: string, subjectId: string): string {
  return `${tutorId}_${subjectId}`
}

export default function PaymentsPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) ?? "en"

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

        // ✅ deduplicate — only fetch each unique tutorId once
        const uniqueTutorIds = [...new Set(bookingsData.map((b) => b.tutorId))]

        // ✅ deduplicate — only fetch each unique tutorId/subjectId pair once
        const uniquePairs = [
          ...new Map(bookingsData.map((b) => [subjectKey(b.tutorId, b.subjectId), b])).values()
        ]

        // ✅ fetch all tutor names and subject titles in parallel
        const [tutorResults, subjectResults] = await Promise.all([
          Promise.allSettled(
            uniqueTutorIds.map((id) => getTutorName(id).then((name) => ({ id, name })))
          ),
          Promise.allSettled(
            uniquePairs.map((b) =>
              getSubjectTitle(b.tutorId, b.subjectId).then((title) => ({
                // keyed by the SAME composite key used to fetch it, since a
                // subjectId alone can collide across different tutors
                key: subjectKey(b.tutorId, b.subjectId),
                title,
              }))
            )
          ),
        ])

        // build lookup maps
        const tutorNameMap: Record<string, string> = {}
        tutorResults.forEach((r) => {
          if (r.status === "fulfilled") tutorNameMap[r.value.id] = r.value.name
        })

        const subjectTitleMap: Record<string, string> = {}
        subjectResults.forEach((r) => {
          if (r.status === "fulfilled") subjectTitleMap[r.value.key] = r.value.title
        })

        // build per-payment enrichment maps
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

        // ✅ set all state at once — renders everything together
        setTutorNames(newTutorNames)
        setSubjectTitles(newSubjectTitles)
        setDurations(newDurations)
        setPayments(paymentsData)

      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load payments.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Close filter on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filtering
  const filtered = payments.filter((p) => {
    const date = new Date(p.paidAt ?? p.createdAt)
    if (appliedFrom && date < new Date(appliedFrom)) return false
    if (appliedTo) {
      // "YYYY-MM-DD" parses to midnight, which would exclude every
      // transaction that happened later that same day — push the upper
      // bound to the very end of the selected day instead.
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

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentPayments = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  function getDescription(payment: Payment) {
    const tutor = tutorNames[payment._id]
    const subject = subjectTitles[payment._id]
    const duration = durations[payment._id]
    const durationText = duration ? `${duration / 60}h` : ""
    return {
      title: tutor ? `Session with ${tutor}` : "Session",
      subtitle: [subject, durationText].filter(Boolean).join(" · "),
    }
  }

  const statusLabelMap: Record<Payment["status"], Transaction["status"]> = {
  success: "Completed",
  failed: "Failed",
  refunded: "Refunded",
  pending: "Pending",
}

  function toTransaction(payment: Payment): Transaction {
    return {
      id: payment._id,
      date: formatDate(payment.paidAt ?? payment.createdAt),
      tutorName: tutorNames[payment._id] ?? "Tutor",
      subject: subjectTitles[payment._id] ?? "Session",
      duration: durations[payment._id] ?? 0,
      amount: payment.amount,
      currency: payment.currency,
      status: statusLabelMap[payment.status] ?? payment.status,
    }
  }

  function handleExportCSV() {
    exportCSV(filtered.map(toTransaction))
  }

  function handleExportInvoice(payment: Payment) {
    exportInvoicePDF(toTransaction(payment))
  }

  function handleRowClick(payment: Payment) {
    router.push(`/${locale}/paymentHistory/${payment._id}`)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">Recent Transactions</h2>
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

            <button
              onClick={handleExportCSV}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm py-16">
            <Loader2 size={18} className="animate-spin text-indigo-500" />
            <span>Loading transactions...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-3 text-sm border-b border-red-100">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Desktop Table */}
        <PaymentTable
          loading={loading}
          error={error}
          filtered={filtered}
          currentPayments={currentPayments}
          formatDate={formatDate}
          getDescription={getDescription}
          handleRowClick={handleRowClick}
          handleExportInvoice={handleExportInvoice}
          StatusBadge={StatusBadge}
        />

        {/* Mobile Cards */}
        <PaymentMobileList
          loading={loading}
          error={error}
          filtered={filtered}
          currentPayments={currentPayments}
          formatDate={formatDate}
          getDescription={getDescription}
          handleRowClick={handleRowClick}
          handleExportInvoice={handleExportInvoice}
          StatusBadge={StatusBadge}
        />

        {/* Pagination */}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 md:px-5 py-4 border-t border-gray-100">
            <p className="text-xs md:text-sm text-gray-400">
              Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-sm"
              >‹</button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-sm"
              >›</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
