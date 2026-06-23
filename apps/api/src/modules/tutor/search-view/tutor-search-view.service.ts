import mongoose from 'mongoose';
import { UserModel } from '../../users/user.model.js';

const pipeline = [
  {
    $match: {
      role: 'tutor', // tutor accounts only
      isActive: true, // active only
    },
  },

  // join tutor profile
  {
    $lookup: {
      from: 'tutorprofiles',
      localField: '_id',
      foreignField: 'userId',
      as: 'profile',
    },
  },
  { $unwind: { path: '$profile' } }, // flatten array

  // join tutor subjects
  {
    $lookup: {
      from: 'tutorsubjects',
      localField: '_id',
      foreignField: 'tutorId',
      as: 'subjects',
    },
  },

  // Shape final output
  {
    $project: {
      _id: 0,

      // user data
      userId: '$_id',
      name: 1,
      avatar: 1,
      isEmailVerified: 1, // for filters?

      // profile
      profile: {
        bio: '$profile.bio',
        headline: '$profile.headline',
        hourlyRate: '$profile.hourlyRate',
        rating: '$profile.rating',
        totalReviews: '$profile.totalReviews',
        languages: '$profile.languages',
        education: '$profile.education',
        experience: '$profile.experience',
        isAvailable: '$profile.isAvailable',
      },

      // subjects array
      subjects: {
        $map: {
          input: '$subjects',
          as: 's',
          in: {
            id: '$$s._id',
            title: '$$s.title',
            category: '$$s.category',
            educationLevel: '$$s.educationLevel',
            curriculum: '$$s.curriculum',
            gradeNote: '$$s.gradeNote',
            description: '$$s.description',
          },
        },
      },
    },
  },
];

/**
 * Refreshes the materialized view for all tutors.
 */
export const refreshAllTutorsSearchView = async () => {
  return UserModel.aggregate([
    // apply aggregation
    ...pipeline,

    // write materialized view collection
    {
      $merge: {
        into: 'tutor_search_view',
        on: 'userId',
        whenMatched: 'replace',
        whenNotMatched: 'insert',
      },
    },
  ]);
};

/**
 * Refreshes the materialized view for a singe tutor.
 */
export const refreshTutorSearchView = async (tutorId: string) => {
  return UserModel.aggregate([
    // match by tutorId
    {
      $match: {
        _id: new mongoose.Types.ObjectId(tutorId),
      },
    },

    // apply aggregation
    ...pipeline,

    // write materialized view collection
    {
      $merge: {
        into: 'tutor_search_view',
        on: 'userId',
        whenMatched: 'replace',
        whenNotMatched: 'insert',
      },
    },
  ]);
};
