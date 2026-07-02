"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ApiClientError } from "@/lib/axios";
import { createReview } from "@/services/reviews/create-review";

interface LearnerReviewCardProps {
  bookingId: string;
  alreadyReviewed?: boolean;
  onReviewCreated?: (reviewId: string) => void;
}

export function LearnerReviewCard({
  bookingId,
  alreadyReviewed = false,
  onReviewCreated,
}: LearnerReviewCardProps) {
  const t = useTranslations("BookingDetails.review");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(alreadyReviewed);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (rating < 1) {
      setError(t("ratingRequired"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const review = await createReview({
        bookingId,
        rating,
        comment: comment.trim() || undefined,
      });

      setIsSubmitted(true);
      onReviewCreated?.(review._id);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 409) {
        setIsSubmitted(true);
        return;
      }

      setError(err instanceof Error ? err.message : t("submitError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <Card className="mt-4 border-green-200 bg-green-50 shadow-sm">
        <CardContent className="flex items-start gap-3 p-4 text-green-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">{t("submittedTitle")}</p>
            <p className="text-sm text-green-700">{t("submittedDescription")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{t("title")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium">{t("ratingLabel")}</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className="rounded-full p-1 text-amber-500 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-300"
                aria-label={t("ratingOption", { count: value })}
              >
                <Star
                  className="h-7 w-7"
                  fill={value <= rating ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="review-comment" className="mb-2 block text-sm font-medium">
            {t("commentLabel")}
          </label>
          <Textarea
            id="review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value.slice(0, 1000))}
            placeholder={t("commentPlaceholder")}
            className="min-h-28 resize-none"
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {t("commentCount", { count: comment.length })}
          </p>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin rtl:ml-2 rtl:mr-0" />
              {t("submitting")}
            </>
          ) : (
            t("submit")
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
