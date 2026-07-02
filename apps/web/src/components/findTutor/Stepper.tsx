'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import CurriculumStep from './CurriculumStep';
import LevelStep from './LevelStep';
import SubjectStep from './SubjectStep';
import ResultsStep from './ResultsStep';
import { motion, AnimatePresence } from 'framer-motion';
import type { TutorSearchSort } from '@/services/tutorsLearner/tutor-search';

interface StepperSidebarProps {
  currentStep: number;
  onStepClick: (stepNumber: number) => void;
  selectedCurriculum: string | null;
  selectedLevel: string | null;
  selectedSubject: string | null;
}

const selectedValueTranslationKeys: Record<string, string> = {
  american: 'options.american',
  british: 'options.british',
  ib: 'options.ib',
  igcse: 'options.igcse',
  languages: 'options.languages',
  mathematics: 'options.mathematics',
  national_new: 'options.national',
  none: 'options.noCurriculum',
  preparatory: 'options.preparatory',
  primary: 'options.primary',
  professional: 'options.professional',
  sciences: 'options.sciences',
  secondary: 'options.secondary',
  technology: 'options.technology',
  university: 'options.university',
};

function normalizeSelectedValue(value: string) {
  return value.trim().toLowerCase().replaceAll(' ', '_');
}

function StepperSidebar({
  currentStep,
  onStepClick,
  selectedCurriculum,
  selectedLevel,
  selectedSubject,
}: StepperSidebarProps) {
  const locale = useLocale();
  const t = useTranslations('findTutor.steps');
  const tFindTutor = useTranslations('findTutor');
  const isRtl = locale === 'ar';
  const getSelectedValueLabel = (value: string) => {
    const normalizedValue = normalizeSelectedValue(value);
    const key = selectedValueTranslationKeys[normalizedValue];

    return key ? tFindTutor(key) : value.replaceAll('_', ' ');
  };

  const steps = [
    { number: 1, label: t('curriculum'), value: selectedCurriculum },
    { number: 2, label: t('level'), value: selectedLevel },
    { number: 3, label: t('subject'), value: selectedSubject },
    { number: 4, label: t('results'), value: null },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm">{t('title')}</CardTitle>
      </CardHeader>

      <CardContent>
        <div
          className={`grid grid-cols-4 gap-2 lg:relative lg:block lg:space-y-5 lg:before:absolute lg:before:bottom-2 lg:before:top-2 lg:before:w-px lg:before:bg-border ${
            isRtl ? 'lg:before:right-[15px]' : 'lg:before:left-[15px]'
          }`}
        >
          {steps.map((step) => {
            const isActive = step.number === currentStep;
            const isCompleted =
              step.number < currentStep && step.value !== null;
            const isClickable =
              step.number < currentStep ||
              (step.value !== null && step.number !== 4);

            return (
              <button
                key={step.number}
                onClick={() => isClickable && onStepClick(step.number)}
                disabled={!isClickable}
                type="button"
                className={`group flex min-w-0 flex-col items-center gap-2 rounded-lg p-2 text-center transition-colors lg:flex-row lg:items-center lg:gap-4 lg:p-0 ${
                  isRtl ? 'lg:text-right' : 'lg:text-left'
                } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div
                  className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-all ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground ring-4 ring-primary/10'
                      : isCompleted
                        ? 'border-primary bg-secondary text-primary'
                        : 'border-border bg-card text-muted-foreground group-hover:border-primary/40'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="size-4 stroke-[3]" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p
                    className={`truncate text-xs font-medium transition-colors sm:text-sm ${
                      isActive
                        ? 'text-primary'
                        : isCompleted
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.value && (
                    <p className="hidden max-w-36 truncate text-xs font-medium capitalize text-muted-foreground lg:block">
                      {getSelectedValueLabel(step.value)}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

type FindTutorProps = {
  initialStep?: number;
  initialFilters?: {
    curriculum: string | null;
    languageQuery: string;
    level: string | null;
    maxHourlyRate: string;
    minHourlyRate: string;
    minRating: string;
    page: string;
    searchQuery: string;
    sortBy: string;
    subject: string | null;
  };
};

function normalizeInitialPage(page: string) {
  const parsed = Number(page);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function normalizeInitialSort(sortBy: string): TutorSearchSort {
  return ['relevance', 'rating', 'price_asc', 'price_desc'].includes(sortBy)
    ? (sortBy as TutorSearchSort)
    : 'relevance';
}

export default function FindTutor({
  initialStep = 1,
  initialFilters,
}: FindTutorProps) {
  const t = useTranslations('findTutor.steps');
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string | null>(
    initialFilters?.curriculum ?? null,
  );
  const [selectedLevel, setSelectedLevel] = useState<string | null>(
    initialFilters?.level ?? null,
  );
  const [selectedSubject, setSelectedSubject] = useState<string | null>(
    initialFilters?.subject ?? null,
  );

  // Checks if the user is allowed to proceed to the next step
  const isStepComplete = () => {
    if (currentStep === 1) return selectedCurriculum !== null;
    if (currentStep === 2) return selectedLevel !== null;
    if (currentStep === 3) return selectedSubject !== null;
    return true;
  };

  const handleNext = () => {
    if (isStepComplete() && currentStep < 4) {
      setCurrentStep((s) => s + 1);
    }
  };
  const handleAutoAdvance = () => {
    setCurrentStep((s) => (s < 4 ? s + 1 : s));
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleReset = () => {
    setSelectedCurriculum(null);
    setSelectedLevel(null);
    setSelectedSubject(null);
    setCurrentStep(1);
  };

  const handleStepClick = (stepNumber: number) => {
    setCurrentStep(stepNumber);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CurriculumStep
            selected={selectedCurriculum}
            onSelect={setSelectedCurriculum}
            onNext={handleAutoAdvance}
          />
        );
      case 2:
        return (
          <LevelStep
            selected={selectedLevel}
            onSelect={setSelectedLevel}
            onNext={handleAutoAdvance}
          />
        );
      case 3:
        return (
          <SubjectStep
            selected={selectedSubject}
            onSelect={setSelectedSubject}
            onNext={handleAutoAdvance}
          />
        );
      case 4:
        return (
          <ResultsStep
            curriculum={selectedCurriculum}
            level={selectedLevel}
            subject={selectedSubject}
            onReset={handleReset}
            onEditStep={handleStepClick}
            setCurriculum={setSelectedCurriculum}
            setLevel={setSelectedLevel}
            setSubject={setSelectedSubject}
            initialLanguageQuery={initialFilters?.languageQuery ?? ''}
            initialMaxHourlyRate={initialFilters?.maxHourlyRate ?? ''}
            initialMinHourlyRate={initialFilters?.minHourlyRate ?? ''}
            initialMinRating={initialFilters?.minRating ?? 'all'}
            initialPage={normalizeInitialPage(initialFilters?.page ?? '1')}
            initialSearchQuery={initialFilters?.searchQuery ?? ''}
            initialSortBy={normalizeInitialSort(
              initialFilters?.sortBy ?? 'relevance',
            )}
          />
        );
      default:
        return (
          <CurriculumStep
            selected={selectedCurriculum}
            onSelect={setSelectedCurriculum}
            onNext={handleNext}
          />
        );
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 py-4 lg:flex-row lg:gap-6">
      {/* Sidebar - Visual Stepper Indicator */}
      <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-72">
        <StepperSidebar
          currentStep={currentStep}
          onStepClick={handleStepClick}
          selectedCurriculum={selectedCurriculum}
          selectedLevel={selectedLevel}
          selectedSubject={selectedSubject}
        />
      </aside>

      {/* Main Panel - Dynamic Stage Rendering */}
      <Card className="min-h-[500px] w-full flex-1">
        <CardContent className="flex flex-1 flex-col">
          <div className="flex-1 pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </CardContent>

        {/* Persistent Navigation Controls */}
        <CardFooter className="justify-between">
          <Button
            onClick={handleBack}
            disabled={currentStep === 1}
            variant="outline"
          >
            {t('back')}
          </Button>

          {currentStep < 4 && (
            <Button onClick={handleNext} disabled={!isStepComplete()}>
              {t('next')}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
