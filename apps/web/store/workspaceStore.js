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

  fetchWorkspaces: async (preferId) => {
    try {
      const res = await api.get('/workspaces');
      const fetchedWorkspaces = res.data.data.workspaces || [];
      
      let current = get().currentWorkspace;
      if (preferId) {
        current = fetchedWorkspaces.find(w => w.id === preferId) || current;
      }
      
      set({ 
        workspaces: fetchedWorkspaces, 
        currentWorkspace: current || fetchedWorkspaces[0] || null 
      });
      return fetchedWorkspaces;
    } catch (err) {
      console.error('Failed to fetch workspaces:', err.message);
      return [];
    }
  },

  fetchMembers: async (workspaceId) => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}`);
      set({ members: res.data.data.workspace.members || [] });
    } catch (err) {
      console.error('Failed to fetch members:', err.message);
    }
  },

  setOnlineUsers: (userIds) => set({ onlineUserIds: userIds }),

  setCurrentWorkspaceById: (id) => {
    const { workspaces } = get();
    const workspace = workspaces.find(w => w.id === id);
    if (workspace) {
      set({ currentWorkspace: workspace });
    }
  }
}));
