import prisma from '../../config/db.js';

/**
 * Log a critical action in the workspace audit trail.
 * @param {String} workspaceId - ID of the workspace
 * @param {String} actorId - ID of the user performing the action
 * @param {String} action - Action type (e.g., "GOAL_CREATED")
 * @param {Object} metadata - Optional metadata about the action
 */
export async function logAction(workspaceId, actorId, action, metadata = {}) {
  try {
    await prisma.auditLog.create({
      data: {
        workspaceId,
        actorId,
        action,
        metadata,
      },
    });
  } catch (err) {
    console.error('Audit logging failed:', err.message);
  }
}
