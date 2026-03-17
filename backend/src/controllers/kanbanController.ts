import { Request, Response } from 'express';
import * as kanbanService from '../services/kanbanService';
import { TaskStatus, TaskPriority } from '@prisma/client';

export const getKanbanBoard = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { status, assigneeId, priority, search } = req.query;

  const board = await kanbanService.getKanbanBoard(req.params.projectId, userId, {
    status: status as TaskStatus | undefined,
    assigneeId: assigneeId as string | undefined,
    priority: priority as TaskPriority | undefined,
    search: search as string | undefined,
  });

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

export const moveTask = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { status, index } = req.body;

  const task = await kanbanService.moveTask({
    projectId: req.params.projectId,
    taskId: req.params.taskId,
    userId,
    toStatus: status,
    toIndex: index,
  });

  res.status(200).json({ status: 'success', data: task });
};
