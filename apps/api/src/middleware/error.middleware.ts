import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';
import { sendError } from '../utils/api-response.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return sendError(res, 400, 'Validation error', error.flatten().fieldErrors);
  }

  if (error instanceof AppError) {
    return sendError(res, error.statusCode, error.message);
  }

  console.error(error);

  const message =
    env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : error instanceof Error
        ? error.message
        : 'Internal server error';

  return sendError(res, 500, message);
};
