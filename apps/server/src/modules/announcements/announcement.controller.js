import * as announcementService from './announcement.service.js';
import * as commentService from './comment.service.js';
import { getIO } from '../../config/socket.js';

/**
 * POST /api/v1/workspaces/:workspaceId/announcements
 */
export async function createAnnouncement(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const announcement = await announcementService.createAnnouncement(workspaceId, req.user.id, req.body);

    try {
      const io = getIO();
      io.to(`workspace:${workspaceId}`).emit('NEW_ANNOUNCEMENT', {
        workspaceId,
        announcement,
      });
    } catch (err) {
      console.error('Socket emission failed:', err.message);
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
    const { content } = req.body;
    const { comment, mentionedUserIds } = await commentService.addComment(announcementId, req.user.id, content);

    try {
      const io = getIO();
      // Notify mentioned users
      mentionedUserIds.forEach(userId => {
        io.to(`user:${userId}`).emit('NEW_NOTIFICATION', {
          type: 'MENTION',
          actorId: req.user.id,
          entityId: announcementId,
          entityType: 'ANNOUNCEMENT',
          message: 'mentioned you in a comment',
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
