import { findTutors, getStats } from './tutor.repository.js';
import type { TutorSearchParams } from '../../validators/tutor-search.js';

export const getTutors = async (params: TutorSearchParams) => {
  const { tutors, pagination } = await findTutors({
    ...params,
    profileStatus: ['approved'],
    activeStatus: ['active'],
  });
  return { tutors, pagination };
};

export const getTutorStats = async (tutorId: string) => {
  return await getStats(tutorId);
};
