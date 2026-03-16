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

export const findTasksByProjectGroupedByStatus = async (projectId: string) => {
  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: taskInclude,
    orderBy: { createdAt: 'desc' },
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

