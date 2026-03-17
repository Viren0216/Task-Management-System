import { Request, Response } from 'express';
import * as kanbanService from '../services/kanbanService';

export const getKanbanBoard = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const board = await kanbanService.getKanbanBoard(req.params.projectId, userId);
  res.status(200).json({ status: 'success', data: board });
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { status } = req.body;
  const task = await kanbanService.updateTaskStatus(
    req.params.projectId,
    req.params.taskId,
    userId,
    status
  );
  res.status(200).json({ status: 'success', data: task });
};
