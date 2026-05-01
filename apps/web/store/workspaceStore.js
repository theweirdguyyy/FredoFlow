import { create } from 'zustand';
import api from '../lib/api';

/**
 * Workspace Store
 * Manages the list of workspaces, current selection, and member presence.
 */
export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  members: [],
  onlineUserIds: [],

  setWorkspaces: (workspaces) => set({ workspaces }),
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

  fetchWorkspaces: async () => {
    try {
      const res = await api.get('/workspaces');
      set({ workspaces: res.data.data.workspaces });
      return res.data.data.workspaces;
    } catch (err) {
      console.error('Failed to fetch workspaces:', err.message);
      return [];
    }
  },

  fetchMembers: async (workspaceId) => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/members`);
      // Assuming members are nested in the response
      set({ members: res.data.data.members || [] });
    } catch (err) {
      console.error('Failed to fetch members:', err.message);
    }
  },

  setOnlineUsers: (userIds) => set({ onlineUserIds: userIds }),
}));
