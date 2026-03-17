import * as taskRepository from '../repositories/taskRepository';
import * as activityLogService from './activityLogService';
import { verifyProjectRole } from './projectService';
import { NotFoundError } from '../errors/NotFoundError';
import { ActivityAction } from '../constants/activityActions';
import { ProjectRole, TaskStatus, TaskPriority } from '@prisma/client';

type BoardFilters = {
  status?: TaskStatus;
  assigneeId?: string;
  priority?: TaskPriority;
  search?: string;
};

export const getKanbanBoard = async (
  projectId: string,
  userId: string,
  filters: BoardFilters = {}
) => {
  // Any project member (including VIEWER) can view the Kanban board
  await verifyProjectRole(projectId, userId);
  return taskRepository.findTasksByProjectGroupedByStatus(projectId, filters);
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

  activityLogService
    .log({
      userId,
      projectId,
      taskId,
      action: ActivityAction.TASK_STATUS_CHANGED,
      metadata: { oldStatus: task.status, newStatus: status },
    })
    .catch(() => {});

  return updated;
};

type MoveTaskPayload = {
  projectId: string;
  taskId: string;
  userId: string;
  toStatus: TaskStatus;
  toIndex: number;
};

export const moveTask = async ({
  projectId,
  taskId,
  userId,
  toStatus,
  toIndex,
}: MoveTaskPayload) => {
  // Only ADMIN and MEMBER can move cards across columns
  await verifyProjectRole(projectId, userId, [ProjectRole.ADMIN, ProjectRole.MEMBER]);

  // Ensure the task exists and belongs to this project
  const existing = await taskRepository.findTaskById(taskId, projectId);
  if (!existing) {
    throw new NotFoundError('Task not found in this project');
  }

  const updated = await taskRepository.moveTaskWithReorder({
    projectId,
    taskId,
    toStatus,
    toIndex,
  });

  activityLogService
    .log({
      userId,
      projectId,
      taskId,
      action: ActivityAction.TASK_STATUS_CHANGED,
      metadata: {
        oldStatus: existing.status,
        newStatus: updated.status,
        newPosition: (updated as any).position,
      },
    })
    .catch(() => {});

  return updated;
};
