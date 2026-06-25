"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import CurriculumStep from "./CurriculumStep";
import LevelStep from "./LevelStep";
import SubjectStep from "./SubjectStep";
import ResultsStep from "./ResultsStep";

interface StepperSidebarProps {
  currentStep: number;
  onStepClick: (stepNumber: number) => void;
  selectedCurriculum: string | null;
  selectedLevel: string | null;
  selectedSubject: string | null;
}

function StepperSidebar({
  currentStep,
  onStepClick,
  selectedCurriculum,
  selectedLevel,
  selectedSubject,
}: StepperSidebarProps) {
  const steps = [
    { number: 1, label: "Curriculum", value: selectedCurriculum },
    { number: 2, label: "Level", value: selectedLevel },
    { number: 3, label: "Subject", value: selectedSubject },
    { number: 4, label: "Results", value: null },
  ];

  return (
    <div className="flex flex-col gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
        Search Steps
      </h3>
      
      <div className="space-y-6 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
        {steps.map((step) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep && step.value !== null;
          const isClickable = step.number < currentStep || (step.value !== null && step.number !== 4);

          return (
            <button
              key={step.number}
              onClick={() => isClickable && onStepClick(step.number)}
              disabled={!isClickable}
              type="button"
              className={`flex items-center gap-4 text-left w-full transition-all group ${
                isClickable ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all z-10 ${
                  isActive
                    ? "border-indigo-600 bg-indigo-600 text-white ring-4 ring-indigo-50"
                    : isCompleted
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-200 bg-white text-slate-400 group-hover:border-slate-300"
                }`}
              >
                {isCompleted ? <Check className="size-4 stroke-[3]" /> : step.number}
              </div>
              <div className="space-y-0.5">
                <p
                  className={`text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-indigo-600"
                      : isCompleted
                      ? "text-slate-800"
                      : "text-slate-400"
                  }`}
                >
                  {step.label}
                </p>
                {step.value && (
                  <p className="text-[11px] text-emerald-600 font-medium capitalize">
                    {step.value}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FindTutor() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

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
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <LevelStep
            selected={selectedLevel}
            onSelect={setSelectedLevel}
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <SubjectStep
            selected={selectedSubject}
            onSelect={setSelectedSubject}
            onNext={handleNext}
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
          />
        );
      default:
        return <CurriculumStep selected={selectedCurriculum} onSelect={setSelectedCurriculum} onNext={handleNext} />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start max-w-6xl mx-auto py-4">
      {/* Sidebar - Visual Stepper Indicator */}
      <aside className="w-full lg:w-72 lg:sticky lg:top-6 flex-shrink-0">
        <StepperSidebar
          currentStep={currentStep}
          onStepClick={handleStepClick}
          selectedCurriculum={selectedCurriculum}
          selectedLevel={selectedLevel}
          selectedSubject={selectedSubject}
        />
      </aside>

      {/* Main Panel - Dynamic Stage Rendering */}
      <main className="flex-1 w-full bg-white border border-slate-100 rounded-2xl p-6 shadow-sm min-h-[480px] flex flex-col justify-between">
        <div className="flex-1 pb-8">
          {renderStep()}
        </div>
        
        {/* Persistent Navigation Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-5 mt-4 flex-shrink-0">
          <Button
            onClick={handleBack}
            disabled={currentStep === 1}
            variant="outline"
            className="border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-semibold px-5 py-2.5 rounded-xl"
          >
            Back
          </Button>

          {currentStep < 4 && (
            <Button
              onClick={handleNext}
              disabled={!isStepComplete()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer font-semibold px-6 py-2.5 rounded-xl transition-all"
            >
              Next Step
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}