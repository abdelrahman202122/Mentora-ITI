import { Types, type PipelineStage } from 'mongoose';

import Booking from '../bookings/booking.model.js';
import { BookingStatus } from '../bookings/booking.types.js';
import Earning, { EarningStatus } from '../payments/earning.model.js';
import { TutorProfileModel } from './profile/tutor-profile.model.js';
import { TutorSearchViewModel } from './search-view/tutor-search-view.model.js';
import type { AdminTutorSearchParams } from '../../validators/tutor-search.js';

export interface FindTutorsResult {
  tutors: unknown[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const findAll = async () => {
  return TutorSearchViewModel.find().lean();
};

export const findTutors = async (
  params: AdminTutorSearchParams,
): Promise<FindTutorsResult> => {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 10));
  const skip = (page - 1) * limit;

  const profileMatch: Record<string, unknown> = {};

  if (params.profileStatus?.length) {
    profileMatch.status = { $in: params.profileStatus };
  }

  if (params.languages?.length) {
    profileMatch.languages = { $in: params.languages };
  }

  if (params.minRating) {
    profileMatch.rating = { $gte: params.minRating };
  }

  if (params.minHourlyRate || params.maxHourlyRate) {
    const hourlyRate: Record<string, number> = {};
    if (params.minHourlyRate) hourlyRate.$gte = params.minHourlyRate;
    if (params.maxHourlyRate) hourlyRate.$lte = params.maxHourlyRate;
    profileMatch.hourlyRate = hourlyRate;
  }

  const userMatch: Record<string, unknown> = {};

  if (params.activeStatus?.length) {
    userMatch['userData.isActive'] = {
      $in: params.activeStatus.map((status) => status === 'active'),
    };
  }

  const subjectFilters: Record<string, string> = {};
  if (params.category) subjectFilters.category = params.category;
  if (params.educationLevel) {
    subjectFilters.educationLevel = params.educationLevel;
  }
  if (params.curriculum) subjectFilters.curriculum = params.curriculum;

  const basePipeline: PipelineStage[] = [
    { $match: profileMatch },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userData',
      },
    },
    { $unwind: '$userData' },
    { $match: userMatch },
    {
      $lookup: {
        from: 'tutorsubjects',
        localField: 'userId',
        foreignField: 'tutorId',
        as: 'subjects',
      },
    },
  ];

  if (Object.keys(subjectFilters).length > 0) {
    basePipeline.push({
      $match: {
        subjects: {
          $elemMatch: subjectFilters,
        },
      },
    });
  }

  if (params.q) {
    const searchRegex = new RegExp(params.q, 'i');
    basePipeline.push({
      $match: {
        $or: [
          { 'userData.name': searchRegex },
          { 'userData.email': searchRegex },
          { headline: searchRegex },
          { bio: searchRegex },
          { 'subjects.title': searchRegex },
          { 'subjects.description': searchRegex },
          { 'subjects.gradeNote': searchRegex },
        ],
      },
    });
  }

  let sort: Record<string, 1 | -1> = { createdAt: -1 };

  switch (params.sortBy) {
    case 'price_asc':
      sort = { hourlyRate: 1, _id: 1 };
      break;
    case 'price_desc':
      sort = { hourlyRate: -1, _id: 1 };
      break;
    case 'rating':
    case 'relevance':
      sort = { rating: -1, _id: 1 };
      break;
  }

  const projectTutor: PipelineStage.Project = {
    $project: {
      _id: 0,
      userId: '$userId',
      name: '$userData.name',
      avatar: '$userData.avatar',
      isEmailVerified: '$userData.isEmailVerified',
      isActive: '$userData.isActive',
      profile: {
        id: '$_id',
        bio: '$bio',
        headline: '$headline',
        hourlyRate: '$hourlyRate',
        rating: '$rating',
        totalReviews: '$totalReviews',
        languages: '$languages',
        education: '$education',
        experience: '$experience',
        isAvailable: '$isAvailable',
        status: '$status',
      },
      subjects: {
        $map: {
          input: '$subjects',
          as: 'subject',
          in: {
            id: '$$subject._id',
            title: '$$subject.title',
            category: '$$subject.category',
            educationLevel: '$$subject.educationLevel',
            curriculum: '$$subject.curriculum',
            gradeNote: '$$subject.gradeNote',
            description: '$$subject.description',
          },
        },
      },
    },
  };

  const [tutors, totalResult] = await Promise.all([
    TutorProfileModel.aggregate([
      ...basePipeline,
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      projectTutor,
    ]),
    TutorProfileModel.aggregate([...basePipeline, { $count: 'total' }]),
  ]);
  const total = totalResult[0]?.total ?? 0;

  return {
    tutors,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getTutors = async (params: AdminTutorSearchParams) => {
  const { tutors, pagination } = await findTutors(params);
  return { tutors, pagination };
};

export const getStats = async (tutorId: string) => {
  const [bookingStats, earningStats] = await Promise.all([
    getBookingStats(tutorId),
    getEarningStats(tutorId),
  ]);

  return {
    totalHours: bookingStats.totalHours,
    totalSessions: bookingStats.totalSessions,
    totalEarnings: earningStats.totalEarnings,
    availableBalance: earningStats.availableBalance,
  };
};

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
