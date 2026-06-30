"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Calendar, Info, Loader2 } from "lucide-react";
import type { Tutor } from "@/types/admin";
import { useDrawerEffects } from "@/hooks/admin/use-drawer-effects";
import { Avatar, DrawerOverlay } from "../../shared";
import { accountBadgeClasses, approvalBadgeClasses } from "@/utils/admin/badge-styles";

interface TutorDrawerProps {
  tutor: Tutor | null;
  onClose: () => void;
  onApprove: (tutor: Tutor, notes: string) => void;
  onReject: (tutor: Tutor) => void;
  mutating?: boolean;
}

export function TutorDrawer({
  tutor,
  onClose,
  onApprove,
  onReject,
  mutating = false,
}: TutorDrawerProps) {
  const [notes, setNotes] = useState("");

  // ✅ NEW: track WHICH action is in progress (approve vs reject)
  // so only the clicked button shows a spinner
  const [actionInProgress, setActionInProgress] = useState<
    "approve" | "reject" | null
  >(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotes(tutor?.moderatorNotes ?? "");
    // Reset action state when tutor changes
    setActionInProgress(null);
  }, [tutor]);

  useDrawerEffects(!!tutor, onClose);

  if (!tutor) return null;

  const handleApprove = () => {
    if (mutating) return;
    setActionInProgress("approve");
    onApprove(tutor, notes);
  };

  const handleReject = () => {
    if (mutating) return;
    setActionInProgress("reject");
    onReject(tutor);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <DrawerOverlay
        onClick={mutating ? () => {} : onClose}
        opacity="bg-black/35"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Tutor details: ${tutor.name}`}
        className="relative flex h-full w-full max-w-[480px] flex-col rounded-tl bg-white shadow-2xl"
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
          <div className="flex items-start justify-end px-5 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={mutating}
              aria-label="Close drawer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
          <div className="px-5 pb-5">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <Avatar
                  name={tutor.name}
                  seed={tutor.id}
                  avatarUrl={tutor.avatarUrl ?? undefined}
                  size="lg"
                />
                <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-gray-900">{tutor.name}</h2>
                {tutor.degree && (
                  <p className="mt-0.5 text-sm text-gray-500">{tutor.degree}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${approvalBadgeClasses[tutor.approval]}`}
                  >
                    {tutor.approval}
                  </span>
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${accountBadgeClasses[tutor.account]}`}
                  >
                    {tutor.account}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  {tutor.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      {tutor.location}
                    </span>
                  )}
                  {tutor.joinedDate && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      {tutor.joinedDate}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ FIXED: each button only shows spinner when ITS action is in progress */}
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleReject}
                disabled={mutating}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded bg-red-500 px-4 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionInProgress === "reject" && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                Reject Application
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={mutating}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded bg-indigo-600 px-4 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionInProgress === "approve" && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                )}
                Approve Tutor
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {tutor.bio && (
            <section>
              <h3 className="flex items-center gap-1.5 text-base font-bold text-gray-900">
                <Info className="h-4 w-4 text-blue-500" />
                Biography
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {tutor.bio}
              </p>
            </section>
          )}
          {tutor.experience && tutor.experience.length > 0 && (
            <section>
              <h3 className="text-base font-bold text-gray-900">Experience</h3>
              <div className="mt-3 space-y-4">
                {tutor.experience.map((exp, idx) => (
                  <div key={idx}>
                    <p className="text-sm font-bold text-gray-900">{exp.title}</p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {exp.org}
                      {exp.period ? ` | ${exp.period}` : ""}
                    </p>
                    {exp.description && (
                      <p className="mt-1 text-sm text-gray-700">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {tutor.subjects.length > 0 && (
            <section>
              <h3 className="text-base font-bold text-gray-900">
                Expertise &amp; Subjects
              </h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tutor.subjects.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center rounded bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}
          <section className="grid grid-cols-2 gap-3">
            <div className="rounded border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Hourly Rate</p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                ${tutor.hourlyRate.toFixed(2)} / hr
              </p>
            </div>
            <div className="rounded border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Commission Rate</p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {tutor.commissionRate ?? "15%"}
              </p>
            </div>
          </section>
          <section>
            <h3 className="text-sm font-bold text-gray-900">Moderator Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={mutating}
              placeholder="Add internal notes about this tutor's application..."
              rows={5}
              className="mt-2 w-full resize-y rounded border border-gray-300 bg-white p-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                disabled={mutating}
                onClick={() => console.log("Save notes for tutor", tutor.id, notes)}
                className="inline-flex h-8 items-center justify-center rounded bg-blue-600 px-4 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Notes
              </button>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
