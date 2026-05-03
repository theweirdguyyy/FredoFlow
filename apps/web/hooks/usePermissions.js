import { useParams } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';

/**
 * usePermissions Hook
 * Returns a permission matrix based on the current user's role in the active workspace.
 */
export const usePermissions = () => {
  const { user } = useAuthStore();
  const { members, currentWorkspace, workspaces } = useWorkspaceStore();
  const { workspaceId: paramId } = useParams();

  // Prefer the workspace that matches the URL, fallback to currentWorkspace
  const activeWorkspace = (paramId && workspaces.find(w => w.id === paramId)) || currentWorkspace;

  const currentMember = members.find((m) => m.userId === user?.id);
  const role = currentMember?.role;

  // Fallback: if members list not loaded yet, check if current user is the owner of the workspace
  const isWorkspaceOwner = activeWorkspace?.ownerId === user?.id;
  const isAdmin = role === 'ADMIN' || role === 'OWNER' || isWorkspaceOwner;
  const isMember = role === 'MEMBER' || isWorkspaceOwner;

  return {
    canCreateGoal: isAdmin || isMember,
    canDeleteGoal: isAdmin,
    canPostAnnouncement: isAdmin,
    canPinAnnouncement: isAdmin,
    canInviteMember: isAdmin,
    canRemoveMember: isAdmin,
    canChangeRole: isAdmin,
    canExportCSV: isAdmin,
    canDeleteWorkspace: isAdmin,
    canCreateActionItem: isAdmin || isMember,
    canDeleteAnyActionItem: isAdmin,
    // Helper roles
    isAdmin,
    isMember,
    isOwner: role === 'OWNER',
    role
  };
};
