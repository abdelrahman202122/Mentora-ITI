import type { Request, Response } from 'express';
import { CATEGORIES } from '../../constants/categories.js';
import { EDUCATION_LEVELS } from '../../constants/educationLevels.js';
import { CURRICULA } from '../../constants/curricula.js';
import { sendSuccess } from '../../utils/api-response.js';

export const getCategories = (req: Request, res: Response) => {
  return sendSuccess(res, 200, 'Categories fetched successfully', CATEGORIES);
};

export const getEducationLevels = (req: Request, res: Response) => {
  return sendSuccess(
    res,
    200,
    'Education levels fetched successfully',
    EDUCATION_LEVELS,
  );
};

export const getCurricula = (req: Request, res: Response) => {
  return sendSuccess(res, 200, 'Curricula fetched successfully', CURRICULA);
};
