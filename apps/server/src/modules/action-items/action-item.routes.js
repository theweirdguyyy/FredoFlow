import { Router } from 'express';
import * as actionItemController from './action-item.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import { attachmentUpload } from '../../middleware/upload.js';

const router = Router({ mergeParams: true });

// All action item routes require authentication and membership
router.use(authenticate);
router.use(requireRole());

router.get('/', actionItemController.getWorkspaceActionItems);
router.post('/', actionItemController.createActionItem);
router.get('/:actionItemId', actionItemController.getActionItemById);
router.patch('/:actionItemId', actionItemController.updateActionItem);
router.delete('/:actionItemId', actionItemController.deleteActionItem);

// Kanban movement
router.post('/:actionItemId/move', actionItemController.moveActionItem);

// Attachments
router.post('/:actionItemId/attachments', attachmentUpload.single('file'), actionItemController.addAttachment);
router.delete('/:actionItemId/attachments/:attachmentId', actionItemController.removeAttachment);

export default router;
