import type { Request, Response } from 'express';

import { sendSuccess } from '../../utils/api-response.js';
import { recommendTutors } from './tutor-recommendation.service.js';

export async function recommendTutorsController(req: Request, res: Response) {
  const learnerId = req.user?.userId;

  if (!learnerId) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  const result = await recommendTutors(learnerId, req.body);

  return sendSuccess(
    res,
    200,
    'Tutor recommendations fetched successfully',
    result,
  );
}
