import {
  ConflictError,
  NotFoundError,
} from '../../../common/errors/AppError.js';
import { UserModel } from '../../users/user.model.js';
import {
  findByUserId,
  updateByUserId,
  create,
  getProfileWithUser,
} from './tutor-profile.repository.js';
import type {
  CreateTutorProfileInput,
  UpdateTutorProfileInput,
} from '../../../validators/tutor-profile.js';
import { updateUserName } from '../../users/user.repository.js';

// get full tutor profile
export const getProfile = async (tutorId: string) => {
  const tutor = await getProfileWithUser(tutorId);

  if (!tutor) {
    throw new NotFoundError('Tutor profile not found');
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
    throw new NotFoundError('User not found');
  }

  const existingProfile = await findByUserId(userId);

  if (existingProfile) {
    throw new ConflictError('Tutor profile already exists');
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
  data: UpdateTutorProfileInput,
) => {
  const tutor = await findByUserId(userId);

  if (!tutor) {
    throw new NotFoundError('Tutor profile not found');
  }

  const { name, ...profileData } = data;

  if (name) {
    await updateUserName(userId, name);
  }

  const updated = await updateByUserId(userId, profileData);

  if (!updated) {
    throw new NotFoundError('Tutor profile not found');
  }

  return updated;
};
