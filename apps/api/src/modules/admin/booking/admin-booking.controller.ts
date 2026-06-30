import type { NextFunction, Request, Response } from 'express';
import { sendSuccess } from '../../../utils/api-response.js';
import * as adminBookingService from './admin-booking.service.js';
import type { AdminBookingListQuery } from './admin-booking.validation.js';

export async function listBookings(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await adminBookingService.listBookings(
      req.query as unknown as AdminBookingListQuery,
    );
    sendSuccess(res, 200, 'Admin bookings retrieved successfully', result);
  } catch (error) {
    next(error);
  }
}
