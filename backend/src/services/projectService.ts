import * as projectRepository from '../repositories/projectRepository';
import * as projectMemberRepository from '../repositories/projectMemberRepository';
import * as userRepository from '../repositories/userRepository';
import * as activityLogService from './activityLogService';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { ConflictError } from '../errors/ConflictError';
import { ActivityAction } from '../constants/activityActions';
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
  const project = await prisma.$transaction(async (tx) => {
    // Check for duplicate name for the same owner
    const existingProject = await tx.project.findUnique({
      where: {
        ownerId_name: { ownerId, name: data.name },
      },
    });

    if (existingProject) {
      throw new ConflictError('You already have a project with this name');
    }

    const newProject = await tx.project.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId,
      },
    });

    await tx.projectMember.create({
      data: {
        projectId: newProject.id,
        userId: ownerId,
        role: ProjectRole.ADMIN,
      },
    });

    return newProject;
  });

  // Fire-and-forget activity log
  activityLogService.log({
    userId: ownerId,
    projectId: project.id,
    action: ActivityAction.PROJECT_CREATED,
    metadata: { projectName: project.name },
  }).catch(() => {});

  return project;
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
  const updated = await projectRepository.updateProject(projectId, {
    ...data,
    updatedById: userId,
  });

  activityLogService.log({
    userId,
    projectId,
    action: ActivityAction.PROJECT_UPDATED,
    metadata: { updatedFields: Object.keys(data) },
  }).catch(() => {});

  return updated;
};

export const deleteProject = async (projectId: string, userId: string) => {
  await verifyProjectRole(projectId, userId, [ProjectRole.ADMIN]);

  // Grab name before deleting for the log metadata
  const project = await projectRepository.findProjectById(projectId);
  await projectRepository.deleteProject(projectId);

  activityLogService.log({
    userId,
    action: ActivityAction.PROJECT_DELETED,
    metadata: { projectName: project?.name, projectId },
  }).catch(() => {});
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

  const member = await projectMemberRepository.addMember({
    projectId,
    userId: targetUser.id,
    role,
    invitedById: requesterId,
  });

  activityLogService.log({
    userId: requesterId,
    projectId,
    action: ActivityAction.MEMBER_INVITED,
    metadata: { invitedEmail: email, invitedUserId: targetUser.id, role },
  }).catch(() => {});

  return member;
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

  const updated = await projectMemberRepository.updateMemberRole(projectId, targetUserId, newRole);

  activityLogService.log({
    userId: requesterId,
    projectId,
    action: ActivityAction.MEMBER_ROLE_CHANGED,
    metadata: { targetUserId, oldRole: existingMember.role, newRole },
  }).catch(() => {});

  return updated;
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

  await projectMemberRepository.removeMember(projectId, targetUserId);

  activityLogService.log({
    userId: requesterId,
    projectId,
    action: ActivityAction.MEMBER_REMOVED,
    metadata: { removedUserId: targetUserId },
  }).catch(() => {});
};
