
"use client";

import { Calendar, Filter, ChevronDown } from "lucide-react";

interface DropdownWithLabelProps {
  label: string;
  displayValue: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  icon?: typeof Calendar | typeof Filter;
}

function DropdownWithLabel({ label, displayValue, options, onChange, icon: Icon }: DropdownWithLabelProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</label>
      <div className="relative">
        <button type="button" onClick={() => setOpen((o) => !o)} onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
          <span className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-gray-400" />}
            <span>{displayValue}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
        {open && (
          <div className="absolute right-0 z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            <button type="button" onMouseDown={() => { onChange(""); setOpen(false); }}
              className="block w-full px-3 py-1.5 text-left text-sm text-gray-600 hover:bg-gray-50">{displayValue}</button>
            {options.map((opt) => (
              <button key={opt} type="button" onMouseDown={() => { onChange(opt); setOpen(false); }}
                className="block w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50">{opt}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";

interface BookingFiltersProps {
  status: string;
  onStatusChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  tutorQuery: string;
  onTutorQueryChange: (value: string) => void;
  learnerQuery: string;
  onLearnerQueryChange: (value: string) => void;
}

export function BookingFilters({
  status,
  onStatusChange,
  dateRange,
  onDateRangeChange,
  tutorQuery,
  onTutorQueryChange,
  learnerQuery,
  onLearnerQueryChange,
}: BookingFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-3 border-b border-gray-100 p-4 sm:grid-cols-2 lg:grid-cols-4">
      <DropdownWithLabel label="Date Range" displayValue={dateRange || "Oct 1, 2023"}
        options={["Oct 1, 2023", "Last 7 days", "Last 30 days", "This month", "This year"]}
        value={dateRange} onChange={onDateRangeChange} icon={Calendar} />
      <DropdownWithLabel label="Status" displayValue={status || "All Statuses"}
        options={["Pending", "Confirmed", "Completed", "Cancelled", "Refunded"]}
        value={status} onChange={onStatusChange} icon={Filter} />
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Tutor</label>
        <input type="text" value={tutorQuery} onChange={(e) => onTutorQueryChange(e.target.value)} placeholder="Search by name"
          className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Learner</label>
        <input type="text" value={learnerQuery} onChange={(e) => onLearnerQueryChange(e.target.value)} placeholder="Search by name"
          className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
      </div>
    </div>
  );
}
