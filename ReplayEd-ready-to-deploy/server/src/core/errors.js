export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Invalid authentication credentials') {
    super(message, 401, 'AUTHENTICATION_REQUIRED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded, please retry later') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/**
 * Central Express Error Handling Middleware.
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (err.status ? err.status : 500);
  const code = err.code || 'INTERNAL_ERROR';

  if (statusCode >= 500) {
    console.error(`[Unhandled Error] ${req.method} ${req.url}:`, err);
  }

  res.status(statusCode).json({
    error: err.message || 'An unexpected error occurred',
    code,
    details: err.details || undefined,
  });
}
