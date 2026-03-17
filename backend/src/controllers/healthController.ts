import { Request, Response } from 'express';

/**
 * Health controller simply responds with a 200 OK indicating the service is running.
 */
export const getHealth = (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'API is up and running' });
};
