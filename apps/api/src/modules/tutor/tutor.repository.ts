import type { PipelineStage } from 'mongoose';
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
export const findTutors = async (
  params: TutorSearchParams,
  approvedOnly: boolean,
) => {
  const { q, page, limit } = params;
  const should = buildSearch(q); // text search queries
  const filter = buildFilter(params, approvedOnly); // filter queries
  // const { isRelevanceSort, sortQuery } = buildSort(params); // sort condition
  const sortQuery = buildSort(params);

  /**
   * Pipeline shape:
   *
   * [
   *   {
   *     $search: {
   *       index: 'tutor_search',
   *       compound: {
   *         should: [...],
   *         minimumShouldMatch: 1,
   *         filters: [...]
   *       },
   *       // sorting by relevance
   *       sort: {  ... },
   *       count: { type: 'total',},
   *     },
   *   },
   *     $facet: {
   *       items: [{ $skip: skip }, { $limit: limit }],
   *       meta: [ { replaceWith: '$$SEARCH_META', },],
    },
   * ];
   */
  const pipeline: PipelineStage[] = [];

  pipeline.push({
    $search: {
      index: 'tutor_search',

      ...(should.length || filter.length
        ? {
            compound: {
              ...(should.length && {
                should,
                minimumShouldMatch: 1,
              }),
              ...(filter.length && {
                filter,
              }),
            },
          }
        : {
            exists: {
              path: '_id',
            },
          }),

      sort: sortQuery,

      count: {
        type: 'total',
      },
    },
  });

  pipeline.push({
    $facet: {
      items: [{ $skip: (page - 1) * limit }, { $limit: limit }],

      meta: [
        {
          $replaceWith: '$$SEARCH_META',
        },
      ],
    },
  });

  const [result] = await TutorSearchViewModel.aggregate(pipeline);
  const { items, meta } = result ?? { items: [], meta: [] };
  return {
    tutors: items,
    pagination: {
      page,
      limit,
      total: meta[0]?.count?.total ?? 0,
      totalPages: Math.ceil((meta[0]?.count?.total ?? 0) / limit),
    },
  };
};

const buildSearch = (q: string | undefined) => {
  if (!q) {
    return [];
  }

  const hasArabic = /[\u0600-\u06FF]/.test(q);
  // const hasLatin = /[A-Za-z]/.test(query);
  // const isMixed = hasArabic && hasLatin;

  return [
    {
      // headline and subject title => fuzzy search, score boost: 3
      text: {
        query: q,
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
        query: q,
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
        query: q,
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
  ];
};

const buildFilter = (params: TutorSearchParams, approvedOnly: boolean) => {
  const {
    category,
    educationLevel,
    curriculum,
    minRating,
    maxHourlyRate,
    minHourlyRate,
    languages,
  } = params;

  const filter = [];

  if (approvedOnly) {
    filter.push({ equals: { path: 'profile.status', value: 'approved' } });
  }

  if (category) {
    filter.push({ equals: { path: 'subjects.category', value: category } });
  }

  if (educationLevel) {
    filter.push({
      equals: {
        path: 'subjects.educationLevel',
        value: educationLevel,
      },
    });
  }

  if (curriculum) {
    filter.push({
      equals: { path: 'subjects.curriculum', value: curriculum },
    });
  }

  if (minHourlyRate && maxHourlyRate) {
    filter.push({
      range: {
        path: 'profile.hourlyRate',
        gte: minHourlyRate,
        lte: maxHourlyRate,
      },
    });
  } else if (minHourlyRate) {
    filter.push({ range: { path: 'profile.hourlyRate', gte: minHourlyRate } });
  } else if (maxHourlyRate) {
    filter.push({ range: { path: 'profile.hourlyRate', lte: maxHourlyRate } });
  }

  if (minRating) {
    filter.push({ range: { path: 'profile.rating', gte: minRating } });
  }

  if (languages && languages.length > 0) {
    filter.push({
      compound: {
        should: languages?.map((language) => ({
          equals: {
            path: 'profile.languages',
            value: language,
          },
        })),
        minimumShouldMatch: 1,
      },
    });
  }

  return filter;
};

const buildSort = (params: TutorSearchParams) => {
  // if no query and sortBy set to relevance, sort by rating instead
  const sortBy =
    !params.q && params.sortBy === 'relevance' ? 'rating' : params.sortBy;

  switch (sortBy) {
    case 'price_asc':
      return {
        'profile.hourlyRate': 1,
        _id: 1,
      };

    case 'price_desc':
      return {
        'profile.hourlyRate': -1,
        _id: 1,
      };

    case 'rating':
      return {
        'profile.rating': -1,
        _id: 1,
      };

    case 'relevance':
      return {
        score: { $meta: 'searchScore' },
        'profile.rating': -1,
        _id: 1,
      };
  }
};
