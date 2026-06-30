"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  Camera,
  GraduationCap,
  Languages,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { authKeys } from "@/hooks/auth/use-auth";
import { useUpdateTutorProfile } from "@/hooks/tutor/updateTutorProfile";
import { useUploadAvatar } from "@/hooks/tutor/useUploadeAvatar";
import { createTutorProfile } from "@/services/tutor/postProfile";
import type { UserData } from "@/services/tutor/patchProfile";
import {
  createTutorProfileSchema,
  type TutorProfilePayload,
} from "@/schemas/tutor/tutor-profile-schema";
import type {
  Experience,
  TutorProfileData,
} from "@/types/tutor/tutor-profile";

const MONTH_KEYS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

type Props = {
  mode: "create" | "update";
  data?: Partial<TutorProfileData> & { userData?: Partial<UserData> };
  tutorId?: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-600">{message}</p>;
}

function FieldLabel({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      className="text-sm font-medium text-foreground"
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}

export default function TutorProfileForm({ mode, data, tutorId }: Props) {
  const isUpdate = mode === "update";
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("tutorProfile.form");
  const tValidation = useTranslations("tutorProfile.validation");
  const queryClient = useQueryClient();
  const updateProfile = useUpdateTutorProfile(tutorId);
  const uploadAvatar = useUploadAvatar(tutorId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [newLanguage, setNewLanguage] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const profileSchema = useMemo(
    () => createTutorProfileSchema(tValidation),
    [tValidation]
  );

  const {
    control,
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<TutorProfilePayload>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: data?.userData?.name ?? "",
      headline: data?.headline ?? "",
      bio: data?.bio ?? "",
      hourlyRate: data?.hourlyRate ?? undefined,
      languages: data?.languages?.map((language) => ({ value: language })) ?? [],
      education: data?.education ?? [],
      experience: data?.experience ?? [],
    },
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({ control, name: "education" });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({ control, name: "experience" });

  const {
    fields: languageFields,
    append: appendLanguage,
    remove: removeLanguage,
  } = useFieldArray({ control, name: "languages" });

  const currentAvatar =
    avatarPreview ??
    (data?.userData?.avatar
      ? `/api/files/avatars/${data.userData.avatar}`
      : "/profile-default.jpeg");

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPendingAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleAddLanguage() {
    const trimmed = newLanguage.trim();
    if (!trimmed) return;
    appendLanguage({ value: trimmed });
    setNewLanguage("");
  }

  async function onSubmit(values: TutorProfilePayload) {
    setSubmitError(null);

    try {
      if (pendingAvatarFile) {
        await uploadAvatar.mutateAsync(pendingAvatarFile);
        setPendingAvatarFile(null);
      }

      const payload = {
        headline: values.headline,
        bio: values.bio,
        hourlyRate: values.hourlyRate,
        languages: values.languages.map((language) => language.value),
        education: values.education,
        experience: values.experience.map((experience: Experience) => ({
          ...experience,
          endYear: experience.endYear ?? null,
          endMonth: experience.endMonth ?? null,
        })),
        userData: { name: values.name },
      };

      if (isUpdate) {
        await updateProfile.mutateAsync(payload);
      } else {
        await createTutorProfile(payload);
        await queryClient.invalidateQueries({
          queryKey: authKeys.currentUser,
        });
        router.refresh();
        router.push(`/${locale}/tutor/dashboard`);
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t("errors.save"));
    }
  }

  return (
    <Card className="rounded-lg border-border bg-card shadow-none">
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-8 lg:grid-cols-[180px_1fr]">
            <div className="flex flex-col items-center gap-3">
              <button
                aria-label={t("avatar.change")}
                className="group relative size-32 overflow-hidden rounded-full border-4 border-border bg-muted"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <Image
                  alt={t("avatar.alt")}
                  className="object-cover"
                  fill
                  src={currentAvatar}
                />
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                  <Camera className="size-5" />
                  {t("avatar.change")}
                </span>
              </button>
              <input
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                ref={fileInputRef}
                type="file"
              />
              {avatarPreview ? (
                <p className="text-center text-xs font-medium text-primary">
                  {t("avatar.selected")}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <FieldLabel htmlFor="tutor-name">{t("fields.name")}</FieldLabel>
                <Input
                  id="tutor-name"
                  placeholder={t("placeholders.name")}
                  readOnly={!isUpdate}
                  {...register("name")}
                />
                <FieldError message={errors.name?.message} />
              </div>

              <div className="grid gap-2">
                <FieldLabel htmlFor="tutor-headline">
                  {t("fields.headline")}
                </FieldLabel>
                <Input
                  id="tutor-headline"
                  placeholder={t("placeholders.headline")}
                  {...register("headline")}
                />
                <FieldError message={errors.headline?.message} />
              </div>

              <div className="grid gap-2">
                <FieldLabel htmlFor="tutor-bio">{t("fields.bio")}</FieldLabel>
                <Textarea
                  className="min-h-32 resize-none"
                  id="tutor-bio"
                  placeholder={t("placeholders.bio")}
                  {...register("bio")}
                />
                <FieldError message={errors.bio?.message} />
              </div>

              <div className="grid max-w-xs gap-2">
                <FieldLabel htmlFor="tutor-hourly-rate">
                  {t("fields.hourlyRate")}
                </FieldLabel>
                <Input
                  id="tutor-hourly-rate"
                  min={1}
                  placeholder={t("placeholders.hourlyRate")}
                  type="number"
                  {...register("hourlyRate", { valueAsNumber: true })}
                />
                <FieldError message={errors.hourlyRate?.message} />
              </div>
            </div>
          </div>

          <Card size="sm" className="rounded-lg shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="size-4 text-primary" />
                {t("sections.languages")}
              </CardTitle>
              <CardDescription>{t("descriptions.languages")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex min-h-8 flex-wrap gap-2">
                {languageFields.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("empty.languages")}
                  </p>
                ) : null}
                {languageFields.map((field, index) => (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                    key={field.id}
                  >
                    <input
                      type="hidden"
                      {...register(`languages.${index}.value`)}
                    />
                    {field.value}
                    <button
                      aria-label={t("actions.removeLanguage", {
                        language: field.value,
                      })}
                      className="rounded-full hover:text-red-600"
                      onClick={() => removeLanguage(index)}
                      type="button"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  onChange={(event) => setNewLanguage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddLanguage();
                    }
                  }}
                  placeholder={t("placeholders.language")}
                  value={newLanguage}
                />
                <Button onClick={handleAddLanguage} type="button" variant="outline">
                  <Plus className="size-4" />
                  {t("actions.add")}
                </Button>
              </div>
              <FieldError message={errors.languages?.message} />
            </CardContent>
          </Card>

          <Card size="sm" className="rounded-lg shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="size-4 text-primary" />
                {t("sections.education")}
              </CardTitle>
              <CardDescription>{t("descriptions.education")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldError message={errors.education?.message as string} />
              {educationFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("empty.education")}
                </p>
              ) : null}
              {educationFields.map((field, index) => (
                <div
                  className="relative grid gap-3 rounded-lg border bg-muted/25 p-4 pr-12 sm:grid-cols-2"
                  key={field.id}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:col-span-2">
                    {t("entry", { number: index + 1 })}
                  </p>
                  <Input
                    placeholder={t("placeholders.degree")}
                    {...register(`education.${index}.degree`)}
                  />
                  <Input
                    placeholder={t("placeholders.field")}
                    {...register(`education.${index}.field`)}
                  />
                  <Input
                    placeholder={t("placeholders.institution")}
                    {...register(`education.${index}.institution`)}
                  />
                  <Input
                    placeholder={t("placeholders.graduationYear")}
                    type="number"
                    {...register(`education.${index}.graduationYear`, {
                      valueAsNumber: true,
                    })}
                  />
                  <FieldError message={errors.education?.[index]?.degree?.message} />
                  <FieldError message={errors.education?.[index]?.field?.message} />
                  <FieldError
                    message={errors.education?.[index]?.institution?.message}
                  />
                  <FieldError
                    message={errors.education?.[index]?.graduationYear?.message}
                  />
                  <Button
                    aria-label={t("actions.removeEntry")}
                    className="absolute right-3 top-3"
                    onClick={() => removeEducation(index)}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="size-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button
                onClick={() =>
                  appendEducation({
                    degree: "",
                    field: "",
                    institution: "",
                    graduationYear: 0,
                  })
                }
                type="button"
                variant="outline"
              >
                <Plus className="size-4" />
                {t("actions.addEducation")}
              </Button>
            </CardContent>
          </Card>

          <Card size="sm" className="rounded-lg shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="size-4 text-primary" />
                {t("sections.experience")}
              </CardTitle>
              <CardDescription>{t("descriptions.experience")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldError message={errors.experience?.message as string} />
              {experienceFields.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("empty.experience")}
                </p>
              ) : null}
              {experienceFields.map((field, index) => (
                <div
                  className="relative grid gap-3 rounded-lg border bg-muted/25 p-4 pr-12 sm:grid-cols-2"
                  key={field.id}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:col-span-2">
                    {t("entry", { number: index + 1 })}
                  </p>
                  <Input
                    className="sm:col-span-2"
                    placeholder={t("placeholders.jobTitle")}
                    {...register(`experience.${index}.title`)}
                  />
                  <Input
                    placeholder={t("placeholders.startYear")}
                    type="number"
                    {...register(`experience.${index}.startYear`, {
                      valueAsNumber: true,
                    })}
                  />
                  <Controller
                    control={control}
                    name={`experience.${index}.startMonth`}
                    render={({ field: controllerField }) => (
                      <select
                        className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        onChange={(event) =>
                          controllerField.onChange(Number(event.target.value))
                        }
                        value={controllerField.value ?? ""}
                      >
                        <option value="">{t("placeholders.startMonth")}</option>
                        {MONTH_KEYS.map((month, monthIndex) => (
                          <option key={month} value={monthIndex + 1}>
                            {t(`months.${month}`)}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  <Input
                    placeholder={t("placeholders.endYear")}
                    type="number"
                    {...register(`experience.${index}.endYear`, {
                      setValueAs: (value) =>
                        value === "" || Number.isNaN(Number(value))
                          ? null
                          : Number(value),
                    })}
                  />
                  <Controller
                    control={control}
                    name={`experience.${index}.endMonth`}
                    render={({ field: controllerField }) => (
                      <select
                        className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        onChange={(event) =>
                          controllerField.onChange(
                            event.target.value ? Number(event.target.value) : null
                          )
                        }
                        value={controllerField.value ?? ""}
                      >
                        <option value="">{t("placeholders.endMonth")}</option>
                        {MONTH_KEYS.map((month, monthIndex) => (
                          <option key={month} value={monthIndex + 1}>
                            {t(`months.${month}`)}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  <label className="flex cursor-pointer select-none items-center gap-2 text-sm sm:col-span-2">
                    <input
                      className="size-4 accent-primary"
                      type="checkbox"
                      {...register(`experience.${index}.isCurrent`)}
                    />
                    {t("fields.currentRole")}
                  </label>
                  <FieldError message={errors.experience?.[index]?.title?.message} />
                  <FieldError
                    message={errors.experience?.[index]?.startYear?.message}
                  />
                  <FieldError
                    message={errors.experience?.[index]?.startMonth?.message}
                  />
                  <Button
                    aria-label={t("actions.removeEntry")}
                    className="absolute right-3 top-3"
                    onClick={() => removeExperience(index)}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="size-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button
                onClick={() =>
                  appendExperience({
                    title: "",
                    startYear: 0,
                    startMonth: 0,
                    endYear: null,
                    endMonth: null,
                    isCurrent: false,
                  })
                }
                type="button"
                variant="outline"
              >
                <Plus className="size-4" />
                {t("actions.addExperience")}
              </Button>
            </CardContent>
          </Card>

          {submitError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {submitError}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {isSubmitting
                ? t("actions.saving")
                : isUpdate
                  ? t("actions.save")
                  : t("actions.create")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
