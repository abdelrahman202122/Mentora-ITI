import { findAll, findTutors } from './tutor.repository.js';

export const getTutors = async (query: string) => {
  let tutors;
  if (query) {
    tutors = await findTutors(query);
  } else {
    tutors = await findAll();
  }

  if (!tutors.length) {
    return [];
  }

  return tutors;
};
