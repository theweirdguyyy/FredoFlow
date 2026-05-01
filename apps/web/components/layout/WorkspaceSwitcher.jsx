'use client';

import { useState } from 'react';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { clsx } from 'clsx';

/**
 * Workspace Switcher
 * A dropdown-based component for switching between multiple team workspaces.
 */
export default function WorkspaceSwitcher() {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentWorkspace) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-accent transition-all duration-300 group shadow-sm active:scale-[0.98]"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div 
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md"
            style={{ backgroundColor: currentWorkspace.accentColor }}
          >
            {currentWorkspace.name.charAt(0)}
          </div>
          <span className="font-bold text-sm truncate text-zinc-900 dark:text-zinc-100">
            {currentWorkspace.name}
          </span>
        </div>
        <ChevronDown size={18} className={clsx("text-zinc-400 group-hover:text-accent transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
            <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
              <p className="px-3 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Your Workspaces</p>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setCurrentWorkspace(ws);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    "w-full flex items-center justify-between gap-3 p-3 rounded-xl transition-all mb-1 group/item",
                    ws.id === currentWorkspace.id 
                      ? "bg-accent/5 dark:bg-accent/10" 
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  )}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div 
                      className="w-6 h-6 rounded flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: ws.accentColor }}
                    />
                    <span className={clsx(
                      "text-sm truncate transition-colors",
                      ws.id === currentWorkspace.id ? "font-bold text-accent" : "font-medium text-zinc-600 dark:text-zinc-400 group-hover/item:text-zinc-900 dark:group-hover/item:text-white"
                    )}>
                      {ws.name}
                    </span>
                  </div>
                  {ws.id === currentWorkspace.id && <Check size={16} className="text-accent" />}
                </button>
              ))}
            </div>
            
            {/* Action Footer */}
            <div className="p-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl text-zinc-500 hover:text-accent hover:bg-accent/5 transition-all group font-bold text-xs uppercase tracking-wider">
                <div className="w-6 h-6 rounded border-2 border-dashed border-zinc-300 group-hover:border-accent flex items-center justify-center transition-colors">
                  <Plus size={14} />
                </div>
                Create Workspace
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
