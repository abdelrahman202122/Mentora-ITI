import type { Request, Response } from 'express';
import {
  getProfile,
  createProfile,
  updateOwnProfile,
} from './tutor-profile.service.js';
import { sendError, sendSuccess } from '../../../utils/api-response.js';
import { generateAccessToken } from '../../../utils/JWT.js';
import { cookieOptions } from '../../../config/cookie.config.js';

// get tutor profile
export const getProfileController = async (req: Request, res: Response) => {
  const tutorId = req.params.tutorId?.toString();

  if (!tutorId) {
    return sendError(res, 400, 'Tutor ID is required');
  }

  const profile = await getProfile(tutorId);

  return sendSuccess(res, 200, 'Tutor profile fetched successfully', profile);
};

// create tutor profile (one time after registration)
export const createProfileController = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return sendError(res, 401, 'Unauthorized');
  }

  const profile = await createProfile(userId, req.body);

  // regenerate new access token with updated user role
  const newAccessToken = generateAccessToken(userId, 'tutor');
  res.cookie('accessToken', newAccessToken, cookieOptions.accessToken);

  return sendSuccess(res, 201, 'Tutor profile created successfully', profile);
};

// update field(s) in tutor profile
export const updateOwnProfileController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const profile = await updateOwnProfile(userId, req.body);

  return sendSuccess(res, 200, 'Tutor profile updated successfully', profile);
};
