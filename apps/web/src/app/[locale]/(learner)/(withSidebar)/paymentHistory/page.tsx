"use client"

import { useEffect, useState, useRef } from "react"
import { Filter, Download, X } from "lucide-react"
import { getTransactions, type Transaction } from "@/services/paymentHistory/payment-history-service"
import TransactionRow from "@/components/learner/TransactionRow"
import TransactionCard from "@/components/learner/TransactionCard"
import { exportCSV, exportInvoicePDF } from "@/utils/learner/exportUtils"

const ITEMS_PER_PAGE = 4

export default function PaymentsPage() {
  const [transactions] = useState<Transaction[]>(() => getTransactions())
  const [currentPage, setCurrentPage] = useState(1)

  // ── Filter state ─────────────────────────────────────────────────────────
  const [showFilter, setShowFilter] = useState(false)
  const [fromDate, setFromDate]     = useState("")
  const [toDate, setToDate]         = useState("")
  const [appliedFrom, setAppliedFrom] = useState("")
  const [appliedTo, setAppliedTo]     = useState("")
  const filterRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // ── Filtering logic ───────────────────────────────────────────────────────
  const filtered = transactions.filter((tx) => {
    const txDate = new Date(tx.date)
    if (appliedFrom && txDate < new Date(appliedFrom)) return false
    if (appliedTo   && txDate > new Date(appliedTo))   return false
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
    setFromDate("")
    setToDate("")
    setAppliedFrom("")
    setAppliedTo("")
    setCurrentPage(1)
    setShowFilter(false)
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages        = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const startIndex        = (currentPage - 1) * ITEMS_PER_PAGE
  const currentTransactions = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800">Recent Transactions</h2>
          <div className="flex items-center gap-2">

            {/* ── Filter button + dropdown ── */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilter((v) => !v)}
                className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 text-xs md:text-sm transition-colors ${
                  isFiltered
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Filter size={13} />
                <span className="hidden sm:inline cursor-pointer">Filter</span>
                {isFiltered && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-0.5" />
                )}
              </button>

              {showFilter && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Filter by Date</span>
                    <button onClick={() => setShowFilter(false)}>
                      <X size={14} className="text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input
                      type="date"
                      value={toDate}
                      min={fromDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleClear}
                      className="flex-1 border border-gray-200 rounded-lg py-1.5 text-xs text-gray-500 hover:bg-gray-50"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleApply}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-1.5 text-xs font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => exportCSV(transactions)}
              className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs md:text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              <Download size={13} className="cursor-pointer" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block">
          <div className="grid grid-cols-6 px-5 py-3 text-xs text-gray-400 uppercase border-b border-gray-50">
            <span>Date</span><span className="col-span-2">Description</span>
            <span className="text-right">Amount</span><span className="text-right">Status</span>
            <span className="text-right">Invoice</span>
          </div>
          {filtered.length === 0
            ? <div className="text-center py-16 text-gray-400 text-sm">No transactions found.</div>
            : <div className="divide-y divide-gray-50">
                {currentTransactions.map((tx) => <TransactionRow key={tx.id} tx={tx} onExportPDF={exportInvoicePDF} />)}
              </div>
          }
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          {filtered.length === 0
            ? <div className="text-center py-16 text-gray-400 text-sm">No transactions found.</div>
            : <div className="divide-y divide-gray-100">
                {currentTransactions.map((tx) => <TransactionCard key={tx.id} tx={tx} onExportPDF={exportInvoicePDF} />)}
              </div>
          }
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 md:px-5 py-4 border-t border-gray-100">
            <p className="text-xs md:text-sm text-gray-400">
              Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-sm">‹</button>
              <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-sm">›</button>
            </div>
          </div>
        )}

      </div>

      {/* Help Card */}
      <div className="mt-6 bg-indigo-50 rounded-2xl p-5 md:p-6">
        <h3 className="text-base font-bold text-gray-800 mb-1">Need help with your billing?</h3>
        <p className="text-sm text-gray-500 mb-4">Our support team is available 24/7 to resolve any payment discrepancies or subscription issues.</p>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">Contact Support</button>
      </div>

    </div>
  )
}
