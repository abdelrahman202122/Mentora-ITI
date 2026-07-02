import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ChevronDown, GraduationCap, HelpCircle, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getLocalePath } from '@/utils/i18n/locale-path';

export const metadata = {
  title: 'Help Center - Mentora',
  description:
    'Find answers to common questions about using the Mentora tutoring platform.',
};

const faqKeys = [
  'account',
  'findTutor',
  'payments',
  'cancel',
  'becomeTutor',
  'forgotPassword',
  'support',
] as const;

export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('helpPage');
  const isRtl = locale === 'ar';
  const supportEmail = t('supportEmail');

  return (
    <main
      className="min-h-screen bg-background px-4 py-8 text-start text-slate-950 sm:px-6 sm:py-12"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="mx-auto w-full max-w-3xl">
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
              <HelpCircle className="size-5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-normal text-slate-900 sm:text-3xl">
                {t('title')}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {t('description')}
              </p>
            </div>
          </div>
        </header>

        <section className="space-y-3" aria-labelledby="help-faqs-title">
          <h2 className="sr-only" id="help-faqs-title">
            {t('title')}
          </h2>
          {faqKeys.map((key) => (
            <details
              key={key}
              className="group rounded-lg border border-slate-200 bg-white transition-colors hover:border-slate-300"
            >
              <summary className="flex cursor-pointer select-none items-center justify-between gap-4 px-4 py-4 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden sm:px-5">
                <span>{t(`faqs.${key}.question`)}</span>
                <ChevronDown className="size-4 shrink-0 text-indigo-600 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="border-t border-slate-100 px-4 pb-4 pt-3 text-sm leading-6 text-slate-600 sm:px-5">
                {t(`faqs.${key}.answer`, { email: supportEmail })}
              </div>
            </details>
          ))}
        </section>

        <Card className="mt-10 rounded-lg border-slate-200 bg-white text-center shadow-none">
          <CardHeader className="items-center px-5 pt-6">
            <span className="flex size-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Mail className="size-5" />
            </span>
            <CardTitle className="text-lg font-semibold">
              {t('contact.title')}
            </CardTitle>
            <CardDescription className="text-sm text-slate-600">
              {t('contact.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-6">
            <Button asChild className="h-11 rounded-lg bg-indigo-600 px-5">
              <a href={`mailto:${supportEmail}`}>
                <Mail className="size-4" />
                {t('contact.email')}
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
