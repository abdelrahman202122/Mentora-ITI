import { findAll, findTutors } from './tutor.repository.js';
import type { TutorSearchParams } from '../../validators/tutor-search.js';

export const getTutors = async (params: TutorSearchParams) => {
  let tutors;
  if (params.q) {
    tutors = await findTutors(params);
  } else {
    tutors = await findAll();
  }

  if (!tutors.length) {
    return [];
  }

  return tutors;
};
