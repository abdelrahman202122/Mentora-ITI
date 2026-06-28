// components/admin/StatsCard.tsx
import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number; // percentage change, e.g. +12.5 or -3.2
  changeLabel?: string; // e.g. "vs last month"
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

export default function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend = "neutral",
}: StatsCardProps) {
  const trendColor =
    trend === "up"
      ? "text-emerald-600 bg-emerald-50"
      : trend === "down"
        ? "text-red-600 bg-red-50"
        : "text-gray-600 bg-gray-50";

  const trendIcon =
    trend === "up" ? (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 12 12">
        <path d="M6 2.5L9.5 7H2.5L6 2.5Z" fill="currentColor" />
      </svg>
    ) : trend === "down" ? (
      <svg className="h-3 w-3" fill="none" viewBox="0 0 12 12">
        <path d="M6 9.5L2.5 5H9.5L6 9.5Z" fill="currentColor" />
      </svg>
    ) : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between">
        {/* Left: title + value */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
        </div>

        {/* Right: icon */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            {icon}
        </div>
      </div>

      {/* Trend row */}
      {change !== undefined && (
        <div className="mt-4 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${trendColor}`}
          >
            {trendIcon}
            {change > 0 ? "+" : ""}
            {change}%
          </span>
          {changeLabel && (
            <span className="text-xs text-gray-500">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}