
"use client";

import { useState } from "react";
import { Download, RefreshCw, BarChart3, Star, AlertTriangle, Clock } from "lucide-react";
import { ReviewDrawer } from "@/components/admin/reviews/components/ReviewDrawer";
import { ReviewsTable } from "@/components/admin/reviews/components/ReviewsTable";
import { REVIEWS, TOTAL_REVIEWS } from "@/mocks/mock-data";
import type { Review } from "@/types/admin";
import { PageHeader, StatCard, TablePagination, Dropdown } from "@/components/admin/shared";

export default function ReviewsPage() {
  const [ratingFilter, setRatingFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const filtered = REVIEWS.filter(
    (r) => !ratingFilter || r.rating === Number(ratingFilter),
  );

  const handleKeep = (r: Review) => {
    console.log("Keep review:", r.id);
    setSelectedReview(null);
  };

  const handleFlag = (r: Review) => {
    console.log("Flag review:", r.id);
    setSelectedReview(null);
  };

  const handleDelete = (r: Review) => {
    console.log("Delete review:", r.id);
    setSelectedReview(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <PageHeader
          title="Reviews Moderation"
          description="Monitor and manage educational quality through peer feedback."
          actions={
            <>
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-blue-600 transition-colors hover:bg-gray-50">
                <Download className="h-4 w-4" />Export Report
              </button>
              <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                <RefreshCw className="h-4 w-4" />Refresh Feed
              </button>
            </>
          }
        />

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Reviews" value="12,842" subtext="+12% this month" subtextClassName="text-emerald-600" valueClassName="text-blue-600" icon={BarChart3} iconBg="bg-blue-500/10" iconColor="text-blue-600" />
          <StatCard label="Average Rating" value="4.8" subtext="★★★★★" subtextClassName="text-amber-500 tracking-tight" valueClassName="text-blue-600" icon={Star} iconBg="bg-amber-500/10" iconColor="text-amber-500" />
          <StatCard label="Flagged Reviews" value="24" subtext="Requires attention" subtextClassName="text-red-600" valueClassName="text-red-600" icon={AlertTriangle} iconBg="bg-red-500/10" iconColor="text-red-600" />
          <StatCard label="Moderation Queue" value="156" subtext="Pending verification" subtextClassName="text-white/80" valueClassName="text-white" labelClassName="text-white/80" icon={Clock} iconBg="bg-white/15" iconColor="text-white" cardClassName="bg-blue-600 border-blue-600" />
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-gray-900">Recent Feedback</h2>
            <Dropdown label="All Ratings" options={["5", "4", "3", "2", "1"]} value={ratingFilter} onChange={setRatingFilter} />
          </div>
          <ReviewsTable reviews={filtered} onView={setSelectedReview} />
          <TablePagination page={page} totalPages={3} onPageChange={setPage} variant="rounded" />
        </div>
      </div>

      <ReviewDrawer review={selectedReview} onClose={() => setSelectedReview(null)} onKeep={handleKeep} onFlag={handleFlag} onDelete={handleDelete} />
    </div>
  );
}
