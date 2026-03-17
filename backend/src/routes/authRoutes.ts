import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validateRequest } from '../middleware/validate';
import { requireAuth } from '../middleware/authMiddleware';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  changePasswordSchema,
} from '../validators/authValidator';

const router = Router();

// Public routes protected by request body validation
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/refresh', validateRequest(refreshSchema), authController.refresh);

// logout can technically be public (if providing refresh token in body) or protected. Let's protect it.
router.post('/logout', requireAuth, authController.logout);

// Protected routes require valid Access Token Bearer in headers
router.post(
  '/change-password',
  requireAuth,
  validateRequest(changePasswordSchema),
  authController.changePassword
);

export default router;
