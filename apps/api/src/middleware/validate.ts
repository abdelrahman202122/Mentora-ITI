import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

/**
 * Validation middleware factory for validating request body against a Zod schema.
 *
 * Validation errors are caught and passed to the central error handler.
 * If validation succeeds, the request continues to the next handler.
 *
 * @example
 * app.post('/api/bookings', validate(createBookingSchema), bookingController.create);
 */
export function validate(schema: ZodSchema) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = await schema.safeParseAsync(req.body);

      if (!result.success) {
        // Throw ZodError; will be caught by error handler
        throw result.error;
      }

      // Store validated data on request for controller access
      req.body = result.data;

      next();
    } catch (error) {
      next(error);
    }
  };
}
