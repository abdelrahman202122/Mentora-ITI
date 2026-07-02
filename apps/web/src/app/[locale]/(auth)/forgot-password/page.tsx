'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { GraduationCap, Loader2, MailCheck } from 'lucide-react';
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
import { useForgotPassword } from '@/hooks/auth/use-auth';
import {
  createForgotPasswordSchema,
  type ForgotPasswordPayload,
} from '@/schemas/auth/auth-schema';
import { getLocalizedAuthError } from '@/utils/auth/localized-auth-error';
import { getLocalePath } from '@/utils/i18n/locale-path';
import { cn } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const t = useTranslations('auth');
  const tValidation = useTranslations('auth.validation');
  const tErrors = useTranslations('auth.errors');
  const forgotPasswordMutation = useForgotPassword();
  const isRtl = locale === 'ar';

  const forgotPasswordSchema = useMemo(
    () => createForgotPasswordSchema(tValidation),
    [tValidation],
  );

  const form = useForm<ForgotPasswordPayload>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  function handleForgotPassword(values: ForgotPasswordPayload) {
    forgotPasswordMutation.mutate(values);
  }

  const successMessage =
    forgotPasswordMutation.data || t('forgotPassword.successMessage');

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
                {t('forgotPassword.title')}
              </CardTitle>
              <CardDescription className="mt-2 text-sm text-slate-600">
                {t('forgotPassword.description')}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-7 pb-7">
            {forgotPasswordMutation.isSuccess ? (
              <div className="space-y-6">
                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-sm font-medium text-green-800">
                  <div className="mb-2 flex items-center gap-2">
                    <MailCheck className="size-4" />
                    <span>{t('forgotPassword.checkEmailTitle')}</span>
                  </div>
                  <p>{successMessage}</p>
                </div>

                <Button
                  asChild
                  className="h-12 w-full bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Link href={getLocalePath(locale, '/login')}>
                    {t('forgotPassword.backToLogin')}
                  </Link>
                </Button>
              </div>
            ) : (
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(handleForgotPassword)}
              >
                {forgotPasswordMutation.error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                    {getLocalizedAuthError(
                      forgotPasswordMutation.error.message,
                      tErrors,
                    )}
                  </div>
                )}

                <FieldError message={form.formState.errors.email?.message}>
                  <label
                    className="text-xs font-semibold text-slate-700"
                    htmlFor="email"
                  >
                    {t('forgotPassword.emailLabel')}
                  </label>
                  <Input
                    className={cn(
                      'mt-2 h-12 rounded-lg border-slate-300 bg-white px-4 text-sm',
                      isRtl && 'text-right',
                    )}
                    id="email"
                    autoComplete="email"
                    placeholder={t('forgotPassword.emailPlaceholder')}
                    type="email"
                    {...form.register('email')}
                  />
                </FieldError>

                <Button
                  className="h-12 w-full bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
                  disabled={forgotPasswordMutation.isPending}
                  type="submit"
                >
                  {forgotPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {t('forgotPassword.submitting')}
                    </>
                  ) : (
                    t('forgotPassword.submit')
                  )}
                </Button>

                <p className="text-center text-sm text-slate-600">
                  <Link
                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                    href={getLocalePath(locale, '/login')}
                  >
                    {t('forgotPassword.backToLogin')}
                  </Link>
                </p>
              </form>
            )}
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
