import { Router } from 'express';
import * as workspaceController from './workspace.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = Router();

// All workspace routes require authentication
router.use(authenticate);

// Global workspace operations
router.post('/', workspaceController.createWorkspace);
router.get('/', workspaceController.getUserWorkspaces);
router.post('/invites/accept', workspaceController.acceptInvite);

// Workspace-scoped operations
router.get('/:workspaceId', workspaceController.getWorkspaceById);

// Admin-only workspace operations
router.patch('/:workspaceId', requireRole('ADMIN'), workspaceController.updateWorkspace);
router.delete('/:workspaceId', requireRole('ADMIN'), workspaceController.deleteWorkspace);
router.post('/:workspaceId/invites', requireRole('ADMIN'), workspaceController.inviteMember);
router.delete('/:workspaceId/members/:userId', requireRole('ADMIN'), workspaceController.removeMember);
router.patch('/:workspaceId/members/:userId/role', requireRole('ADMIN'), workspaceController.updateMemberRole);

export default router;
