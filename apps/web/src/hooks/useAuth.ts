import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import AuthService from '@/lib/auth-service';
import type { RegisterPayload, LoginPayload } from '@/lib/schemas';

interface UseAuthOptions {
  onError?: (message: string) => void;
  onSuccess?: (message?: string) => void;
}

/**
 * Custom hook for authentication with loading and error handling
 * Usage:
 *   const { login, register, loading, error } = useAuth();
 *   await login(credentials);
 */
export function useAuth(options?: UseAuthOptions) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleError = useCallback(
    (err: unknown) => {
      const errorObj = err as {
        message?: string;
        fieldErrors?: Record<string, string[]>;
      };

      const message =
        errorObj.message || 'An error occurred. Please try again.';
      setError(message);
      setFieldErrors(errorObj.fieldErrors || {});
      options?.onError?.(message);
    },
    [options],
  );

  const login = useCallback(
    async (credentials: LoginPayload) => {
      setLoading(true);
      setError(null);
      setFieldErrors({});

      try {
        await AuthService.login(credentials);
        options?.onSuccess?.('Login successful');
        // Redirect is handled by server action
        router.push('/Home');
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    },
    [handleError, options, router],
  );

  const register = useCallback(
    async (data: RegisterPayload) => {
      setLoading(true);
      setError(null);
      setFieldErrors({});

      try {
        const user = await AuthService.register(data);
        options?.onSuccess?.(
          'Registration successful! Please log in to continue.',
        );
        return user;
      } catch (err) {
        handleError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleError, options],
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await AuthService.logout();
      options?.onSuccess?.('Logged out successfully');
      router.push('/Login');
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError, options, router]);

  return {
    login,
    register,
    logout,
    loading,
    error,
    fieldErrors,
    clearError: () => {
      setError(null);
      setFieldErrors({});
    },
  };
}

export default useAuth;
