'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useUIStore } from '../../store/uiStore';
import { connectSocket, disconnectSocket } from '../../lib/socket';
import Sidebar from '../../components/layout/Sidebar';
import Navbar from '../../components/layout/Navbar';

/**
 * Dashboard Layout
 * The core shell for the authenticated experience. Handles data hydration,
 * socket management, and responsive sidebar behavior.
 */
export default function DashboardLayout({ children }) {
  const { user, fetchMe, isLoading, isAuthenticated } = useAuthStore();
  const { fetchWorkspaces, currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();
  const { sidebarOpen } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      // 1. Fetch user profile
      await fetchMe();
      
      // 2. Fetch workspaces
      const workspaces = await fetchWorkspaces();
      if (workspaces.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(workspaces[0]);
      }
      
      // 3. Establish real-time connection
      connectSocket();
    };
    
    init();

    return () => {
      disconnectSocket();
    };
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          <p className="text-zinc-500 font-medium animate-pulse">Aligning your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex transition-colors duration-300">
      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:pl-72' : 'pl-0'}`}>
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
