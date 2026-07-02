

"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  Calendar,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CreditCard,
  Link2,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { getPaymentById, type PaymentDetails } from "@/services/payment/PaymentDetailsService"

function formatDate(iso: string | null, locale: string): string {
  if (!iso) return "-"
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function StatusBadge({
  status,
  t,
}: {
  status: PaymentDetails["status"]
  t: ReturnType<typeof useTranslations<"PaymentDetails">>
}) {
  const statusTranslationKeys: Record<PaymentDetails["status"], string> = {
    success: "status.success",
    pending: "status.pending",
    failed: "status.failed",
    refunded: "status.refunded",
  }
  const map: Record<string, { className: string }> = {
    success: { className: "bg-green-100 text-green-700 border-green-200" },
    pending: { className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    failed: { className: "bg-red-100 text-red-600 border-red-200" },
    refunded: { className: "bg-blue-100 text-blue-700 border-blue-200" },
  }
  const s = map[status] ?? map.pending
  const label = t(statusTranslationKeys[status])
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${s.className}`}>
      {label}
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

export default function PaymentDetailsPage() {
  const params = useParams()
  const paymentId = params.paymentId as string
  const locale = (params.locale as string) ?? "en"
  const t = useTranslations("PaymentDetails")
  const isRtl = locale === "ar"

  const [payment, setPayment] = useState<PaymentDetails | null>(null)
  const [loading, setLoading] = useState(() => Boolean(paymentId))
  const [error, setError] = useState<string | null>(null)

useEffect(() => {
    if (!paymentId) {
      setError(t("notFoundError"))
      setLoading(false)
      return
    }

    getPaymentById(paymentId)
      .then(setPayment)
      .catch(() => setError(t("genericError")))
      .finally(() => setLoading(false))
  }, [paymentId, t])
  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-12 font-sans">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="gap-2 text-sidebar-primary hover:underline px-0">
            <Link href={`/${locale}/paymentHistory`}>
              <ArrowLeft size={16} className={cn(isRtl && "rotate-180")} aria-hidden />
              {t("backToPayments")}
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

        {!loading && !error && payment && (
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">{t("title")}</CardTitle>
              <StatusBadge status={payment.status} t={t} />
            </CardHeader>

            <CardContent className="space-y-1">

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {t("sections.amount")}
              </p>
              <Row label={t("fields.total")} value={
                <span className="flex items-center gap-2">
                  <CreditCard size={14} className="text-muted-foreground" />
                  {payment.currency} {payment.amount.toFixed(2)}
                </span>
              } />
              <Row label={t("fields.provider")} value={payment.provider} />

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">
                {t("sections.timeline")}
              </p>
              <Row label={t("fields.createdAt")} value={
                <span className="flex items-center gap-2">
                  <Calendar size={14} className="text-muted-foreground" />
                  {formatDate(payment.createdAt, locale)}
                </span>
              } />
              {payment.paidAt && <Row label={t("fields.paidAt")} value={formatDate(payment.paidAt, locale)} />}
              {payment.failedAt && <Row label={t("fields.failedAt")} value={formatDate(payment.failedAt, locale)} />}
              {payment.refundedAt && <Row label={t("fields.refundedAt")} value={formatDate(payment.refundedAt, locale)} />}
              {payment.failureReason && (
                <Row label={t("fields.failureReason")} value={
                  <span className="text-red-600">{payment.failureReason}</span>
                } />
              )}

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">
                {t("sections.info")}
              </p>
              <Row label={t("fields.paymentId")} value={<span className="font-mono text-xs">{payment._id}</span>} />
              {payment.providerTransactionId && (
                <Row
                  label={t("fields.transactionId")}
                  value={<span className="font-mono text-xs">{payment.providerTransactionId}</span>}
                />
              )}
              <Row
                label={t("fields.relatedBooking")}
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
