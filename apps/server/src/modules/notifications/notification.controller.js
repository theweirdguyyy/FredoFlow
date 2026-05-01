import * as notificationService from './notification.service.js';

/**
 * GET /api/v1/notifications
 */
export async function getUserNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id);

    res.status(200).json({
      success: true,
      data: { notifications },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/notifications/:notificationId/read
 */
export async function markAsRead(req, res, next) {
  try {
    await notificationService.markAsRead(req.params.notificationId, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/notifications/read-all
 */
export async function markAllAsRead(req, res, next) {
  try {
    await notificationService.markAllAsRead(req.user.id);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
}
