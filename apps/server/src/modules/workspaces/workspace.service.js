import prisma from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.js';
import crypto from 'crypto';

/**
 * Generate a URL-friendly slug from a string.
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') + '-' + crypto.randomBytes(3).toString('hex');
}

/**
 * Create a new workspace.
 */
export async function createWorkspace(userId, { name, description, accentColor }) {
  const slug = generateSlug(name);

  return await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name,
        description,
        accentColor,
        slug,
        ownerId: userId,
      },
    });

    // Add creator as ADMIN member
    await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId,
        role: 'ADMIN',
      },
    });

    return workspace;
  });
}

/**
 * Get all workspaces for a user.
 */
export async function getUserWorkspaces(userId) {
  return await prisma.workspace.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      _count: {
        select: {
          members: true,
          goals: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get workspace by ID.
 */
export async function getWorkspaceById(workspaceId) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
      _count: {
        select: {
          goals: true,
          announcements: true,
          actionItems: true,
        },
      },
    },
  });

  if (!workspace) {
    throw new AppError('Workspace not found', 404, 'WORKSPACE_NOT_FOUND');
  }

  return workspace;
}

/**
 * Update workspace details.
 */
export async function updateWorkspace(workspaceId, data) {
  return await prisma.workspace.update({
    where: { id: workspaceId },
    data,
  });
}

/**
 * Delete a workspace (owner only).
 */
export async function deleteWorkspace(workspaceId, userId) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    throw new AppError('Workspace not found', 404, 'WORKSPACE_NOT_FOUND');
  }

  if (workspace.ownerId !== userId) {
    throw new AppError('Only the workspace owner can delete a workspace', 403, 'FORBIDDEN');
  }

  await prisma.workspace.delete({
    where: { id: workspaceId },
  });
}

/**
 * Invite a member to a workspace.
 */
export async function inviteMember(workspaceId, { email, role }) {
  // Check if already a member
  const existingMember = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      user: { email },
    },
  });

  if (existingMember) {
    throw new AppError('User is already a member of this workspace', 400, 'ALREADY_MEMBER');
  }

  // Check for existing pending invite
  const existingInvite = await prisma.workspaceInvite.findFirst({
    where: {
      workspaceId,
      email,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (existingInvite) {
    return existingInvite;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  return await prisma.workspaceInvite.create({
    data: {
      workspaceId,
      email,
      role,
      token,
      expiresAt,
    },
    include: {
      workspace: {
        select: { name: true }
      }
    }
  });
}

/**
 * Accept a workspace invitation.
 */
export async function acceptInvite(userId, token) {
  const invite = await prisma.workspaceInvite.findUnique({
    where: { token },
  });

  if (!invite) {
    throw new AppError('Invitation not found', 404, 'INVITE_NOT_FOUND');
  }

  if (invite.acceptedAt) {
    throw new AppError('Invitation already accepted', 400, 'INVITE_ALREADY_ACCEPTED');
  }

  if (invite.expiresAt < new Date()) {
    throw new AppError('Invitation has expired', 400, 'INVITE_EXPIRED');
  }

  // Check if user is already a member (in case they were added through another way)
  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: invite.workspaceId,
        userId,
      },
    },
  });

  if (existingMember) {
    // Just mark invite as accepted and return
    return await prisma.workspaceInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });
  }

  return await prisma.$transaction(async (tx) => {
    // Add member
    const member = await tx.workspaceMember.create({
      data: {
        workspaceId: invite.workspaceId,
        userId,
        role: invite.role,
      },
    });

    // Mark invite as accepted
    await tx.workspaceInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });

    return member;
  });
}

/**
 * Remove a member from a workspace.
 */
export async function removeMember(workspaceId, userId) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    throw new AppError('Workspace not found', 404, 'WORKSPACE_NOT_FOUND');
  }

  if (workspace.ownerId === userId) {
    throw new AppError('Cannot remove the workspace owner', 400, 'CANNOT_REMOVE_OWNER');
  }

  await prisma.workspaceMember.delete({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });
}

/**
 * Update a member's role.
 */
export async function updateMemberRole(workspaceId, userId, role) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    throw new AppError('Workspace not found', 404, 'WORKSPACE_NOT_FOUND');
  }

  if (workspace.ownerId === userId) {
    throw new AppError('Cannot change role of the workspace owner', 400, 'CANNOT_CHANGE_OWNER_ROLE');
  }

  return await prisma.workspaceMember.update({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    data: { role },
  });
}
