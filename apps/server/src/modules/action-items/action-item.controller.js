import * as actionItemService from './action-item.service.js';
import { getIO } from '../../config/socket.js';
import { AppError } from '../../middleware/errorHandler.js';
import { logAction } from '../audit/audit-log.service.js';

/**
 * POST /api/v1/workspaces/:workspaceId/action-items
 */
export async function createActionItem(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const item = await actionItemService.createActionItem(workspaceId, req.user.id, req.body);
    
    await logAction(workspaceId, req.user.id, 'ACTION_ITEM_CREATED', { itemId: item.id, title: item.title });

    try {
      const io = getIO();
      io.to(`workspace:${workspaceId}`).emit('ACTION_ITEM_CREATED', {
        workspaceId,
        item,
      });
    } catch (err) {
      console.error('Socket emission failed:', err.message);
    }

    res.status(201).json({
      success: true,
      data: { item },
      message: 'Action item created successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/workspaces/:workspaceId/action-items
 */
export async function getWorkspaceActionItems(req, res, next) {
  try {
    const { workspaceId } = req.params;
    const items = await actionItemService.getWorkspaceActionItems(workspaceId, req.query);

    res.status(200).json({
      success: true,
      data: { items },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/workspaces/:workspaceId/action-items/:actionItemId
 */
export async function getActionItemById(req, res, next) {
  try {
    const item = await actionItemService.getActionItemById(req.params.actionItemId);

    res.status(200).json({
      success: true,
      data: { item },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/workspaces/:workspaceId/action-items/:actionItemId
 */
export async function updateActionItem(req, res, next) {
  try {
    const item = await actionItemService.updateActionItem(req.params.actionItemId, req.body);

    await logAction(req.params.workspaceId, req.user.id, 'ACTION_ITEM_UPDATED', { itemId: req.params.actionItemId, updates: req.body });

    res.status(200).json({
      success: true,
      data: { item },
      message: 'Action item updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/workspaces/:workspaceId/action-items/:actionItemId
 */
export async function deleteActionItem(req, res, next) {
  try {
    await actionItemService.deleteActionItem(req.params.actionItemId);

    await logAction(req.params.workspaceId, req.user.id, 'ACTION_ITEM_DELETED', { itemId: req.params.actionItemId });

    res.status(200).json({
      success: true,
      data: null,
      message: 'Action item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/workspaces/:workspaceId/action-items/:actionItemId/move
 */
export async function moveActionItem(req, res, next) {
  try {
    const { workspaceId, actionItemId } = req.params;
    const { status, position } = req.body;
    const item = await actionItemService.moveActionItem(actionItemId, { status, position });

    await logAction(workspaceId, req.user.id, 'ACTION_ITEM_MOVED', { itemId: actionItemId, status, position });

    try {
      const io = getIO();
      io.to(`workspace:${workspaceId}`).emit('ACTION_ITEM_MOVED', {
        workspaceId,
        actionItemId,
        status,
        position,
      });
    } catch (err) {
      console.error('Socket emission failed:', err.message);
    }

    res.status(200).json({
      success: true,
      data: { item },
      message: 'Action item moved successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/workspaces/:workspaceId/action-items/:actionItemId/attachments
 */
export async function addAttachment(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError('File is required', 400);
    }

    const { actionItemId } = req.params;
    const attachment = await actionItemService.addAttachment(actionItemId, {
      url: req.file.path,
      publicId: req.file.filename,
      filename: req.file.originalname || 'attachment',
    });

    res.status(201).json({
      success: true,
      data: { attachment },
      message: 'Attachment added successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/workspaces/:workspaceId/action-items/:actionItemId/attachments/:attachmentId
 */
export async function removeAttachment(req, res, next) {
  try {
    await actionItemService.removeAttachment(req.params.attachmentId);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Attachment removed successfully',
    });
  } catch (error) {
    next(error);
  }
}
