import { Router } from 'express';
import * as projectController from '../controllers/projectController';
import { requireAuth } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  updateMemberRoleSchema,
} from '../validators/projectValidator';

const router = Router();

// Apply auth middleware to all project routes
router.use(requireAuth);

// Project Management
router.post('/', validateRequest(createProjectSchema), projectController.createProject);
router.get('/', projectController.listProjects);
router.get('/:projectId', projectController.getProject);
router.patch('/:projectId', validateRequest(updateProjectSchema), projectController.updateProject);
router.delete('/:projectId', projectController.deleteProject);

// Member Management
router.get('/:projectId/members', projectController.listMembers);
router.get('/:projectId/members/me', projectController.getMyRole);
router.post('/:projectId/members', validateRequest(addMemberSchema), projectController.inviteMember);
router.patch('/:projectId/members/:userId', validateRequest(updateMemberRoleSchema), projectController.updateMemberRole);
router.delete('/:projectId/members/:userId', projectController.removeMember);

export default router;
