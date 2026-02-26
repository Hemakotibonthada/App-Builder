/**
 * Notification Toast System
 * 
 * Renders toast notifications from the Redux UI state.
 * Supports: info, success, warning, error
 * Auto-dismiss with configurable duration.
 * Animated entrance/exit with Framer Motion.
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { removeNotification, type Notification } from '@/store/uiSlice';

/* ──────────────────────────────────────────────
 * Icons per type
 * ────────────────────────────────────────────── */

function TypeIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    success: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </svg>
    ),
    warning: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    info: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
  };
  return <>{icons[type] ?? icons.info}</>;
}

/* ──────────────────────────────────────────────
 * Single Toast
 * ────────────────────────────────────────────── */

const typeStyles: Record<string, { bg: string; border: string; icon: string }> = {
  success: { bg: 'bg-builder-success/10', border: 'border-builder-success/30', icon: 'text-builder-success' },
  error: { bg: 'bg-builder-error/10', border: 'border-builder-error/30', icon: 'text-builder-error' },
  warning: { bg: 'bg-builder-warning/10', border: 'border-builder-warning/30', icon: 'text-builder-warning' },
  info: { bg: 'bg-builder-info/10', border: 'border-builder-info/30', icon: 'text-builder-info' },
};

function Toast({ notification, onDismiss }: { notification: Notification; onDismiss: () => void }) {
  const s = typeStyles[notification.type] ?? typeStyles.info!;

  useEffect(() => {
    if (notification.duration > 0) {
      const timer = setTimeout(onDismiss, notification.duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [notification.duration, onDismiss]);

  return (
    <motion.div
      layout
      className={clsx(
        'flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-glass shadow-glass-lg max-w-sm w-full',
        s.bg, s.border,
      )}
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className={clsx('flex-shrink-0 mt-0.5', s.icon)}>
        <TypeIcon type={notification.type} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-builder-text">{notification.title}</div>
        <div className="text-[11px] text-builder-text-muted mt-0.5 leading-relaxed">{notification.message}</div>
      </div>
      {notification.dismissible && (
        <button
          className="flex-shrink-0 text-builder-text-dim hover:text-builder-text transition-colors"
          onClick={onDismiss}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
 * Toast Container
 * ────────────────────────────────────────────── */

export function NotificationToasts() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.ui.notifications);

  const handleDismiss = useCallback(
    (id: string) => dispatch(removeNotification(id)),
    [dispatch],
  );

  return (
    <div className="fixed top-16 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <div key={n.id} className="pointer-events-auto">
            <Toast notification={n} onDismiss={() => handleDismiss(n.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
