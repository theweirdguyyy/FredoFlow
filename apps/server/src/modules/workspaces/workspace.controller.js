import * as workspaceService from './workspace.service.js';
import { logAction } from '../audit/audit-log.service.js';

/**
 * POST /api/v1/workspaces
 */
export async function createWorkspace(req, res, next) {
  try {
    const { name, description, accentColor } = req.body;
    const workspace = await workspaceService.createWorkspace(req.user.id, {
      name,
      description,
      accentColor,
    });

    res.status(201).json({
      success: true,
      data: { workspace },
      message: 'Workspace created successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/workspaces
 */
export async function getUserWorkspaces(req, res, next) {
  try {
    const workspaces = await workspaceService.getUserWorkspaces(req.user.id);

    res.status(200).json({
      success: true,
      data: { workspaces },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/workspaces/:workspaceId
 */
export async function getWorkspaceById(req, res, next) {
  try {
    const workspace = await workspaceService.getWorkspaceById(req.params.workspaceId);

    res.status(200).json({
      success: true,
      data: { workspace },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/workspaces/:workspaceId
 */
export async function updateWorkspace(req, res, next) {
  try {
    const { name, description, accentColor } = req.body;
    const workspace = await workspaceService.updateWorkspace(req.params.workspaceId, {
      name,
      description,
      accentColor,
    });

    res.status(200).json({
      success: true,
      data: { workspace },
      message: 'Workspace updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/workspaces/:workspaceId/invites
 */
export async function inviteMember(req, res, next) {
  try {
    const { email, role } = req.body;
    const invite = await workspaceService.inviteMember(req.params.workspaceId, {
      email,
      role,
    });
    
    await logAction(req.params.workspaceId, req.user.id, 'MEMBER_INVITED', { email, role });

    res.status(201).json({
      success: true,
      data: { invite },
      message: 'Invitation sent successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/workspaces/invites/accept
 */
export async function acceptInvite(req, res, next) {
  try {
    const { token } = req.body;
    const member = await workspaceService.acceptInvite(req.user.id, token);
    
    await logAction(member.workspaceId, req.user.id, 'INVITE_ACCEPTED', { workspaceId: member.workspaceId });

    res.status(200).json({
      success: true,
      data: { member },
      message: 'Joined workspace successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/workspaces/:workspaceId/members/:userId
 */
export async function removeMember(req, res, next) {
  try {
    await workspaceService.removeMember(req.params.workspaceId, req.params.userId);

    await logAction(req.params.workspaceId, req.user.id, 'MEMBER_REMOVED', { removedUserId: req.params.userId });

    res.status(200).json({
      success: true,
      data: null,
      message: 'Member removed from workspace',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/workspaces/:workspaceId/members/:userId/role
 */
export async function updateMemberRole(req, res, next) {
  try {
    const { role } = req.body;
    const member = await workspaceService.updateMemberRole(
      req.params.workspaceId,
      req.params.userId,
      role
    );

    res.status(200).json({
      success: true,
      data: { member },
      message: 'Member role updated successfully',
    });
  } catch (error) {
    next(error);
  }
}
