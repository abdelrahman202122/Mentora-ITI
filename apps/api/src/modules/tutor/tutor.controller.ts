import type { Request, Response } from 'express';
import { getTutors } from './tutor.service.js';
import { sendSuccess } from '../../utils/api-response.js';
import type { TutorSearchParams } from '../../validators/tutor-search.js';

export const getTutorsController = async (req: Request, res: Response) => {
  const approvedOnly = req.user?.role !== 'admin';
  const result = await getTutors(
    req.query as unknown as TutorSearchParams,
    approvedOnly,
  );

  return sendSuccess(res, 200, 'Tutors fetched successfully', result);
};
