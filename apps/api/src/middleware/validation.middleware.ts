import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodTypeAny } from 'zod';

type ValidationSchemas = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

type ValidationInput = ZodTypeAny | ValidationSchemas;

function isZodSchema(input: ValidationInput): input is ZodTypeAny {
  return typeof (input as ZodTypeAny).safeParseAsync === 'function';
}

function normalizeSchemas(input: ValidationInput): ValidationSchemas {
  if (isZodSchema(input)) {
    return { body: input };
  }

  return input;
}

/**
 * Validation middleware factory for validating request body, params, and query.
 *
 * Validation errors are caught and passed to the central error handler.
 * If validation succeeds, the request continues to the next handler.
 *
 * @example
 * app.post('/api/bookings', validate(createBookingSchema), bookingController.create);
 *
 * @example
 * router.get(
 *   '/:bookingId',
 *   validate({ params: bookingIdSchema }),
 *   bookingController.getOne,
 * );
 */
export function validate(input: ValidationInput): RequestHandler {
  const schemas = normalizeSchemas(input);

  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const targets = [
        ['body', schemas.body],
        ['params', schemas.params],
        ['query', schemas.query],
      ] as const;

      for (const [target, schema] of targets) {
        if (!schema) {
          continue;
        }

        const result = await schema.safeParseAsync(req[target]);

        if (!result.success) {
          throw result.error;
        }

        if (target === 'query') {
          // Express 5 exposes req.query through a getter. Shadow it so later
          // handlers receive Zod's coerced values and defaults.
          Object.defineProperty(req, 'query', {
            value: result.data,
            configurable: true,
            enumerable: true,
            writable: true,
          });
          continue;
        }

        req[target] = result.data;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
