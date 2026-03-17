import { Router } from 'express';
import * as userController from '../controllers/userController';
import { requireAuth } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validate';
import { updateUserProfileSchema } from '../validators/userValidator';

const router = Router();

// Apply auth middleware to all user routes
router.use(requireAuth);

router.get('/me', userController.getMe);
router.patch('/me', validateRequest(updateUserProfileSchema), userController.updateMe);

export default router;
