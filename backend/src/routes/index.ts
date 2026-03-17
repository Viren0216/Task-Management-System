import { Router } from 'express';
import { getHealth } from '../controllers/healthController';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import projectRoutes from './projectRoutes';
import dashboardRoutes from './dashboardRoutes';
import myTaskRoutes from './myTaskRoutes';

const router = Router();

// Base health route
router.get('/health', getHealth);

// Map layer routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/tasks', myTaskRoutes);

export default router;
