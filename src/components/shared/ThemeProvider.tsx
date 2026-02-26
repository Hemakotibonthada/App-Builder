/**
 * Theme Provider
 * 
 * Wraps the application with both Redux provider and
 * dark mode context. Manages class-based dark mode.
 */

'use client';

import React, { useEffect, createContext, useContext } from 'react';
import { Provider } from 'react-redux';
import { store, useAppSelector } from '@/store/store';

/* ──────────────────────────────────────────────
 * Theme Context
 * ────────────────────────────────────────────── */

interface ThemeContextValue {
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({ isDark: true });

export const useTheme = () => useContext(ThemeContext);

/* ──────────────────────────────────────────────
 * Inner Theme Component
 * ────────────────────────────────────────────── */

function ThemeApplier({ children }: { children: React.ReactNode }) {
  const isDark = useAppSelector((state) => state.ui.darkMode);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ──────────────────────────────────────────────
 * Root Provider
 * ────────────────────────────────────────────── */

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <Provider store={store}>
      <ThemeApplier>{children}</ThemeApplier>
    </Provider>
  );
}
