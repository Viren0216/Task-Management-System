import { Router } from 'express';
import * as activityLogController from '../controllers/activityLogController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router({ mergeParams: true });

router.use(requireAuth);

// GET /api/v1/projects/:projectId/activity
router.get('/', activityLogController.getProjectActivity);

export default router;
