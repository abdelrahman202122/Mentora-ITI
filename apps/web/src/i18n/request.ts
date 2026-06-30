import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

function isSupportedLocale(locale: string): locale is (typeof routing.locales)[number] {
  return routing.locales.includes(locale as (typeof routing.locales)[number]);
}

export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale;
  const safeLocale =
    locale && isSupportedLocale(locale)
      ? locale
      : routing.defaultLocale;
  const messages = (await import(`../../messages/${safeLocale}.json`)).default;

  return {
    locale: safeLocale,
    messages,
  };
});
