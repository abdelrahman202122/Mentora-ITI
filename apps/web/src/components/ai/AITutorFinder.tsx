"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Bot, Loader2, Search, Sparkles, Star } from "lucide-react";
import { useLocale } from "next-intl";
import type React from "react";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFindTutorByAI } from "@/hooks/ai/use-ai-recommendations";
import { useCurricula } from "@/hooks/metadata/useCurricula";
import { useEducationLevels } from "@/hooks/metadata/useEducationLevels";
import { useSubjectCategories } from "@/hooks/metadata/useSubjectCategories";
import { ApiClientError } from "@/lib/axios";
import type { TutorRecommendation } from "@/types/ai/ai-types";

const anyValue = "any";

const fallbackCategories = [
  { value: "mathematics", en: "Mathematics" },
  { value: "sciences", en: "Sciences" },
  { value: "languages", en: "Languages" },
  { value: "technology", en: "Technology & CS" },
  { value: "test_prep", en: "Test Preparation" },
];

const fallbackEducationLevels = [
  { value: "primary", en: "Primary School" },
  { value: "preparatory", en: "Preparatory School" },
  { value: "secondary", en: "Secondary School" },
  { value: "university", en: "University" },
  { value: "professional", en: "Professional" },
];

const fallbackCurricula = [
  { value: "national_new", en: "Egyptian National (New)" },
  { value: "igcse", en: "IGCSE / Cambridge" },
  { value: "ib", en: "IB" },
  { value: "american", en: "American" },
  { value: "british", en: "British" },
  { value: "none", en: "Not Applicable" },
];

const tutorFinderSchema = z.object({
  goal: z.string().trim().max(300).optional(),
  query: z.string().trim().min(1, "Tell us the subject or topic").max(200),
  category: z.string().optional(),
  educationLevel: z.string().optional(),
  curriculum: z.string().optional(),
  languages: z.string().trim().max(120).optional(),
  maxHourlyRate: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.coerce
      .number()
      .positive("Budget must be greater than 0")
      .max(100000)
      .optional()
  ),
});

type TutorFinderFormInput = z.input<typeof tutorFinderSchema>;
type TutorFinderFormValues = z.output<typeof tutorFinderSchema>;

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Could not find tutor recommendations.";
}

function splitLanguages(value?: string) {
  return value
    ?.split(",")
    .map((language) => language.trim())
    .filter(Boolean);
}

function cleanOptionalValue(value?: string) {
  return value && value !== anyValue ? value : undefined;
}

