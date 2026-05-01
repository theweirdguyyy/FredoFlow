import { Router } from 'express';
import * as notificationController from './notification.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/', notificationController.getUserNotifications);
router.patch('/:notificationId/read', notificationController.markAsRead);
router.post('/read-all', notificationController.markAllAsRead);

export default router;
