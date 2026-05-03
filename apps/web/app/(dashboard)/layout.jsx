'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useUIStore } from '../../store/uiStore';
import NotificationPanel from '../../components/shared/NotificationPanel';
import ThemeToggle from '../../components/ui/ThemeToggle';

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )},
  { label: 'Workspaces', href: '/workspaces', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
    </svg>
  )},
  { label: 'Goals', href: 'goals', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )},
  { label: 'Announcements', href: 'announcements', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ), badge: true, badgeCount: 3},
  { label: 'Action Items', href: 'action-items', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <polyline points="9 11 12 14 22 4"/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  )},
  { label: 'Members', href: 'members', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  )},
  { label: 'Analytics', href: '/dashboard', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )},
  { label: 'Settings', href: 'settings', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  )},
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { user, fetchMe, logout, isLoading: authLoading } = useAuthStore();
  const { currentWorkspace, workspaces, fetchWorkspaces, setCurrentWorkspace } = useWorkspaceStore();
  const { unreadCount } = useNotificationStore();
  const { sidebarOpen, toggleSidebar, theme, setTheme } = useUIStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [wsDropOpen, setWsDropOpen] = useState(false);

  // Hydrate user
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, [setTheme]);

  const workspaceId = params?.workspaceId || currentWorkspace?.id;

  useEffect(() => {
    fetchWorkspaces(workspaceId);
  }, [fetchWorkspaces, workspaceId]);
  const setCurrentWorkspaceById = useWorkspaceStore(s => s.setCurrentWorkspaceById);

  useEffect(() => {
    if (workspaceId) {
      setCurrentWorkspaceById(workspaceId);
      useWorkspaceStore.getState().fetchMembers(workspaceId);
    }
  }, [workspaceId, setCurrentWorkspaceById]);

  if (authLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div className="animate-pulse" style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#6366f1' }} />
      </div>
    );
  }
  const getHref = (href) => {
    if (href.startsWith('/')) return href;
    return workspaceId ? `/workspaces/${workspaceId}/${href}` : '/workspaces';
  };
  const isActive = (href) => {
    if (href.startsWith('/')) return pathname === href;
    return pathname.includes(href);
  };
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-secondary)' }}>

      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 40, display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
        style={{
          width: 'var(--sidebar-width)', minHeight: '100vh',
          background: 'var(--bg-primary)',
          borderRight: '1px solid var(--border-primary)',
          display: 'flex', flexDirection: 'column',
          flexShrink: 0, zIndex: 50,
          transition: 'transform 0.25s ease',
        }}
      >
        {/* Workspace switcher */}
        <div style={{ padding: '14px 12px', borderBottom: '1px solid var(--border-primary)' }}>
          <div
            onClick={() => setWsDropOpen((p) => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: '9px',
              padding: '8px 9px', borderRadius: '8px', cursor: 'pointer',
              transition: 'background 0.15s', position: 'relative',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              width: '30px', height: '30px', borderRadius: '8px',
              background: currentWorkspace?.accentColor || '#6366f1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Syne', sans-serif", fontSize: '12px',
              fontWeight: 800, color: '#fff', flexShrink: 0,
              overflow: 'hidden'
            }}>
              {currentWorkspace?.name?.slice(0, 2).toUpperCase() || 'FF'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentWorkspace?.name || 'Select workspace'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>Admin</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" style={{ flexShrink: 0 }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>

          {/* Workspace dropdown */}
          {wsDropOpen && (
            <div style={{
              position: 'absolute', top: '60px', left: '12px',
              width: 'calc(var(--sidebar-width) - 24px)',
              background: 'var(--bg-primary)', border: '1px solid var(--border-primary)',
              borderRadius: '10px', boxShadow: 'var(--shadow-lg)',
              zIndex: 100, overflow: 'hidden',
            }}>
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => { setCurrentWorkspace(ws); setWsDropOpen(false); router.push(`/workspaces/${ws.id}`); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '9px',
                    padding: '10px 12px', cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '6px',
                    background: ws.accentColor || '#6366f1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 700, color: '#fff',
                  }}>{ws.name?.slice(0, 2).toUpperCase()}</div>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{ws.name}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border-primary)', padding: '8px 12px' }}>
                <Link href="/workspaces" onClick={() => setWsDropOpen(false)}
                  style={{ fontSize: '12px', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  New workspace
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-tertiary)', padding: '0 8px', margin: '6px 0 4px' }}>
            Main
          </div>
          {NAV.slice(0, 5).map((item) => (
            <NavItem key={item.label} item={item} href={getHref(item.href)} active={isActive(item.href)} unreadCount={unreadCount} />
          ))}
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-tertiary)', padding: '0 8px', margin: '14px 0 4px' }}>
            Workspace
          </div>
          {NAV.slice(5).map((item) => (
            <NavItem key={item.label} item={item} href={getHref(item.href)} active={isActive(item.href)} />
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--border-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 8px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:5000${user.avatarUrl}`} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: '#6366f1', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: '#fff',
                }}>{initials}</div>
              )}
              <div style={{
                position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px',
                borderRadius: '50%', background: '#10b981', border: '1.5px solid var(--bg-primary)',
              }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
            <button
              onClick={logout}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px', borderRadius: '5px', color: 'var(--text-tertiary)', flexShrink: 0 }}
              title="Logout"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          height: 'var(--topbar-height)', background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', flexShrink: 0, zIndex: 30,
        }}>
          {/* Mobile hamburger */}
          <button
            onClick={toggleSidebar}
            className="mobile-menu-btn"
            style={{
              display: 'none', alignItems: 'center', justifyContent: 'center',
              width: '34px', height: '34px', borderRadius: '8px',
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-secondary)', cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Logo (mobile only) */}
          <div className="mobile-logo" style={{ display: 'none', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '26px', height: '26px', background: '#6366f1', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <path d="M12 4L4 8l8 4 8-4-8-4z"/><path d="M4 12l8 4 8-4"/><path d="M4 16l8 4 8-4"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>FredoFlow</span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ThemeToggle />
            {/* Bell */}
            <button
              onClick={() => setNotifOpen((p) => !p)}
              style={{
                position: 'relative', width: '34px', height: '34px',
                borderRadius: '8px', border: '1px solid var(--border-primary)',
                background: 'var(--bg-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: '6px', right: '6px',
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: '#ef4444', border: '1.5px solid var(--bg-primary)',
                }} />
              )}
            </button>

            {/* Avatar */}
            <Link href="/profile">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:5000${user.avatarUrl}`} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }} />
              ) : (
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: '#6366f1', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '11px', fontWeight: 600,
                  color: '#fff', cursor: 'pointer', flexShrink: 0,
                }}>{initials}</div>
              )}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>

      {/* Notification panel */}
      {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}

      <style>{`
        @media (max-width: 767px) {
          .sidebar {
            position: fixed !important;
            top: 0; left: 0; height: 100vh;
            transform: translateX(-100%);
          }
          .sidebar.sidebar-open {
            transform: translateX(0);
          }
          .mobile-overlay { display: block !important; }
          .mobile-menu-btn { display: flex !important; }
          .mobile-logo { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

function NavItem({ item, href, active, unreadCount }) {
  const count = item.badgeCount ?? (item.badge ? unreadCount : 0);
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '7px 9px', borderRadius: '7px', marginBottom: '1px',
        background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
        color: active ? '#6366f1' : 'var(--text-secondary)',
        transition: 'background 0.15s, color 0.15s', cursor: 'pointer',
      }}
        onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
        onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ flexShrink: 0 }}>{item.icon}</span>
        <span style={{ fontSize: '13px', fontWeight: active ? 500 : 400 }}>{item.label}</span>
        {count > 0 && (
          <span style={{
            marginLeft: 'auto', background: '#ef4444', color: '#fff',
            borderRadius: '10px', fontSize: '9px', fontWeight: 700,
            padding: '1px 5px',
          }}>{count}</span>
        )}
      </div>
    </Link>
  );
}
