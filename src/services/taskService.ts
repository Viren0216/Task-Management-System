import * as taskRepository from '../repositories/taskRepository';
import * as projectMemberRepository from '../repositories/projectMemberRepository';
import { verifyProjectRole } from './projectService';
import { NotFoundError } from '../errors/NotFoundError';
import { ConflictError } from '../errors/ConflictError';
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

  return taskRepository.createTask({
    ...data,
    projectId,
    createdById: creatorId,
  });
};

export const getProjectTasks = async (projectId: string, userId: string) => {
  // Any member (including VIEWER) can list tasks
  await verifyProjectRole(projectId, userId);
  return taskRepository.findProjectTasks(projectId);
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

  return taskRepository.updateTask(taskId, projectId, data);
};

export const deleteTask = async (projectId: string, taskId: string, userId: string) => {
  // Only ADMIN and MEMBER can delete
  await verifyProjectRole(projectId, userId, [ProjectRole.ADMIN, ProjectRole.MEMBER]);

  const existingTask = await taskRepository.findTaskById(taskId, projectId);
  if (!existingTask) {
    throw new NotFoundError('Task not found');
  }

  return taskRepository.deleteTask(taskId, projectId);
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

  return taskRepository.assignTask(taskId, projectId, assigneeId);
};
