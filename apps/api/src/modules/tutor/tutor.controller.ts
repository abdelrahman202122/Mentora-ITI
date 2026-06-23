import type { Request, Response } from 'express';
import { getTutors } from './tutor.service.js';
import { sendSuccess } from '../../utils/api-response.js';

export const getTutorsController = async (req: Request, res: Response) => {
  const tutors = await getTutors();

  return sendSuccess(res, 200, 'Tutors fetched successfully', tutors);
};
