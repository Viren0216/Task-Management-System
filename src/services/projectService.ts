import * as projectRepository from '../repositories/projectRepository';
import * as projectMemberRepository from '../repositories/projectMemberRepository';
import * as userRepository from '../repositories/userRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { ConflictError } from '../errors/ConflictError';
import { ProjectRole } from '@prisma/client';
import prisma from '../config/prisma';

// Helper to verify membership and roles
export const verifyProjectRole = async (projectId: string, userId: string, allowedRoles?: ProjectRole[]) => {
  const member = await projectMemberRepository.findMember(projectId, userId);
  if (!member) {
    throw new NotFoundError('Project not found or you are not a member');
  }

  if (allowedRoles && !allowedRoles.includes(member.role)) {
    throw new ForbiddenError('You do not have permission to perform this action');
  }

  return member;
};

export const createProject = async (data: { name: string; description?: string }, ownerId: string) => {
  // Use transaction to ensure both project and admin member are created reliably
  return prisma.$transaction(async (tx) => {
    // Check for duplicate name for the same owner
    const existingProject = await tx.project.findUnique({
      where: {
        ownerId_name: { ownerId, name: data.name },
      },
    });

    if (existingProject) {
      throw new ConflictError('You already have a project with this name');
    }

    const project = await tx.project.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId,
      },
    });

    await tx.projectMember.create({
      data: {
        projectId: project.id,
        userId: ownerId,
        role: ProjectRole.ADMIN,
      },
    });

    return project;
  });
};

export const getUserProjects = async (userId: string) => {
  return projectRepository.findUserProjects(userId);
};

export const getProjectDetails = async (projectId: string, userId: string) => {
  await verifyProjectRole(projectId, userId);
  return projectRepository.findProjectById(projectId);
};

export const updateProject = async (projectId: string, userId: string, data: any) => {
  await verifyProjectRole(projectId, userId, [ProjectRole.ADMIN]);
  
  // Update the project, marking the updater
  return projectRepository.updateProject(projectId, {
    ...data,
    updatedById: userId,
  });
};

export const deleteProject = async (projectId: string, userId: string) => {
  await verifyProjectRole(projectId, userId, [ProjectRole.ADMIN]);
  return projectRepository.deleteProject(projectId);
};

export const getProjectMembers = async (projectId: string, userId: string) => {
  await verifyProjectRole(projectId, userId);
  return projectMemberRepository.findProjectMembers(projectId);
};

export const getMyProjectRole = async (projectId: string, userId: string) => {
  const member = await verifyProjectRole(projectId, userId);
  return { role: member.role };
};

export const inviteMember = async (projectId: string, requesterId: string, email: string, role: ProjectRole) => {
  await verifyProjectRole(projectId, requesterId, [ProjectRole.ADMIN]);

  const targetUser = await userRepository.findUserByEmail(email);
  if (!targetUser) {
    throw new NotFoundError('User with this email not found');
  }

  const existingMember = await projectMemberRepository.findMember(projectId, targetUser.id);
  if (existingMember) {
    throw new ConflictError('User is already a member of this project');
  }

  return projectMemberRepository.addMember({
    projectId,
    userId: targetUser.id,
    role,
    invitedById: requesterId,
  });
};

export const updateMemberRole = async (projectId: string, requesterId: string, targetUserId: string, newRole: ProjectRole) => {
  await verifyProjectRole(projectId, requesterId, [ProjectRole.ADMIN]);

  const existingMember = await projectMemberRepository.findMember(projectId, targetUserId);
  if (!existingMember) {
    throw new NotFoundError('Member not found in this project');
  }

  // Prevent last admin removal mapping
  if (existingMember.role === ProjectRole.ADMIN && newRole !== ProjectRole.ADMIN) {
    const adminCount = await projectMemberRepository.countAdmins(projectId);
    if (adminCount <= 1) {
      throw new ConflictError('Cannot demote the last project admin');
    }
  }

  return projectMemberRepository.updateMemberRole(projectId, targetUserId, newRole);
};

export const removeMember = async (projectId: string, requesterId: string, targetUserId: string) => {
  await verifyProjectRole(projectId, requesterId, [ProjectRole.ADMIN]);

  const existingMember = await projectMemberRepository.findMember(projectId, targetUserId);
  if (!existingMember) {
    throw new NotFoundError('Member not found in this project');
  }

  if (existingMember.role === ProjectRole.ADMIN) {
    const adminCount = await projectMemberRepository.countAdmins(projectId);
    if (adminCount <= 1) {
      throw new ConflictError('Cannot remove the last project admin');
    }
  }

  return projectMemberRepository.removeMember(projectId, targetUserId);
};
