'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  GraduationCap,
  Loader2,
  Mail,
  ShieldCheck,
  Lock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import { useRef, useState, useMemo, KeyboardEvent, ClipboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  createForgotPasswordSchema,
  createResetPasswordSchema,
  type ResetPasswordPayload,
} from '@/schemas/auth/auth-schema';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useForgotPassword, useResetPassword } from '@/hooks/auth/use-auth';
import { getLocalePath } from '@/utils/i18n/locale-path';
import { getLocalizedAuthError } from '@/utils/auth/localized-auth-error';
import { cn } from '@/lib/utils';

/* ─── Steps ──────────────────────────────────────────────────────────── */
type Step = 'email' | 'code' | 'password' | 'done';

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

/* ─── OTP Input component ─────────────────────────────────────────────── */
function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  function handleKey(e: KeyboardEvent<HTMLInputElement>, idx: number) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = value.split('');
      if (next[idx]) {
        next[idx] = '';
      } else if (idx > 0) {
        next[idx - 1] = '';
        refs.current[idx - 1]?.focus();
      }
      onChange(next.join(''));
    } else if (/^\d$/.test(e.key)) {
      e.preventDefault();
      const next = value.split('').slice(0, 6);
      while (next.length < 6) next.push('');
      next[idx] = e.key;
      onChange(next.join(''));
      if (idx < 5) refs.current[idx + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = pasted.split('');
    while (next.length < 6) next.push('');
    onChange(next.join(''));
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
  }

  return (
    <div className="flex justify-center gap-2.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onKeyDown={(e) => handleKey(e, i)}
          onPaste={handlePaste}
          onChange={() => {}} // controlled via onKeyDown
          className={cn(
            'h-14 w-12 rounded-xl border text-center text-xl font-bold text-slate-900 outline-none transition-all',
            'border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200',
            value[i] ? 'border-indigo-400 bg-indigo-50' : '',
          )}
        />
      ))}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────── */
