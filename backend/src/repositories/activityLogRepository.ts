import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export const createLog = async (data: {
  userId: string;
  projectId?: string;
  taskId?: string;
  action: string;
  metadata?: any;
}) => {
  return prisma.activityLog.create({ data });
};

export const findProjectLogs = async (projectId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.activityLog.count({ where: { projectId } }),
  ]);

  return { logs, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const findTaskLogs = async (taskId: string, projectId: string, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where: { taskId, projectId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.activityLog.count({ where: { taskId, projectId } }),
  ]);

  return { logs, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

