import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en'
});
/**
 * This config defines the supported languages in the app.
 *
 * locales: the available languages in the website
 * - en = English
 * - ar = Arabic
 *
 * defaultLocale: the language used when the user does NOT specify one in the URL.
 *
 * Example behavior:
 * - User visits:        /  → automatically redirected to /en
 * - User visits:        /courses → /en/courses (because en is default)
 * - User selects Arabic → /en/courses → /ar/courses
 */