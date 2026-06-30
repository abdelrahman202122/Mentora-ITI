'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { GraduationCap, Loader2, Phone } from 'lucide-react';
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
import { useRegister } from '@/hooks/auth/use-auth';
import { getSafeRedirectPath } from '@/utils/auth/safe-redirect';
import {
  createBackendRegisterSchema,
  type BackendRegisterPayload,
} from '@/schemas/auth/auth-schema';
import { getLocalePath } from '@/utils/i18n/locale-path';
import { getLocalizedAuthError } from '@/utils/auth/localized-auth-error';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('auth');
  const tValidation = useTranslations('auth.validation');
  const tErrors = useTranslations('auth.errors');
  const registerMutation = useRegister();
  const isRtl = locale === 'ar';

  const nextParam = searchParams.get('next');
  const registerRedirectPath =
    typeof window === 'undefined'
      ? getLocalePath(locale, '/')
      : getSafeRedirectPath(
          nextParam,
          window.location.origin,
          getLocalePath(locale, '/'),
        );
  const loginPath = getLocalePath(locale, '/login');
  const loginHref = nextParam
    ? `${loginPath}?next=${encodeURIComponent(nextParam)}`
    : loginPath;

  const registerSchema = useMemo(
    () => createBackendRegisterSchema(tValidation),
    [tValidation],
  );

  const form = useForm<BackendRegisterPayload>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
    },
  });

  function handleRegister(values: BackendRegisterPayload) {
    registerMutation.mutate(values, {
      onSuccess: () => {
        router.replace(registerRedirectPath);
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
                {t('register.title')}
              </CardTitle>
              <CardDescription className="mt-2 text-sm text-slate-600">
                {t('register.description')}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-7 pb-7">
            <form
              className="space-y-6"
              onSubmit={form.handleSubmit(handleRegister)}
            >
              {registerMutation.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {getLocalizedAuthError(
                    registerMutation.error.message,
                    tErrors,
                  )}
                </div>
              )}

              <div className="space-y-4">
                <FieldError message={form.formState.errors.name?.message}>
                  <label
                    className="text-xs font-semibold text-slate-700"
                    htmlFor="name"
                  >
                    {t('register.nameLabel')}
                  </label>
                  <Input
                    className={cn(
                      'mt-2 h-12 rounded-lg border-slate-300 bg-white px-4 text-sm',
                      isRtl && 'text-right',
                    )}
                    id="name"
                    autoComplete="name"
                    placeholder={t('register.namePlaceholder')}
                    {...form.register('name')}
                  />
                </FieldError>

                <FieldError message={form.formState.errors.email?.message}>
                  <label
                    className="text-xs font-semibold text-slate-700"
                    htmlFor="email"
                  >
                    {t('register.emailLabel')}
                  </label>
                  <Input
                    className={cn(
                      'mt-2 h-12 rounded-lg border-slate-300 bg-white px-4 text-sm',
                      isRtl && 'text-right',
                    )}
                    id="email"
                    autoComplete="email"
                    placeholder={t('register.emailPlaceholder')}
                    type="email"
                    {...form.register('email')}
                  />
                </FieldError>

                <FieldError
                  message={form.formState.errors.phoneNumber?.message}
                >
                  <label
                    className="text-xs font-semibold text-slate-700"
                    htmlFor="phoneNumber"
                  >
                    {t('register.phoneLabel')}
                  </label>
                  <div className="relative mt-2">
                    <Phone
                      className={cn(
                        'pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-slate-400',
                        isRtl ? 'right-4' : 'left-4',
                      )}
                    />
                    <Input
                      className={cn(
                        'h-12 rounded-lg border-slate-300 bg-white text-sm',
                        isRtl ? 'pl-4 pr-11 text-right' : 'pl-11 pr-4',
                      )}
                      id="phoneNumber"
                      autoComplete="tel"
                      placeholder={t('register.phonePlaceholder')}
                      type="tel"
                      inputMode="numeric"
                      {...form.register('phoneNumber')}
                    />
                  </div>
                </FieldError>

                <FieldError message={form.formState.errors.password?.message}>
                  <label
                    className="text-xs font-semibold text-slate-700"
                    htmlFor="password"
                  >
                    {t('register.passwordLabel')}
                  </label>
                  <Input
                    className={cn(
                      'mt-2 h-12 rounded-lg border-slate-300 bg-white px-4 text-sm',
                      isRtl && 'text-right',
                    )}
                    id="password"
                    autoComplete="new-password"
                    placeholder={t('register.passwordPlaceholder')}
                    type="password"
                    {...form.register('password')}
                  />
                </FieldError>
              </div>

              <Button
                className="h-12 w-full bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
                disabled={registerMutation.isPending}
                type="submit"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t('register.submitting')}
                  </>
                ) : (
                  t('register.submit')
                )}
              </Button>

              <p className="text-center text-sm text-slate-600">
                {t('register.hasAccount')}{' '}
                <Link
                  className="font-semibold text-indigo-600 hover:text-indigo-700"
                  href={loginHref}
                >
                  {t('register.logInLink')}
                </Link>
              </p>
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
