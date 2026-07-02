import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { GraduationCap, ScrollText } from 'lucide-react';

import { getLocalePath } from '@/utils/i18n/locale-path';

export const metadata = {
  title: 'Terms of Service - Mentora',
  description:
    'Read the terms and conditions that govern your use of the Mentora platform.',
};

const sectionKeys = [
  'acceptance',
  'accounts',
  'tutors',
  'bookings',
  'payments',
  'cancellations',
  'communication',
  'prohibited',
  'liability',
  'contact',
] as const;

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('termsPage');
  const isRtl = locale === 'ar';
  const supportEmail = t('supportEmail');

  return (
    <main
      className="min-h-screen bg-background px-4 py-8 text-start text-slate-950 sm:px-6 sm:py-12"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <article className="mx-auto w-full max-w-3xl">
        <header className="mb-8 sm:mb-10">
          <Link
            href={getLocalePath(locale, '/')}
            className="group mb-8 inline-flex items-center gap-2 text-indigo-600"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors group-hover:bg-indigo-500">
              <GraduationCap className="size-5" />
            </span>
            <span className="text-lg font-semibold">{t('brandName')}</span>
          </Link>

          <div className="mt-6 flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <ScrollText className="size-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-normal text-slate-900 sm:text-3xl">
                {t('title')}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {t('description')}
              </p>
              <p className="mt-2 text-xs font-medium text-slate-500">
                {t('lastUpdated')}
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-7 rounded-lg border border-slate-200 bg-white p-5 sm:p-8">
          {sectionKeys.map((key) => (
            <section key={key}>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                {t(`sections.${key}.title`)}
              </h2>
              <p className="text-sm leading-6 text-slate-600">
                {t(`sections.${key}.body`, { email: supportEmail })}
              </p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
