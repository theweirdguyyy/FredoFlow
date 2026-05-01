'use client';

import { Menu, Bell, Sun, Moon } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useNotificationStore } from '../../store/notificationStore';
import { usePathname } from 'next/navigation';

/**
 * Top Navbar
 * Context-aware header providing page titles, theme toggling, and notifications.
 */
export default function Navbar() {
  const { toggleSidebar, theme, setTheme } = useUIStore();
  const { unreadCount } = useNotificationStore();
  const pathname = usePathname();

  const getPageTitle = () => {
    const segment = pathname.split('/')[1];
    if (!segment) return 'Dashboard';
    // Handle workspace sub-routes or specific modules
    return segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <header className="h-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30 px-6 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 lg:hidden hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-600 dark:text-zinc-400"
        >
          <Menu size={24} />
        </button>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {getPageTitle()}
          </h2>
          <p className="hidden sm:block text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
            FredoFlow Hub
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Switching */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all hover:text-accent"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Global Notifications */}
        <button 
          className="relative p-2.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all group hover:text-accent"
          aria-label="Notifications"
        >
          <Bell size={20} className="group-hover:rotate-12 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 bg-red-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-900 shadow-sm animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
