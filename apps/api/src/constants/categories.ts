/**
 * Subject categories for Mentora
 * Used for: TutorSubject.category enum, filter dropdowns, meta API response
 *
 * Each entry:
 *   value   — stored in DB, used in API queries
 *   en      — English display label
 *   ar      — Arabic display label
 */

export const CATEGORIES = [
  {
    value: 'mathematics',
    en: 'Mathematics',
    ar: 'الرياضيات',
  },
  {
    value: 'sciences',
    en: 'Sciences',
    ar: 'العلوم',
  },
  {
    value: 'languages',
    en: 'Languages',
    ar: 'اللغات',
  },
  {
    value: 'social_studies',
    en: 'Social Studies',
    ar: 'الدراسات الاجتماعية',
    icon: '🌍',
  },
  {
    value: 'humanities',
    en: 'Humanities',
    ar: 'العلوم الإنسانية',
  },
  {
    value: 'technology',
    en: 'Technology & CS',
    ar: 'التكنولوجيا وعلوم الحاسب',
  },
  {
    value: 'test_prep',
    en: 'Test Preparation',
    ar: 'التحضير للامتحانات',
  },
  {
    value: 'engineering',
    en: 'Engineering',
    ar: 'الهندسة',
  },
  {
    value: 'commerce_law',
    en: 'Commerce & Law',
    ar: 'التجارة والقانون',
  },
  {
    value: 'arts',
    en: 'Arts & Design',
    ar: 'الفنون والتصميم',
  },
  {
    value: 'other',
    en: 'Other',
    ar: 'أخرى',
  },
] as const;

export type Category = (typeof CATEGORIES)[number]['value'];

export const CATEGORY_VALUES: Category[] = CATEGORIES.map((c) => c.value);
