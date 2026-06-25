"use client";

import { GraduationCap, Award, BookOpen, Book, Loader2, Check } from "lucide-react";
import { useEducationLevels } from "@/hooks/metadata/useEducationLevels";

interface LevelStepProps {
  selected: string | null;
  onSelect: (value: string) => void;
  onNext: () => void;
}

export default function LevelStep({
  selected,
  onSelect,
  onNext,
}: LevelStepProps) {
  const { data: levels, isLoading, error } = useEducationLevels();

  // Helper to assign icons to different levels
  const getIcon = (value: string) => {
    const val = value.toLowerCase();
    if (val.includes("primary")) {
      return <BookOpen className="size-6 text-indigo-600" />;
    }
    if (val.includes("prep") || val.includes("middle")) {
      return <Book className="size-6 text-amber-600" />;
    }
    if (val.includes("secondary") || val.includes("high")) {
      return <GraduationCap className="size-6 text-emerald-600" />;
    }
    return <Award className="size-6 text-rose-600" />;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="size-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-sm">Loading education levels...</p>
      </div>
    );
  }

  if (error || !levels) {
    return (
      <div className="text-center py-20 text-red-500">
        <p className="font-medium">Failed to load education levels</p>
        <p className="text-xs text-slate-400 mt-1">Please try again later</p>
      </div>
    );
  }

  // Sort levels by order if available
  const sortedLevels = [...levels].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Select Education Level</h2>
        <p className="text-sm text-slate-500 mt-1">
          Choose your current academic grade level.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sortedLevels.map((lvl) => {
          const isSelected = selected === lvl.value;
          return (
            <button
              key={lvl.value}
              onClick={() => {
                onSelect(lvl.value);
                // Tiny delay for smooth UX transition
                setTimeout(onNext, 200);
              }}
              type="button"
              className={`flex items-center gap-4 p-5 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50/40 shadow-sm shadow-indigo-100/50 ring-1 ring-indigo-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <div className="p-3 bg-slate-100 rounded-xl flex-shrink-0">
                {getIcon(lvl.value)}
              </div>
              <div className="space-y-0.5 pr-6">
                <h3 className="font-semibold text-slate-900">{lvl.en}</h3>
                <p className="text-xs text-slate-400">
                  Grade Level Order: {lvl.order}
                </p>
              </div>

              {isSelected && (
                <span className="absolute top-1/2 -translate-y-1/2 right-4 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="size-3 stroke-[3]" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
