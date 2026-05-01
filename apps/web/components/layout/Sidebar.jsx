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
 * Handles primary app navigation, workspace switching, and user profile management.
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
        "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 lg:translate-x-0 flex flex-col shadow-xl lg:shadow-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Branding Section */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform shadow-lg shadow-accent/20">
              FF
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">FredoFlow</span>
          </Link>
          <button 
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Workspace Selector */}
        <div className="px-4 py-6">
          <WorkspaceSwitcher />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold group",
                  isActive 
                    ? "text-accent" 
                    : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white"
                )}
                style={isActive ? { color: accentColor, backgroundColor: `${accentColor}10` } : {}}
              >
                <Icon size={20} className={clsx("transition-transform group-hover:scale-110", isActive ? "text-accent" : "text-zinc-400")} style={isActive ? { color: accentColor } : {}} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Actions */}
        <div className="p-4 mt-auto border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 overflow-hidden">
              <Avatar name={user?.name} src={user?.avatarUrl} size="md" />
              <div className="truncate">
                <p className="text-sm font-bold truncate text-zinc-900 dark:text-white">{user?.name}</p>
                <p className="text-[10px] text-zinc-500 truncate font-medium">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
