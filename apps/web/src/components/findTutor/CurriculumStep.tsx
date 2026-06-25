"use client";

import { BookOpen, Compass, Globe, Award, Loader2, Check } from "lucide-react";
import { useCurricula } from "@/hooks/metadata/useCurricula";

interface CurriculumStepProps {
  selected: string | null;
  onSelect: (value: string) => void;
  onNext: () => void;
}

export default function CurriculumStep({
  selected,
  onSelect,
  onNext,
}: CurriculumStepProps) {
  const { data: curricula, isLoading, error } = useCurricula();

  // Helper to assign icons to different curricula
  const getIcon = (value: string) => {
    const val = value.toLowerCase();
    if (val.includes("british") || val.includes("igcse")) {
      return <Award className="size-6 text-indigo-600" />;
    }
    if (val.includes("american") || val.includes("sat")) {
      return <Compass className="size-6 text-amber-600" />;
    }
    if (val.includes("international") || val.includes("ib")) {
      return <Globe className="size-6 text-emerald-600" />;
    }
    return <BookOpen className="size-6 text-indigo-600" />;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="size-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-sm">Loading curricula...</p>
      </div>
    );
  }

  if (error || !curricula) {
    return (
      <div className="text-center py-20 text-red-500">
        <p className="font-medium">Failed to load curricula</p>
        <p className="text-xs text-slate-400 mt-1">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Select Curriculum</h2>
        <p className="text-sm text-slate-500 mt-1">
          Choose the educational system you want to study under.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {curricula.map((curr) => {
          const isSelected = selected === curr.value;
          return (
            <button
              key={curr.value}
              onClick={() => {
                onSelect(curr.value);
                // Tiny delay for smooth UX transition
                setTimeout(onNext, 200);
              }}
              type="button"
              className={`flex items-start gap-4  rounded-xl border text-left transition-all relative ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50/40 shadow-sm shadow-indigo-100/50 ring-1 ring-indigo-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <div className="p-3 bg-slate-100 rounded-xl flex-shrink-0">
                {getIcon(curr.value)}
              </div>
              <div className="space-y-1 pr-6">
                <h3 className="font-semibold text-slate-900">{curr.en}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {curr.description?.en || "Custom study tracks and courses tailored to your academic needs."}
                </p>
              </div>

              {isSelected && (
                <span className="absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
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