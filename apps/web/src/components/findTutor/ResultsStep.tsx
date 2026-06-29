"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Eye,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Star,
  User,
} from "lucide-react";

import { AIFinderCta } from "@/components/ai/AIFinderCta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  searchTutors,
  type TutorSearchItem,
  type TutorSearchSort,
} from "@/services/tutorsLearner/tutor-search";
import { getLocalePath } from "@/utils/i18n/locale-path";

const ALL_VALUE = "all";
const RESULTS_PAGE_SIZE = 10;

const curriculumOptions = [
  { value: "national_new", labelKey: "national" },
  { value: "igcse", labelKey: "igcse" },
  { value: "british", labelKey: "british" },
  { value: "american", labelKey: "american" },
  { value: "ib", labelKey: "ib" },
  { value: "none", labelKey: "noCurriculum" },
] as const;

const levelOptions = [
  { value: "primary", labelKey: "primary" },
  { value: "preparatory", labelKey: "preparatory" },
  { value: "secondary", labelKey: "secondary" },
  { value: "university", labelKey: "university" },
  { value: "professional", labelKey: "professional" },
] as const;

const subjectOptions = [
  { value: "mathematics", labelKey: "mathematics" },
  { value: "sciences", labelKey: "sciences" },
  { value: "languages", labelKey: "languages" },
  { value: "technology", labelKey: "technology" },
] as const;

type ResultsStepProps = {
  curriculum: string | null;
  level: string | null;
  subject: string | null;
  onReset: () => void;
  onEditStep?: (stepNumber: number) => void;
  setCurriculum?: (value: string | null) => void;
  setLevel?: (value: string | null) => void;
  setSubject?: (value: string | null) => void;
};

function normalizeFilterValue(value: string | null | undefined) {
  return value && value !== ALL_VALUE ? value : undefined;
}

function parseOptionalNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function splitLanguages(value: string) {
  return value
    .split(",")
    .map((language) => language.trim())
    .filter(Boolean);
}

function getTutorInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getPrimarySubject(tutor: TutorSearchItem) {
  return tutor.subjects[0]?.title ?? "General tutoring";
}

function TutorResultsSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="flex flex-col gap-4 md:flex-row">
            <div className="h-14 w-14 shrink-0 rounded-lg bg-muted" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-3 w-64 max-w-full rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
              <div className="flex gap-2">
                <div className="h-6 w-20 rounded-full bg-muted" />
                <div className="h-6 w-24 rounded-full bg-muted" />
              </div>
            </div>
            <div className="h-20 w-full shrink-0 rounded-lg bg-muted md:w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ResultsStep({
  curriculum,
  level,
  subject,
  onReset,
  setCurriculum,
  setLevel,
  setSubject,
}: ResultsStepProps) {
  const locale = useLocale();
  const t = useTranslations("findTutor");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCurriculum, setSelectedCurriculum] = useState(
    curriculum || ALL_VALUE,
  );
  const [selectedLevel, setSelectedLevel] = useState(level || ALL_VALUE);
  const [selectedSubject, setSelectedSubject] = useState(subject || ALL_VALUE);
  const [sortBy, setSortBy] = useState<TutorSearchSort>("relevance");
  const [languageQuery, setLanguageQuery] = useState("");
  const [minHourlyRate, setMinHourlyRate] = useState("");
  const [maxHourlyRate, setMaxHourlyRate] = useState("");
  const [minRating, setMinRating] = useState(ALL_VALUE);
  const [page, setPage] = useState(1);

  const queryParams = useMemo(() => {
    const trimmedSearch = searchQuery.trim();
    const languages = splitLanguages(languageQuery);

    return {
      q: trimmedSearch.length >= 2 ? trimmedSearch : undefined,
      category: normalizeFilterValue(selectedSubject),
      educationLevel: normalizeFilterValue(selectedLevel),
      curriculum: normalizeFilterValue(selectedCurriculum),
      languages: languages.length > 0 ? languages : undefined,
      minHourlyRate: parseOptionalNumber(minHourlyRate),
      maxHourlyRate: parseOptionalNumber(maxHourlyRate),
      minRating: parseOptionalNumber(minRating),
      sortBy,
      page,
      limit: RESULTS_PAGE_SIZE,
    };
  }, [
    languageQuery,
    maxHourlyRate,
    minHourlyRate,
    minRating,
    page,
    searchQuery,
    selectedCurriculum,
    selectedLevel,
    selectedSubject,
    sortBy,
  ]);

  const { data, error, isError, isFetching, isPending, refetch } = useQuery({
    queryKey: ["tutor-search", queryParams],
    queryFn: () => searchTutors(queryParams),
  });

  useEffect(() => {
    setPage(1);
  }, [
    languageQuery,
    maxHourlyRate,
    minHourlyRate,
    minRating,
    searchQuery,
    selectedCurriculum,
    selectedLevel,
    selectedSubject,
    sortBy,
  ]);

  const tutors = data?.tutors ?? [];
  const pagination = data?.pagination;

  function handleReset() {
    setSearchQuery("");
    setSelectedCurriculum(ALL_VALUE);
    setSelectedLevel(ALL_VALUE);
    setSelectedSubject(ALL_VALUE);
    setSortBy("relevance");
    setLanguageQuery("");
    setMinHourlyRate("");
    setMaxHourlyRate("");
    setMinRating(ALL_VALUE);
    setPage(1);
    setCurriculum?.(null);
    setLevel?.(null);
    setSubject?.(null);
    onReset();
  }

  return (
    <div className="space-y-6">
      <AIFinderCta
        href={getLocalePath(locale, "/ai-assistant")}
        title={t("aiCta.title")}
        description={t("aiCta.description")}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>{t("filters.title")}</CardTitle>
              <CardDescription>{t("filters.description")}</CardDescription>
            </div>

            <Button onClick={handleReset} type="button" variant="outline">
              <RefreshCcw className="size-4" />
              {t("filters.startOver")}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3 xl:grid-cols-[minmax(220px,1fr)_repeat(4,minmax(150px,auto))]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-9 bg-white pl-9"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("filters.searchPlaceholder")}
                type="search"
                value={searchQuery}
              />
            </div>

            <Select
              value={selectedCurriculum}
              onValueChange={(value) => {
                setSelectedCurriculum(value);
                setCurriculum?.(value === ALL_VALUE ? null : value);
              }}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder={t("filters.allCurricula")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>
                  {t("filters.allCurricula")}
                </SelectItem>
                {curriculumOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(`options.${option.labelKey}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedLevel}
              onValueChange={(value) => {
                setSelectedLevel(value);
                setLevel?.(value === ALL_VALUE ? null : value);
              }}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder={t("filters.allLevels")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>
                  {t("filters.allLevels")}
                </SelectItem>
                {levelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(`options.${option.labelKey}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedSubject}
              onValueChange={(value) => {
                setSelectedSubject(value);
                setSubject?.(value === ALL_VALUE ? null : value);
              }}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder={t("filters.allSubjects")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>
                  {t("filters.allSubjects")}
                </SelectItem>
                {subjectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(`options.${option.labelKey}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as TutorSearchSort)}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder={t("filters.sortBy")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">
                  {t("options.relevance")}
                </SelectItem>
                <SelectItem value="rating">{t("options.rating")}</SelectItem>
                <SelectItem value="price_asc">
                  {t("options.priceAsc")}
                </SelectItem>
                <SelectItem value="price_desc">
                  {t("options.priceDesc")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border bg-muted/40 p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <SlidersHorizontal className="size-4 text-slate-500" />
              {t("filters.advanced")}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Input
                className="h-9 bg-white"
                onChange={(event) => setLanguageQuery(event.target.value)}
                placeholder={t("filters.languagesPlaceholder")}
                value={languageQuery}
              />
              <Input
                className="h-9 bg-white"
                min={0}
                onChange={(event) => setMinHourlyRate(event.target.value)}
                placeholder={t("filters.minRatePlaceholder")}
                type="number"
                value={minHourlyRate}
              />
              <Input
                className="h-9 bg-white"
                min={0}
                onChange={(event) => setMaxHourlyRate(event.target.value)}
                placeholder={t("filters.maxRatePlaceholder")}
                type="number"
                value={maxHourlyRate}
              />
              <Select value={minRating} onValueChange={setMinRating}>
                <SelectTrigger className="h-9 bg-white">
                  <SelectValue placeholder={t("filters.minimumRating")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>
                    {t("filters.anyRating")}
                  </SelectItem>
                  <SelectItem value="4">4.0+</SelectItem>
                  <SelectItem value="4.5">4.5+</SelectItem>
                  <SelectItem value="4.8">4.8+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {t("results.count", { count: pagination?.total ?? 0 })}
          </h2>
          <p className="text-sm text-slate-600">
            {isFetching ? t("results.updating") : t("results.approvedOnly")}
          </p>
        </div>
      </div>

      {isPending ? <TutorResultsSkeleton /> : null}

      {isError ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">
              {t("results.loadErrorTitle")}
            </CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={() => void refetch()}
              type="button"
              variant="outline"
            >
              {t("results.tryAgain")}
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      {!isPending && !isError && tutors.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <User className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">
              {t("results.emptyTitle")}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              {t("results.emptyDescription")}
            </p>
            <Button className="mt-5" onClick={handleReset} type="button">
              {t("results.clearFilters")}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {tutors.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {tutors.map((tutor) => (
            <TutorResultCard key={tutor.userId} locale={locale} tutor={tutor} />
          ))}
        </div>
      ) : null}

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Button
            disabled={page <= 1 || isFetching}
            onClick={() =>
              setPage((currentPage) => Math.max(1, currentPage - 1))
            }
            type="button"
            variant="outline"
          >
            {t("results.previous")}
          </Button>
          <span className="text-sm text-slate-600">
            {t("results.pageOf", {
              page: pagination.page,
              totalPages: pagination.totalPages,
            })}
          </span>
          <Button
            disabled={page >= pagination.totalPages || isFetching}
            onClick={() =>
              setPage((currentPage) =>
                Math.min(pagination.totalPages, currentPage + 1),
              )
            }
            type="button"
            variant="outline"
          >
            {t("results.next")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function TutorResultCard({
  locale,
  tutor,
}: {
  locale: string;
  tutor: TutorSearchItem;
}) {
  const t = useTranslations("findTutor.results");
  const primarySubject = getPrimarySubject(tutor);
  const bookingHref =
    getLocalePath(locale, "/booking") +
    `?tutorId=${tutor.userId}` +
    `&tutorName=${encodeURIComponent(tutor.name)}` +
    `&hourlyRate=${tutor.profile.hourlyRate}` +
    "&currency=EGP" +
    `&subject=${encodeURIComponent(primarySubject)}`;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 md:flex-row">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-secondary text-base font-semibold text-primary">
          {getTutorInitials(tutor.name) || <User className="size-6" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {tutor.name}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {tutor.profile.headline}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-lg font-semibold text-slate-950">
                {tutor.profile.hourlyRate} EGP
              </p>
              <p className="text-xs text-slate-500">{t("perHour")}</p>
            </div>
          </div>

          <p className="mt-3 line-clamp-2 text-sm text-slate-600">
            {tutor.profile.bio}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {tutor.subjects.slice(0, 4).map((subject) => (
              <Badge key={subject.id} variant="secondary">
                {subject.title}
              </Badge>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              {tutor.profile.rating ?? 0} ({tutor.profile.totalReviews ?? 0})
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="size-4 text-slate-400" />
              {tutor.profile.isAvailable
                ? t("available")
                : t("availabilityVaries")}
            </span>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-2 md:w-40 md:grid-cols-1">
          <Button asChild variant="outline">
            <Link href={getLocalePath(locale, `/tutor-match/${tutor.userId}`)}>
              <Eye className="size-4" />
              {t("viewProfile")}
            </Link>
          </Button>
          <Button asChild>
            <Link href={bookingHref}>{t("bookSession")}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
