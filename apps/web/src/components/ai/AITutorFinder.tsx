"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bot,
  ExternalLink,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type React from "react";
import { useMemo, useState } from "react";
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
import { useCreateChat } from "@/hooks/chat/use-chat";
import { useCurricula } from "@/hooks/metadata/useCurricula";
import { useEducationLevels } from "@/hooks/metadata/useEducationLevels";
import { useSubjectCategories } from "@/hooks/metadata/useSubjectCategories";
import { ApiClientError } from "@/lib/axios";
import type {
  TutorRecommendation,
  TutorRecommendationInput,
} from "@/types/ai/ai-types";
import { getLocalePath } from "@/utils/i18n/locale-path";

type Translate = ReturnType<typeof useTranslations<"aiTutorFinder">>;

const anyValue = "any";

const fallbackCategories = [
  { value: "mathematics", labelKey: "fallbackCategories.mathematics" },
  { value: "sciences", labelKey: "fallbackCategories.sciences" },
  { value: "languages", labelKey: "fallbackCategories.languages" },
  { value: "technology", labelKey: "fallbackCategories.technology" },
  { value: "test_prep", labelKey: "fallbackCategories.test_prep" },
];

const fallbackEducationLevels = [
  { value: "primary", labelKey: "fallbackEducationLevels.primary" },
  { value: "preparatory", labelKey: "fallbackEducationLevels.preparatory" },
  { value: "secondary", labelKey: "fallbackEducationLevels.secondary" },
  { value: "university", labelKey: "fallbackEducationLevels.university" },
  { value: "professional", labelKey: "fallbackEducationLevels.professional" },
];

const fallbackCurricula = [
  { value: "national_new", labelKey: "fallbackCurricula.national_new" },
  { value: "igcse", labelKey: "fallbackCurricula.igcse" },
  { value: "ib", labelKey: "fallbackCurricula.ib" },
  { value: "american", labelKey: "fallbackCurricula.american" },
  { value: "british", labelKey: "fallbackCurricula.british" },
  { value: "none", labelKey: "fallbackCurricula.none" },
];

function createTutorFinderSchema(t: (key: string) => string) {
  return z.object({
    goal: z.string().trim().max(300).optional(),
    query: z.string().trim().min(1, t("validation.queryRequired")).max(200),
    category: z.string().optional(),
    educationLevel: z.string().optional(),
    curriculum: z.string().optional(),
    languages: z.string().trim().max(120).optional(),
    maxHourlyRate: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.coerce
        .number()
        .positive(t("validation.budgetPositive"))
        .max(100000)
        .optional()
    ),
  });
}

type TutorFinderSchema = ReturnType<typeof createTutorFinderSchema>;
type TutorFinderFormInput = z.input<TutorFinderSchema>;
type TutorFinderFormValues = z.output<TutorFinderSchema>;

function getErrorMessage(error: unknown, t: Translate) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return t("errors.recommendationsFailed");
}

function splitLanguages(value?: string) {
  const languages = value
    ?.split(",")
    .map((language) => language.trim())
    .filter(Boolean);

  return languages?.length ? languages : undefined;
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

function formatCriteriaValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return String(value);
}

