"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  Calendar,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CreditCard,
  Hash,
  Link2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getPaymentById, type PaymentDetails } from "@/services/payment/PaymentDetailsService"

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function StatusBadge({ status }: { status: PaymentDetails["status"] }) {
  const map: Record<string, { label: string; className: string }> = {
    success:  { label: "Completed", className: "bg-green-100 text-green-700 border-green-200" },
    pending:  { label: "Pending",   className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    failed:   { label: "Failed",    className: "bg-red-100 text-red-600 border-red-200" },
    refunded: { label: "Refunded",  className: "bg-blue-100 text-blue-700 border-blue-200" },
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b last:border-0 gap-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

export default function PaymentDetailsPage() {
  const params = useParams()
  const paymentId = params.paymentId as string
  const locale = (params.locale as string) ?? "en"

  const [payment, setPayment] = useState<PaymentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!paymentId) {
      setError("Payment ID not found in URL.")
      setLoading(false)
      return
    }

    getPaymentById(paymentId)
      .then(setPayment)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load payment details."))
      .finally(() => setLoading(false))
  }, [paymentId])

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 font-sans">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-2 text-sidebar-primary hover:underline px-0">
            <Link href={`/${locale}/paymentHistory`}>
              <ArrowLeft size={16} /> Back to Payments
            </Link>
          </Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
            <Loader2 size={20} className="animate-spin" />
            <span>Loading payment details...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {!loading && !error && payment && (
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">Payment Details</CardTitle>
              <StatusBadge status={payment.status} />
            </CardHeader>

            <CardContent className="space-y-1">

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Amount</p>
              <Row label="Total" value={
                <span className="flex items-center gap-2">
                  <CreditCard size={14} className="text-muted-foreground" />
                  {payment.currency} {payment.amount.toFixed(2)}
                </span>
              } />
              <Row label="Provider" value={payment.provider} />

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">Timeline</p>
              <Row label="Created At" value={
                <span className="flex items-center gap-2">
                  <Calendar size={14} className="text-muted-foreground" />
                  {formatDate(payment.createdAt)}
                </span>
              } />
              {payment.paidAt && <Row label="Paid At" value={formatDate(payment.paidAt)} />}
              {payment.failedAt && <Row label="Failed At" value={formatDate(payment.failedAt)} />}
              {payment.refundedAt && <Row label="Refunded At" value={formatDate(payment.refundedAt)} />}
              {payment.failureReason && (
                <Row label="Failure Reason" value={
                  <span className="text-red-600">{payment.failureReason}</span>
                } />
              )}

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">Info</p>
              <Row label="Payment ID" value={<span className="font-mono text-xs">{payment._id}</span>} />
              {payment.providerTransactionId && (
                <Row
                  label="Transaction ID"
                  value={<span className="font-mono text-xs">{payment.providerTransactionId}</span>}
                />
              )}
              <Row
                label="Related Booking"
                value={
                  <Link
                    href={`/${locale}/booking/${payment.bookingId}`}
                    className="flex items-center gap-1 text-sidebar-primary hover:underline font-mono text-xs"
                  >
                    <Link2 size={12} />
                    {payment.bookingId}
                  </Link>
                }
              />

            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}