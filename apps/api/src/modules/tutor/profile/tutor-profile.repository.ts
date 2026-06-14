import { TutorProfileModel } from './tutor-profile.model.js';

export const create = async (data: Record<string, unknown>) => {
  return TutorProfileModel.create(data);
};

// get tutorprofile by userId field
export const findByUserId = async (userId: string) => {
  return TutorProfileModel.findOne({ userId }).lean();
};

// update profile fields
export const updateByUserId = async (
  userId: string,
  data: Record<string, unknown>,
) => {
  return TutorProfileModel.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true, runValidators: true }, // return the updated document, run schema validation
  ).lean();
};
