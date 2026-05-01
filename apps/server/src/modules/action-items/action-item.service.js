import prisma from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';

/**
 * Create a new action item.
 */
export async function createActionItem(workspaceId, creatorId, data) {
  const { title, description, assigneeId, goalId, priority, dueDate, status } = data;

  // Get max position in current status for Kanban
  const maxPosItem = await prisma.actionItem.findFirst({
    where: { workspaceId, status: status || 'TODO' },
    orderBy: { position: 'desc' },
    select: { position: true },
  });

  const position = (maxPosItem?.position || 0) + 1000;

  return await prisma.actionItem.create({
    data: {
      workspaceId,
      creatorId,
      assigneeId,
      goalId,
      title,
      description,
      priority,
      status: status || 'TODO',
      dueDate: dueDate ? new Date(dueDate) : null,
      position,
    },
    include: {
      assignee: {
        select: { id: true, name: true, avatarUrl: true },
      },
      creator: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });
}

/**
 * Get all action items for a workspace with filters.
 */
export async function getWorkspaceActionItems(workspaceId, filters = {}) {
  const { status, assigneeId, goalId, priority } = filters;

  return await prisma.actionItem.findMany({
    where: {
      workspaceId,
      status,
      assigneeId,
      goalId,
      priority,
    },
    include: {
      assignee: {
        select: { id: true, name: true, avatarUrl: true },
      },
      creator: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: {
        select: { attachments: true },
      },
    },
    orderBy: [
      { status: 'asc' },
      { position: 'asc' },
    ],
  });
}

/**
 * Get action item by ID.
 */
export async function getActionItemById(actionItemId) {
  const item = await prisma.actionItem.findUnique({
    where: { id: actionItemId },
    include: {
      assignee: {
        select: { id: true, name: true, avatarUrl: true },
      },
      creator: {
        select: { id: true, name: true, avatarUrl: true },
      },
      attachments: true,
      goal: {
        select: { id: true, title: true },
      },
    },
  });

  if (!item) {
    throw new AppError('Action item not found', 404, 'ACTION_ITEM_NOT_FOUND');
  }

  return item;
}

/**
 * Update an action item.
 */
export async function updateActionItem(actionItemId, data) {
  const { title, description, assigneeId, priority, dueDate, status } = data;

  return await prisma.actionItem.update({
    where: { id: actionItemId },
    data: {
      title,
      description,
      assigneeId,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      status,
    },
  });
}

/**
 * Delete an action item.
 */
export async function deleteActionItem(actionItemId) {
  await prisma.actionItem.delete({
    where: { id: actionItemId },
  });
}

/**
 * Move action item (Kanban logic).
 */
export async function moveActionItem(actionItemId, { status, position }) {
  return await prisma.actionItem.update({
    where: { id: actionItemId },
    data: {
      status,
      position,
    },
  });
}

/**
 * Add attachment.
 */
export async function addAttachment(actionItemId, { url, publicId, filename }) {
  return await prisma.actionItemAttachment.create({
    data: {
      actionItemId,
      url,
      publicId,
      filename,
    },
  });
}

/**
 * Remove attachment.
 */
export async function removeAttachment(attachmentId) {
  await prisma.actionItemAttachment.delete({
    where: { id: attachmentId },
  });
}
