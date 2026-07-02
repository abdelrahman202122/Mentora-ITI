"use client";

import { motion } from "framer-motion";
import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}

export default function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend = "neutral",
  delay = 0,
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        {/* Left: title + value */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        {/* Right: icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>

      {/* Trend row */}
      <div className="mt-6 flex items-center gap-2">
        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${trendColor}`}
          >
            {trendIcon}
            {change > 0 ? "+" : ""}
            {change}%
          </span>
        )}
        {changeLabel && (
          <span className="text-xs text-slate-400">{changeLabel}</span>
        )}
      </div>
    </motion.div>
  );
}