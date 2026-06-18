'use server';

import AuthService from '@/lib/auth-service';
import { registerSchema } from '@/lib/schemas';

export async function registerActionWithAPI(
  _prevState: unknown,
  formData: FormData,
) {
  try {
    const result = registerSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
      return { errors: result.error.flatten().fieldErrors };
    }

    // Call API instead of mock
    const user = await AuthService.register(result.data);

    return {
      success: true,
      user,
      message: 'Registration successful! Please log in to continue.',
    };
  } catch (error: unknown) {
    const err = error as {
      message?: string;
      fieldErrors?: Record<string, string[]>;
      errorType?: string;
    };

    // Check for email already exists error
    if (
      err.fieldErrors?.email ||
      err.message?.toLowerCase().includes('email')
    ) {
      return {
        errors: {
          email: err.fieldErrors?.email || [
            'This email already has an account',
          ],
        },
      };
    }

    // Return user-friendly error message
    return {
      formError: err.message || 'Registration failed. Please try again.',
    };
  }
}
