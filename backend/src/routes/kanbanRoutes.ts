import { Router } from 'express';
import * as kanbanController from '../controllers/kanbanController';
import { validateRequest } from '../middleware/validate';
import { updateTaskStatusSchema, moveTaskSchema } from '../validators/taskValidator';

const router = Router({ mergeParams: true }); // mergeParams to read :projectId from parent

// GET  /api/v1/projects/:projectId/kanban  → grouped board view
router.get('/', kanbanController.getKanbanBoard);

// PATCH /api/v1/projects/:projectId/kanban/:taskId/status → move card across columns (status only)
router.patch(
  '/:taskId/status',
  validateRequest(updateTaskStatusSchema),
  kanbanController.updateTaskStatus
);

// PATCH /api/v1/projects/:projectId/kanban/:taskId/move → move card with ordering
router.patch(
  '/:taskId/move',
  validateRequest(moveTaskSchema),
  kanbanController.moveTask
);

export default router;
