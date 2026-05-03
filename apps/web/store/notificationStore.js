import { create } from 'zustand';
import api from '../lib/api';

/**
 * Notification Store
 * Manages the user alerts and unread counts.
 */
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => {
    const unreadCount = (notifications || []).filter(n => !n.isRead).length;
    set({ notifications: notifications || [], unreadCount });
  },

  fetchNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      const notifications = res.data.data.notifications || [];
      const unreadCount = notifications.filter(n => !n.isRead).length;
      set({ notifications, unreadCount });
    } catch (err) {
      console.error('Failed to fetch notifications:', err.message);
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markRead: async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      console.error('Failed to mark notification as read:', err.message);
    }
  },

  markAllRead: async () => {
    try {
      await api.post('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error('Failed to mark all as read:', err.message);
    }
  },
}));
