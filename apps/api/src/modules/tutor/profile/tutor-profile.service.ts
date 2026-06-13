import { AppError } from '../../../utils/app-error.js';
import { UserModel } from '../../users/user.model.js';
import {
  findByUserId,
  updateByUserId,
  create,
} from './tutor-profile.repository.js';
import type { CreateTutorProfileInput } from '../../../validators/tutor-profile.js';

// get full tutor profile
export const getProfile = async (tutorId: string) => {
  const tutor = await findByUserId(tutorId);

  if (!tutor) {
    throw new AppError('Tutor profile not found', 404);
  }

  return tutor;
};

// create tutor profile (one time after registration)
export const createProfile = async (
  userId: string,
  data: CreateTutorProfileInput,
) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const existingProfile = await findByUserId(userId);

  if (existingProfile) {
    throw new AppError('Tutor profile already exists', 409);
  }

  const profile = await create({
    userId,
    ...data,
    isAvailable: data.isAvailable ?? true,
    rating: 0,
    totalReviews: 0,
  });

  await UserModel.findByIdAndUpdate(userId, {
    role: 'tutor',
    // tutorProfile: profile._id,
  });

  return profile;
};

// update field in tutor profile
export const updateOwnProfile = async (
  userId: string,
  data: Record<string, unknown>,
) => {
  const tutor = await findByUserId(userId);

  if (!tutor) {
    throw new AppError('Tutor profile not found', 404);
  }

  const updated = await updateByUserId(userId, data);

  if (!updated) {
    throw new AppError('Tutor profile not found', 404);
  }

  return updated;
};
