

import { TutorSearchViewModel } from './search-view/tutor-search-view.model.js';
import { TutorProfileModel } from './profile/tutor-profile.model.js';
import { UserModel } from '../users/user.model.js';
import { Types, type PipelineStage } from 'mongoose';
import type { AdminTutorSearchParams } from '../../validators/tutor-search.js';
import Booking from '../bookings/booking.model.js';
import { BookingStatus } from '../bookings/booking.types.js';
import Earning, { EarningStatus } from '../payments/earning.model.js';

/**
 * Find all tutors in the database (search view)
 */
export const findAll = async () => {
  return TutorSearchViewModel.find().lean();
};

/* ═══════════════════════════════════════════════════════════════════
   Result type for findTutors
   ═══════════════════════════════════════════════════════════════════ */

export interface FindTutorsResult {
  tutors: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/* ═══════════════════════════════════════════════════════════════════
   findTutors — paginated, filterable, searchable list of tutor
   profiles with populated user data.

   Uses AdminTutorSearchParams directly so the field names match the
   Zod validation schema exactly:
     - q           (search query, not "search")
     - languages   (array, not "subjects")
     - profileStatus (array, not single "status" string)
     - activeStatus  (array of "active" | "inactive")
     - minRating, minHourlyRate, maxHourlyRate, sortBy, page, limit
   ═══════════════════════════════════════════════════════════════════ */

export const findTutors = async (
  params: AdminTutorSearchParams,
): Promise<FindTutorsResult> => {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 10));
  const skip = (page - 1) * limit;

  /* ─── Build the MongoDB filter ────────────────────────────────────── */

  const filter: Record<string, any> = {};


  if (params.profileStatus && params.profileStatus.length > 0) {
    filter.status = { $in: params.profileStatus };
  }


  if (params.languages && params.languages.length > 0) {
    filter.languages = { $in: params.languages };
  }

  // Min rating filter
  if (params.minRating) {
    filter.rating = { $gte: params.minRating };
  }

  // Hourly rate range filter
  if (params.minHourlyRate || params.maxHourlyRate) {
    filter.hourlyRate = {};
    if (params.minHourlyRate) filter.hourlyRate.$gte = params.minHourlyRate;
    if (params.maxHourlyRate) filter.hourlyRate.$lte = params.maxHourlyRate;
  }

  /* ─── Active status filter ──────────────────────────────────────────
     activeStatus is on the User document (isActive), not the
     TutorProfile. We collect matching user IDs first. */

  if (params.activeStatus && params.activeStatus.length > 0) {
    const isActiveValues = params.activeStatus.map((s) => s === 'active');
    const matchingUsers = await UserModel.find({
      isActive: { $in: isActiveValues },
    })
      .select('_id')
      .lean();
    const activeUserIds: Types.ObjectId[] = matchingUsers.map((u) => u._id);

    if (filter.userId && filter.userId.$in) {
      // Intersect with existing userId filter (from search)
      filter.userId.$in = filter.userId.$in.filter((id: Types.ObjectId) =>
        activeUserIds.some((auId) => auId.equals(id)),
      );
    } else {
      filter.userId = { $in: activeUserIds };
    }
  }

  /* ─── Search filter (q) ─────────────────────────────────────────────
     Search across user name/email — we need to join with User
     collection, so we collect matching user IDs first. */

  if (params.q) {
    const searchRegex = new RegExp(params.q, 'i');
    const matchingUsers = await UserModel.find({
      $or: [{ name: searchRegex }, { email: searchRegex }],
    })
      .select('_id')
      .lean();


    const searchUserIds: Types.ObjectId[] = matchingUsers.map((u) => u._id);

    if (filter.userId && filter.userId.$in) {
      // Intersect with existing userId filter (from activeStatus)
      filter.userId.$in = filter.userId.$in.filter((id: Types.ObjectId) =>
        searchUserIds.some((suId) => suId.equals(id)),
      );
    } else {
      filter.userId = { $in: searchUserIds };
    }
  }

  /* ─── Build sort ──────────────────────────────────────────────────── */

  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  switch (params.sortBy) {
    case 'price_asc':
      sort = { hourlyRate: 1, _id: 1 };
      break;
    case 'price_desc':
      sort = { hourlyRate: -1, _id: 1 };
      break;
    case 'rating':
      sort = { rating: -1, _id: 1 };
      break;
    case 'relevance':
      // No Atlas Search score here — fall back to rating
      sort = { rating: -1, _id: 1 };
      break;
  }

  /* ─── Execute queries in parallel ─────────────────────────────────── */

  const [tutors, total] = await Promise.all([
    TutorProfileModel.find(filter)
      .populate({
        path: 'userId',
        select: 'name avatar isActive email', 
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    TutorProfileModel.countDocuments(filter),
  ]);

  return {
    tutors,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/* ═══════════════════════════════════════════════════════════════════
   getTutors — thin wrapper used by admin-tutor.service.ts
   (If you have this in admin-tutor.service.ts instead, delete it here.)
   ═══════════════════════════════════════════════════════════════════ */

export const getTutors = async (params: AdminTutorSearchParams) => {
  const { tutors, pagination } = await findTutors(params);
  return { tutors, pagination };
};

/* ═══════════════════════════════════════════════════════════════════
   Atlas Search helpers (used by the public tutor search endpoint
   that uses MongoDB Atlas Search with the TutorSearchViewModel)
   ═══════════════════════════════════════════════════════════════════ */

const buildSearch = (q: string | undefined) => {
  if (!q) {
    return [];
  }

  const hasArabic = /[\u0600-\u06FF]/.test(q);

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

const buildFilter = (params: AdminTutorSearchParams) => {
  const {
    profileStatus,
    activeStatus,
    category,
    educationLevel,
    curriculum,
    minRating,
    maxHourlyRate,
    minHourlyRate,
    languages,
  } = params;

  const filter = [];

  if (profileStatus && profileStatus.length > 0) {
    filter.push({
      compound: {
        should: profileStatus?.map((status) => ({
          equals: {
            path: 'profile.status',
            value: status,
          },
        })),
        minimumShouldMatch: 1,
      },
    });
  }

  if (activeStatus && activeStatus.length > 0) {
    filter.push({
      compound: {
        should: activeStatus?.map((status) => ({
          equals: {
            path: 'isActive',
            value: status === 'active' ? true : false,
          },
        })),
        minimumShouldMatch: 1,
      },
    });
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

const buildSort = (params: AdminTutorSearchParams) => {
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

/**
 * Get stats for tutor dashboard.
 */
export const getStats = async (tutorId: string) => {
  const [bookingStats, earningStats] = await Promise.all([
    getBookingStats(tutorId),
    getEarningStats(tutorId),
  ]);

  return {
    totalHours: bookingStats.totalHours,
    totalSessions: bookingStats.totalSessions,
    totalEarnings: earningStats.totalEarnings, // AVAILABLE + PAID_OUT
    availableBalance: earningStats.availableBalance, // AVAILABLE
  };
};

/**
 * Aggregate booking statistics.
 */
const getBookingStats = async (tutorId: string) => {
  const [stats] = await Booking.aggregate([
    {
      $match: {
        tutorId: new Types.ObjectId(tutorId),
        bookingStatus: BookingStatus.COMPLETED,
      },
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalMinutes: { $sum: '$durationMinutes' },
      },
    },
    {
      $project: {
        _id: 0,
        totalSessions: 1,
        totalHours: {
          $round: [
            {
              $divide: ['$totalMinutes', 60],
            },
            2,
          ],
        },
      },
    },
  ]);

  return {
    totalHours: stats?.totalHours ?? 0,
    totalSessions: stats?.totalSessions ?? 0,
  };
};

/**
 * Aggregate tutor earnings.
 */
const getEarningStats = async (tutorId: string) => {
  const [stats] = await Earning.aggregate([
    {
      $match: {
        tutorId: new Types.ObjectId(tutorId),
        status: {
          $in: [EarningStatus.AVAILABLE, EarningStatus.PAID_OUT],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalEarnings: {
          $sum: '$tutorAmount',
        },
        availableBalance: {
          $sum: {
            $cond: [
              { $eq: ['$status', EarningStatus.AVAILABLE] },
              '$tutorAmount',
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalEarnings: 1,
        availableBalance: 1,
      },
    },
  ]);

  return {
    totalEarnings: stats?.totalEarnings ?? 0,
    availableBalance: stats?.availableBalance ?? 0,
  };
};
