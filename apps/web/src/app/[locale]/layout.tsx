import { NextIntlClientProvider } from 'next-intl';
import { routing } from '../../i18n/routing';
import Footer from '@/components/home/Footer';

function isSupportedLocale(
  locale: string,
): locale is (typeof routing.locales)[number] {
  return routing.locales.includes(locale as (typeof routing.locales)[number]);
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isSupportedLocale(rawLocale)
    ? rawLocale
    : routing.defaultLocale;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <NextIntlClientProvider locale={locale}>
      <div lang={locale} dir={dir} className="min-h-screen">
        {children}
      </div>
      {/* <Footer /> */}
    </NextIntlClientProvider>
  );
}
