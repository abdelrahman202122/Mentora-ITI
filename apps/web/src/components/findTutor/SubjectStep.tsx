"use client";

import { Calculator, FlaskConical, Languages, Binary, Book, Loader2, Check } from "lucide-react";
import { useSubjectCategories } from "@/hooks/metadata/useSubjectCategories";

interface SubjectStepProps {
  selected: string | null;
  onSelect: (value: string) => void;
  onNext: () => void;
}

export default function SubjectStep({
  selected,
  onSelect,
  onNext,
}: SubjectStepProps) {
  const { data: categories, isLoading, error } = useSubjectCategories();

  // Helper to assign icons to different subject categories
  const getIcon = (value: string) => {
    const val = value.toLowerCase();
    if (val.includes("math")) {
      return <Calculator className="size-6 text-indigo-600" />;
    }
    if (val.includes("science") || val.includes("phys") || val.includes("chem") || val.includes("bio")) {
      return <FlaskConical className="size-6 text-emerald-600" />;
    }
    if (val.includes("lang") || val.includes("english") || val.includes("arab") || val.includes("french")) {
      return <Languages className="size-6 text-amber-600" />;
    }
    if (val.includes("tech") || val.includes("comp") || val.includes("code") || val.includes("prog")) {
      return <Binary className="size-6 text-rose-600" />;
    }
    return <Book className="size-6 text-slate-600" />;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="size-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-sm">Loading subjects...</p>
      </div>
    );
  }

  if (error || !categories) {
    return (
      <div className="text-center py-20 text-red-500">
        <p className="font-medium">Failed to load subjects</p>
        <p className="text-xs text-slate-400 mt-1">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Select Subject Category</h2>
        <p className="text-sm text-slate-500 mt-1">
          Choose the subject or subject area you need assistance with.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const isSelected = selected === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => {
                onSelect(cat.value);
                // Tiny delay for smooth UX transition
                setTimeout(onNext, 2000);
              }}
              type="button"
              className={`flex flex-col items-center justify-center rounded-xl border text-center transition-all relative aspect-square ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50/40 shadow-sm shadow-indigo-100/50 ring-1 ring-indigo-500/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
              }`}
            >
              <div className="p-4 bg-slate-100 rounded-full mb-3 flex items-center justify-center">
                {getIcon(cat.value)}
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">{cat.en}</h3>

              {isSelected && (
                <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
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