import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware that logs the method, path, and timestamp of every incoming HTTP request.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`Incoming Request: ${req.method} ${req.url} at ${new Date().toISOString()}`);
  next();
};
