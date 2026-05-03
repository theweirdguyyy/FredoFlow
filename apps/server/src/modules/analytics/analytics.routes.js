import { Router } from 'express';
import * as analyticsController from './analytics.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = Router({ mergeParams: true });

// All analytics routes require authentication and ADMIN role
router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/stats', analyticsController.getWorkspaceStats);
router.get('/charts', analyticsController.getGoalCompletionData);
router.get('/export', analyticsController.exportWorkspaceCSV);
router.get('/audit-log', analyticsController.getAuditLog);

export default router;
