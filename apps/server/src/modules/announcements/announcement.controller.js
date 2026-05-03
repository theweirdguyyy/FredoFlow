import * as announcementService from './announcement.service.js';
import * as commentService from './comment.service.js';
import { getIO } from '../../config/socket.js';
import { logAction } from '../audit/audit-log.service.js';

/**
 * POST /api/v1/workspaces/:workspaceId/announcements
 */
export async function createAnnouncement(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const announcement = await announcementService.createAnnouncement(workspaceId, req.user.id, req.body);
    
    await logAction(workspaceId, req.user.id, 'ANNOUNCEMENT_CREATED', { announcementId: announcement.id, title: announcement.title });

    try {
      const io = getIO();
      // Real-time broadcast for the announcements page
      io.to(`workspace:${workspaceId}`).emit('NEW_ANNOUNCEMENT', {
        workspaceId,
        announcement,
      });

      // Create database notifications and emit to personal rooms
      const { notifyWorkspaceMembers } = await import('../notifications/notification.service.js');
      const notifications = await notifyWorkspaceMembers(workspaceId, req.user.id, {
        type: 'ANNOUNCEMENT_POSTED',
        entityId: announcement.id,
        entityType: 'ANNOUNCEMENT',
        message: `${req.user.name} posted a new announcement: ${announcement.title}`,
      });

      notifications.forEach(notif => {
        io.to(`user:${notif.recipientId}`).emit('NEW_NOTIFICATION', notif);
      });
    } catch (err) {
      console.error('Notification/Socket emission failed:', err.message);
    }

    res.status(201).json({
      success: true,
      data: { announcement },
      message: 'Announcement posted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/workspaces/:workspaceId/announcements
 */
export async function getAnnouncements(req, res, next) {
  try {
    const announcements = await announcementService.getAnnouncements(req.params.workspaceId);

    res.status(200).json({
      success: true,
      data: { announcements },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/workspaces/:workspaceId/announcements/:announcementId
 */
export async function getAnnouncementById(req, res, next) {
  try {
    const announcement = await announcementService.getAnnouncementById(req.params.announcementId);

    res.status(200).json({
      success: true,
      data: { announcement },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/workspaces/:workspaceId/announcements/:announcementId
 */
export async function updateAnnouncement(req, res, next) {
  try {
    const announcement = await announcementService.updateAnnouncement(req.params.announcementId, req.body);

    res.status(200).json({
      success: true,
      data: { announcement },
      message: 'Announcement updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/workspaces/:workspaceId/announcements/:announcementId
 */
export async function deleteAnnouncement(req, res, next) {
  try {
    await announcementService.deleteAnnouncement(req.params.announcementId);

    await logAction(req.params.workspaceId, req.user.id, 'ANNOUNCEMENT_DELETED', { announcementId: req.params.announcementId });

    res.status(200).json({
      success: true,
      data: null,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/workspaces/:workspaceId/announcements/:announcementId/pin
 */
export async function togglePin(req, res, next) {
  try {
    const { workspaceId, announcementId } = req.params;
    const announcement = await announcementService.togglePin(announcementId);

    if (announcement.isPinned) {
      try {
        const io = getIO();
        io.to(`workspace:${workspaceId}`).emit('ANNOUNCEMENT_PINNED', {
          workspaceId,
          announcementId,
        });
      } catch (err) {
        console.error('Socket emission failed:', err.message);
      }
    }

    res.status(200).json({
      success: true,
      data: { announcement },
      message: announcement.isPinned ? 'Announcement pinned' : 'Announcement unpinned',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/workspaces/:workspaceId/announcements/:announcementId/reactions
 */
export async function addReaction(req, res, next) {
  try {
    const { workspaceId, announcementId } = req.params;
    const { emoji } = req.body;
    const reaction = await announcementService.addReaction(announcementId, req.user.id, emoji);

    try {
      const io = getIO();
      io.to(`workspace:${workspaceId}`).emit('NEW_REACTION', {
        workspaceId,
        announcementId,
        emoji,
        userId: req.user.id,
      });
    } catch (err) {
      console.error('Socket emission failed:', err.message);
    }

    res.status(201).json({
      success: true,
      data: { reaction },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/workspaces/:workspaceId/announcements/:announcementId/reactions
 */
export async function removeReaction(req, res, next) {
  try {
    const { announcementId } = req.params;
    const { emoji } = req.body;
    await announcementService.removeReaction(announcementId, req.user.id, emoji);

    res.status(200).json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/workspaces/:workspaceId/announcements/:announcementId/comments
 */
export async function addComment(req, res, next) {
  try {
    const { announcementId } = req.params;
    const { content, mentionedUserIds: bodyMentionedIds } = req.body;
    const { comment, mentionedUserIds } = await commentService.addComment(announcementId, req.user.id, content, bodyMentionedIds);

    try {
      const io = getIO();
      // Notify mentioned users
      mentionedUserIds.forEach(userId => {
        io.to(`user:${userId}`).emit('NEW_NOTIFICATION', {
          id: `tmp-${Date.now()}-${userId}`, // Temp ID until refresh
          type: 'MENTION',
          actorId: req.user.id,
          actor: comment.author, // Include actor info for UI
          entityId: announcementId,
          entityType: 'ANNOUNCEMENT',
          message: `${comment.author.name} mentioned you in a comment`,
          createdAt: new Date().toISOString(),
          isRead: false
        });
      });
    } catch (err) {
      console.error('Socket emission failed:', err.message);
    }

    res.status(201).json({
      success: true,
      data: { comment },
      message: 'Comment added successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/workspaces/:workspaceId/announcements/:announcementId/comments/:commentId
 */
export async function deleteComment(req, res, next) {
  try {
    await commentService.deleteComment(req.params.commentId, req.user.id);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
