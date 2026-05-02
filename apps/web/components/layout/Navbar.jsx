'use client';

import { Menu, Bell, Sun, Moon } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useNotificationStore } from '../../store/notificationStore';
import { usePathname } from 'next/navigation';

/**
 * Top Navbar
 * Context-aware header matching strict design system (48px height).
 */
export default function Navbar() {
  const { toggleSidebar, theme, setTheme } = useUIStore();
  const { unreadCount } = useNotificationStore();
  const pathname = usePathname();

  const getPageTitle = () => {
    const segment = pathname.split('/')[1];
    if (!segment) return 'Dashboard';
    return segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <header className="h-[48px] bg-[var(--color-background-primary)]/80 backdrop-blur-md border-b-0.5 border-[var(--color-border-tertiary)] sticky top-0 z-30 px-6 flex items-center justify-between transition-all duration-150 ease">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-1 lg:hidden hover:bg-[var(--color-background-secondary)] rounded-[7px] transition-colors text-[var(--color-text-secondary)]"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-baseline gap-2">
          <h2 className="text-base font-syne text-[var(--color-text-primary)]">
            {getPageTitle()}
          </h2>
          <p className="hidden sm:block text-[9px] text-[var(--color-text-tertiary)] font-bold uppercase tracking-[0.8px]">
            FredoFlow Hub
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Switching */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] rounded-[7px] transition-all duration-150 ease hover:text-accent"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Global Notifications */}
        <button 
          className="relative p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] rounded-[7px] transition-all duration-150 ease group hover:text-accent"
          aria-label="Notifications"
        >
          <Bell size={16} className="group-hover:rotate-12 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-1 bg-red-500 text-[9px] font-bold text-white flex items-center justify-center rounded-full border-[1.5px] border-[var(--color-background-primary)] shadow-sm animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
