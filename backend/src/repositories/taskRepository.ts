import prisma from '../config/prisma';
import { Prisma, TaskStatus, TaskPriority } from '@prisma/client';

export const createTask = async (data: Prisma.TaskUncheckedCreateInput) => {
  return prisma.task.create({
    data,
    include: {
      assignee: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  });
};

export const findProjectTasks = async (projectId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    }),
    prisma.task.count({ where: { projectId } }),
  ]);

  return { tasks, total, page, limit };
};

export const findTaskById = async (taskId: string, projectId: string) => {
  return prisma.task.findFirst({
    where: { id: taskId, projectId },
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
  });
};

export const updateTask = async (taskId: string, projectId: string, data: Prisma.TaskUncheckedUpdateInput) => {
  return prisma.task.update({
    where: { id: taskId, projectId },
    data,
    include: {
      assignee: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      createdBy: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  });
};

export const deleteTask = async (taskId: string, projectId: string) => {
  return prisma.task.delete({
    where: { id: taskId, projectId },
  });
};

export const assignTask = async (taskId: string, projectId: string, assigneeId: string | null) => {
  return prisma.task.update({
    where: { id: taskId, projectId },
    data: { assigneeId },
    include: {
      assignee: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  });
};

// --- Kanban-specific methods ---

const taskInclude = {
  assignee: {
    select: { id: true, name: true, email: true, avatar: true },
  },
  createdBy: {
    select: { id: true, name: true, email: true, avatar: true },
  },
};

export type KanbanFilters = {
  status?: TaskStatus;
  assigneeId?: string;
  priority?: TaskPriority;
  search?: string;
};

export const findTasksByProjectGroupedByStatus = async (
  projectId: string,
  filters: KanbanFilters = {}
) => {
  const { status, assigneeId, priority, search } = filters;

  const where: Prisma.TaskWhereInput = {
    projectId,
    status,
    assigneeId,
    priority,
    ...(search
      ? {
          OR: [
            // Note: MySQL StringFilter doesn't support `mode: 'insensitive'`
            { title: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {}),
  };

  const tasks = await prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: [
      { status: 'asc' },
      { position: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  return {
    todo:       tasks.filter((t) => t.status === 'TODO'),
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS'),
    review:     tasks.filter((t) => t.status === 'REVIEW'),
    done:       tasks.filter((t) => t.status === 'DONE'),
  };
};

export const updateTaskStatus = async (taskId: string, projectId: string, status: TaskStatus) => {
  return prisma.task.update({
    where: { id: taskId, projectId },
    data: { status },
    include: taskInclude,
  });
};

export type MoveTaskInput = {
  projectId: string;
  taskId: string;
  toStatus: TaskStatus;
  toIndex: number;
};

export const moveTaskWithReorder = async ({
  projectId,
  taskId,
  toStatus,
  toIndex,
}: MoveTaskInput) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.task.findFirst({
      where: { id: taskId, projectId },
      select: { id: true, status: true, position: true },
    });

    if (!existing) {
      throw new Error('Task not found in this project');
    }

    const fromStatus = existing.status;
    const fromPosition = existing.position;

    // Moving within the same column: shift positions between fromPosition and toIndex
    if (fromStatus === toStatus) {
      if (toIndex === fromPosition) {
        const unchanged = await tx.task.findUnique({
          where: { id: taskId },
          include: taskInclude,
        });
        if (!unchanged) {
          throw new Error('Task not found in this project');
        }
        return unchanged;
      }

      const direction = toIndex > fromPosition ? -1 : 1;
      const range: Prisma.TaskWhereInput =
        toIndex > fromPosition
          ? {
              projectId,
              status: fromStatus,
              position: { gt: fromPosition, lte: toIndex },
            }
          : {
              projectId,
              status: fromStatus,
              position: { gte: toIndex, lt: fromPosition },
            };

      await tx.task.updateMany({
        where: range,
        data: {
          position: {
            increment: direction,
          },
        },
      });

      const updated = await tx.task.update({
        where: { id: taskId },
        data: {
          position: toIndex,
        },
        include: taskInclude,
      });

      return updated;
    }

    // Moving to a different column: close gap in source column
    await tx.task.updateMany({
      where: {
        projectId,
        status: fromStatus,
        position: { gt: fromPosition },
      },
      data: { position: { decrement: 1 } },
    });

    // Shift tasks in target column at/after toIndex down by 1
    await tx.task.updateMany({
      where: {
        projectId,
        status: toStatus,
        position: { gte: toIndex },
      },
      data: { position: { increment: 1 } },
    });

    const updated = await tx.task.update({
      where: { id: taskId },
      data: {
        status: toStatus,
        position: toIndex,
      },
      include: taskInclude,
    });

    return updated;
  });
};

