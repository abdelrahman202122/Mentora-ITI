import { NotFoundError } from '../../../common/errors/AppError.js';
import type { AdminUpdateTutorProfileInput } from '../../../validators/tutor-profile.js';
import { AdminTutorSearchParams } from '../../../validators/tutor-search.js';
import {
  getStats,
  setStatusByUserId,
  updateByUserId,
} from '../../tutor/profile/tutor-profile.repository.js';
import { findTutors } from '../../tutor/tutor.repository.js';

export const getTutorStats = async () => {
  return await getStats();
};

export const approveTutor = async (tutorId: string) => {
  const updated = await setStatusByUserId(tutorId, 'approved');
  if (!updated) {
    throw new NotFoundError('Tutor profile not found');
  }
  return updated;
};

export const rejectTutor = async (tutorId: string) => {
  const updated = await setStatusByUserId(tutorId, 'rejected');
  if (!updated) {
    throw new NotFoundError('Tutor profile not found');
  }
  return updated;
};

export const patchTutor = async (
  tutorId: string,
  data: AdminUpdateTutorProfileInput,
) => {
  const updated = await updateByUserId(tutorId, data);
  if (!updated) {
    throw new NotFoundError('Tutor profile not found');
  }
  return updated;
};

export const getTutors = async (params: AdminTutorSearchParams) => {
  const { tutors, pagination } = await findTutors({ ...params });
  return { tutors, pagination };
};
