import type { Response } from 'express';

type SuccessResponse<T> = {
  success: true;
  message: string;
  data?: T;
};

type ErrorResponse = {
  success: false;
  message: string;
  errors?: unknown;
};

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
) {
  const response: SuccessResponse<T> = {
    success: true,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown,
) {
  const response: ErrorResponse = {
    success: false,
    message,
  };

  if (errors !== undefined) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}
