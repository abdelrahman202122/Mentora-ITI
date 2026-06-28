import { z } from "zod";

export const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  educationLevel: z.string().min(1, "Education level is required"),
  curriculum: z.string().min(1, "Curriculum is required"),
  gradeNote: z.string().min(3, "Grade note must be at least 3 characters").or(z.literal("")).optional(),});

export type CoursePayload = z.infer<typeof courseSchema>;