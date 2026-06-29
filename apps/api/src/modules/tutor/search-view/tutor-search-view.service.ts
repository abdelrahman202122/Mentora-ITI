import mongoose from 'mongoose';
import { UserModel } from '../../users/user.model.js';
import { TutorSearchViewModel } from './tutor-search-view.model.js';

const pipeline = [
  {
    $match: {
      role: 'tutor', // tutor accounts only
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
      isActive: 1,

      // profile
      profile: {
        id: '$profile._id',
        bio: '$profile.bio',
        headline: '$profile.headline',
        hourlyRate: '$profile.hourlyRate',
        rating: '$profile.rating',
        totalReviews: '$profile.totalReviews',
        languages: '$profile.languages',
        education: '$profile.education',
        experience: '$profile.experience',
        isAvailable: '$profile.isAvailable',
        status: '$profile.status',
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
 * Refreshes the materialized view for a single tutor.
 */
export const refreshTutorSearchView = async (tutorId: string) => {
  // Run aggregation
  const results = await UserModel.aggregate([
    // match by tutorId
    {
      $match: {
        _id: new mongoose.Types.ObjectId(tutorId),
      },
    },

    // apply aggregation
    ...pipeline,
  ]);

  // If tutor not found (no longer matches aggregation condition or has been deleted)
  // delete from materialized view. Else set the updated tutor document.
  if (results.length > 0) {
    await TutorSearchViewModel.updateOne(
      { userId: new mongoose.Types.ObjectId(tutorId) },
      { $set: results[0] },
      { upsert: true },
    );
  } else {
    await TutorSearchViewModel.deleteOne({
      userId: new mongoose.Types.ObjectId(tutorId),
    });
  }
};
