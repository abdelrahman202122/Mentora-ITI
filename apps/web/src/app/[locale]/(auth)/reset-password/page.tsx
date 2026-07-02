'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { GraduationCap, Loader2, ShieldCheck } from 'lucide-react';
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
import { useResetPassword } from '@/hooks/auth/use-auth';
import {
  createResetPasswordSchema,
  type ResetPasswordPayload,
} from '@/schemas/auth/auth-schema';
import { getLocalizedAuthError } from '@/utils/auth/localized-auth-error';
import { getLocalePath } from '@/utils/i18n/locale-path';
import { cn } from '@/lib/utils';

export default function ResetPasswordPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const t = useTranslations('auth');
  const tValidation = useTranslations('auth.validation');
  const tErrors = useTranslations('auth.errors');
  const resetPasswordMutation = useResetPassword();
  const token = searchParams.get('token') ?? '';
  const isRtl = locale === 'ar';

  const resetPasswordSchema = useMemo(
    () => createResetPasswordSchema(tValidation),
    [tValidation],
  );

  const form = useForm<ResetPasswordPayload>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      confirmPassword: '',
      newPassword: '',
    },
  });

  function handleResetPassword(values: ResetPasswordPayload) {
    if (!token) {
      return;
    }

    resetPasswordMutation.mutate({
      newPassword: values.newPassword,
      token,
    });
  }

  const successMessage =
    resetPasswordMutation.data || t('resetPassword.successMessage');

  return (
    <main
      className="min-h-screen bg-background px-4 py-6 text-start text-slate-950 sm:px-6 sm:py-8"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center">
        <Card className="w-full rounded-lg border-slate-200 bg-white/90 p-0 shadow-sm ring-slate-200">
          <CardHeader className="gap-2 px-5 pt-6 sm:px-7 sm:pt-7">
            <div className="flex items-center gap-2 text-indigo-600">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <GraduationCap className="size-5" />
              </div>
              <span className="text-lg font-semibold">{t('brandName')}</span>
            </div>

            <div className="pt-2">
              <CardTitle className="text-2xl font-semibold tracking-normal">
                {t('resetPassword.title')}
              </CardTitle>
              <CardDescription className="mt-2 text-sm text-slate-600">
                {t('resetPassword.description')}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-5 pb-6 sm:px-7 sm:pb-7">
            {resetPasswordMutation.isSuccess ? (
              <div className="space-y-6">
                <div
                  className="rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-sm font-medium text-green-800"
                  role="status"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <ShieldCheck className="size-4" />
                    <span>{t('resetPassword.successTitle')}</span>
                  </div>
                  <p>{successMessage}</p>
                </div>

                <Button
                  asChild
                  className="h-12 w-full bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Link href={getLocalePath(locale, '/login')}>
                    {t('resetPassword.backToLogin')}
                  </Link>
                </Button>
              </div>
            ) : (
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(handleResetPassword)}
              >
                {!token && (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                    role="alert"
                  >
                    {t('resetPassword.missingToken')}
                  </div>
                )}

                {resetPasswordMutation.error && (
                  <div
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                    role="alert"
                  >
                    {getLocalizedAuthError(
                      resetPasswordMutation.error.message,
                      tErrors,
                      resetPasswordMutation.error.status,
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <FieldError
                    id="reset-password-new-password-error"
                    message={form.formState.errors.newPassword?.message}
                  >
                    <label
                      className="text-xs font-semibold text-slate-700"
                      htmlFor="newPassword"
                    >
                      {t('resetPassword.newPasswordLabel')}
                    </label>
                    <Input
                      aria-describedby={
                        form.formState.errors.newPassword
                          ? 'reset-password-new-password-error'
                          : undefined
                      }
                      aria-invalid={Boolean(
                        form.formState.errors.newPassword,
                      )}
                      className={cn(
                        'mt-2 h-12 rounded-lg border-slate-300 bg-white px-4 text-sm',
                        isRtl && 'text-right',
                      )}
                      id="newPassword"
                      autoComplete="new-password"
                      placeholder={t('resetPassword.newPasswordPlaceholder')}
                      type="password"
                      {...form.register('newPassword')}
                    />
                  </FieldError>

                  <FieldError
                    id="reset-password-confirm-password-error"
                    message={form.formState.errors.confirmPassword?.message}
                  >
                    <label
                      className="text-xs font-semibold text-slate-700"
                      htmlFor="confirmPassword"
                    >
                      {t('resetPassword.confirmPasswordLabel')}
                    </label>
                    <Input
                      aria-describedby={
                        form.formState.errors.confirmPassword
                          ? 'reset-password-confirm-password-error'
                          : undefined
                      }
                      aria-invalid={Boolean(
                        form.formState.errors.confirmPassword,
                      )}
                      className={cn(
                        'mt-2 h-12 rounded-lg border-slate-300 bg-white px-4 text-sm',
                        isRtl && 'text-right',
                      )}
                      id="confirmPassword"
                      autoComplete="new-password"
                      placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                      type="password"
                      {...form.register('confirmPassword')}
                    />
                  </FieldError>
                </div>

                <Button
                  className="h-12 w-full bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
                  disabled={!token || resetPasswordMutation.isPending}
                  type="submit"
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {t('resetPassword.submitting')}
                    </>
                  ) : (
                    t('resetPassword.submit')
                  )}
                </Button>

                <p className="text-center text-sm text-slate-600 sm:text-start">
                  <Link
                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                    href={getLocalePath(locale, '/login')}
                  >
                    {t('resetPassword.backToLogin')}
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
  id,
  message,
}: {
  children: React.ReactNode;
  id: string;
  message?: string;
}) {
  return (
    <div>
      {children}
      {message && (
        <p className="mt-2 text-xs font-medium text-red-600" id={id}>
          {message}
        </p>
      )}
    </div>
  );
}
