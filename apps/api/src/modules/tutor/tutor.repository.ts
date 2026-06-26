import type { TutorSearchParams } from '../../validators/tutor-search.js';
import { TutorSearchViewModel } from './search-view/tutor-search-view.model.js';

/**
 * Find all tutors in the database
 */
export const findAll = async () => {
  return TutorSearchViewModel.find().lean();
};

/**
 * Find tutors based on search query
 */
export const findTutors = async (params: TutorSearchParams) => {
  const query = params.q!;
  const hasArabic = /[\u0600-\u06FF]/.test(query); // will use arabic analyzer for queries containing arabic text only
  // const hasLatin = /[A-Za-z]/.test(query);
  // const isMixed = hasArabic && hasLatin;

  return TutorSearchViewModel.aggregate([
    {
      $search: {
        index: 'tutor_search',
        compound: {
          should: [
            {
              // headline and subject title => fuzzy search, score boost: 3
              text: {
                query: query,
                path: [
                  hasArabic
                    ? { value: 'profile.headline', multi: 'arabicAnalyzer' }
                    : { value: 'profile.headline' },
                  hasArabic
                    ? { value: 'subjects.title', multi: 'arabicAnalyzer' }
                    : { value: 'subjects.title' },
                ],
                score: { boost: { value: 3 } },
                fuzzy: {
                  maxEdits: 1,
                  prefixLength: 2,
                  maxExpansions: 50,
                },
              },
            },

            // bio and subject description => fuzzy search, score boost: 2
            {
              text: {
                query: query,
                path: [
                  hasArabic
                    ? { value: 'profile.bio', multi: 'arabicAnalyzer' }
                    : { value: 'profile.bio' },
                  hasArabic
                    ? { value: 'subjects.description', multi: 'arabicAnalyzer' }
                    : { value: 'subjects.description' },
                ],
                score: { boost: { value: 2 } },
                fuzzy: {
                  maxEdits: 1,
                  prefixLength: 2,
                  maxExpansions: 50,
                },
              },
            },

            // name and subject gradeNote => score boost: 1
            {
              text: {
                query: query,
                path: [
                  hasArabic
                    ? { value: 'name', multi: 'arabicAnalyzer' }
                    : { value: 'name' },
                  hasArabic
                    ? { value: 'subjects.gradeNote', multi: 'arabicAnalyzer' }
                    : { value: 'subjects.gradeNote' },
                ],
                score: { boost: { value: 1 } },
              },
            },
          ],
        },
      },
    },
  ]);
};
