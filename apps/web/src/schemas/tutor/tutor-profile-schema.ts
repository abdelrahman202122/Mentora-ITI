import { z } from "zod";

const currentYear = new Date().getFullYear();

type TutorProfileValidationTranslator = (
  key: string,
  values?: Record<string, string | number>
) => string;

const defaultValidation: TutorProfileValidationTranslator = (key, values) => {
  const messages: Record<string, string> = {
    nameRequired: "Name is required",
    headlineRequired: "Headline is required",
    bioMin: "Bio must be at least 10 characters",
    hourlyRateNumber: "Hourly rate must be a number",
    hourlyRateMin: "Rate must be at least 1",
    languageRequired: "Language is required",
    languagesMin: "Add at least one language",
    degreeRequired: "Degree is required",
    fieldRequired: "Field is required",
    institutionRequired: "Institution is required",
    yearNumber: "Year must be a number",
    yearMin: "Year must be 1970 or later",
    yearMax: `Year must be ${values?.year ?? currentYear} or earlier`,
    titleRequired: "Title is required",
    startYearRequired: "Start year is required",
    startMonthRequired: "Start month is required",
    startMonthRange: "Start month must be between 1 and 12",
    endMonthRange: "End month must be between 1 and 12",
    educationMin: "Add at least one education entry",
  };

  return messages[key] ?? key;
};

export function createTutorProfileSchema(
  t: TutorProfileValidationTranslator = defaultValidation
) {
  const educationSchema = z.object({
    degree: z.string().min(1, t("degreeRequired")),
    field: z.string().min(1, t("fieldRequired")),
    institution: z.string().min(1, t("institutionRequired")),
    graduationYear: z
      .number({ error: t("yearNumber") })
      .min(1970, t("yearMin"))
      .max(currentYear, t("yearMax", { year: currentYear })),
  });

  const experienceSchema = z.object({
    title: z.string().min(1, t("titleRequired")),
    startYear: z
      .number({ error: t("startYearRequired") })
      .min(1970, t("yearMin"))
      .max(currentYear, t("yearMax", { year: currentYear })),
    startMonth: z
      .number({ error: t("startMonthRequired") })
      .min(1, t("startMonthRange"))
      .max(12, t("startMonthRange")),
    endYear: z
      .number()
      .min(1970, t("yearMin"))
      .max(currentYear, t("yearMax", { year: currentYear }))
      .nullable(),
    endMonth: z
      .number()
      .min(1, t("endMonthRange"))
      .max(12, t("endMonthRange"))
      .nullable(),
    isCurrent: z.boolean(),
  });

  return z.object({
    name: z.string().min(1, t("nameRequired")),
    headline: z.string().min(1, t("headlineRequired")),
    bio: z.string().min(10, t("bioMin")),
    hourlyRate: z
      .number({ error: t("hourlyRateNumber") })
      .min(1, t("hourlyRateMin")),
    languages: z
      .array(z.object({ value: z.string().min(1, t("languageRequired")) }))
      .min(1, t("languagesMin")),
    education: z.array(educationSchema).min(1, t("educationMin")),
    experience: z.array(experienceSchema),
  });
}

export const tutorProfileSchema = createTutorProfileSchema();

export type TutorProfilePayload = z.infer<typeof tutorProfileSchema>;
