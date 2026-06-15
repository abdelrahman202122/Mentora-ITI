import { NextIntlClientProvider } from "next-intl";
import { routing } from "../../i18n/routing";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
   const { locale: rawLocale } = await params;
   const locale = routing.locales.includes(rawLocale as any) 
     ? rawLocale 
     : routing.defaultLocale;

  return (
    <NextIntlClientProvider locale={locale}>
      {children}
    </NextIntlClientProvider>
    
  );
}