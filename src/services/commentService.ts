import * as commentRepository from '../repositories/commentRepository';
import * as taskRepository from '../repositories/taskRepository';
import * as activityLogService from './activityLogService';
import { verifyProjectRole } from './projectService';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { ActivityAction } from '../constants/activityActions';
import { ProjectRole } from '@prisma/client';

// Helper: verify task exists in the project, return the task
const verifyTaskInProject = async (taskId: string, projectId: string) => {
  const task = await taskRepository.findTaskById(taskId, projectId);
  if (!task) {
    throw new NotFoundError('Task not found in this project');
  }
  return task;
};

export const createComment = async (projectId: string, taskId: string, userId: string, content: string) => {
  // ADMIN and MEMBER can comment; VIEWER cannot
  await verifyProjectRole(projectId, userId, [ProjectRole.ADMIN, ProjectRole.MEMBER]);
  await verifyTaskInProject(taskId, projectId);

  const comment = await commentRepository.createComment({ content, taskId, userId });

  activityLogService.log({
    userId,
    projectId,
    taskId,
    action: ActivityAction.COMMENT_CREATED,
    metadata: { commentId: comment.id },
  }).catch(() => {});

  return comment;
};

export const getTaskComments = async (projectId: string, taskId: string, userId: string, page: number = 1, limit: number = 20) => {
  // Any member can read comments
  await verifyProjectRole(projectId, userId);
  await verifyTaskInProject(taskId, projectId);

  return commentRepository.findTaskComments(taskId, page, limit);
};

export const updateComment = async (projectId: string, taskId: string, commentId: string, userId: string, content: string) => {
  await verifyProjectRole(projectId, userId, [ProjectRole.ADMIN, ProjectRole.MEMBER]);
  await verifyTaskInProject(taskId, projectId);

  const comment = await commentRepository.findCommentById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  // Only the author can edit their own comment
  if (comment.userId !== userId) {
    throw new ForbiddenError('You can only edit your own comments');
  }

  const updated = await commentRepository.updateComment(commentId, content);

  activityLogService.log({
    userId,
    projectId,
    taskId,
    action: ActivityAction.COMMENT_UPDATED,
    metadata: { commentId },
  }).catch(() => {});

  return updated;
};

export const deleteComment = async (projectId: string, taskId: string, commentId: string, userId: string) => {
  await verifyProjectRole(projectId, userId, [ProjectRole.ADMIN, ProjectRole.MEMBER]);
  await verifyTaskInProject(taskId, projectId);

  const comment = await commentRepository.findCommentById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment not found');
  }

  // Author can delete own comment; ADMIN can delete any comment
  const membership = await verifyProjectRole(projectId, userId);
  if (comment.userId !== userId && membership.role !== ProjectRole.ADMIN) {
    throw new ForbiddenError('You can only delete your own comments');
  }

  await commentRepository.deleteComment(commentId);

  activityLogService.log({
    userId,
    projectId,
    taskId,
    action: ActivityAction.COMMENT_DELETED,
    metadata: { commentId },
  }).catch(() => {});
};
