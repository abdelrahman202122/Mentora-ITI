import type { Request, Response } from 'express';
import {
  createAvailability,
  getAvailability,
  getFilteredAvailabilityForDateRange,
  replaceAvailability,
} from './tutor-availability.service.js';
import { sendError, sendSuccess } from '../../../utils/api-response.js';

export const createAvailabilityController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.user?.userId;

  if (!userId) {
    return sendError(res, 401, 'Unauthorized');
  }

  const slots = req.body.slots;
  if (!slots || typeof slots !== 'object') {
    return sendError(res, 400, "Invalid payload: missing 'slots' data");
  }

  const timezone = req.body.timezone;
  if (!timezone) {
    return sendError(res, 400, "Invalid payload: missing 'timezone' data");
  }

  const availability = await createAvailability(userId, { slots, timezone });

  return sendSuccess(
    res,
    201,
    'Tutor availability created successfully',
    availability,
  );
};

export const replaceAvailabilityController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.user?.userId;

  if (!userId) {
    return sendError(res, 401, 'Unauthorized');
  }

  const slots = req.body.slots;
  if (!slots || typeof slots !== 'object') {
    return sendError(res, 400, "Invalid payload: missing 'slots' data");
  }

  const timezone = req.body.timezone;
  if (!timezone) {
    return sendError(res, 400, "Invalid payload: missing 'timezone' data");
  }

  const availability = await replaceAvailability(userId, { slots, timezone });

  return sendSuccess(
    res,
    200,
    'Tutor availability updated successfully',
    availability,
  );
};

export const getAvailabilityController = async (
  req: Request,
  res: Response,
) => {
  const tutorId = req.params.tutorId?.toString();

  if (!tutorId) {
    return sendError(res, 400, 'Tutor ID is required');
  }

  const canViewUnapproved =
    req.user?.role === 'admin' ||
    (req.user?.role === 'tutor' && req.user.userId === tutorId);
  const approvedOnly = !canViewUnapproved;
  const availability = await getAvailability(tutorId, approvedOnly);

  return sendSuccess(
    res,
    200,
    'Tutor availability fetched successfully',
    availability,
  );
};

export const getAvailabilitySlotsController = async (
  req: Request,
  res: Response,
) => {
  const tutorId = req.params.tutorId?.toString();

  if (!tutorId) {
    return sendError(res, 400, 'Tutor ID is required');
  }

  const { startDate, endDate } = req.query;

  const canViewUnapproved =
    req.user?.role === 'admin' ||
    (req.user?.role === 'tutor' && req.user.userId === tutorId);
  const approvedOnly = !canViewUnapproved;
  const slots = await getFilteredAvailabilityForDateRange(
    tutorId,
    startDate as string,
    endDate as string,
    approvedOnly,
  );

  if (!slots) {
    return sendError(res, 404, 'Tutor availability not found');
  }

  return sendSuccess(
    res,
    200,
    'Tutor availability slots fetched successfully',
    slots,
  );
};
