import { Filter, X } from "lucide-react";

interface PaymentFilterProps {
  showFilter: boolean;
  setShowFilter: React.Dispatch<React.SetStateAction<boolean>>;

  fromDate: string;
  setFromDate: React.Dispatch<React.SetStateAction<string>>;

  toDate: string;
  setToDate: React.Dispatch<React.SetStateAction<string>>;

  isFiltered: boolean;

  filterRef: React.RefObject<HTMLDivElement | null>;

  handleApply: () => void;
  handleClear: () => void;
}

export default function PaymentFilter({
  showFilter,
  setShowFilter,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  isFiltered,
  filterRef,
  handleApply,
  handleClear,
}: PaymentFilterProps) {
  return (
    <div className="relative" ref={filterRef}>
      <button
        onClick={() => setShowFilter((v) => !v)}
        className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm transition-colors ${
          isFiltered
            ? "border-indigo-400 bg-indigo-50 text-indigo-700"
            : "border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <Filter size={13} />
        <span className="hidden sm:inline">Filter</span>

        {isFiltered && (
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-0.5" />
        )}
      </button>

      {showFilter && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Filter by Date
            </span>

            <button onClick={() => setShowFilter(false)}>
              <X
                size={14}
                className="text-gray-400 hover:text-gray-600"
              />
            </button>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">
              From
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">
              To
            </label>

            <input
              type="date"
              value={toDate}
              min={fromDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleClear}
              className="flex-1 border border-gray-200 rounded-lg py-1.5 text-xs text-gray-500 hover:bg-gray-50"
            >
              Clear
            </button>

            <button
              onClick={handleApply}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-1.5 text-xs font-semibold"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}