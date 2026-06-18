import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

type Locale = (typeof routing.locales)[number];

export default getRequestConfig(async ({locale}) => {
  const safeLocale =
    locale && routing.locales.includes(locale as Locale)
      ? locale
      : routing.defaultLocale;

  return {
    locale: safeLocale,
    messages: {}
  };
});
