import * as taskRepository from '../repositories/taskRepository';
import * as activityLogService from './activityLogService';
import { verifyProjectRole } from './projectService';
import { NotFoundError } from '../errors/NotFoundError';
import { ActivityAction } from '../constants/activityActions';
import { ProjectRole, TaskStatus } from '@prisma/client';

export const getKanbanBoard = async (projectId: string, userId: string) => {
  // Any project member (including VIEWER) can view the Kanban board
  await verifyProjectRole(projectId, userId);
  return taskRepository.findTasksByProjectGroupedByStatus(projectId);
};

export const updateTaskStatus = async (
  projectId: string,
  taskId: string,
  userId: string,
  status: TaskStatus
) => {
  // Only ADMIN and MEMBER can move cards across columns
  await verifyProjectRole(projectId, userId, [ProjectRole.ADMIN, ProjectRole.MEMBER]);

  // Ensure the task exists and belongs to this project
  const task = await taskRepository.findTaskById(taskId, projectId);
  if (!task) {
    throw new NotFoundError('Task not found in this project');
  }

  const updated = await taskRepository.updateTaskStatus(taskId, projectId, status);

  activityLogService.log({
    userId,
    projectId,
    taskId,
    action: ActivityAction.TASK_STATUS_CHANGED,
    metadata: { oldStatus: task.status, newStatus: status },
  }).catch(() => {});

  return updated;
};
