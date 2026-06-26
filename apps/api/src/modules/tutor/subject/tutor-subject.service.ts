import { NotFoundError } from '../../../common/errors/AppError.js';
import { CATEGORIES } from '../../../constants/categories.js';
import { CURRICULA } from '../../../constants/curricula.js';
import { EDUCATION_LEVELS } from '../../../constants/educationLevels.js';
import type { tutorSubjectInput } from '../../../validators/tutor-subject.js';
import { TutorSubject } from './tutor-subject.model.js';
import {
  create,
  deleteById,
  findById,
  findByTutorId,
  updateById,
} from './tutor-subject.repository.js';

/**
 * Enriches a TutorSubject object with its category, educationLevel, and curriculum details.
 * @param subject - The lean tutor subject object retrieved from the database.
 * @returns A new object with the subject data and its mapped entities.
 */
const enrichSubject = (subject: TutorSubject) => {
  return {
    ...subject,
    category:
      CATEGORIES.find((c) => c.value === subject.category) ?? subject.category,
    educationLevel:
      EDUCATION_LEVELS.find((e) => e.value === subject.educationLevel) ??
      subject.educationLevel,
    curriculum:
      CURRICULA.find((c) => c.value === subject.curriculum) ??
      subject.curriculum,
  };
};

export const getTutorSubjects = async (tutorId: string) => {
  const subjects = await findByTutorId(tutorId);
  if (!subjects.length) {
    return [];
  }

  return subjects.map((subject) => enrichSubject(subject));
};

export const getTutorSubject = async (tutorId: string, subjectId: string) => {
  const subject = await findById(subjectId);

  if (!subject || subject.tutorId.toString() !== tutorId) {
    throw new NotFoundError('Tutor subject not found');
  }

  return enrichSubject(subject); //
};

export const createTutorSubject = async (
  userId: string,
  data: tutorSubjectInput,
) => {
  return create({ tutorId: userId, ...data });
};

export const updateTutorSubject = async (
  userId: string,
  subjectId: string,
  data: tutorSubjectInput,
) => {
  const subject = await findById(subjectId);

  if (!subject || subject.tutorId.toString() !== userId) {
    throw new NotFoundError('Tutor subject not found');
  }

  const updated = await updateById(subjectId, { tutorId: userId, ...data });

  if (!updated) {
    throw new NotFoundError('Tutor subject not found');
  }

  return updated;
};

export const deleteTutorSubject = async (userId: string, subjectId: string) => {
  const subject = await findById(subjectId);

  if (!subject || subject.tutorId.toString() !== userId) {
    throw new NotFoundError('Tutor subject not found');
  }

  const deleted = await deleteById(subjectId);

  if (!deleted) {
    throw new NotFoundError('Tutor subject not found');
  }

  return deleted;
};
