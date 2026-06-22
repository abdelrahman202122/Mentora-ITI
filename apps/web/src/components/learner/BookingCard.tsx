
"use client"

import { useRouter } from "next/navigation"

interface BookingCardProps {
  bookingId: string
  tutorName: string
  subject: string
  time: string
  paymentPending?: boolean
  hourlyRate?: number
  duration?: number
  currency?: string
}

export default function BookingCard({
  bookingId,
  tutorName,
  subject,
  time,
  paymentPending,
  hourlyRate = 45,
  duration = 60,
  currency = "$",
}: BookingCardProps) {
  const router = useRouter()

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-accent flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{subject}</p>
          <p className="text-xs text-muted-foreground">with {tutorName}</p>
          {paymentPending && (
            <p className="text-xs text-destructive mt-1">⚠ Payment Pending</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">{time}</p>
        </div>
        {paymentPending && (
          <button
            onClick={() =>
              router.push(
                `/en/payment?bookingId=${bookingId}&tutorName=${encodeURIComponent(tutorName)}&subject=${encodeURIComponent(subject)}&time=${encodeURIComponent(time)}&hourlyRate=${hourlyRate}&duration=${duration}&currency=${encodeURIComponent(currency)}`
              )
            }
            className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-lg whitespace-nowrap flex-shrink-0 cursor-pointer"
          >
            Pay Now
          </button>
        )}
      </div>
    </div>
  )
}