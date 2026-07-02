"use client";

import { motion } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

export function PlatformHealth({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className={cn(
        "w-full rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70",
        className
      )}
    >
      {/* Title */}
      <h2 className="text-base font-semibold text-slate-800">Platform Health</h2>

      {/* Server Load */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
          <span className="tracking-wide uppercase">Server Load</span>
          <span className="text-emerald-500">Normal</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "42%" }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="h-full rounded-full bg-indigo-600"
          />
        </div>
      </div>

      {/* User Satisfaction */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
          <span className="tracking-wide uppercase">User Satisfaction</span>
          <span className="text-slate-800">4.8/5.0</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "96%" }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            className="h-full rounded-full bg-indigo-600"
          />
        </div>
      </div>

      {/* Status footer */}
      <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-3 w-3"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 10l3.5 3.5L15 6" />
          </svg>
        </span>
        <span className="text-sm font-medium text-emerald-500">
          All systems operational
        </span>
      </div>
    </motion.div>
  );
}

export default PlatformHealth;