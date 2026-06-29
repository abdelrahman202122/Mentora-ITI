"use client";

import { useState } from "react";
import { Calculator, FlaskConical, Languages, Binary, Book, Loader2, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSubjectCategories } from "@/hooks/metadata/useSubjectCategories";
import SelectorCard from "./SelectorCard";

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
  const locale = useLocale();
  const t = useTranslations("findTutor.subject");
  const { data: categories, isLoading, error } = useSubjectCategories();
  const [searchQuery, setSearchQuery] = useState("");

  const getIcon = (value: string) => {
    const val = value.toLowerCase();
    if (val.includes("math")) return <Calculator className="size-6 text-on-primary-container" />;
    if (val.includes("science") || val.includes("phys") || val.includes("chem") || val.includes("bio")) return <FlaskConical className="size-6 text-on-secondary-container" />;
    if (val.includes("lang") || val.includes("english") || val.includes("arab") || val.includes("french")) return <Languages className="size-6 text-on-tertiary-container" />;
    if (val.includes("tech") || val.includes("comp") || val.includes("code") || val.includes("prog")) return <Binary className="size-6 text-on-surface" />;
    return <Book className="size-6 text-on-surface-variant" />;
  };

  const getIconBg = (value: string) => {
    const val = value.toLowerCase();
    if (val.includes("math")) return "bg-primary-container/20";
    if (val.includes("science")) return "bg-secondary-container/20";
    if (val.includes("lang")) return "bg-tertiary-container/20";
    return "bg-surface-dim";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !categories) {
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

  const filteredCategories = categories.filter((cat) =>
    `${cat.en} ${cat.ar}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
          {t("title")}
        </h2>
        <p className="font-body-lg text-on-surface-variant">
          {t("description")}
        </p>
      </div>

      {/* Search Input */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-outline" />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-xl font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredCategories.map((cat) => (
          <SelectorCard
            key={cat.value}
            isSelected={selected === cat.value}
            value={cat.value}
            onSelect={onSelect}
            onNext={onNext}
            icon={getIcon(cat.value)}
            iconBgClass={getIconBg(cat.value)}
            title={locale === "ar" ? cat.ar : cat.en}
          />
        ))}
      </div>
    </div>
  );
}
