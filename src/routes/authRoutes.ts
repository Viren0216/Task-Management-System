import { Router, Request, Response } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

// Skeleton routes for Authentication
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/change-password', authController.changePassword);

export default router;
