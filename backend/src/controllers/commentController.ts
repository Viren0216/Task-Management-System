import { Request, Response } from 'express';
import * as commentService from '../services/commentService';

export const createComment = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const comment = await commentService.createComment(
    req.params.projectId,
    req.params.taskId,
    userId,
    req.body.content
  );
  res.status(201).json({ status: 'success', data: comment });
};

export const listComments = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

  const result = await commentService.getTaskComments(
    req.params.projectId,
    req.params.taskId,
    userId,
    page,
    limit
  );
  res.status(200).json({ status: 'success', data: result });
};

export const updateComment = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const comment = await commentService.updateComment(
    req.params.projectId,
    req.params.taskId,
    req.params.commentId,
    userId,
    req.body.content
  );
  res.status(200).json({ status: 'success', data: comment });
};

export const deleteComment = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  await commentService.deleteComment(
    req.params.projectId,
    req.params.taskId,
    req.params.commentId,
    userId
  );
  res.status(204).send();
};
