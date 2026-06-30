import type { Request, Response } from 'express';
import { getTutors, getTutorStats } from './tutor.service.js';
import { sendError, sendSuccess } from '../../utils/api-response.js';
import type { TutorSearchParams } from '../../validators/tutor-search.js';

export const getTutorsController = async (req: Request, res: Response) => {
  const result = await getTutors(req.query as unknown as TutorSearchParams);

  return sendSuccess(res, 200, 'Tutors fetched successfully', result);
};

export const getTutorStatsController = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return sendError(res, 401, 'Unauthorized');
  }
  const result = await getTutorStats(userId);

  return sendSuccess(res, 200, 'Tutors stats fetched successfully', result);
};
