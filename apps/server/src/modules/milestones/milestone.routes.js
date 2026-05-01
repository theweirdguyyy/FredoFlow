import { Router } from 'express';
import * as milestoneController from './milestone.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = Router({ mergeParams: true });

// All milestone routes require authentication and membership
router.use(authenticate);
router.use(requireRole());

router.post('/', milestoneController.createMilestone);
router.patch('/:milestoneId', milestoneController.updateMilestone);
router.delete('/:milestoneId', milestoneController.deleteMilestone);

export default router;
