import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboardService';
import { TaskStatus } from '@prisma/client';

export const getStats = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const stats = await dashboardService.getDashboardStats(userId);
  res.status(200).json({ status: 'success', data: stats });
};

export const getMyTasks = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const status = req.query.status as TaskStatus | undefined;
  const tasks = await dashboardService.getMyTasks(userId, status);
  res.status(200).json({ status: 'success', data: tasks });
};


