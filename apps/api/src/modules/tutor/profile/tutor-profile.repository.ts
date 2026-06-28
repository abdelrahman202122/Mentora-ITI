import type { ClientSession } from 'mongoose';
import { TutorProfileModel } from './tutor-profile.model.js';
import { UserModel } from '../../users/user.model.js'; // adjust import path as needed

export const create = async (
  data: Record<string, unknown>,
  session?: ClientSession,
) => {
  const [profile] = await TutorProfileModel.create([data], { session });
  return profile.toObject();
};

// get tutorprofile by userId field
export const findByUserId = async (userId: string) => {
  return TutorProfileModel.findOne({ userId }).lean();
};

// get tutor profile with populated user info (name, avatar)
export const getProfileWithUser = async (userId: string) => {
  const profile = await TutorProfileModel.findOne({ userId })
    .populate({
      path: 'userId',
      select: 'name avatar',
    })
    .lean();

  if (!profile) return null;

  // rename userId to userData
  const { userId: userData, ...profileData } = profile;

  return {
    ...profileData,
    userData,
  };
};

// update profile fields
export const updateByUserId = async (
  userId: string,
  data: Record<string, unknown>,
  session?: ClientSession,
) => {
  const profile = await TutorProfileModel.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true, runValidators: true, session },
  )
    .populate({
      path: 'userId',
      select: 'name avatar isActive',
    })
    .lean();

  if (!profile) return null;

  const { userId: userData, ...profileData } = profile;

  return {
    ...profileData,
    userData,
  };
};

// get statistics for admin dashboard
export const getStats = async () => {
  const [totalTutors, activeTutors, pendingApproval, ratingAgg] =
    await Promise.all([
      TutorProfileModel.countDocuments(),
      UserModel.countDocuments({ isActive: true, role: 'tutor' }),
      TutorProfileModel.countDocuments({ status: 'pending' }),
      TutorProfileModel.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } },
      ]),
    ]);

  const avgRating = ratingAgg[0]?.avgRating ?? 0;
  return { totalTutors, activeTutors, pendingApproval, avgRating };
};

// set status (approved/rejected) by userId
export const setStatusByUserId = async (
  userId: string,
  status: 'approved' | 'rejected',
) => {
  return TutorProfileModel.findOneAndUpdate(
    { userId },
    { $set: { status } },
    { runValidators: true },
  ).lean();
};
