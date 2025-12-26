import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/index.js';

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      status: err.statusCode,
    });
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: 'Invalid JSON in request body',
      status: 400,
    });
    return;
  }

  if ('code' in err && typeof err.code === 'string') {
    const pgError = err as Error & { code: string };
    
    if (pgError.code === '23503') {
      res.status(400).json({
        error: 'Referenced resource not found',
        status: 400,
      });
      return;
    }

    if (pgError.code === '23505') {
      res.status(409).json({
        error: 'Resource already exists',
        status: 409,
      });
      return;
    }

    if (pgError.code === 'ECONNREFUSED' || pgError.code === 'ETIMEDOUT') {
      res.status(503).json({
        error: 'Database temporarily unavailable',
        status: 503,
      });
      return;
    }
  }

  res.status(500).json({
    error: 'An unexpected error occurred. Please try again.',
    status: 500,
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
    status: 404,
  });
}

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
