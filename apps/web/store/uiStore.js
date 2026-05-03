import { create } from 'zustand';

/**
 * UI Store
 * Manages local UI state like themes, sidebar visibility, and view preferences.
 */
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  theme: 'light',
  actionItemView: 'kanban', // 'kanban' or 'list'

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
    set({ theme });
  },

  setActionItemView: (view) => set({ actionItemView: view }),
}));
