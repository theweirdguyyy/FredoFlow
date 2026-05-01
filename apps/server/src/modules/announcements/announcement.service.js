import prisma from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';

/**
 * Create a new announcement.
 */
export async function createAnnouncement(workspaceId, authorId, { title, content }) {
  return await prisma.announcement.create({
    data: {
      workspaceId,
      authorId,
      title,
      content,
    },
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });
}

/**
 * Get all announcements for a workspace.
 */
export async function getAnnouncements(workspaceId) {
  const announcements = await prisma.announcement.findMany({
    where: { workspaceId },
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: {
        select: {
          comments: true,
          reactions: true,
        },
      },
    },
    orderBy: [
      { isPinned: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return announcements;
}

/**
 * Get announcement by ID with comments and grouped reactions.
 */
export async function getAnnouncementById(announcementId) {
  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId },
    include: {
      author: {
        select: { id: true, name: true, avatarUrl: true },
      },
      comments: {
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
      reactions: {
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!announcement) {
    throw new AppError('Announcement not found', 404, 'ANNOUNCEMENT_NOT_FOUND');
  }

  // Group reactions by emoji
  const groupedReactions = announcement.reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        count: 0,
        users: [],
      };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push({
      id: reaction.userId,
      name: reaction.user.name,
    });
    return acc;
  }, {});

  return {
    ...announcement,
    groupedReactions,
  };
}

/**
 * Update an announcement.
 */
export async function updateAnnouncement(announcementId, data) {
  return await prisma.announcement.update({
    where: { id: announcementId },
    data,
  });
}

/**
 * Delete an announcement.
 */
export async function deleteAnnouncement(announcementId) {
  await prisma.announcement.delete({
    where: { id: announcementId },
  });
}

/**
 * Toggle pin status.
 */
export async function togglePin(announcementId) {
  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId },
    select: { isPinned: true },
  });

  if (!announcement) {
    throw new AppError('Announcement not found', 404, 'ANNOUNCEMENT_NOT_FOUND');
  }

  return await prisma.announcement.update({
    where: { id: announcementId },
    data: { isPinned: !announcement.isPinned },
  });
}

/**
 * Add or update a reaction.
 */
export async function addReaction(announcementId, userId, emoji) {
  return await prisma.reaction.upsert({
    where: {
      announcementId_userId_emoji: {
        announcementId,
        userId,
        emoji,
      },
    },
    create: {
      announcementId,
      userId,
      emoji,
    },
    update: {}, // No update needed if exists
  });
}

/**
 * Remove a reaction.
 */
export async function removeReaction(announcementId, userId, emoji) {
  try {
    await prisma.reaction.delete({
      where: {
        announcementId_userId_emoji: {
          announcementId,
          userId,
          emoji,
        },
      },
    });
  } catch (error) {
    // If reaction doesn't exist, ignore
  }
}
