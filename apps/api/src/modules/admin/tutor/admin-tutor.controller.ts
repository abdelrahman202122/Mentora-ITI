import type { Request, Response } from 'express';
import * as adminService from './admin-tutor.service.js';
import { sendError, sendSuccess } from '../../../utils/api-response.js';
import type { AdminUpdateTutorProfileInput } from '../../../validators/tutor-profile.js';
import { AdminTutorSearchParams } from '../../../validators/tutor-search.js';

export const getTutorStats = async (req: Request, res: Response) => {
  const stats = await adminService.getTutorStats();
  sendSuccess(res, 200, 'Tutor stats fetched successfully', stats);
};

export const approveTutor = async (req: Request, res: Response) => {
  const tutorId = req.params.tutorId?.toString();
  if (!tutorId) {
    return sendError(res, 400, 'Tutor ID is required');
  }

  const updated = await adminService.approveTutor(tutorId);
  sendSuccess(res, 200, 'Tutor approved successfully', updated);
};

export const rejectTutor = async (req: Request, res: Response) => {
  const tutorId = req.params.tutorId?.toString();
  if (!tutorId) {
    return sendError(res, 400, 'Tutor ID is required');
  }

  const updated = await adminService.rejectTutor(tutorId);
  sendSuccess(res, 200, 'Tutor rejected successfully', updated);
};

export const patchTutor = async (req: Request, res: Response) => {
  const tutorId = req.params.tutorId?.toString();
  if (!tutorId) {
    return sendError(res, 400, 'Tutor ID is required');
  }

  const data = req.body as AdminUpdateTutorProfileInput;
  const updated = await adminService.patchTutor(tutorId, data);
  sendSuccess(res, 200, 'Tutor patched successfully', updated);
};

export const getTutors = async (req: Request, res: Response) => {
  const result = await adminService.getTutors(
    req.query as unknown as AdminTutorSearchParams,
  );

  return sendSuccess(res, 200, 'Tutors fetched successfully', result);
};
