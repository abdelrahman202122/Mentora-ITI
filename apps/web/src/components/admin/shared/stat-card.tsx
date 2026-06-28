
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  subtextClassName?: string;
  valueClassName?: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  cardClassName?: string;
  labelClassName?: string;
}

export function StatCard({
  label,
  value,
  subtext,
  subtextClassName = "text-gray-500",
  valueClassName = "text-gray-900",
  icon: Icon,
  iconBg,
  iconColor,
  cardClassName = "bg-white",
  labelClassName = "text-gray-500",
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl border border-gray-200 p-4 shadow-sm ${cardClassName}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[11px] font-semibold uppercase tracking-wider ${labelClassName}`}
        >
          {label}
        </span>
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}
        >
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </span>
      </div>
      <p className={`mt-3 text-2xl font-semibold ${valueClassName}`}>{value}</p>
      {subtext && (
        <div className={`mt-1 text-xs ${subtextClassName}`}>
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}
