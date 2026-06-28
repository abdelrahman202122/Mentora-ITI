
"use client";

import { X, Clock, MapPin, Flag, CheckCircle, Trash2, Star } from "lucide-react";
import type { Review } from "@/types/admin";
import { DrawerOverlay, Stars } from "../../shared";
import { useDrawerEffects } from "@/hooks/admin/use-drawer-effects";
import { avatarInitials } from "@/utils/admin/avatar";

interface ReviewDrawerProps {
  review: Review | null;
  onClose: () => void;
  onKeep: (review: Review) => void;
  onFlag: (review: Review) => void;
  onDelete: (review: Review) => void;
}

export function ReviewDrawer({ review, onClose, onKeep, onFlag, onDelete }: ReviewDrawerProps) {
  useDrawerEffects(!!review, onClose);

  if (!review) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <DrawerOverlay onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-label={`Review details: ${review.id}`}
        className="relative flex h-full w-full max-w-[420px] flex-col rounded-l-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-medium text-gray-900">Review Details</h2>
          <button type="button" onClick={onClose} aria-label="Close drawer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold ${review.tutorAvatarColor}`}>
              {avatarInitials(review.tutor)}
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Tutor</p>
              <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">{review.tutor}</button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
              {avatarInitials(review.learner)}
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Learner</p>
              <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">{review.learner}</button>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Rating</p>
            <div className="mt-1.5 flex items-center gap-2">
              <Stars value={review.rating} />
              <span className="text-sm font-medium text-gray-700">{review.rating}.0</span>
            </div>
          </div>

          <div className="my-5 border-t border-gray-100" />

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Full Review</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              &ldquo;{review.fullReview}&rdquo;
            </p>
          </div>

          <div className="my-5 border-t border-gray-100" />

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Date Submitted</p>
                <p className="mt-0.5 text-sm text-gray-900">{review.dateFull}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Topic Area</p>
                <p className="mt-0.5 text-sm text-gray-900">{review.topicArea}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Session Duration</p>
                <p className="mt-0.5 text-sm text-gray-900">{review.sessionDuration}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-2 border-t border-gray-100 px-6 py-4">
          <button type="button" onClick={() => onKeep(review)}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            <CheckCircle className="h-4 w-4" />Keep Review
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={() => onFlag(review)}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-blue-100 px-4 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200">
              <Flag className="h-4 w-4" />Flag for Review
            </button>
            <button type="button" onClick={() => onDelete(review)}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-red-100 px-4 text-sm font-medium text-red-700 transition-colors hover:bg-red-200">
              <Trash2 className="h-4 w-4" />Delete Review
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}