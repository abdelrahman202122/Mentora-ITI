'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLogin } from '@/hooks/use-auth';
import { getSafeRedirectPath } from '@/lib/safe-redirect';
import { loginSchema, type LoginPayload } from '@/lib/schemas';

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const form = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function handleLogin(values: LoginPayload) {
    loginMutation.mutate(values, {
      onSuccess: () => {
        const nextPath = new URLSearchParams(window.location.search).get('next');
        router.replace(getSafeRedirectPath(nextPath, window.location.origin));
        router.refresh();
      },
    });
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
            <form className="space-y-6" onSubmit={form.handleSubmit(handleLogin)}>
              {loginMutation.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {loginMutation.error.message}
                </div>
              )}

              <div className="space-y-4">
                <FieldError message={form.formState.errors.email?.message}>
                  <label
                    className="text-xs font-semibold text-slate-700"
                    htmlFor="email"
                  >
                    Email address
                  </label>
                  <Input
                    className="mt-2 h-12 rounded-lg border-slate-300 bg-white px-4 text-sm"
                    id="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    type="email"
                    {...form.register('email')}
                  />
                </FieldError>

                <FieldError message={form.formState.errors.password?.message}>
                  <label
                    className="text-xs font-semibold text-slate-700"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <Input
                    className="mt-2 h-12 rounded-lg border-slate-300 bg-white px-4 text-sm"
                    id="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    type="password"
                    {...form.register('password')}
                  />
                </FieldError>
              </div>

              <Button
                className="h-12 w-full bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
                disabled={loginMutation.isPending}
                type="submit"
              >
                {loginMutation.isPending ? (
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
