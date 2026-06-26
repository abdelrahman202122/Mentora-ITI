import type { Request, Response } from 'express';
import { getTutors } from './tutor.service.js';
import { sendSuccess } from '../../utils/api-response.js';
import type { TutorSearchParams } from '../../validators/tutor-search.js';

export const getTutorsController = async (
  req: Request<unknown, unknown, unknown, TutorSearchParams>,
  res: Response,
) => {
  const tutors = await getTutors(req.query);

  return sendSuccess(res, 200, 'Tutors fetched successfully', tutors);
};