export function AITutorFinder() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("aiTutorFinder");
  const finder = useFindTutorByAI();
  const createChat = useCreateChat();
  const [startingChatTutorId, setStartingChatTutorId] = useState<string | null>(
    null
  );
  const categoriesQuery = useSubjectCategories();
  const educationLevelsQuery = useEducationLevels();
  const curriculaQuery = useCurricula();
  const tutorFinderSchema = useMemo(() => createTutorFinderSchema(t), [t]);

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
      languages: "",
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
    () => (finder.error ? getErrorMessage(finder.error, t) : null),
    [finder.error, t]
  );
  const actionErrorMessage = useMemo(
    () => (createChat.error ? getErrorMessage(createChat.error, t) : null),
    [createChat.error, t]
  );
  const criteriaSummary = useMemo(
    () => getCriteriaSummary(finder.data?.criteria, t),
    [finder.data?.criteria, t]
  );

  async function handleSubmit(values: TutorFinderFormValues) {
    const maxHourlyRate =
      typeof values.maxHourlyRate === "number"
        ? values.maxHourlyRate
        : undefined;

    await finder.mutateAsync({
      locale,
      goal: values.goal?.trim() || t("goalFallback", { query: values.query }),
      query: values.query,
      category: cleanOptionalValue(values.category),
      educationLevel: cleanOptionalValue(values.educationLevel),
      curriculum: cleanOptionalValue(values.curriculum),
      languages: splitLanguages(values.languages),
      maxHourlyRate,
      limit: 5,
    });
  }

  async function handleStartChat(recommendation: TutorRecommendation) {
    setStartingChatTutorId(recommendation.tutorId);

    try {
      const chat = await createChat.mutateAsync({
        tutorId: recommendation.tutorId,
      });

      router.push(getLocalePath(locale, `/messages/${chat.id}`));
    } catch (error) {
      console.error("Failed to start AI recommendation chat", {
        error,
        tutorId: recommendation.tutorId,
      });
    } finally {
      setStartingChatTutorId(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
          <Bot className="size-4" />
          {t("badge")}
        </div>
        <h1 className="text-2xl font-semibold text-slate-950">
          {t("title")}
        </h1>
        <p className="max-w-2xl text-sm text-slate-500">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>{t("formTitle")}</CardTitle>
            <CardDescription>
              {t("formDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <Field
                label={t("fields.goal")}
                error={form.formState.errors.goal?.message}
              >
                <textarea
                  className="min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder={t("placeholders.goal")}
                  {...form.register("goal")}
                />
              </Field>

              <Field
                label={t("fields.query")}
                error={form.formState.errors.query?.message}
              >
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder={t("placeholders.query")}
                  {...form.register("query")}
                />
              </Field>

              <SelectField
                anyLabel={t("placeholders.any")}
                label={t("fields.category")}
                locale={locale}
                placeholder={t("placeholders.anyField", {
                  label: t("fields.category").toLowerCase(),
                })}
                value={selectedCategory ?? anyValue}
                onValueChange={(value) =>
                  form.setValue("category", value, { shouldDirty: true })
                }
                options={categories}
                t={t}
              />

              <SelectField
                anyLabel={t("placeholders.any")}
                label={t("fields.educationLevel")}
                locale={locale}
                placeholder={t("placeholders.anyField", {
                  label: t("fields.educationLevel").toLowerCase(),
                })}
                value={selectedEducationLevel ?? anyValue}
                onValueChange={(value) =>
                  form.setValue("educationLevel", value, { shouldDirty: true })
                }
                options={educationLevels}
                t={t}
              />

              <SelectField
                anyLabel={t("placeholders.any")}
                label={t("fields.curriculum")}
                locale={locale}
                placeholder={t("placeholders.anyField", {
                  label: t("fields.curriculum").toLowerCase(),
                })}
                value={selectedCurriculum ?? anyValue}
                onValueChange={(value) =>
                  form.setValue("curriculum", value, { shouldDirty: true })
                }
                options={curricula}
                t={t}
              />

              <Field
                label={t("fields.languages")}
                error={form.formState.errors.languages?.message}
              >
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder={t("placeholders.languages")}
                  {...form.register("languages")}
                />
              </Field>

              <Field
                label={t("fields.maxHourlyRate")}
                error={form.formState.errors.maxHourlyRate?.message}
              >
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  min={1}
                  placeholder={t("placeholders.maxHourlyRate")}
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
                {t("actions.findTutors")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <section className="flex min-h-[520px] flex-col gap-4">
          {!hasSearched ? (
            <EmptyState t={t} />
          ) : recommendations.length === 0 ? (
            <NoResultsState t={t} />
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    {t("results.title")}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {t("results.matchesFound", {
                      count: recommendations.length,
                    })}
                  </p>
                </div>
                <Badge variant="outline">{t("results.rankedByScore")}</Badge>
              </div>

              {criteriaSummary.length > 0 ? (
                <div className="flex flex-wrap gap-2 rounded-lg border border-slate-100 bg-white p-3">
                  <span className="text-sm font-medium text-slate-700">
                    {t("criteria.title")}
                  </span>
                  {criteriaSummary.map((item) => (
                    <Badge key={item.label} variant="secondary">
                      {item.label}: {item.value}
                    </Badge>
                  ))}
                </div>
              ) : null}

              {actionErrorMessage ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {actionErrorMessage}
                </p>
              ) : null}

              <div className="grid gap-4">
                {recommendations.map((recommendation) => (
                  <RecommendationCard
                    isStartingChat={
                      startingChatTutorId === recommendation.tutorId
                    }
                    key={recommendation.tutorProfileId}
                    onStartChat={() => handleStartChat(recommendation)}
                    profileHref={getLocalePath(
                      locale,
                      `/tutor-match/${recommendation.tutorId}`
                    )}
                    recommendation={recommendation}
                    t={t}
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

function getCriteriaSummary(
  criteria: TutorRecommendationInput | undefined,
  t: Translate
) {
  if (!criteria) {
    return [];
  }

  const entries: Array<{ label: string; value: unknown }> = [
    { label: t("fields.query"), value: criteria.query },
    { label: t("fields.category"), value: criteria.category },
    { label: t("fields.educationLevel"), value: criteria.educationLevel },
    { label: t("fields.curriculum"), value: criteria.curriculum },
    { label: t("fields.languages"), value: criteria.languages },
    { label: t("fields.maxHourlyRate"), value: criteria.maxHourlyRate },
  ];

  return entries
    .filter(
      (entry) =>
        entry.value !== undefined &&
        entry.value !== null &&
        entry.value !== "" &&
        (!Array.isArray(entry.value) || entry.value.length > 0)
    )
    .map((entry) => ({
      label: entry.label,
      value: formatCriteriaValue(entry.value),
    }));
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
  anyLabel,
  label,
  locale,
  onValueChange,
  options,
  placeholder,
  t,
  value,
}: {
  anyLabel: string;
  label: string;
  locale: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; en?: string; ar?: string; labelKey?: string }>;
  placeholder: string;
  t: Translate;
  value: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <Select onValueChange={onValueChange} value={value}>
        <SelectTrigger className="h-10 w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={anyValue}>{anyLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.labelKey ? t(option.labelKey) : locale === "ar" ? option.ar : option.en}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function EmptyState({ t }: { t: Translate }) {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        <Sparkles className="size-6" />
      </div>
      <h2 className="text-lg font-semibold text-slate-950">
        {t("empty.title")}
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        {t("empty.description")}
      </p>
    </div>
  );
}

function NoResultsState({ t }: { t: Translate }) {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-slate-950">
        {t("noResults.title")}
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        {t("noResults.description")}
      </p>
    </div>
  );
}

function RecommendationCard({
  isStartingChat,
  onStartChat,
  profileHref,
  recommendation,
  t,
}: {
  isStartingChat: boolean;
  onStartChat: () => void;
  profileHref: string;
  recommendation: TutorRecommendation;
  t: Translate;
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
              {t(`strength.${recommendation.matchStrength}`)}
            </Badge>
            <div className="rounded-lg bg-slate-950 px-3 py-2 text-center text-white">
              <div className="text-lg font-semibold">
                {recommendation.score}
              </div>
              <div className="text-[11px] uppercase tracking-wide text-slate-300">
                {t("results.score")}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
          <InfoItem
            label={t("results.hourlyRate")}
            value={`${recommendation.profile.hourlyRate} EGP`}
          />
          <InfoItem
            label={t("results.rating")}
            value={`${recommendation.profile.rating.toFixed(1)} (${recommendation.profile.totalReviews})`}
            icon={<Star className="size-3.5 fill-amber-400 text-amber-400" />}
          />
          <InfoItem
            label={t("results.languages")}
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

        <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row">
          <Button asChild className="h-9 flex-1" variant="outline">
            <Link href={profileHref}>
              <ExternalLink className="size-4" />
              {t("actions.viewProfile")}
            </Link>
          </Button>
          <Button
            className="h-9 flex-1"
            disabled={isStartingChat}
            onClick={onStartChat}
            type="button"
          >
            {isStartingChat ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <MessageSquare className="size-4" />
            )}
            {isStartingChat
              ? t("actions.startingChat")
              : t("actions.messageTutor")}
          </Button>
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
