import prisma from '../config/prisma';
import { ProjectRole, Prisma } from '@prisma/client';

export const addMember = async (data: Prisma.ProjectMemberUncheckedCreateInput) => {
  return prisma.projectMember.create({
    data,
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
  });
};

export const findMember = async (projectId: string, userId: string) => {
  return prisma.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId },
    },
  });
};

export const findProjectMembers = async (projectId: string) => {
  return prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatar: true },
      },
      invitedBy: {
        select: { id: true, name: true, email: true, avatar: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const updateMemberRole = async (projectId: string, userId: string, role: ProjectRole) => {
  return prisma.projectMember.update({
    where: {
      projectId_userId: { projectId, userId },
    },
    data: { role },
  });
};

export const removeMember = async (projectId: string, userId: string) => {
  return prisma.projectMember.delete({
    where: {
      projectId_userId: { projectId, userId },
    },
  });
};

export const countAdmins = async (projectId: string) => {
  return prisma.projectMember.count({
    where: {
      projectId,
      role: 'ADMIN',
    },
  });
};
