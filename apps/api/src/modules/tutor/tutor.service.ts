import { findAll } from './tutor.repository.js';

export const getTutors = async () => {
  const tutors = await findAll();

  if (!tutors.length) {
    return [];
  }

  return tutors;
};
