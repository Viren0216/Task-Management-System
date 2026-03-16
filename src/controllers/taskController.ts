import { Request, Response } from 'express';
import * as taskService from '../services/taskService';

export const createTask = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const task = await taskService.createTask(req.params.projectId, userId, req.body);
  res.status(201).json({ status: 'success', data: task });
};

export const listTasks = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

  const result = await taskService.getProjectTasks(req.params.projectId, userId, page, limit);
  res.status(200).json({ status: 'success', data: result });
};

export const getTask = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const task = await taskService.getTaskDetails(req.params.projectId, req.params.taskId, userId);
  res.status(200).json({ status: 'success', data: task });
};

export const updateTask = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const task = await taskService.updateTask(req.params.projectId, req.params.taskId, userId, req.body);
  res.status(200).json({ status: 'success', data: task });
};

export const deleteTask = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  await taskService.deleteTask(req.params.projectId, req.params.taskId, userId);
  res.status(204).send();
};

export const assignTask = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { assigneeId } = req.body;
  const task = await taskService.assignTask(req.params.projectId, req.params.taskId, userId, assigneeId);
  res.status(200).json({ status: 'success', data: task });
};
