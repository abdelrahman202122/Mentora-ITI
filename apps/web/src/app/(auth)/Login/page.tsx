'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Loader2 } from 'lucide-react';

import AuthService from '@/lib/auth-service';
import { loginSchema } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type FormErrors = {
  email?: string[];
  password?: string[];
};

type LoginState = {
  formError?: string;
  errors?: FormErrors;
};

export default function LoginPage() {
  const router = useRouter();
  const [state, setState] = useState<LoginState>({});
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setState({});

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: (formData.get('email')?.toString() ?? '').trim(),
      password: formData.get('password')?.toString() ?? '',
    };

    const validation = loginSchema.safeParse(payload);
    if (!validation.success) {
      setState({ errors: validation.error.flatten().fieldErrors });
      setIsPending(false);
      return;
    }

    try {
      await AuthService.login(validation.data);
      router.push('/Home?login=success');
    } catch (error: unknown) {
      const err = error as {
        message?: string;
        fieldErrors?: Record<string, string[]>;
      };

      setState({
        formError:
          err.message || 'Login failed. Please check your credentials.',
        errors: err.fieldErrors,
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-8 text-slate-950 sm:px-6">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center">
        <Card className="w-full rounded-lg border-slate-200 bg-white/90 p-0 shadow-sm ring-slate-200">
          <CardHeader className="gap-2 px-7 pt-7">
            <div className="flex items-center gap-2 text-indigo-600">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <GraduationCap className="size-5" />
              </div>
              <span className="text-lg font-semibold">Mentora</span>
            </div>

            <div className="pt-2">
              <CardTitle className="text-2xl font-semibold tracking-normal">
                Log In to Mentora
              </CardTitle>
              <CardDescription className="mt-2 text-sm text-slate-600">
                Welcome back! Please enter your details.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-7 pb-7">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Button
                className="h-10 w-full border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                type="button"
                variant="outline"
              >
                <span className="mr-1 text-base font-semibold text-blue-600">
                  G
                </span>
                Continue with Google
              </Button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Or email
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {state?.formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {state.formError}
                </div>
              )}

              <div className="space-y-4">
                <FieldError message={state?.errors?.email?.[0]}>
                  <label
                    className="text-xs font-semibold text-slate-700"
                    htmlFor="email"
                  >
                    Email address
                  </label>
                  <Input
                    className="mt-2 h-12 rounded-lg border-slate-300 bg-white px-4 text-sm"
                    id="email"
                    name="email"
                    placeholder="name@company.com"
                    type="email"
                  />
                </FieldError>

                <FieldError message={state?.errors?.password?.[0]}>
                  <label
                    className="text-xs font-semibold text-slate-700"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <Input
                    className="mt-2 h-12 rounded-lg border-slate-300 bg-white px-4 text-sm"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type="password"
                  />
                </FieldError>
              </div>

              <Button
                className="h-12 w-full bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
                disabled={isPending}
                type="submit"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Checking account
                  </>
                ) : (
                  'Log In'
                )}
              </Button>

              <p className="text-center text-sm text-slate-600">
                Don&apos;t have an account?{' '}
                <Link
                  className="font-semibold text-indigo-600 hover:text-indigo-700"
                  href="/register"
                >
                  Sign Up
                </Link>
              </p>

              <div className="border-t border-slate-200 pt-7">
                <div className="flex items-center justify-center gap-5 text-xs font-medium text-slate-700">
                  <Link href="/privacy">Privacy Policy</Link>
                  <Link href="/terms">Terms of Service</Link>
                  <Link href="/help">Help Center</Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function FieldError({
  children,
  message,
}: {
  children: React.ReactNode;
  message?: string;
}) {
  return (
    <div>
      {children}
      {message && (
        <p className="mt-2 text-xs font-medium text-red-600">{message}</p>
      )}
    </div>
  );
}
