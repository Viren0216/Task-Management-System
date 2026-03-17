import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// All dashboard routes require authentication
router.use(requireAuth);

// GET /api/v1/dashboard/stats — aggregate stats for the authenticated user
router.get('/stats', dashboardController.getStats);

export default router;


