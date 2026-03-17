import prisma from '../config/prisma';
import { TaskStatus } from '@prisma/client';

/**
 * Aggregates dashboard stats for the authenticated user:
 * - Total projects they belong to
 * - Total tasks assigned to them
 * - Task counts grouped by status
 */
export const getDashboardStats = async (userId: string) => {
  const [totalProjects, totalTasksAssignedToMe, tasksByStatusRaw] = await Promise.all([
    prisma.projectMember.count({ where: { userId } }),
    prisma.task.count({ where: { assigneeId: userId } }),
    prisma.task.groupBy({
      by: ['status'],
      where: { assigneeId: userId },
      _count: { status: true },
    }),
  ]);

  // Convert the groupBy result into a clean { TODO: n, IN_PROGRESS: n, ... } object
  const tasksByStatus: Record<string, number> = {
    TODO: 0,
    IN_PROGRESS: 0,
    REVIEW: 0,
    DONE: 0,
  };
  for (const row of tasksByStatusRaw) {
    tasksByStatus[row.status] = row._count.status;
  }

  return { totalProjects, totalTasksAssignedToMe, tasksByStatus };
};

/**
 * Returns all tasks assigned to the authenticated user across ALL projects.
 * Supports optional ?status= filter.
 */
export const getMyTasks = async (userId: string, statusFilter?: TaskStatus) => {
  const where: any = { assigneeId: userId };
  if (statusFilter) {
    where.status = statusFilter;
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      project: {
        select: { id: true, name: true },
      },
    },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
  });

  return tasks;
};


