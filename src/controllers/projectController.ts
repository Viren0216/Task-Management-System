import { Request, Response } from 'express';
import * as projectService from '../services/projectService';

export const createProject = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const project = await projectService.createProject(req.body, userId);
  res.status(201).json({ status: 'success', data: project });
};

export const listProjects = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const projects = await projectService.getUserProjects(userId);
  res.status(200).json({ status: 'success', data: projects });
};

export const getProject = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const project = await projectService.getProjectDetails(req.params.projectId, userId);
  res.status(200).json({ status: 'success', data: project });
};

export const updateProject = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const project = await projectService.updateProject(req.params.projectId, userId, req.body);
  res.status(200).json({ status: 'success', data: project });
};

export const deleteProject = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  await projectService.deleteProject(req.params.projectId, userId);
  res.status(204).send();
};

export const listMembers = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const members = await projectService.getProjectMembers(req.params.projectId, userId);
  res.status(200).json({ status: 'success', data: members });
};

export const getMyRole = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const roleData = await projectService.getMyProjectRole(req.params.projectId, userId);
  res.status(200).json({ status: 'success', data: roleData });
};

export const inviteMember = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { email, role } = req.body;
  const newMember = await projectService.inviteMember(req.params.projectId, userId, email, role);
  res.status(201).json({ status: 'success', data: newMember });
};

export const updateMemberRole = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { role } = req.body;
  const updatedMember = await projectService.updateMemberRole(req.params.projectId, userId, req.params.userId, role);
  res.status(200).json({ status: 'success', data: updatedMember });
};

export const removeMember = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  await projectService.removeMember(req.params.projectId, userId, req.params.userId);
  res.status(204).send();
};
