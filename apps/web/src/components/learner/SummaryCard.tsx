import Link from "next/link"
import { useTranslations } from "next-intl"
import { UserRound } from "lucide-react"

interface SummaryCardProps {
  tutorName: string
  subject: string
  hourlyRate: number
  duration: number | string
  currency: string
  date?: string
  time?: string
  showTerms?: boolean
}
export function SummaryCard({
  tutorName,
  subject,
  hourlyRate,
  duration,
  currency,
  date,
  time,
  showTerms = false,
}: SummaryCardProps) {
  const t = useTranslations("Booking.summary")

  const numericDuration = Number(duration || 0)
  const sessionCost = (hourlyRate * numericDuration) / 60
  const total = sessionCost 
  const formatMoney = (amount: number) => `${currency} ${amount.toFixed(2)}`

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 bg-sidebar/50 border border-border p-4 rounded-xl">
        <div className="w-12 h-12 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-xs text-muted-foreground">
          <UserRound size={20} aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{tutorName}</p>
          <p className="text-xs text-muted-foreground">{subject}</p>
          {date && time && (
            <p className="text-xs text-gray-400 mt-0.5">
              {date} - {time}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("pricePerHour")}</span>
          <span className="font-medium text-foreground">
            {formatMoney(hourlyRate)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("duration")}</span>
          <span className="text-foreground">
            {numericDuration >= 60
              ? `${numericDuration / 60} ${t("hour")}`
              : `${numericDuration} ${t("mins")}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("sessionCost")}</span>
          <span className="text-foreground">
            {formatMoney(sessionCost)}
          </span>
        </div>
      </div>

      <div className="border-t border-border pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-foreground">{t("totalPrice")}</span>
          <span className="text-xl font-bold text-indigo-600">
            {formatMoney(total)}
          </span>
        </div>
      </div>

      {showTerms && (
        <p className="text-xs text-center text-gray-400 mt-3">
          {t.rich("termsAgree", {
            terms: (chunks) => (
              <Link href="#" className="underline">{chunks}</Link>
            ),
            refund: (chunks) => (
              <Link href="#" className="underline">{chunks}</Link>
            ),
          })}
        </p>
      )}
    </div>
  )
}
