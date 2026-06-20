import { NextIntlClientProvider } from "next-intl";
import { routing } from "../../i18n/routing";
import { HtmlLang } from "@/components/i18n/HtmlLang";

function isSupportedLocale(locale: string): locale is (typeof routing.locales)[number] {
  return routing.locales.includes(locale as (typeof routing.locales)[number]);
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
   const { locale: rawLocale } = await params;
   const locale = isSupportedLocale(rawLocale) 
     ? rawLocale 
     : routing.defaultLocale;

  return (
    <NextIntlClientProvider locale={locale}>
      <HtmlLang locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}
