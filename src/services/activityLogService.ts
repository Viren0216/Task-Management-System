import * as activityLogRepository from '../repositories/activityLogRepository';
import * as taskRepository from '../repositories/taskRepository';
import { verifyProjectRole } from './projectService';
import { NotFoundError } from '../errors/NotFoundError';
import { ActivityActionType } from '../constants/activityActions';

// Core logging function — fire-and-forget from callers
export const log = async (data: {
  userId: string;
  projectId?: string;
  taskId?: string;
  action: ActivityActionType;
  metadata?: Record<string, any>;
}) => {
  return activityLogRepository.createLog(data);
};

export const getProjectActivity = async (
  projectId: string,
  userId: string,
  page: number = 1,
  limit: number = 20
) => {
  // Any project member can view activity
  await verifyProjectRole(projectId, userId);
  return activityLogRepository.findProjectLogs(projectId, page, limit);
};

export const getTaskActivity = async (
  projectId: string,
  taskId: string,
  userId: string,
  page: number = 1,
  limit: number = 20
) => {
  await verifyProjectRole(projectId, userId);

  const task = await taskRepository.findTaskById(taskId, projectId);
  if (!task) {
    throw new NotFoundError('Task not found in this project');
  }

  return activityLogRepository.findTaskLogs(taskId, projectId, page, limit);
};
