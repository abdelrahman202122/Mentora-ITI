import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

function isSupportedLocale(locale: string): locale is (typeof routing.locales)[number] {
  return routing.locales.includes(locale as (typeof routing.locales)[number]);
}

export default getRequestConfig(async ({locale}) => {
  const safeLocale =
    locale && isSupportedLocale(locale)
      ? locale
      : routing.defaultLocale;

  return {
    locale: safeLocale,
    messages: {}
  };
});
