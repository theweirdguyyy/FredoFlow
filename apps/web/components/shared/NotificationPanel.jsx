'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';
import { getSocket } from '../../lib/socket';

const TYPE_CONFIG = {
  MENTION: { color: '#6366f1', icon: '@' },
  GOAL_ASSIGNED: { color: '#10b981', icon: '🎯' },
  ITEM_ASSIGNED: { color: '#f59e0b', icon: '✅' },
  WORKSPACE_INVITE: { color: '#8b5cf6', icon: '📨' },
  GOAL_COMPLETED: { color: '#10b981', icon: '🎉' },
  ANNOUNCEMENT_POSTED: { color: '#3b82f6', icon: '📢' },
};

export default function NotificationPanel({ onClose }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markRead, markAllRead, addNotification } = useNotificationStore();

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    const socket = getSocket();

    const handleNewNotification = (notification) => {
      addNotification(notification);
    };

    socket.on('NEW_NOTIFICATION', handleNewNotification);

    // Join user-specific room
    socket.emit('joinUser', user.id);

    return () => {
      socket.off('NEW_NOTIFICATION', handleNewNotification);
    };
  }, [user?.id]);

  const handleClickNotification = async (notif) => {
    if (!notif.isRead) {
      await markRead(notif.id);
    }

    // Navigate to the relevant entity
    if (notif.entityType && notif.entityId) {
      const base = `/workspaces`;
      switch (notif.entityType) {
        case 'goal':
          router.push(`${base}/${notif.entityId}`);
          break;
        case 'announcement':
          router.push(`${base}/${notif.entityId}`);
          break;
        case 'actionItem':
          router.push(`${base}/${notif.entityId}`);
          break;
        default:
          break;
      }
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 99,
        background: 'transparent',
      }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '380px', maxWidth: '100vw',
        background: 'var(--bg-primary)',
        borderLeft: '1px solid var(--border-primary)',
        boxShadow: '-8px 0 30px rgba(0,0,0,0.12)',
        zIndex: 100,
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.25s ease-out',
      }}>

        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span style={{
                background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 700,
                padding: '2px 7px', borderRadius: '10px', lineHeight: 1.4,
              }}>
                {unreadCount}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{
                background: 'none', border: 'none', fontSize: '11px', fontWeight: 600,
                color: '#6366f1', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px',
                transition: 'background 0.15s',
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Mark all read
              </button>
            )}
            <button onClick={onClose} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)',
              width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '6px', transition: 'background 0.15s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                All caught up!
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                No notifications to show.
              </div>
            </div>
          ) : (
            notifications.map((notif) => {
              const cfg = TYPE_CONFIG[notif.type] || { color: '#6366f1', icon: '🔔' };
              const actorInitials = notif.actor?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
              let timeAgo = '';
              try {
                timeAgo = formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true });
              } catch {
                timeAgo = '';
              }

              return (
                <div
                  key={notif.id}
                  onClick={() => handleClickNotification(notif)}
                  style={{
                    display: 'flex', gap: '12px', padding: '14px 20px',
                    borderBottom: '1px solid var(--border-primary)',
                    borderLeft: notif.isRead ? '3px solid transparent' : '3px solid #6366f1',
                    background: notif.isRead ? 'transparent' : 'rgba(99,102,241,0.03)',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = notif.isRead ? 'transparent' : 'rgba(99,102,241,0.03)'}
                >
                  {/* Actor Avatar */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', background: cfg.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 700, color: '#fff',
                    }}>
                      {actorInitials}
                    </div>
                    {/* Type badge */}
                    <span style={{
                      position: 'absolute', bottom: '-2px', right: '-4px',
                      fontSize: '12px', lineHeight: 1,
                    }}>
                      {cfg.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5,
                      fontWeight: notif.isRead ? 400 : 500,
                    }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px', fontWeight: 500 }}>
                      {timeAgo}
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!notif.isRead && (
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1',
                      flexShrink: 0, marginTop: '6px',
                    }} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Slide-in animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.8; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
