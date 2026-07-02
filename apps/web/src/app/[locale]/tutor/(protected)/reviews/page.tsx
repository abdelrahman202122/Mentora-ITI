"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import ReviewCard from "@/components/TutorReviews/ReviewCard";
import ReviewSummary from "@/components/TutorReviews/ReviewSummary";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/auth/use-auth";
import { useMyReviews } from "@/hooks/reviews/reviews";
import { useTutorProfile } from "@/hooks/tutor/useTutorProfile";

const PAGE_LIMIT = 5;

export default function ReviewsPage() {
  const t = useTranslations("tutorReviews");
  const { data: currentUser } = useCurrentUser();
  const tutorId = currentUser?.id ?? "";
  const [page, setPage] = useState(1);

  const { data: tutorProfile, isLoading: isLoadingProfile } =
    useTutorProfile(tutorId);
  const {
    data: reviewsData,
    isError: isReviewsError,
    isLoading: isLoadingReviews,
  } = useMyReviews(
    tutorProfile?._id ?? "",
    { page, limit: PAGE_LIMIT },
    !!tutorProfile,
  );

  const reviews = reviewsData?.reviews ?? [];
  const pagination = reviewsData?.pagination;

  return (
    <div className="max-w-6xl mx-auto px-0 sm:px-6 py-8 space-y-10">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </header>

      {isLoadingProfile ? (
        <div className="text-muted-foreground text-sm py-6 text-center">
          {t("loadingSummary")}
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
            {t("loadingReviews")}
          </div>
        )}

        {isReviewsError && (
          <div className="text-red-600 text-sm py-6 text-center">
            {t("error")}
          </div>
        )}

        {!isLoadingReviews && !isReviewsError && reviews.length === 0 && (
          <div className="text-muted-foreground text-sm py-6 text-center">
            {t("empty")}
          </div>
        )}

        {reviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1}
          >
            {t("previous")}
          </Button>

          <span className="text-sm text-muted-foreground">
            {t("pageOf", {
              page: pagination.page,
              totalPages: pagination.totalPages,
            })}
          </span>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setPage((current) => Math.min(pagination.totalPages, current + 1))
            }
            disabled={page >= pagination.totalPages}
          >
            {t("next")}
          </Button>
        </div>
      )}
    </div>
  );
}
