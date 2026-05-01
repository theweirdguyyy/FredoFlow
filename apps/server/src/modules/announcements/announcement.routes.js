import { Router } from 'express';
import * as announcementController from './announcement.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';

const router = Router({ mergeParams: true });

// All announcement routes require authentication and membership
router.use(authenticate);
router.use(requireRole());

// Announcement CRUD
router.get('/', announcementController.getAnnouncements);
router.post('/', requireRole('ADMIN'), announcementController.createAnnouncement);
router.get('/:announcementId', announcementController.getAnnouncementById);
router.patch('/:announcementId', requireRole('ADMIN'), announcementController.updateAnnouncement);
router.delete('/:announcementId', requireRole('ADMIN'), announcementController.deleteAnnouncement);

// Pinning
router.post('/:announcementId/pin', requireRole('ADMIN'), announcementController.togglePin);

// Reactions
router.post('/:announcementId/reactions', announcementController.addReaction);
router.delete('/:announcementId/reactions', announcementController.removeReaction);

// Comments
router.post('/:announcementId/comments', announcementController.addComment);
router.delete('/:announcementId/comments/:commentId', announcementController.deleteComment);

export default router;
