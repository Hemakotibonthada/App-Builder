// =============================================================================
// Notification Service - Complete toast/notification system with queuing,
// stacking, progress, actions, and sound support
// =============================================================================

// =============================================================================
// Notification Types
// =============================================================================

export interface NotificationConfig {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;      // ms, 0 = persistent
  position?: NotificationPosition;
  icon?: string;
  actions?: NotificationAction[];
  progress?: NotificationProgress;
  dismissible?: boolean;
  sound?: boolean;
  groupId?: string;
  priority?: NotificationPriority;
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

export type NotificationType =
  | 'info' | 'success' | 'warning' | 'error'
  | 'loading' | 'custom';

export type NotificationPosition =
  | 'top-right' | 'top-left' | 'top-center'
  | 'bottom-right' | 'bottom-left' | 'bottom-center';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationAction {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  onClick?: () => void;
}

export interface NotificationProgress {
  value: number;     // 0-100
  label?: string;
  indeterminate?: boolean;
  color?: string;
}

export interface NotificationGroup {
  id: string;
  label: string;
  count: number;
  collapsed: boolean;
}

// =============================================================================
// Notification Queue Manager
// =============================================================================

export class NotificationManager {
  private notifications: Map<string, NotificationConfig> = new Map();
  private queue: NotificationConfig[] = [];
  private maxVisible: number;
  private defaultDuration: number;
  private defaultPosition: NotificationPosition;
  private listeners: Set<(notifications: NotificationConfig[]) => void> = new Set();
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private idCounter: number = 0;

  constructor(options?: {
    maxVisible?: number;
    defaultDuration?: number;
    defaultPosition?: NotificationPosition;
  }) {
    this.maxVisible = options?.maxVisible ?? 5;
    this.defaultDuration = options?.defaultDuration ?? 5000;
    this.defaultPosition = options?.defaultPosition ?? 'top-right';
  }

  private generateId(): string {
    return `notification-${++this.idCounter}-${Date.now()}`;
  }

  show(config: Partial<NotificationConfig> & { title: string }): string {
    const id = config.id || this.generateId();
    const notification: NotificationConfig = {
      id,
      type: config.type ?? 'info',
      title: config.title,
      message: config.message,
      duration: config.duration ?? this.defaultDuration,
      position: config.position ?? this.defaultPosition,
      dismissible: config.dismissible ?? true,
      sound: config.sound ?? false,
      priority: config.priority ?? 'normal',
      timestamp: Date.now(),
      actions: config.actions,
      progress: config.progress,
      groupId: config.groupId,
      icon: config.icon,
    };

    this.notifications.set(id, notification);

    // Sort by priority
    const priorityOrder: Record<NotificationPriority, number> = {
      urgent: 0, high: 1, normal: 2, low: 3,
    };

    // Set auto-dismiss timer
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        this.dismiss(id);
      }, notification.duration);
      this.timers.set(id, timer);
    }

    this.emit();
    return id;
  }

  info(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'info', title, message, duration });
  }

  success(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'success', title, message, duration });
  }

  warning(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'warning', title, message, duration });
  }

  error(title: string, message?: string, duration?: number): string {
    return this.show({ type: 'error', title, message, duration: duration ?? 0 });
  }

  loading(title: string, message?: string): string {
    return this.show({
      type: 'loading',
      title,
      message,
      duration: 0,
      dismissible: false,
      progress: { value: 0, indeterminate: true },
    });
  }

  updateProgress(id: string, value: number, label?: string): void {
    const notification = this.notifications.get(id);
    if (notification && notification.progress) {
      notification.progress.value = value;
      if (label) notification.progress.label = label;
      notification.progress.indeterminate = false;
      this.emit();
    }
  }

  dismiss(id: string): void {
    this.notifications.delete(id);
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.emit();
  }

  dismissAll(): void {
    this.notifications.clear();
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.emit();
  }

  getAll(): NotificationConfig[] {
    return Array.from(this.notifications.values());
  }

  getVisible(): NotificationConfig[] {
    return this.getAll().slice(0, this.maxVisible);
  }

  getCount(): number {
    return this.notifications.size;
  }

  subscribe(listener: (notifications: NotificationConfig[]) => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private emit(): void {
    const notifications = this.getAll();
    this.listeners.forEach(listener => listener(notifications));
  }

  destroy(): void {
    this.dismissAll();
    this.listeners.clear();
  }
}

// =============================================================================
// Toast CSS Generation
// =============================================================================

