import {
  ConflictError,
  NotFoundError,
} from '../../../common/errors/AppError.js';
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
import {
  findUserById,
  updateUserName,
  updateUserRole,
} from '../../users/user.repository.js';
import { withTransaction } from '../../../common/transactionHelper.js';

// get full tutor profile
export const getProfile = async (tutorId: string, approvedOnly: boolean) => {
  const tutor = await getProfileWithUser(tutorId);

  if (!tutor) {
    throw new NotFoundError('Tutor profile not found');
  }

  if (approvedOnly && tutor.status !== 'approved') {
    throw new NotFoundError('Tutor not found');
  }

  return tutor;
};

// create tutor profile (one time after registration)
export const createProfile = async (
  userId: string,
  data: CreateTutorProfileInput,
) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const existingProfile = await findByUserId(userId);

  if (existingProfile) {
    throw new ConflictError('Tutor profile already exists');
  }

  // start transaction for: create profile and update user role to 'tutor'
  const profile = await withTransaction(async (session) => {
    const profile = await create(
      {
        userId,
        ...data,
        isAvailable: data.isAvailable ?? true,
        rating: 0,
        totalReviews: 0,
        status: 'pending',
      },
      session,
    );

    await updateUserRole(
      userId,
      'tutor',
      // profile._id,
      session,
    );
    return profile;
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

  const status = tutor.status === 'rejected' ? 'pending' : tutor.status;

  const { name, ...profileData } = data;

  // start transaction for: update profile and user name
  const updated = await withTransaction(async (session) => {
    if (name) {
      await updateUserName(userId, name, session);
    }

    // if no new profile data, skip update and return existing profile data,
    if (Object.keys(profileData).length === 0 && status === tutor.status) {
      return getProfileWithUser(userId);
    }

    const updated = await updateByUserId(
      userId,
      { ...profileData, status },
      session,
    );

    if (!updated) {
      throw new NotFoundError('Tutor profile not found');
    }

    return updated;
  });

  return updated;
};

export const getTutorStatus = async (tutorId: string) => {
  const tutor = await findByUserId(tutorId);

  if (!tutor) {
    throw new NotFoundError('Tutor profile not found');
  }

  return tutor.status;
};

export const isApprovedTutor = async (tutorId: string) => {
  const status = await getTutorStatus(tutorId);
  return status === 'approved';
};
