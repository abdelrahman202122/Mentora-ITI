/**
 * Curricula for Mentora
 * Used for: TutorSubject.curricula enum, filter dropdowns, meta API response
 *
 * Each entry:
 *   value       — stored in DB, used in API queries
 *   en          — English display label
 *   ar          — Arabic display label
 *   description — short clarifying note in both languages (shown as subtitle in UI)
 */

const CURRICULA = [
  {
    value: 'national_new',
    en: 'Egyptian National (New)',
    ar: 'المناهج المصرية (الجديدة)',
    description: {
      en: 'New Egyptian curriculum introduced from 2018 onwards',
      ar: 'المناهج المصرية الجديدة المعتمدة من 2018',
    },
  },
  {
    value: 'national_old',
    en: 'Egyptian National (Old)',
    ar: 'المناهج المصرية (القديمة)',
    description: {
      en: 'Classic Egyptian national curriculum (pre-2018 system)',
      ar: 'المناهج المصرية الكلاسيكية (نظام ما قبل 2018)',
    },
  },
  {
    value: 'igcse',
    en: 'IGCSE / Cambridge',
    ar: 'IGCSE / كامبريدج',
    description: {
      en: 'International General Certificate of Secondary Education',
      ar: 'الشهادة الدولية للتعليم الثانوي العام',
    },
  },
  {
    value: 'ib',
    en: 'IB (International Baccalaureate)',
    ar: 'البكالوريا الدولية',
    description: {
      en: 'International Baccalaureate — MYP and Diploma programmes',
      ar: 'برامج البكالوريا الدولية — MYP والدبلوما',
    },
  },
  {
    value: 'american',
    en: 'American',
    ar: 'المنهج الأمريكي',
    description: {
      en: 'American curriculum — SAT / AP track',
      ar: 'المنهج الأمريكي — مسار SAT / AP',
    },
  },
  {
    value: 'british',
    en: 'British',
    ar: 'المنهج البريطاني',
    description: {
      en: 'British curriculum — Key Stages and A-Levels',
      ar: 'المنهج البريطاني — المراحل الدراسية و A-Levels',
    },
  },
  {
    value: 'university',
    en: 'University Level',
    ar: 'المستوى الجامعي',
    description: {
      en: 'University and higher education content',
      ar: 'محتوى التعليم الجامعي وما فوقه',
    },
  },
  {
    value: 'none',
    en: 'Not Applicable',
    ar: 'غير محدد',
    description: {
      en: 'No specific curriculum — e.g. conversational language, professional skills',
      ar: 'لا يوجد منهج محدد — مثل المحادثة أو المهارات المهنية',
    },
  },
  {
    value: 'other',
    en: 'Other',
    ar: 'أخرى',
    description: {
      en: 'Any other curriculum not listed above',
      ar: 'أي منهج آخر غير مذكور',
    },
  },
] as const;

export type Curriculum = (typeof CURRICULA)[number]['value'];

export const CURRICULA_VALUES: Curriculum[] = CURRICULA.map((c) => c.value);