function getStrengthClasses(strength: TutorRecommendation["matchStrength"]) {
  if (strength === "strong") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (strength === "good") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (strength === "partial") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

export function AITutorFinder() {
  const locale = useLocale();
  const finder = useFindTutorByAI();
  const categoriesQuery = useSubjectCategories();
  const educationLevelsQuery = useEducationLevels();
  const curriculaQuery = useCurricula();

  const categories = categoriesQuery.data ?? fallbackCategories;
  const educationLevels = educationLevelsQuery.data ?? fallbackEducationLevels;
  const curricula = curriculaQuery.data ?? fallbackCurricula;

  const form = useForm<TutorFinderFormInput, unknown, TutorFinderFormValues>({
    resolver: zodResolver(tutorFinderSchema),
    defaultValues: {
      goal: "",
      query: "",
      category: anyValue,
      educationLevel: anyValue,
      curriculum: anyValue,
      languages: "English",
      maxHourlyRate: "",
    },
  });
  const selectedCategory = useWatch({
    control: form.control,
    name: "category",
  });
  const selectedEducationLevel = useWatch({
    control: form.control,
    name: "educationLevel",
  });
  const selectedCurriculum = useWatch({
    control: form.control,
    name: "curriculum",
  });

  const recommendations = finder.data?.recommendations ?? [];
  const hasSearched = Boolean(finder.data);
  const errorMessage = useMemo(
    () => (finder.error ? getErrorMessage(finder.error) : null),
    [finder.error]
  );

  async function handleSubmit(values: TutorFinderFormValues) {
    const maxHourlyRate =
      typeof values.maxHourlyRate === "number"
        ? values.maxHourlyRate
        : undefined;

    await finder.mutateAsync({
      locale,
      goal: values.goal?.trim() || `Find a tutor for ${values.query}`,
      query: values.query,
      category: cleanOptionalValue(values.category),
      educationLevel: cleanOptionalValue(values.educationLevel),
      curriculum: cleanOptionalValue(values.curriculum),
      languages: splitLanguages(values.languages),
      maxHourlyRate,
      limit: 5,
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
          <Bot className="size-4" />
          AI Tutor Finder
        </div>
        <h1 className="text-2xl font-semibold text-slate-950">
          Find a tutor that matches your learning needs
        </h1>
        <p className="max-w-2xl text-sm text-slate-500">
          Search with structured criteria so recommendations keep working even
          when the AI text provider is unavailable.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Learning criteria</CardTitle>
            <CardDescription>
              These fields map directly to the backend recommendation engine.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <Field label="Goal" error={form.formState.errors.goal?.message}>
                <textarea
                  className="min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="I need help with IGCSE math before exams"
                  {...form.register("goal")}
                />
              </Field>

              <Field
                label="Subject or topic"
                error={form.formState.errors.query?.message}
              >
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="math"
                  {...form.register("query")}
                />
              </Field>

              <SelectField
                label="Category"
                value={selectedCategory ?? anyValue}
                onValueChange={(value) =>
                  form.setValue("category", value, { shouldDirty: true })
                }
                options={categories}
              />

              <SelectField
                label="Education level"
                value={selectedEducationLevel ?? anyValue}
                onValueChange={(value) =>
                  form.setValue("educationLevel", value, { shouldDirty: true })
                }
                options={educationLevels}
              />

              <SelectField
                label="Curriculum"
                value={selectedCurriculum ?? anyValue}
                onValueChange={(value) =>
                  form.setValue("curriculum", value, { shouldDirty: true })
                }
                options={curricula}
              />

              <Field
                label="Languages"
                error={form.formState.errors.languages?.message}
              >
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="English, Arabic"
                  {...form.register("languages")}
                />
              </Field>

              <Field
                label="Max hourly rate"
                error={form.formState.errors.maxHourlyRate?.message}
              >
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  min={1}
                  placeholder="300"
                  type="number"
                  {...form.register("maxHourlyRate")}
                />
              </Field>

              {errorMessage ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMessage}
                </p>
              ) : null}

              <Button
                className="h-10 w-full"
                disabled={finder.isPending}
                type="submit"
              >
                {finder.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                Find tutors
              </Button>
            </form>
          </CardContent>
        </Card>

        <section className="flex min-h-[520px] flex-col gap-4">
          {!hasSearched ? (
            <EmptyState />
          ) : recommendations.length === 0 ? (
            <NoResultsState />
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    Recommended tutors
                  </h2>
                  <p className="text-sm text-slate-500">
                    {recommendations.length} matches found
                  </p>
                </div>
                <Badge variant="outline">Ranked by match score</Badge>
              </div>

              <div className="grid gap-4">
                {recommendations.map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.tutorProfileId}
                    recommendation={recommendation}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function Field({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
      {label}
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

function SelectField({
  label,
  onValueChange,
  options,
  value,
}: {
  label: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; en: string }>;
  value: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <Select onValueChange={onValueChange} value={value}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue placeholder={`Any ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={anyValue}>Any</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.en}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        <Sparkles className="size-6" />
      </div>
      <h2 className="text-lg font-semibold text-slate-950">
        Your matches will appear here
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        The backend will score tutors by subject, curriculum, language, price,
        and quality.
      </p>
    </div>
  );
}

function NoResultsState() {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-slate-950">
        No tutors matched this search
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Try a broader subject, a different curriculum, or a higher hourly rate.
      </p>
    </div>
  );
}

function RecommendationCard({
  recommendation,
}: {
  recommendation: TutorRecommendation;
}) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{recommendation.profile.headline}</CardTitle>
            <CardDescription className="mt-1">
              {recommendation.profile.bio}
            </CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge
              className={getStrengthClasses(recommendation.matchStrength)}
              variant="outline"
            >
              {recommendation.matchStrength}
            </Badge>
            <div className="rounded-lg bg-slate-950 px-3 py-2 text-center text-white">
              <div className="text-lg font-semibold">
                {recommendation.score}
              </div>
              <div className="text-[11px] uppercase tracking-wide text-slate-300">
                score
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
          <InfoItem label="Hourly rate" value={`${recommendation.profile.hourlyRate} EGP`} />
          <InfoItem
            label="Rating"
            value={`${recommendation.profile.rating.toFixed(1)} (${recommendation.profile.totalReviews})`}
            icon={<Star className="size-3.5 fill-amber-400 text-amber-400" />}
          />
          <InfoItem
            label="Languages"
            value={recommendation.profile.languages.join(", ")}
          />
        </div>

        {recommendation.matchedSubjects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {recommendation.matchedSubjects.map((subject) => (
              <Badge key={subject.id} variant="secondary">
                {subject.title}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-2">
          {recommendation.reasons.map((reason) => (
            <div
              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600"
              key={reason}
            >
              {reason}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 flex items-center gap-1 font-medium text-slate-800">
        {icon}
        {value}
      </div>
    </div>
  );
}
