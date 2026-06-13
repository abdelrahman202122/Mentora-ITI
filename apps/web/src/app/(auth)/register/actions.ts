"use server";

import { createMockUser } from "@/lib/mock-auth-store";
import { registerSchema } from "@/lib/schemas";

export async function registerAction(_prevState: unknown, formData: FormData) {
  const result = registerSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const createdUser = await createMockUser(result.data);

  if (!createdUser.ok) {
    return {
      errors: {
        email: ["This email already has an account"],
      },
    };
  }

  console.log("Mock user ready for backend:", createdUser.user);

  return { success: true, user: createdUser.user };
}
