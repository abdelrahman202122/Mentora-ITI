"use client";

import { CalendarDays, Download } from "lucide-react";

export default function PageHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Financial Overview
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Track your academic success and performance revenue.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-outline gap-2">
          <CalendarDays className="h-4 w-4" />
          Oct 2023
        </button>

        <button className="btn-outline gap-2">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>
    </div>
  );
}