"use client";

import { GraduationCap, Award, BookOpen, Book, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEducationLevels } from "@/hooks/metadata/useEducationLevels";
import { motion } from "framer-motion";
import SelectorCard from "./SelectorCard";

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
  const locale = useLocale();
  const t = useTranslations("findTutor.level");
  const { data: levels, isLoading, error } = useEducationLevels();

  // Helper to assign icons to different levels
  const getIcon = (value: string) => {
    const val = value.toLowerCase();
    if (val.includes("primary")) {
      return <BookOpen className="size-6 text-on-primary-container" />;
    }
    if (val.includes("prep") || val.includes("middle")) {
      return <Book className="size-6 text-on-secondary-container" />;
    }
    if (val.includes("secondary") || val.includes("high")) {
      return <GraduationCap className="size-6 text-on-tertiary-container" />;
    }
    return <Award className="size-6 text-error" />;
  };

  const getIconBg = (value: string) => {
    const val = value.toLowerCase();
    if (val.includes("primary")) return "bg-primary-container/20";
    if (val.includes("prep")) return "bg-secondary-container/20";
    if (val.includes("secondary")) return "bg-tertiary-container/20";
    return "bg-error/10";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !levels) {
    return (
      <div className="text-center py-20 text-error">
        <p className="font-headline-sm text-headline-sm">
          {t("loadErrorTitle")}
        </p>
        <p className="font-body-sm text-on-surface-variant mt-1">
          {t("loadErrorDescription")}
        </p>
      </div>
    );
  }

  // Sort levels by order if available
  const sortedLevels = [...levels].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-semibold mb-2">{t("title")}</h2>
        <p className="text-slate-600">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {sortedLevels.map((lvl, index) => {
          const isSelected = selected === lvl.value;
          return (
            <motion.div
              key={lvl.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="w-full"
            >
              <SelectorCard
                isSelected={isSelected}
                value={lvl.value}
                onSelect={onSelect}
                onNext={onNext}
                icon={getIcon(lvl.value)}
                iconBgClass={getIconBg(lvl.value)}
                title={locale === "ar" ? lvl.ar : lvl.en}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
