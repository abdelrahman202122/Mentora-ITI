import type { Request, Response } from 'express';

import { sendError, sendSuccess } from '../../../utils/api-response.js';
import {
  createTutorSubject,
  deleteTutorSubject,
  getTutorSubject,
  getTutorSubjects,
  updateTutorSubject,
} from './tutor-subject.service.js';

export const createTutorSubjectController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.user?.userId;

  if (!userId) {
    return sendError(res, 401, 'Unauthorized');
  }

  const subject = await createTutorSubject(userId, req.body);

  return sendSuccess(res, 201, 'Tutor subject created successfully', subject);
};

export const updateTutorSubjectController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.user?.userId;
  const subjectId = req.params.subjectId?.toString();

  if (!userId) {
    return sendError(res, 401, 'Unauthorized');
  }

  if (!subjectId) {
    return sendError(res, 400, 'Subject ID is required');
  }

  const subject = await updateTutorSubject(userId, subjectId, req.body);

  return sendSuccess(res, 200, 'Tutor subject updated successfully', subject);
};

export const deleteTutorSubjectController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.user?.userId;
  const subjectId = req.params.subjectId?.toString();

  if (!userId) {
    return sendError(res, 401, 'Unauthorized');
  }

  if (!subjectId) {
    return sendError(res, 400, 'Subject ID is required');
  }

  await deleteTutorSubject(userId, subjectId);

  return sendSuccess(res, 200, 'Tutor subject removed successfully');
};

export const getTutorSubjectsController = async (
  req: Request,
  res: Response,
) => {
  const tutorId = req.params.tutorId?.toString();

  if (!tutorId) {
    return sendError(res, 400, 'Tutor ID is required');
  }

  const subjects = await getTutorSubjects(tutorId);

  return sendSuccess(res, 200, 'Tutor subjects fetched successfully', subjects);
};

export const getTutorSubjectController = async (
  req: Request,
  res: Response,
) => {
  const tutorId = req.params.tutorId?.toString();
  const subjectId = req.params.subjectId?.toString();

  if (!tutorId) {
    return sendError(res, 400, 'Tutor ID is required');
  }

  if (!subjectId) {
    return sendError(res, 400, 'Subject ID is required');
  }

  const subject = await getTutorSubject(tutorId, subjectId);

  return sendSuccess(res, 200, 'Tutor subject fetched successfully', subject);
};
