'use client';

import { Bell, Search } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useNotificationStore } from '../../store/notificationStore';
import Avatar from '../ui/Avatar';

/**
 * Top Navbar (52px height)
 * High-fidelity implementation with logo mark and notification indicators.
 */
export default function Navbar() {
  const { theme } = useUIStore();
  const { unreadCount } = useNotificationStore();

  return (
    <header className="h-[52px] bg-[var(--color-background-primary)] border-b-0.5 border-[var(--color-border-tertiary)] sticky top-0 z-30 px-6 flex items-center justify-between transition-all duration-150 ease">
      {/* Left: Logo Mark + Wordmark */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-accent rounded-[7px] flex items-center justify-center">
          <div className="w-3.5 h-3.5 bg-white rounded-[3px] transform rotate-45" />
        </div>
        <span className="font-syne font-[800] text-[16px] text-[var(--color-text-primary)] tracking-tight">
          FredoFlow
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button 
          className="relative w-[30px] h-[30px] bg-[var(--color-background-secondary)] border-0.5 border-[var(--color-border-tertiary)] rounded-full flex items-center justify-center text-[var(--color-text-secondary)] hover:border-[var(--color-border-secondary)] transition-all group"
        >
          <Bell size={15} />
          <span className="absolute top-[2px] right-[2px] w-[6px] h-[6px] bg-[#ef4444] rounded-full border-1.5 border-white" />
        </button>

        {/* User Avatar */}
        <Avatar 
          name="User" 
          size="sm" 
          className="w-[30px] h-[30px] bg-accent text-white border-none" 
        />
      </div>
    </header>
  );
}
