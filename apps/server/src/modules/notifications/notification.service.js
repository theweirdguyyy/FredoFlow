import prisma from '../../config/db.js';

/**
 * Get notifications for a user.
 */
export async function getUserNotifications(userId) {
  return await prisma.notification.findMany({
    where: { recipientId: userId },
    include: {
      actor: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(notificationId, userId) {
  return await prisma.notification.update({
    where: {
      id: notificationId,
      recipientId: userId, // Ensure user owns the notification
    },
    data: { isRead: true },
  });
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllAsRead(userId) {
  return await prisma.notification.updateMany({
    where: {
      recipientId: userId,
      isRead: false,
    },
    data: { isRead: true },
  });
}
