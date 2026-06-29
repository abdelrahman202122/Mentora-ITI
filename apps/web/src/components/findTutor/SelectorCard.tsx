'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { useLocale } from 'next-intl';

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
  const locale = useLocale();
  const isRtl = locale === 'ar';

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
        isRtl ? 'flex-row-reverse text-right' : 'text-left'
      } ${
        description ? 'items-start p-4' : 'items-center p-2'
      } gap-3 rounded-2xl border transition-all duration-300 w-full cursor-pointer ${
        isSelected
          ? 'border-primary bg-primary-container/10 ring-1 ring-primary shadow-sm'
          : 'border-outline-variant bg-surface-container-lowest hover:border-primary/50 hover:shadow-md'
      }`}
    >
      <div
        className={`rounded-full shrink-0 flex items-center justify-center ${
          description ? 'p-3' : 'p-4'
        } ${iconBgClass}`}
      >
        {icon}
      </div>
      <div className={`min-w-0 ${isRtl ? 'pl-6' : 'pr-6'}`}>
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
        <div
          className={`absolute top-3 bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm ${
            isRtl ? 'left-3' : 'right-3'
          }`}
        >
          <Check className="size-4" />
        </div>
      )}
    </button>
  );
}
