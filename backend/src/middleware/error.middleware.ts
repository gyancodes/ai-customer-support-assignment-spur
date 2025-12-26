import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/index.js';

/**
 * Global error handler middleware
 * Catches all errors and returns appropriate JSON responses
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error for debugging
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Handle known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      status: err.statusCode,
    });
    return;
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: 'Invalid JSON in request body',
      status: 400,
    });
    return;
  }

  // Handle PostgreSQL errors
  if ('code' in err && typeof err.code === 'string') {
    const pgError = err as Error & { code: string };
    
    // Foreign key violation
    if (pgError.code === '23503') {
      res.status(400).json({
        error: 'Referenced resource not found',
        status: 400,
      });
      return;
    }

    // Unique violation
    if (pgError.code === '23505') {
      res.status(409).json({
        error: 'Resource already exists',
        status: 409,
      });
      return;
    }

    // Connection errors
    if (pgError.code === 'ECONNREFUSED' || pgError.code === 'ETIMEDOUT') {
      res.status(503).json({
        error: 'Database temporarily unavailable',
        status: 503,
      });
      return;
    }
  }

  // Default to 500 for unknown errors
  res.status(500).json({
    error: 'An unexpected error occurred. Please try again.',
    status: 500,
  });
}

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
    status: 404,
  });
}

/**
 * Request logging middleware (development only)
 */
export function requestLogger(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  }
  next();
}
