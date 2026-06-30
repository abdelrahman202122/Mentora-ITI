// import ReviewSummary from "@/components/TutorReviews/ReviewSummary";
// import ReviewCard from "@/components/TutorReviews/ReviewCard";

// export default function ReviewsPage() {
//         const data = [
//   {
//     name: "Julian Barnes",
//     rating: 5,
//     date: "Oct 24, 2024",
//     comment: "Great explanation of calculus...",
//   },
//   {
//     name: "Sarah Jenkins",
//     rating: 4,
//     date: "Oct 22, 2024",
//     comment: "Good but needs visuals.",
//   },
// ];

//   return (
    
//     <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
//       <div>
//         <h1 className="text-3xl font-bold">My Reviews</h1>
//         <p className="text-muted-foreground">
//           Monitor student feedback and reputation
//         </p>
//       </div>

//       <ReviewSummary reviews= {128} />
//     <div className="space-y-4 mt-6">
//       {data.map((r, i) => (
//         <ReviewCard key={i} {...r} />
//       ))}
//     </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import ReviewSummary from "@/components/TutorReviews/ReviewSummary";
import ReviewCard from "@/components/TutorReviews/ReviewCard";
import { useMyReviews } from "@/hooks/reviews/reviews";
import { useTutorProfile } from "@/hooks/tutor/useTutorProfile";
import { useCurrentUser } from "@/hooks/auth/use-auth"; // adjust path to wherever this actually lives

const PAGE_LIMIT = 5;

export default function ReviewsPage() {
  const { data: currentUser } = useCurrentUser();
  const tutorId = currentUser?.id?? ""; // change to currentUser?.id if your AuthUser uses `id`

  const [page, setPage] = useState(1);

  const { data: tutorProfile, isLoading: isLoadingProfile } = useTutorProfile(tutorId);

  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    isError: isReviewsError,
  } = useMyReviews({ page, limit: PAGE_LIMIT });

  const reviews = reviewsData?.reviews ?? [];
  const pagination = reviewsData?.pagination;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
      <div>
        <h1 className="text-3xl font-bold">My Reviews</h1>
        <p className="text-muted-foreground">
          Monitor student feedback and reputation
        </p>
      </div>

      {isLoadingProfile ? (
        <div className="text-muted-foreground text-sm py-6 text-center">
          Loading rating summary…
        </div>
      ) : (
        <ReviewSummary
          rating={tutorProfile?.rating ?? 0}
          totalReviews={tutorProfile?.totalReviews ?? 0}
        />
      )}

      <div className="space-y-4 mt-6">
        {isLoadingReviews && (
          <div className="text-muted-foreground text-sm py-6 text-center">
            Loading reviews…
          </div>
        )}

        {isReviewsError && (
          <div className="text-red-500 text-sm py-6 text-center">
            Failed to load reviews. Please try again.
          </div>
        )}

        {!isLoadingReviews && !isReviewsError && reviews.length === 0 && (
          <div className="text-muted-foreground text-sm py-6 text-center">
            No reviews yet.
          </div>
        )}

        {reviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <button
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </button>

          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}