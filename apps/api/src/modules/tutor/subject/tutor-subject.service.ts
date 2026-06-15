import { NotFoundError } from '../../../common/errors/AppError.js';
import type { tutorSubjectInput } from '../../../validators/tutor-subject.js';
import {
  create,
  deleteById,
  findById,
  findByTutorId,
  updateById,
} from './tutor-subject.repository.js';

export const getTutorSubjects = async (tutorId: string) => {
  const subjects = await findByTutorId(tutorId);

  if (!subjects.length) {
    return [];
  }

  return subjects;
};

export const getTutorSubject = async (tutorId: string, subjectId: string) => {
  const subject = await findById(subjectId);

  if (!subject || subject.tutorId.toString() !== tutorId) {
    throw new NotFoundError('Tutor subject not found');
  }

  return subject;
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
