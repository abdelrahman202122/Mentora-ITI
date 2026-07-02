'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPaymentById } from '@/services/payment/getPaymentByIdService';

type VerifyState = 'checking' | 'paid' | 'timeout' | 'error' | 'failed';

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 10;

function PaymentSuccessContent({ locale }: { locale: string }) {
  const t = useTranslations('PaymentSuccess');
  const searchParams = useSearchParams();

  const paymentId =
    searchParams.get('paymentId') ??
    searchParams.get('merchant_order_id') ??
    searchParams.get('special_reference') ??
    '';

  const tutorId = searchParams.get('tutorId') ?? '';
  const tutorName = searchParams.get('tutorName') ?? t('fallbackTutor');
  const subject = searchParams.get('subject') ?? t('fallbackSubject');
  const date = searchParams.get('date') ?? '';
  const time = searchParams.get('time') ?? '';

  const [verifyState, setVerifyState] = useState<VerifyState>(() =>
    paymentId ? 'checking' : 'error',
  );

  useEffect(() => {
    if (!paymentId) {
      return;
    }

    let attempts = 0;
    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    async function poll() {
      try {
        const payment = await getPaymentById(paymentId);

        if (cancelled) return;

        if (payment.status === 'success') {
          setVerifyState('paid');
          return;
        }

        if (payment.status === 'failed' || payment.status === 'refunded') {
          setVerifyState('failed');
          return;
        }

        attempts += 1;
        if (attempts >= MAX_ATTEMPTS) {
          setVerifyState('timeout');
          return;
        }

        timerId = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        console.error('Failed to verify payment status:', err);
        if (!cancelled) setVerifyState('error');
      }
    }

    poll();

    return () => {
      cancelled = true;
      if (timerId !== null) clearTimeout(timerId);
    };
  }, [paymentId]);

  if (verifyState === 'checking') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <Loader2 size={40} className="animate-spin text-indigo-600" />
        <p className="text-gray-600 text-sm">{t('checking')}</p>
      </div>
    );
  }

  if (verifyState === 'timeout' || verifyState === 'error' || verifyState === 'failed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <AlertCircle size={40} className="text-amber-500" />
        <h1 className="text-xl font-bold text-gray-900">
          {t(`states.${verifyState}.title`)}
        </h1>
        <p className="text-gray-600 text-sm max-w-sm">
          {t(`states.${verifyState}.description`)}
        </p>
        <Button asChild>
          <Link href={`/${locale}/dashboard`}>{t('dashboard')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-white">
      <main className="max-w-5xl mx-auto w-full px-4 md:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">
          <div className="flex-1">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mb-6">
              <CheckCircle size={32} className="text-white" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('paid.title')}
            </h1>

            <p className="text-gray-600 text-base mb-8 leading-relaxed max-w-xl">
              {t.rich('paid.description', {
                tutorName: () => (
                  <span className="font-semibold text-gray-800">{tutorName}</span>
                ),
              })}
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Button asChild>
                <Link
                  href={`/${locale}/messages/${tutorId}?tutorName=${encodeURIComponent(
                    tutorName,
                  )}`}
                >
                  <MessageSquare size={18} />
                  {t('paid.chat')}
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href={`/${locale}/dashboard`}>{t('dashboard')}</Link>
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail size={16} className="text-indigo-500" />
              {t('paid.email')}
            </div>
          </div>

          <div className="w-full lg:w-80 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{subject}</h2>
            <p className="text-sm text-gray-600 mb-5">{tutorName}</p>

            <hr className="border-gray-100 mb-5" />

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-gray-600">{t('paid.date')}</span>
                <span className="font-semibold text-gray-800 text-end">{date}</span>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-gray-600">{t('paid.time')}</span>
                <span className="font-semibold text-gray-800 text-end">{time}</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-gray-600">{t('paid.status')}</span>
                <Badge>{t('paid.confirmed')}</Badge>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PaymentSuccessFallback() {
  const t = useTranslations('PaymentSuccess');

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      {t('loading')}
    </div>
  );
}

export default function PaymentSuccessPage() {
  const params = useParams();
  const locale = (params.locale as string) ?? 'en';

  return (
    <Suspense fallback={<PaymentSuccessFallback />}>
      <PaymentSuccessContent locale={locale} />
    </Suspense>
  );
}
