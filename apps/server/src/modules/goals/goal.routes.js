import { Router } from 'express';
import * as goalController from './goal.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = Router({ mergeParams: true });

// All goal routes require authentication and workspace membership
router.use(authenticate);
router.use(requireRole()); // Just checks for membership

router.get('/', goalController.getWorkspaceGoals);
router.post('/', goalController.createGoal);
router.get('/:goalId', goalController.getGoalById);
router.patch('/:goalId', goalController.updateGoal);
router.delete('/:goalId', goalController.deleteGoal);
router.post('/:goalId/updates', goalController.postGoalUpdate);

export default router;
