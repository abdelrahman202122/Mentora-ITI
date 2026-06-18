import { z } from "zod";

export const userRoles = ["student", "teacher"] as const;

export const registerSchema = z.object({
  email: z.email("Email not valid"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(userRoles, "Please choose a valid account type"),
});

export const loginSchema = z.object({
  email: z.email("Email not valid"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterPayload = z.infer<typeof registerSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;
