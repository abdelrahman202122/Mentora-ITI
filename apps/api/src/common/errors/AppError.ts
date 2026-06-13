export class AppError extends Error {
  constructor(
    public readonly message:    string,
    public readonly statusCode: number,
    public readonly code:       string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError   extends AppError {
  constructor(message: string) { super(message, 400, 'VALIDATION_ERROR'); }
}
export class UnauthorizedError extends AppError {
  constructor(message: string) { super(message, 401, 'UNAUTHORIZED'); }
}
export class ForbiddenError    extends AppError {
  constructor(message: string) { super(message, 403, 'FORBIDDEN'); }
}
export class ConflictError     extends AppError {
  constructor(message: string) { super(message, 409, 'CONFLICT'); }
}
export class NotFoundError     extends AppError {
  constructor(message: string) { super(message, 404, 'NOT_FOUND'); }
}