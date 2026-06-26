"use client";

import React from "react";
import { Check } from "lucide-react";

interface SelectorCardProps {
  isSelected: boolean;
  value: string;
  onSelect: (value: string) => void;
  onNext?: () => void;
  icon: React.ReactNode;
  iconBgClass: string;
  title: string;
  description?: string;
}

export default function SelectorCard({
  isSelected,
  value,
  onSelect,
  onNext,
  icon,
  iconBgClass,
  title,
  description,
}: SelectorCardProps) {
  const handleClick = () => {
    onSelect(value);
    if (onNext) {
      setTimeout(onNext, 250);
    }
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`relative flex ${
        description ? "items-start p-4" : "items-center p-2"
      } gap-4 rounded-2xl border text-left transition-all duration-300 w-full cursor-pointer ${
        isSelected
          ? "border-primary bg-primary-container/10 ring-1 ring-primary shadow-sm"
          : "border-outline-variant bg-surface-container-lowest hover:border-primary/50 hover:shadow-md"
      }`}
    >
      <div
        className={`rounded-full flex-shrink-0 flex items-center justify-center ${
          description ? "p-3" : "p-4"
        } ${iconBgClass}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0 pr-6">
        <span className="font-label-md text-on-surface block font-medium truncate">
          {title}
        </span>
        {description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-1">
            {description}
          </p>
        )}
      </div>

      {isSelected && (
        <div className="absolute top-3 right-3 bg-primary text-on-primary rounded-full p-0.5 shadow-sm">
          <Check className="size-4" />
        </div>
      )}
    </button>
  );
}

