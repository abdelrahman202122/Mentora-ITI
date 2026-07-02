"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Series = "Revenue" | "Volume";

const DATA: Record<Series, Record<string, number>> = {
  Revenue: { Mon: 4200, Tue: 5100, Wed: 4800, Thu: 7200, Fri: 6100, Sat: 5500, Sun: 8900 },
  Volume: { Mon: 120, Tue: 165, Wed: 140, Thu: 220, Fri: 195, Sat: 175, Sun: 260 },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export default function FinancialChart() {
  const [series, setSeries] = useState<Series>("Revenue");
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const values = DATA[series];
  const max = Math.max(...DAYS.map((d) => values[d]));

  // Find the two highest value days to highlight as "active" by default
  const sortedByValue = [...DAYS].sort((a, b) => values[b] - values[a]);
  const activeDays = new Set([sortedByValue[0], sortedByValue[1]]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="w-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
    >
      {/* Header row */}
      <div className="mb-8 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">
          Financial Growth (7 Days)
        </h3>

        <div className="inline-flex gap-1 rounded-lg bg-slate-100 p-1">
          {(["Revenue", "Volume"] as Series[]).map((s) => {
            const active = s === series;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSeries(s)}
                className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  active
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex h-52 w-full items-end justify-between gap-3 pt-4">
        {DAYS.map((day, i) => {
          const v = values[day];
          const height = (v / max) * 100;
          
          // Determine if this bar should be "active" (purple) or "inactive" (gray)
          // Active if: it's one of the top 2 days, OR it's being hovered
          const isActive = hoveredDay === day || (hoveredDay === null && activeDays.has(day));

          return (
            <div 
              key={day} 
              className="group flex w-full flex-col items-center gap-3 cursor-pointer"
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {/* Value Label (appears on hover) */}
              <div className="h-6 flex items-end">
                {hoveredDay === day && (
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-bold text-slate-900"
                  >
                    {series === "Revenue" ? `$${v.toLocaleString()}` : v}
                  </motion.span>
                )}
              </div>

              {/* Bar Container */}
              <div className="flex h-44 w-full items-end justify-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                  whileHover={{ scaleY: 1.02 }}
                  className={`w-full max-w-[80px] rounded-t-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-indigo-600 group-hover:bg-indigo-700"
                      : "bg-slate-200 group-hover:bg-slate-300"
                  }`}
                />
              </div>
              
              {/* Day Label */}
              <span className={`text-xs font-medium transition-colors duration-200 ${
                isActive ? "text-slate-900" : "text-slate-500"
              }`}>
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}