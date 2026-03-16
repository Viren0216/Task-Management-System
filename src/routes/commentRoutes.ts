import { Router } from 'express';
import * as commentController from '../controllers/commentController';
import { requireAuth } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validate';
import { createCommentSchema, updateCommentSchema } from '../validators/commentValidator';

const router = Router({ mergeParams: true }); // reads :projectId and :taskId from parent

router.use(requireAuth);

router.post('/', validateRequest(createCommentSchema), commentController.createComment);
router.get('/', commentController.listComments);
router.patch('/:commentId', validateRequest(updateCommentSchema), commentController.updateComment);
router.delete('/:commentId', commentController.deleteComment);

export default router;
