import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// All task routes here require authentication
router.use(requireAuth);

// GET /api/v1/tasks/me — all tasks assigned to the authenticated user across all projects
router.get('/me', dashboardController.getMyTasks);

export default router;

