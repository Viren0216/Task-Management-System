import { Router } from 'express';
import { getHealth } from '../controllers/healthController';
import authRoutes from './authRoutes';

const router = Router();

// Base health route
router.get('/health', getHealth);

// Map layer routes
router.use('/auth', authRoutes);

export default router;
