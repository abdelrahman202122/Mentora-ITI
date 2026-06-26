import { TutorProfileModel } from './tutor-profile.model.js';

export const create = async (data: Record<string, unknown>) => {
  return TutorProfileModel.create(data);
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
) => {
  const profile = await TutorProfileModel.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true, runValidators: true }, // return the updated document, run schema validation
  )
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
