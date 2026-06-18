'use server';

import { redirect } from 'next/navigation';

import AuthService from '@/lib/auth-service';
import { loginSchema } from '@/lib/schemas';

export async function loginActionWithAPI(
  _prevState: unknown,
  formData: FormData,
) {
  try {
    const result = loginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
      return { errors: result.error.flatten().fieldErrors };
    }

    await AuthService.login(result.data);

    redirect('/Home');
  } catch (error: unknown) {
    const err = error as {
      message?: string;
      fieldErrors?: Record<string, string[]>;
      errorType?: string;
    };

    // Show field-specific validation errors
    if (err.fieldErrors?.email) {
      return {
        errors: {
          email: err.fieldErrors.email,
        },
      };
    }

    if (err.fieldErrors?.password) {
      return {
        errors: {
          password: err.fieldErrors.password,
        },
      };
    }

    // Return user-friendly error message based on error type
    return {
      formError:
        err.message ||
        'Login failed. Please check your credentials and try again.',
    };
  }
}

