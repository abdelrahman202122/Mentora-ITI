import Link from "next/link"

interface SummaryCardProps {
  tutorName: string
  subject: string
  hourlyRate: number
  duration: number | string
  currency: string
  date?: string
  time?: string
  showTerms?: boolean // ميزة اختيارية لعرض الشروط فقط في صفحة الدفع
}

const SERVICE_FEE = 2.5

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
  
  const numericDuration = Number(duration || 0)
  const sessionCost = (hourlyRate * numericDuration) / 60
  const total = sessionCost + SERVICE_FEE

  return (
    <div>
      {/* Tutor Info */}
      <div className="flex items-center gap-3 mb-6 bg-sidebar/50 border border-border p-4 rounded-xl">
        <div className="w-12 h-12 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-xs text-muted-foreground">
          img
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{tutorName}</p>
          <p className="text-xs text-muted-foreground">{subject}</p>
          {date && time && (
            <p className="text-xs text-gray-400 mt-0.5">
              {date} — {time}
            </p>
          )}
        </div>
      </div>

      {/* Pricing Details */}
      <div className="flex flex-col gap-3 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Price per hour</span>
          <span className="font-medium text-foreground">
            {currency}{hourlyRate.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Duration</span>
          <span className="text-foreground">
            {numericDuration >= 60 ? `${numericDuration / 60} Hour` : `${numericDuration} mins`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Session cost</span>
          <span className="text-foreground">
            {currency}{sessionCost.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Service fee</span>
          <span className="text-foreground">
            {currency}{SERVICE_FEE.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Total section */}
      <div className="border-t border-border pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-foreground">Total Price</span>
          <span className="text-xl font-bold text-indigo-600">
            {currency}{total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Conditional Terms Policy (Only for Payment Page) */}
      {showTerms && (
        <p className="text-xs text-center text-gray-400 mt-3">
          By confirming, you agree to Mentora's{" "}
          <Link href="#" className="underline">Terms of Service</Link> and{" "}
          <Link href="#" className="underline">Refund Policy</Link>.
        </p>
      )}
    </div>
  )
}