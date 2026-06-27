"use client";

import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  badge?: string;
  description?: string;
  progress?: number;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  badge,
  description,
  progress,
}: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="mb-5 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
          <Icon className="h-6 w-6" />
        </div>

        {badge && (
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
            {badge}
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground">{title}</p>

      <h3 className="mt-2 text-3xl font-bold text-foreground">
        {value}
      </h3>

      {description && (
        <p className="mt-3 text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {typeof progress === "number" && (
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}