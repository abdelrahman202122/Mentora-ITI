/**
 * Education levels for Mentora
 * Used for: TutorSubject.educationLevels enum, filter dropdowns, meta API response
 *
 * Each entry:
 *   value   — stored in DB, used in API queries
 *   en      — English display label
 *   ar      — Arabic display label
 *   order   — for sorting in UI (ascending from youngest to oldest)
 */

export const EDUCATION_LEVELS = [
  {
    value: 'primary',
    en: 'Primary School',
    ar: 'المرحلة الابتدائية',
    order: 1,
  },
  {
    value: 'preparatory',
    en: 'Preparatory School',
    ar: 'المرحلة الإعدادية',
    order: 2,
  },
  {
    value: 'secondary',
    en: 'Secondary School',
    ar: 'المرحلة الثانوية',
    order: 3,
  },
  {
    value: 'university',
    en: 'University',
    ar: 'الجامعة',
    order: 4,
  },
  {
    value: 'professional',
    en: 'Professional',
    ar: 'التطوير المهني',
    order: 5,
  },
] as const;

export type EducationLevel = (typeof EDUCATION_LEVELS)[number]['value'];

export const EDUCATION_LEVEL_VALUES = EDUCATION_LEVELS.map((l) => l.value);
