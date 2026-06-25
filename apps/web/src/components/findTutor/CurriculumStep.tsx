"use client";

import { BookOpen, Compass, Globe, Award, Loader2 } from "lucide-react";
import { useCurricula } from "@/hooks/metadata/useCurricula";
import { motion } from "framer-motion";
import SelectorCard from "./SelectorCard";

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
      return <Award className="size-6 text-on-primary-container" />;
    }
    if (val.includes("american") || val.includes("sat")) {
      return <Compass className="size-6 text-on-secondary-container" />;
    }
    if (val.includes("international") || val.includes("ib")) {
      return <Globe className="size-6 text-on-tertiary-container" />;
    }
    return <BookOpen className="size-6 text-on-surface-variant" />;
  };

  const getIconBg = (value: string) => {
    const val = value.toLowerCase();
    if (val.includes("british")) return "bg-primary-container/20";
    if (val.includes("american")) return "bg-secondary-container/20";
    if (val.includes("international")) return "bg-tertiary-container/20";
    return "bg-surface-dim";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !curricula) {
    return (
      <div className="text-center py-20 text-error">
        <p className="font-headline-sm text-headline-sm">Failed to load curricula</p>
        <p className="font-body-sm text-on-surface-variant mt-1">Please try again later</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-semibold mb-2">Select Curriculum</h2>
        <p className="text-slate-600">
          Choose the educational system you want to study under.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {curricula.map((curr, index) => {
          const isSelected = selected === curr.value;
          return (
            <motion.div
              key={curr.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="w-full"
            >
              <SelectorCard
                isSelected={isSelected}
                value={curr.value}
                onSelect={onSelect}
                onNext={onNext}
                icon={getIcon(curr.value)}
                iconBgClass={getIconBg(curr.value)}
                title={curr.en}
                description={curr.description?.en || "Custom study tracks and courses tailored to your academic needs."}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}