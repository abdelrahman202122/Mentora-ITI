import { z } from "zod";

export const userRoles = ["student", "teacher"] as const;
const egyptianPhoneRegex = /^(010|011|012|015)\d{8}$/;

/**
 * Translator function type that mirrors the signature of next-intl's
 * `useTranslations("auth.validation")`. Using a plain function type
 * keeps the schema module free of React/hook dependencies.
 */
export type AuthValidationTranslator = (key: string) => string;

export function createRegisterSchema(t: AuthValidationTranslator) {
  return z.object({
    email: z.string().email(t("emailInvalid")),
    password: z.string().min(6, t("passwordMin")),
    name: z.string().min(2, t("nameMin")),
    phoneNumber: z
      .string()
      .trim()
      .regex(egyptianPhoneRegex, t("phoneInvalid")),
    role: z.enum(userRoles, t("roleInvalid")),
  });
}

export function createBackendRegisterSchema(t: AuthValidationTranslator) {
  return createRegisterSchema(t).omit({ role: true });
}

export function createLoginSchema(t: AuthValidationTranslator) {
  return z.object({
    email: z.string().email(t("emailInvalid")),
    password: z.string().min(1, t("passwordRequired")),
  });
}

export function createForgotPasswordSchema(t: AuthValidationTranslator) {
  return z.object({
    email: z.string().email(t("emailInvalid")),
  });
}

export function createResetPasswordSchema(t: AuthValidationTranslator) {
  return z
    .object({
      newPassword: z.string().min(6, t("passwordMin")),
      confirmPassword: z.string().min(1, t("confirmPasswordRequired")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("passwordsMustMatch"),
      path: ["confirmPassword"],
    });
}

/** Inferred types stay the same as before – based on the schema shape. */
export type RegisterPayload = z.infer<ReturnType<typeof createRegisterSchema>>;
export type BackendRegisterPayload = z.infer<
  ReturnType<typeof createBackendRegisterSchema>
>;
export type LoginPayload = z.infer<ReturnType<typeof createLoginSchema>>;
export type ForgotPasswordPayload = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>;
export type ResetPasswordPayload = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>;
