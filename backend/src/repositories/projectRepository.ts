import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export const createProject = async (data: Prisma.ProjectUncheckedCreateInput) => {
  return prisma.project.create({ data });
};

export const findUserProjects = async (userId: string) => {
  return prisma.project.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const findProjectById = async (projectId: string) => {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      updatedBy: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  });
};

export const updateProject = async (projectId: string, data: Prisma.ProjectUncheckedUpdateInput) => {
  return prisma.project.update({
    where: { id: projectId },
    data,
    include: {
      owner: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      updatedBy: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  });
};

export const deleteProject = async (projectId: string) => {
  return prisma.project.delete({
    where: { id: projectId },
  });
};
