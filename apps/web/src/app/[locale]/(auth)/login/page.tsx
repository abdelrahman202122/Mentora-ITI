'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
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
import { useLogin } from '@/hooks/auth/use-auth';
import { getSafeRedirectPath } from '@/utils/auth/safe-redirect';
import {
  createLoginSchema,
  type LoginPayload,
} from '@/schemas/auth/auth-schema';
import { getLocalePath } from '@/utils/i18n/locale-path';
import { getLocalizedAuthError } from '@/utils/auth/localized-auth-error';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth');
  const tValidation = useTranslations('auth.validation');
  const tErrors = useTranslations('auth.errors');
  const loginMutation = useLogin();
  const isRtl = locale === 'ar';

  const loginSchema = useMemo(
    () => createLoginSchema(tValidation),
    [tValidation],
  );

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
        router.replace(
          getSafeRedirectPath(
            nextPath,
            window.location.origin,
            getLocalePath(locale, '/'),
          ),
        );
        router.refresh();
      },
    });
  }

  return (
    <main
      className="min-h-screen bg-[#f5f7fb] px-4 py-8 text-start text-slate-950 sm:px-6"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center">
        <Card className="w-full rounded-lg border-slate-200 bg-white/90 p-0 shadow-sm ring-slate-200">
          <CardHeader className="gap-2 px-7 pt-7">
            <div className="flex items-center gap-2 text-indigo-600">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <GraduationCap className="size-5" />
              </div>
              <span className="text-lg font-semibold">{t('brandName')}</span>
            </div>

            <div className="pt-2">
              <CardTitle className="text-2xl font-semibold tracking-normal">
                {t('login.title')}
              </CardTitle>
              <CardDescription className="mt-2 text-sm text-slate-600">
                {t('login.description')}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-7 pb-7">
            <form className="space-y-6" onSubmit={form.handleSubmit(handleLogin)}>
              {loginMutation.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {getLocalizedAuthError(loginMutation.error.message, tErrors)}
                </div>
              )}

              <div className="space-y-4">
                <FieldError message={form.formState.errors.email?.message}>
                  <label
                    className="text-xs font-semibold text-slate-700"
                    htmlFor="email"
                  >
                    {t('login.emailLabel')}
                  </label>
                  <Input
                    className={cn(
                      'mt-2 h-12 rounded-lg border-slate-300 bg-white px-4 text-sm',
                      isRtl && 'text-right',
                    )}
                    id="email"
                    autoComplete="email"
                    placeholder={t('login.emailPlaceholder')}
                    type="email"
                    {...form.register('email')}
                  />
                </FieldError>

                <FieldError message={form.formState.errors.password?.message}>
                  <div className="flex items-center justify-between">
                    <label
                      className="text-xs font-semibold text-slate-700"
                      htmlFor="password"
                    >
                      {t('login.passwordLabel')}
                    </label>
                    <Link
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      href={getLocalePath(locale, '/forgot-password')}
                    >
                      {t('login.forgotPasswordLink')}
                    </Link>
                  </div>
                  <Input
                    className={cn(
                      'mt-2 h-12 rounded-lg border-slate-300 bg-white px-4 text-sm',
                      isRtl && 'text-right',
                    )}
                    id="password"
                    autoComplete="current-password"
                    placeholder={t('login.passwordPlaceholder')}
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
                    {t('login.submitting')}
                  </>
                ) : (
                  t('login.submit')
                )}
              </Button>

              <p className="text-center text-sm text-slate-600">
                {t('login.noAccount')}{' '}
                <Link
                  className="font-semibold text-indigo-600 hover:text-indigo-700"
                  href={getLocalePath(locale, '/register')}
                >
                  {t('login.signUpLink')}
                </Link>
              </p>

              <div className="border-t border-slate-200 pt-7">
                <div className="flex items-center justify-center gap-5 text-xs font-medium text-slate-700">
                  <Link href={getLocalePath(locale, '/privacy')}>{t('login.privacyPolicy')}</Link>
                  <Link href={getLocalePath(locale, '/terms')}>{t('login.termsOfService')}</Link>
                  <Link href={getLocalePath(locale, '/help')}>{t('login.helpCenter')}</Link>
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
