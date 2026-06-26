import { findTutors } from './tutor.repository.js';
import type { TutorSearchParams } from '../../validators/tutor-search.js';

export const getTutors = async (params: TutorSearchParams) => {
  const tutors = await findTutors(params);

  if (!tutors.length) {
    return [];
  }

  return tutors;
};
