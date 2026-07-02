import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { GraduationCap, Shield } from 'lucide-react';

import { getLocalePath } from '@/utils/i18n/locale-path';

export const metadata = {
  title: 'Privacy Policy - Mentora',
  description:
    'Learn how Mentora collects, uses, and protects your personal information.',
};

const sectionKeys = [
  'collect',
  'use',
  'sharing',
  'cookies',
  'retention',
  'rights',
  'security',
  'contact',
] as const;

const useListKeys = [
  'auth',
  'matching',
  'booking',
  'payment',
  'chat',
  'ai',
  'support',
] as const;

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('privacyPage');
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
              <Shield className="size-5" />
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
          {sectionKeys.map((key) =>
            key === 'use' ? (
              <section key={key}>
                <h2 className="mb-3 text-lg font-semibold text-slate-900">
                  {t('sections.use.title')}
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  {t('sections.use.intro')}
                </p>
                <ul className="mt-3 list-disc space-y-2 ps-5 text-sm leading-6 text-slate-600">
                  {useListKeys.map((itemKey) => (
                    <li key={itemKey}>{t(`sections.use.${itemKey}`)}</li>
                  ))}
                </ul>
              </section>
            ) : (
              <section key={key}>
                <h2 className="mb-3 text-lg font-semibold text-slate-900">
                  {t(`sections.${key}.title`)}
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  {t(`sections.${key}.body`, { email: supportEmail })}
                </p>
              </section>
            ),
          )}
        </div>
      </article>
    </main>
  );
}
