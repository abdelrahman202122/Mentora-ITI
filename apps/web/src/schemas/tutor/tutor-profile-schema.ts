// // schemas/tutor/tutor-profile-schema.ts
import { z } from "zod";

// const educationSchema = z.object({
//   degree: z.string().min(1, "Degree is required"),
//   field: z.string().min(1, "Field is required"),
//   institution: z.string().min(1, "Institution is required"),
//   graduationYear: z
//     .number({ error: "Year must be a number" })
//     .min(1950, "Invalid year")
//     .max(new Date().getFullYear(), "Invalid year"),
// });

// const experienceSchema = z.object({
//   title: z.string().min(1, "Title is required"),
//   startYear: z
//     .number({ error: "Start year is required" })
//     .min(1950, "Invalid year"),
//   startMonth: z
//     .number({ error: "Start month is required" })
//     .min(1)
//     .max(12),
//   endYear: z.number().nullable(),   // remove optional()
//   endMonth: z.number().min(1).max(12).nullable(),  // remove optional()
//   isCurrent: z.boolean(),
// });
// export const tutorProfileSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   headline: z.string().min(1, "Headline is required"),
//   bio: z.string().min(10, "Bio must be at least 10 characters"),
//   hourlyRate: z
//     .number({ error: "Hourly rate must be a number" })
//     .min(1, "Rate must be at least 1"),
//   languages: z.string().min(1, "At least one language is required"),
//   education: z
//     .array(educationSchema)
//     .min(1, "Add at least one education entry"),
//   experience: z
//     .array(experienceSchema)
//     .min(1, "Add at least one experience entry"),
// });

// export type TutorProfilePayload = z.infer<typeof tutorProfileSchema>;

// schemas/tutor/tutor-profile-schema.ts


const currentYear = new Date().getFullYear();

const educationSchema = z.object({
  degree: z.string().min(1, "Degree is required"),
  field: z.string().min(1, "Field is required"),
  institution: z.string().min(1, "Institution is required"),
  graduationYear: z
    .number({ error: "Year must be a number" })
    .min(1970, "Year must be 1970 or later")
    .max(currentYear, `Year must be ${currentYear} or earlier`),
});

const experienceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  startYear: z
    .number({ error: "Start year is required" })
    .min(1970, "Year must be 1970 or later")
    .max(currentYear, `Year must be ${currentYear} or earlier`),
  startMonth: z
    .number({ error: "Start month is required" })
    .min(1)
    .max(12),
  endYear: z.number().min(1970).max(currentYear).nullable(),
  endMonth: z.number().min(1).max(12).nullable(),
  isCurrent: z.boolean(),
});

export const tutorProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  headline: z.string().min(1, "Headline is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  hourlyRate: z
    .number({ error: "Hourly rate must be a number" })
    .min(1, "Rate must be at least 1"),
languages: z.array(z.object({ value: z.string().min(1) })).min(1, "Add at least one language"),  
 education: z.array(educationSchema).min(1, "Add at least one education entry"),
  experience: z.array(experienceSchema),
});

export type TutorProfilePayload = z.infer<typeof tutorProfileSchema>;