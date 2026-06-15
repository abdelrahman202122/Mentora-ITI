interface BookingCardProps {
  tutorName: string
  subject: string
  time: string
  paymentPending?: boolean
}

export default function BookingCard({
  tutorName,
  subject,
  time,
  paymentPending,
}: BookingCardProps) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-accent flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {subject}
          </p>
          <p className="text-xs text-muted-foreground">with {tutorName}</p>
          {paymentPending && (
            <p className="text-xs text-destructive mt-1">⚠ Payment Pending</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">{time}</p>
        </div>
        {paymentPending && (
          <button className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-lg whitespace-nowrap flex-shrink-0">
            Pay Now
          </button>
        )}
      </div>
    </div>
  )
}