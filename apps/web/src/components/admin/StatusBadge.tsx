interface StatusBadgeProps {
  status: 'operational' | 'degraded' | 'down'
  label?: string
}

const statusConfig = {
  operational: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  degraded: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  down: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
}

export default function StatusBadge({
  status,
  label,
}: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${config.dot}`}
      />

      {label || status}
    </span>
  )
}