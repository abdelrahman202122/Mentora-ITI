import { findTutors } from './tutor.repository.js';
import type { TutorSearchParams } from '../../validators/tutor-search.js';

export const getTutors = async (
  params: TutorSearchParams,
  approvedOnly: boolean,
) => {
  const { tutors, pagination } = await findTutors(params, approvedOnly);
  return { tutors, pagination };
};
