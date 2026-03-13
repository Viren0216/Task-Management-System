import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors/CustomError';

/**
 * Global Error Handling Middleware.
 * This intercepts all errors thrown gracefully (or violently) in any route or service function.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. If we threw a typed CustomError (validation, unauth, etc.), properly format it!
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ errors: err.serializeErrors() });
  }

  // 2. Logging unexpected framework / database crash logs
  // In production, you might want to send this to Sentry, Datadog or CloudWatch.
  console.error('🚨 UNHANDLED ERROR 🚨 :', err);

  // 3. Graceful fallback for the external client so we don't leak core server stacks
  res.status(500).json({
    errors: [{ message: 'Something went incredibly wrong on the server.' }],
  });
};
