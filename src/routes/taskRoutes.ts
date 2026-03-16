import { Router } from 'express';
import * as taskController from '../controllers/taskController';
import { requireAuth } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
} from '../validators/taskValidator';
import * as activityLogController from '../controllers/activityLogController';
import commentRoutes from './commentRoutes';

const router = Router({ mergeParams: true }); // mergeParams needed to read :projectId from parent

// Mount comment routes under /:taskId/comments
router.use('/:taskId/comments', commentRoutes);

router.post('/', validateRequest(createTaskSchema), taskController.createTask);
router.get('/', taskController.listTasks);
router.get('/:taskId', taskController.getTask);
router.patch('/:taskId', validateRequest(updateTaskSchema), taskController.updateTask);
router.delete('/:taskId', taskController.deleteTask);
router.patch('/:taskId/assign', validateRequest(assignTaskSchema), taskController.assignTask);
router.get('/:taskId/activity', activityLogController.getTaskActivity);

export default router;
