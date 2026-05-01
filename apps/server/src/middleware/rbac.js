import { AppError } from './errorHandler.js';
import prisma from '../config/db.js';

/**
 * RBAC middleware factory.
 * Checks that the current user has one of the allowed roles
 * in the given workspace.
 *
 * @param  {...string} allowedRoles - Roles that are permitted (e.g. 'ADMIN')
 */
export function authorize(...allowedRoles) {
  return async (req, _res, next) => {
    try {
      const { workspaceId } = req.params;
      const userId = req.user?.id;

      if (!workspaceId) {
        throw new AppError('Workspace ID is required', 400, 'MISSING_WORKSPACE_ID');
      }

      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId,
          },
        },
      });

      if (!membership) {
        throw new AppError('You are not a member of this workspace', 403, 'NOT_MEMBER');
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        throw new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN');
      }

      // Attach membership info for downstream use
      req.membership = membership;
      next();
    } catch (error) {
      next(error instanceof AppError ? error : new AppError('Authorization failed', 403, 'AUTH_FAILED'));
    }
  };
}
