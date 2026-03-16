import * as taskRepository from '../repositories/taskRepository';
import * as projectMemberRepository from '../repositories/projectMemberRepository';
import * as activityLogService from './activityLogService';
import { verifyProjectRole } from './projectService';
import { NotFoundError } from '../errors/NotFoundError';
import { ConflictError } from '../errors/ConflictError';
import { ActivityAction } from '../constants/activityActions';
import { ProjectRole } from '@prisma/client';

export const createTask = async (projectId: string, creatorId: string, data: any) => {
  // Only ADMIN and MEMBER can create tasks
  await verifyProjectRole(projectId, creatorId, [ProjectRole.ADMIN, ProjectRole.MEMBER]);

  // If assigning to someone during creation, ensure they belong to the project
  if (data.assigneeId) {
    const isMember = await projectMemberRepository.findMember(projectId, data.assigneeId);
    if (!isMember) {
      throw new ConflictError('Assignee must be a member of the project');
    }
  }

  const task = await taskRepository.createTask({
    ...data,
    projectId,
    createdById: creatorId,
  });

  activityLogService.log({
    userId: creatorId,
    projectId,
    taskId: task.id,
    action: ActivityAction.TASK_CREATED,
    metadata: { title: task.title },
  }).catch(() => {});

  return task;
};

export const getProjectTasks = async (projectId: string, userId: string, page: number = 1, limit: number = 20) => {
  // Any member (including VIEWER) can list tasks
  await verifyProjectRole(projectId, userId);
  return taskRepository.findProjectTasks(projectId, page, limit);
};

export const getTaskDetails = async (projectId: string, taskId: string, userId: string) => {
  // Any member can read
  await verifyProjectRole(projectId, userId);
  
  const task = await taskRepository.findTaskById(taskId, projectId);
  if (!task) {
    throw new NotFoundError('Task not found');
  }
  return task;
};

export const updateTask = async (projectId: string, taskId: string, userId: string, data: any) => {
  // Only ADMIN and MEMBER can update
  await verifyProjectRole(projectId, userId, [ProjectRole.ADMIN, ProjectRole.MEMBER]);

  const existingTask = await taskRepository.findTaskById(taskId, projectId);
  if (!existingTask) {
    throw new NotFoundError('Task not found');
  }

  const updated = await taskRepository.updateTask(taskId, projectId, data);

  activityLogService.log({
    userId,
    projectId,
    taskId,
    action: ActivityAction.TASK_UPDATED,
    metadata: { updatedFields: Object.keys(data) },
  }).catch(() => {});

  return updated;
};

export const deleteTask = async (projectId: string, taskId: string, userId: string) => {
  // Only ADMIN and MEMBER can delete
  await verifyProjectRole(projectId, userId, [ProjectRole.ADMIN, ProjectRole.MEMBER]);

  const existingTask = await taskRepository.findTaskById(taskId, projectId);
  if (!existingTask) {
    throw new NotFoundError('Task not found');
  }

  await taskRepository.deleteTask(taskId, projectId);

  activityLogService.log({
    userId,
    projectId,
    taskId,
    action: ActivityAction.TASK_DELETED,
    metadata: { title: existingTask.title },
  }).catch(() => {});
};

export const assignTask = async (projectId: string, taskId: string, userId: string, assigneeId: string | null) => {
  // Only ADMIN and MEMBER can assign tasks
  await verifyProjectRole(projectId, userId, [ProjectRole.ADMIN, ProjectRole.MEMBER]);

  const existingTask = await taskRepository.findTaskById(taskId, projectId);
  if (!existingTask) {
    throw new NotFoundError('Task not found');
  }

  // Ensure target assignee is actually in the project
  if (assigneeId) {
    const isMember = await projectMemberRepository.findMember(projectId, assigneeId);
    if (!isMember) {
      throw new ConflictError('Cannot assign task to a non-project member');
    }
  }

  const result = await taskRepository.assignTask(taskId, projectId, assigneeId);

  activityLogService.log({
    userId,
    projectId,
    taskId,
    action: ActivityAction.TASK_ASSIGNED,
    metadata: { assigneeId, previousAssigneeId: existingTask.assigneeId },
  }).catch(() => {});

  return result;
};