export function generateNotificationCSS(
  position: NotificationPosition = 'top-right',
  theme: 'light' | 'dark' = 'light'
): string {
  const positionStyles = getPositionStyles(position);
  const isDark = theme === 'dark';

  return `.notification-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 420px;
  width: 100%;
  pointer-events: none;
  ${positionStyles}
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  background: ${isDark ? 'rgba(30,30,40,0.95)' : 'rgba(255,255,255,0.97)'};
  color: ${isDark ? '#e5e7eb' : '#1f2937'};
  box-shadow: 0 8px 32px rgba(0,0,0,${isDark ? '0.3' : '0.12'}), 
              0 2px 8px rgba(0,0,0,${isDark ? '0.2' : '0.06'});
  backdrop-filter: blur(12px);
  border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  pointer-events: auto;
  animation: notification-slide-in 300ms cubic-bezier(0.22, 1, 0.36, 1);
  transition: all 200ms ease;
  overflow: hidden;
}

.notification:hover {
  transform: translateX(-2px);
  box-shadow: 0 12px 40px rgba(0,0,0,${isDark ? '0.35' : '0.15'}),
              0 4px 12px rgba(0,0,0,${isDark ? '0.25' : '0.08'});
}

.notification-exiting {
  animation: notification-slide-out 250ms cubic-bezier(0.64, 0, 0.78, 0) forwards;
}

.notification__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 1px;
}

.notification__content {
  flex: 1;
  min-width: 0;
}

.notification__title {
  font-weight: 600;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 2px;
}

.notification__message {
  font-size: 13px;
  line-height: 1.5;
  color: ${isDark ? '#9ca3af' : '#6b7280'};
  margin-top: 2px;
}

.notification__close {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  color: ${isDark ? '#6b7280' : '#9ca3af'};
  transition: all 150ms ease;
}

.notification__close:hover {
  background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  color: ${isDark ? '#d1d5db' : '#374151'};
}

.notification__actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.notification__action {
  font-size: 13px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 150ms ease;
}

.notification__action--primary {
  background: #6366f1;
  color: #fff;
}

.notification__action--primary:hover {
  background: #4f46e5;
}

.notification__action--secondary {
  background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
  color: ${isDark ? '#d1d5db' : '#374151'};
}

.notification__action--secondary:hover {
  background: ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'};
}

.notification__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
  overflow: hidden;
}

.notification__progress-bar {
  height: 100%;
  background: currentColor;
  transition: width 200ms ease;
}

.notification__progress-bar--indeterminate {
  width: 30%;
  animation: notification-progress-indeterminate 1.5s ease-in-out infinite;
}

/* Type variants */
.notification--info { border-left: 3px solid #3b82f6; }
.notification--info .notification__icon { color: #3b82f6; }

.notification--success { border-left: 3px solid #22c55e; }
.notification--success .notification__icon { color: #22c55e; }

.notification--warning { border-left: 3px solid #f59e0b; }
.notification--warning .notification__icon { color: #f59e0b; }

.notification--error { border-left: 3px solid #ef4444; }
.notification--error .notification__icon { color: #ef4444; }

.notification--loading { border-left: 3px solid #8b5cf6; }
.notification--loading .notification__icon { 
  color: #8b5cf6;
  animation: notification-spin 1s linear infinite;
}

/* Animations */
@keyframes notification-slide-in {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes notification-slide-out {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
    max-height: 200px;
    margin-bottom: 8px;
  }
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
    max-height: 0;
    margin-bottom: 0;
    padding-top: 0;
    padding-bottom: 0;
  }
}

@keyframes notification-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes notification-progress-indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}

/* Responsive */
@media (max-width: 480px) {
  .notification-container {
    left: 8px !important;
    right: 8px !important;
    max-width: none;
  }
}`;
}

function getPositionStyles(position: NotificationPosition): string {
  switch (position) {
    case 'top-right': return 'top: 16px; right: 16px;';
    case 'top-left': return 'top: 16px; left: 16px;';
    case 'top-center': return 'top: 16px; left: 50%; transform: translateX(-50%);';
    case 'bottom-right': return 'bottom: 16px; right: 16px;';
    case 'bottom-left': return 'bottom: 16px; left: 16px;';
    case 'bottom-center': return 'bottom: 16px; left: 50%; transform: translateX(-50%);';
  }
}

// =============================================================================
// Notification Icons (SVG strings)
// =============================================================================

export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  info: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>',
  success: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>',
  warning: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>',
  error: '<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>',
  loading: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="7" opacity="0.25" /><path d="M10 3a7 7 0 017 7" stroke-linecap="round" /></svg>',
  custom: '',
};

// =============================================================================
// Singleton instance
// =============================================================================

export const notifications = new NotificationManager();
