import { NextIntlClientProvider } from "next-intl";
import { routing } from "../../i18n/routing";

type Locale = (typeof routing.locales)[number];

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
   const { locale: rawLocale } = await params;
   const locale = routing.locales.includes(rawLocale as Locale) 
     ? rawLocale as Locale
     : routing.defaultLocale;

  return (
    <NextIntlClientProvider locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
