'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Target, 
  Megaphone, 
  CheckSquare, 
  Users, 
  Settings, 
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import Avatar from '../ui/Avatar';
import { clsx } from 'clsx';

const navLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Announcements', href: '/announcements', icon: Megaphone },
  { name: 'Action Items', href: '/action-items', icon: CheckSquare },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

/**
 * Sidebar Navigation
 * Strict 200px width with 48px topbar alignment.
 */
export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();

  const accentColor = currentWorkspace?.accentColor || 'var(--color-accent)';

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-950/20 backdrop-blur-sm lg:hidden" 
          onClick={toggleSidebar}
        />
      )}

      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-[200px] bg-[var(--color-background-primary)] border-r-0.5 border-[var(--color-border-tertiary)] transition-transform duration-150 ease lg:translate-x-0 flex flex-col shadow-xl lg:shadow-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Branding Section - 48px height to align with topbar */}
        <div className="h-[48px] px-4 flex items-center justify-between border-b-0.5 border-[var(--color-border-tertiary)]">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-6 h-6 bg-accent rounded-[7px] flex items-center justify-center text-white text-xs font-syne group-hover:scale-105 transition-transform">
              FF
            </div>
            <span className="text-sm font-syne text-[var(--color-text-primary)]">FredoFlow</span>
          </Link>
          <button 
            onClick={toggleSidebar}
            className="lg:hidden p-1 hover:bg-[var(--color-background-secondary)] rounded-[7px] text-[var(--color-text-secondary)]"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Workspace Selector */}
        <div className="px-3 py-4">
          <WorkspaceSwitcher />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar">
          <p className="px-2 mb-2 text-[10px] uppercase tracking-[0.8px] text-[var(--color-text-tertiary)] font-bold">Main Menu</p>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  "flex items-center gap-2.5 p-[7px] rounded-nav transition-all duration-150 ease text-sm font-medium group",
                  isActive 
                    ? "text-accent" 
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] hover:text-[var(--color-text-primary)]"
                )}
                style={isActive ? { color: accentColor, backgroundColor: `color-mix(in srgb, ${accentColor} 10%, transparent)` } : {}}
              >
                <Icon size={16} className={clsx("transition-transform group-hover:scale-105", isActive ? "" : "opacity-70")} style={isActive ? { color: accentColor } : {}} />
                {link.name}
              </Link>
            );
          })}

          <p className="px-2 mt-6 mb-2 text-[10px] uppercase tracking-[0.8px] text-[var(--color-text-tertiary)] font-bold">Projects</p>
          
          {/* Example of accent dot status label */}
          <Link href="#" className="flex items-center gap-2.5 p-[7px] rounded-nav text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] hover:text-[var(--color-text-primary)] transition-all duration-150 ease">
            <span className="w-2 h-2 rounded-full bg-[var(--color-priority-high)] shrink-0"></span>
            <span className="truncate">Alpha Launch</span>
          </Link>
          <Link href="#" className="flex items-center gap-2.5 p-[7px] rounded-nav text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] hover:text-[var(--color-text-primary)] transition-all duration-150 ease">
            <span className="w-2 h-2 rounded-full bg-[var(--color-priority-medium)] shrink-0"></span>
            <span className="truncate">Website Redesign</span>
          </Link>
        </nav>

        {/* User Profile & Actions */}
        <div className="p-3 mt-auto border-t-0.5 border-[var(--color-border-tertiary)]">
          <div className="flex items-center justify-between gap-2 p-2 rounded-[7px] hover:bg-[var(--color-background-secondary)] transition-all duration-150 ease cursor-pointer">
            <div className="flex items-center gap-2 overflow-hidden">
              <Avatar name={user?.name} src={user?.avatarUrl} size="sm" online={true} />
              <div className="truncate">
                <p className="text-xs font-bold truncate text-[var(--color-text-primary)]">{user?.name || 'User'}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="p-1 text-[var(--color-text-tertiary)] hover:text-red-500 rounded-[7px] transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
