"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showingText?: string;
  variant?: "default" | "rounded";
  siblingCount?: number; // how many pages to show on each side of the current page
}

/* ─────────────────────────────────────────────────────────────────────
   Helper: generate a smart page range with ellipsis

   Examples (siblingCount = 1):
     totalPages=1, page=1 → [1]
     totalPages=3, page=1 → [1, 2, 3]
     totalPages=5, page=1 → [1, 2, 3, ..., 5]
     totalPages=5, page=3 → [1, 2, 3, 4, 5]
     totalPages=5, page=5 → [1, ..., 3, 4, 5]
     totalPages=13, page=7 → [1, ..., 6, 7, 8, ..., 13]

   The "..." is represented as the string "ellipsis" in the array
   so React can render a non-clickable span.
   ───────────────────────────────────────────────────────────────────── */

type PageItem = number | "ellipsis-left" | "ellipsis-right";

function getPageRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): PageItem[] {
  // If 7 or fewer pages, just show them all (no ellipsis needed)
  // 1 (first) + 1 (last) + 2*siblingCount + 1 (current) = 5 + 2*siblingCount
  const totalNumbersToShow = siblingCount * 2 + 5;

  if (totalPages <= totalNumbersToShow) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: PageItem[] = [];

  // Always include page 1
  items.push(1);

  const leftSibling = Math.max(currentPage - siblingCount, 2);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages - 1);

  // Show left ellipsis if there's a gap between page 1 and leftSibling
  if (leftSibling > 2) {
    items.push("ellipsis-left");
  } else if (leftSibling === 2) {
    // No gap — but we still need page 2 to be shown
    // (will be added in the middle range below)
  }

  // Add the middle range of page numbers
  for (let p = leftSibling; p <= rightSibling; p++) {
    items.push(p);
  }

  // Show right ellipsis if there's a gap between rightSibling and last page
  if (rightSibling < totalPages - 1) {
    items.push("ellipsis-right");
  }

  // Always include the last page
  items.push(totalPages);

  return items;
}

export function TablePagination({
  page,
  totalPages,
  onPageChange,
  showingText,
  variant = "default",
  siblingCount = 1,
}: TablePaginationProps) {
  // Guard: if no pages or invalid state, render nothing
  if (totalPages <= 0) return null;

  // Clamp current page to valid range
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageItems = getPageRange(safePage, totalPages, siblingCount);

  /* ─── "rounded" variant (circle buttons) ─── */
  if (variant === "rounded") {
    return (
      <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-4 py-3">
        {/* Previous button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers + ellipsis */}
        {pageItems.map((item, idx) => {
          if (item === "ellipsis-left" || item === "ellipsis-right") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="inline-flex h-8 w-8 items-center justify-center text-sm text-gray-400"
              >
                …
              </span>
            );
          }
          const isActive = item === safePage;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {item}
            </button>
          );
        })}

        {/* Next button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          disabled={safePage === totalPages}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  /* ─── "default" variant (square buttons) ─── */
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row">
      {showingText && <p className="text-xs text-gray-500">{showingText}</p>}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          type="button"
          disabled={safePage === 1}
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page numbers + ellipsis */}
        {pageItems.map((item, idx) => {
          if (item === "ellipsis-left" || item === "ellipsis-right") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="inline-flex h-8 min-w-8 items-center justify-center px-1 text-sm text-gray-400"
              >
                …
              </span>
            );
          }
          const isActive = item === safePage;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm transition-colors ${
                isActive
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item}
            </button>
          );
        })}

        {/* Next button */}
        <button
          type="button"
          disabled={safePage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