export default function ForgotPasswordPage() {
  const locale = useLocale();
  const t = useTranslations('auth');
  const tValidation = useTranslations('auth.validation');
  const tErrors = useTranslations('auth.errors');
  const forgotMutation = useForgotPassword();
  const resetMutation = useResetPassword();
  const isRtl = locale === 'ar';

  const resetSchema = useMemo(() => createResetPasswordSchema(tValidation), [tValidation]);

  const [step, setStep] = useState<Step>('email');
  const [dir, setDir] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);

  /* email form — uses shared localized schema */
  const forgotSchema = useMemo(() => createForgotPasswordSchema(tValidation), [tValidation]);
  const emailForm = useForm<{ email: string }>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  /* password form — schema is the single source of truth; fields match ResetPasswordInput */
  const pwForm = useForm<ResetPasswordPayload>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  function goTo(s: Step, direction = 1) {
    setDir(direction);
    setStep(s);
  }

  /* ── Step 1: send email ── */
  function handleSendCode(values: { email: string }) {
    forgotMutation.mutate(
      { email: values.email },
      {
        onSuccess: (data) => {
          setEmail(values.email);
          if (data.devCode) setDevCode(data.devCode);
          goTo('code', 1);
        },
      },
    );
  }

  /* ── Step 2: verify OTP (client-side check — real verify happens on submit) ── */
  function handleVerifyCode() {
    if (otp.length !== 6) return;
    goTo('password', 1);
  }

  /* ── Step 3: reset password ── */
  function handleResetPassword(values: ResetPasswordPayload) {
    resetMutation.mutate(
      { email, code: otp, newPassword: values.newPassword },
      { onSuccess: () => goTo('done', 1) },
    );
  }

  return (
    <main
      className="min-h-screen bg-[#f5f7fb] px-4 py-8 text-start text-slate-950 sm:px-6"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        <div className="w-full overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            {/* ════ STEP 1: Email ════ */}
            {step === 'email' && (
              <motion.div
                key="email"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                className="w-full"
              >
                <Card className="w-full rounded-xl border-slate-200 bg-white/90 p-0 shadow-sm">
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
                    <form className="space-y-6" onSubmit={emailForm.handleSubmit(handleSendCode)}>
                      {forgotMutation.error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                          {getLocalizedAuthError(forgotMutation.error.message, tErrors)}
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 mx-3" htmlFor="fp-email">
                          {t('forgotPassword.emailLabel')}
                        </label>
                        <div className="relative mt-2">
                          <Input
                            id="fp-email"
                            type="email"
                            autoComplete="email"
                            placeholder={t('forgotPassword.emailPlaceholder')}
                            className={cn(
                              'h-12 rounded-lg border-slate-300 bg-white pl-10 pr-4 text-sm',
                              isRtl && 'pl-4 pr-10 text-right',
                            )}
                            {...emailForm.register('email')}
                          />
                          <div className={cn('pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400', isRtl && 'left-auto right-0 pr-3 pl-0')}>
                            <Mail className="size-5" />
                          </div>
                        </div>
                        {emailForm.formState.errors.email && (
                          <p className="mt-1 text-xs font-medium text-red-600 mx-3">
                            {emailForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <Button
                        className="h-12 w-full bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
                        disabled={forgotMutation.isPending}
                        type="submit"
                      >
                        {forgotMutation.isPending ? (
                          <><Loader2 className="size-4 animate-spin" />{t('forgotPassword.submitting')}</>
                        ) : (
                          t('forgotPassword.submit')
                        )}
                      </Button>

                      <p className="text-center text-sm text-slate-600">
                        <Link className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-700" href={getLocalePath(locale, '/login')}>
                          <BackIcon className="size-4" />
                          {t('forgotPassword.backToLogin')}
                        </Link>
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ════ STEP 2: OTP Code ════ */}
            {step === 'code' && (
              <motion.div
                key="code"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                className="w-full"
              >
                <Card className="w-full rounded-xl border-slate-200 bg-white/90 p-0 shadow-sm">
                  <CardHeader className="gap-2 px-7 pt-7">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                        <GraduationCap className="size-5" />
                      </div>
                      <span className="text-lg font-semibold">{t('brandName')}</span>
                    </div>
                    <div className="pt-2">
                      <CardTitle className="text-2xl font-semibold tracking-normal">
                        {t('forgotPassword.verifyCode.title')}
                      </CardTitle>
                      <CardDescription className="mt-2 text-sm text-slate-600">
                        {t('forgotPassword.verifyCode.description', { email })}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="px-7 pb-7 space-y-6">
                    {/* Dev-mode OTP banner */}
                    {devCode && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Terminal className="size-4 text-amber-600 shrink-0" />
                          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                            Dev mode — no email sent
                          </p>
                        </div>
                        <p className="text-xs text-amber-700">
                          Your verification code is:
                        </p>
                        <p className="text-2xl font-black tracking-[0.5em] text-indigo-600 font-mono">
                          {devCode}
                        </p>
                      </div>
                    )}

                    {/* OTP boxes */}
                    <OtpInput value={otp} onChange={setOtp} />

                    <Button
                      className="h-12 w-full bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                      disabled={otp.length !== 6}
                      onClick={handleVerifyCode}
                      type="button"
                    >
                      <ShieldCheck className="size-4" />
                      {t('forgotPassword.verifyCode.verifyButton')}
                    </Button>

                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-700"
                        onClick={() => goTo('email', -1)}
                      >
                        <BackIcon className="size-4" />
                        {t('forgotPassword.verifyCode.changeEmail')}
                      </button>
                      <button
                        type="button"
                        className="font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-40"
                        disabled={forgotMutation.isPending}
                        onClick={() => {
                          forgotMutation.mutate(
                            { email },
                            {
                              onSuccess: (data) => {
                                setOtp('');
                                if (data.devCode) setDevCode(data.devCode);
                              },
                            },
                          );
                        }}
                      >
                        {forgotMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : t('forgotPassword.verifyCode.resendCode')}
                      </button>
                    </div>

                    {/* Resend error — shown below so it doesn't displace the OTP boxes */}
                    {forgotMutation.error && (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                        {getLocalizedAuthError(forgotMutation.error.message, tErrors)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ════ STEP 3: New Password ════ */}
            {step === 'password' && (
              <motion.div
                key="password"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                className="w-full"
              >
                <Card className="w-full rounded-xl border-slate-200 bg-white/90 p-0 shadow-sm">
                  <CardHeader className="gap-2 px-7 pt-7">
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

                  <CardContent className="px-7 pb-7">
                    <form className="space-y-5" onSubmit={pwForm.handleSubmit(handleResetPassword)}>
                      {resetMutation.error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                          {getLocalizedAuthError(resetMutation.error.message, tErrors)}
                        </div>
                      )}

                      {/* New password */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700" htmlFor="fp-new-password">
                          {t('resetPassword.newPasswordLabel')}
                        </label>
                        <div className="relative mt-2">
                          <Input
                            id="fp-new-password"
                            type="password"
                            autoComplete="new-password"
                            placeholder={t('resetPassword.newPasswordPlaceholder')}
                            className={cn('h-12 rounded-lg border-slate-300 bg-white pl-10 pr-4 text-sm', isRtl && 'pl-4 pr-10 text-right')}
                            {...pwForm.register('newPassword')}
                          />
                          <div className={cn('pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400', isRtl && 'left-auto right-0 pr-3 pl-0')}>
                            <Lock className="size-5" />
                          </div>
                        </div>
                        {pwForm.formState.errors.newPassword && (
                          <p className="text-xs font-medium text-red-600">{pwForm.formState.errors.newPassword.message}</p>
                        )}
                      </div>

                      {/* Confirm password */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700" htmlFor="fp-confirm-password">
                          {t('resetPassword.confirmPasswordLabel')}
                        </label>
                        <div className="relative mt-2">
                          <Input
                            id="fp-confirm-password"
                            type="password"
                            autoComplete="new-password"
                            placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                            className={cn('h-12 rounded-lg border-slate-300 bg-white pl-10 pr-4 text-sm', isRtl && 'pl-4 pr-10 text-right')}
                            {...pwForm.register('confirmPassword')}
                          />
                          <div className={cn('pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400', isRtl && 'left-auto right-0 pr-3 pl-0')}>
                            <Lock className="size-5" />
                          </div>
                        </div>
                        {pwForm.formState.errors.confirmPassword && (
                          <p className="text-xs font-medium text-red-600">{pwForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>

                      <Button
                        className="h-12 w-full bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 mt-2"
                        disabled={resetMutation.isPending}
                        type="submit"
                      >
                        {resetMutation.isPending ? (
                          <><Loader2 className="size-4 animate-spin" />{t('resetPassword.submitting')}</>
                        ) : (
                          t('resetPassword.submit')
                        )}
                      </Button>

                      <p className="text-center text-sm text-slate-600">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-700"
                          onClick={() => goTo('code', -1)}
                        >
                          <BackIcon className="size-4" />
                          {t('forgotPassword.verifyCode.backToCode')}
                        </button>
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ════ STEP 4: Done ════ */}
            {step === 'done' && (
              <motion.div
                key="done"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeInOut' }}
                className="w-full"
              >
                <Card className="w-full rounded-xl border-slate-200 bg-white/90 p-0 shadow-sm">
                  <CardHeader className="flex flex-col items-center justify-center text-center px-7 pt-9">
                    <div className="flex size-16 items-center justify-center rounded-full bg-green-50 text-green-600">
                      <CheckCircle2 className="size-9" />
                    </div>
                    <CardTitle className="mt-4 text-2xl font-semibold tracking-normal text-slate-900">
                      {t('resetPassword.successTitle')}
                    </CardTitle>
                    <CardDescription className="mt-3 text-sm text-slate-600 max-w-sm">
                      {t('resetPassword.successDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-7 pb-9 pt-4 flex flex-col items-center">
                    <Link href={getLocalePath(locale, '/login')} className="w-full">
                      <Button className="h-12 w-full bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700">
                        {t('resetPassword.successAction')}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step indicator */}
          {step !== 'done' && (
            <div className="mt-6 flex justify-center gap-2">
              {(['email', 'code', 'password'] as Step[]).map((s) => (
                <div
                  key={s}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    step === s ? 'w-8 bg-indigo-600' : 'w-4 bg-slate-300',
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
