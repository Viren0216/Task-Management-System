import { Request, Response } from 'express';
import * as activityLogService from '../services/activityLogService';

export const getProjectActivity = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

  const result = await activityLogService.getProjectActivity(
    req.params.projectId,
    userId,
    page,
    limit
  );
  res.status(200).json({ status: 'success', data: result });
};

export const getTaskActivity = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

  const result = await activityLogService.getTaskActivity(
    req.params.projectId,
    req.params.taskId,
    userId,
    page,
    limit
  );
  res.status(200).json({ status: 'success', data: result });
};
