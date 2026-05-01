import prisma from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';

/**
 * Add a comment and notify mentioned users.
 */
export async function addComment(announcementId, authorId, content) {
  // Extract potential mentions: @Name
  const mentionRegex = /@(\w+)/g;
  const matches = content.matchAll(mentionRegex);
  const mentionedNames = [...new Set([...matches].map(m => m[1]))];

  // Find users by name in the same workspace (implied by announcement context)
  const mentionedUsers = await prisma.user.findMany({
    where: {
      name: { in: mentionedNames },
    },
    select: { id: true, name: true },
  });

  const mentionedUserIds = mentionedUsers.map(u => u.id);

  return await prisma.$transaction(async (tx) => {
    // Create comment
    const comment = await tx.comment.create({
      data: {
        announcementId,
        authorId,
        content,
        mentionedUserIds,
      },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Create notifications for mentioned users (excluding author)
    const notifications = mentionedUsers
      .filter(u => u.id !== authorId)
      .map(u => ({
        recipientId: u.id,
        actorId,
        type: 'MENTION',
        entityId: announcementId,
        entityType: 'ANNOUNCEMENT',
        message: 'mentioned you in a comment',
      }));

    if (notifications.length > 0) {
      await tx.notification.createMany({
        data: notifications,
      });
    }

    return { comment, mentionedUserIds: mentionedUserIds.filter(id => id !== authorId) };
  });
}

/**
 * Delete a comment.
 */
export async function deleteComment(commentId, userId) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
  }

  if (comment.authorId !== userId) {
    throw new AppError('You can only delete your own comments', 403, 'FORBIDDEN');
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });
}
