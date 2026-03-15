import { Router } from 'express';
import { getHealth } from '../controllers/healthController';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';

const router = Router();

// Base health route
router.get('/health', getHealth);

// Map layer routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
