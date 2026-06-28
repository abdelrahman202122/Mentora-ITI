import { findTutors } from './tutor.repository.js';
import type { TutorSearchParams } from '../../validators/tutor-search.js';

export const getTutors = async (params: TutorSearchParams) => {
  const { tutors, pagination } = await findTutors(params);
  return { tutors, pagination };
};
