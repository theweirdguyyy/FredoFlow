'use client';

import { useEffect } from 'react';
import { useUIStore } from '../store/uiStore';

/**
 * ThemeProvider
 * Initalizes the application theme from local storage or system preference.
 */
export default function ThemeProvider({ children }) {
  const { setTheme } = useUIStore();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);
  }, [setTheme]);

  return <>{children}</>;
}
