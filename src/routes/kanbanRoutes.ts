import { Router } from 'express';
import * as kanbanController from '../controllers/kanbanController';
import { requireAuth } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validate';
import { updateTaskStatusSchema } from '../validators/taskValidator';

const router = Router({ mergeParams: true }); // mergeParams to read :projectId from parent

// GET  /api/v1/projects/:projectId/kanban  → grouped board view
router.get('/', kanbanController.getKanbanBoard);

// PATCH /api/v1/projects/:projectId/tasks/:taskId/status → move card across columns
router.patch('/:taskId/status', validateRequest(updateTaskStatusSchema), kanbanController.updateTaskStatus);

export default router;
