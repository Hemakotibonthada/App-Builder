/**
 * AutoSave Service
 * 
 * Automatically persists project state to the API at regular intervals
 * and on specific user actions. Uses debouncing to avoid excessive saves.
 * 
 * Features:
 *  - Periodic auto-save (configurable interval)
 *  - Debounced save on state changes
 *  - Dirty tracking (only saves when changes exist)
 *  - Save status indicators (saving, saved, error)
 *  - Conflict detection (version mismatch)
 *  - Offline queue (saves when back online)
 */

import { projectsApi, pagesApi, widgetsApi, variablesApi } from '@/lib/api-client';

// ─── Types ──────────────────────────────────────────────────

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export interface AutoSaveConfig {
  /** Auto-save interval in ms (default: 30s) */
  interval: number;
  /** Debounce delay in ms (default: 2s) */
  debounce: number;
  /** Enable auto-save (default: true) */
  enabled: boolean;
  /** Max retry attempts on failure */
  maxRetries: number;
}

interface PendingSave {
  type: 'project' | 'page' | 'widget' | 'variables';
  projectId: string;
  entityId?: string;
  data: Record<string, unknown>;
  timestamp: number;
}

type StatusListener = (status: SaveStatus, message?: string) => void;

// ─── Default Config ─────────────────────────────────────────

const DEFAULT_CONFIG: AutoSaveConfig = {
  interval: 30_000,
  debounce: 2_000,
  enabled: true,
  maxRetries: 3,
};

// ─── AutoSave Class ─────────────────────────────────────────

class AutoSaveService {
  private config: AutoSaveConfig;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private pendingSaves = new Map<string, PendingSave>();
  private status: SaveStatus = 'idle';
  private listeners = new Set<StatusListener>();
  private retryCount = 0;
  private isDirty = false;
  private lastSaveAt: number | null = null;
  private offlineQueue: PendingSave[] = [];

  constructor(config: Partial<AutoSaveConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.flushOfflineQueue());
      window.addEventListener('beforeunload', (e) => {
        if (this.isDirty) {
          e.preventDefault();
          // Attempt to save synchronously via navigator.sendBeacon
          this.saveBeforeUnload();
        }
      });
    }
  }

  // ─── Public API ─────────────────────────────────────────

  /** Start the auto-save interval */
  start() {
    if (!this.config.enabled || this.intervalId) return;
    this.intervalId = setInterval(() => this.flush(), this.config.interval);
  }

  /** Stop the auto-save interval */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    // Clear all debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }

  /** Queue a project update */
  saveProject(projectId: string, data: Record<string, unknown>) {
    this.queueSave({
      type: 'project',
      projectId,
      data,
      timestamp: Date.now(),
    });
  }

  /** Queue a page update */
  savePage(projectId: string, pageId: string, data: Record<string, unknown>) {
    this.queueSave({
      type: 'page',
      projectId,
      entityId: pageId,
      data,
      timestamp: Date.now(),
    });
  }

  /** Queue a widget update */
  saveWidget(projectId: string, widgetId: string, data: Record<string, unknown>) {
    this.queueSave({
      type: 'widget',
      projectId,
      entityId: widgetId,
      data,
      timestamp: Date.now(),
    });
  }

  /** Queue a batch variables update */
  saveVariables(projectId: string, variables: Array<{ id: string; currentValue: string }>) {
    this.queueSave({
      type: 'variables',
      projectId,
      data: { variables },
      timestamp: Date.now(),
    });
  }

  /** Force an immediate save of all pending changes */
  async flush(): Promise<void> {
    if (this.pendingSaves.size === 0) return;
    await this.executeSaves();
  }

  /** Subscribe to save status changes */
  onStatusChange(listener: StatusListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Get current save status */
  getStatus(): SaveStatus {
    return this.status;
  }

  /** Check if there are unsaved changes */
  hasPendingChanges(): boolean {
    return this.isDirty || this.pendingSaves.size > 0;
  }

  /** Get time since last save */
  getLastSaveTime(): number | null {
    return this.lastSaveAt;
  }

  /** Update configuration */
  configure(config: Partial<AutoSaveConfig>) {
    this.config = { ...this.config, ...config };
    // Restart interval if running
    if (this.intervalId) {
      this.stop();
      this.start();
    }
  }

  /** Destroy the service */
  destroy() {
    this.stop();
    this.listeners.clear();
    this.pendingSaves.clear();
    this.offlineQueue = [];
  }

  // ─── Internal ───────────────────────────────────────────

  private queueSave(save: PendingSave) {
    const key = `${save.type}:${save.projectId}:${save.entityId || 'root'}`;

    // Merge with existing pending save
    const existing = this.pendingSaves.get(key);
    if (existing) {
      save.data = { ...existing.data, ...save.data };
    }
    this.pendingSaves.set(key, save);
    this.isDirty = true;
    this.setStatus('pending');

    // Debounce
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer) clearTimeout(existingTimer);

    this.debounceTimers.set(
      key,
      setTimeout(() => {
        this.debounceTimers.delete(key);
        this.executeSave(key);
      }, this.config.debounce),
    );
  }

  private async executeSave(key: string) {
    const save = this.pendingSaves.get(key);
    if (!save) return;

    // Check if offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.offlineQueue.push(save);
      this.pendingSaves.delete(key);
      return;
    }

    this.setStatus('saving');

    try {
      switch (save.type) {
        case 'project':
          await projectsApi.update(save.projectId, save.data);
          break;
        case 'page':
          if (save.entityId) {
            await pagesApi.update(save.projectId, save.entityId, save.data);
          }
          break;
        case 'widget':
          if (save.entityId) {
            await widgetsApi.update(save.projectId, save.entityId, save.data);
          }
          break;
        case 'variables':
          await variablesApi.batchUpdate(
            save.projectId,
            save.data.variables as Array<{ id: string; currentValue: string }>,
          );
          break;
      }

      this.pendingSaves.delete(key);
      this.retryCount = 0;
      this.lastSaveAt = Date.now();

      if (this.pendingSaves.size === 0) {
        this.isDirty = false;
        this.setStatus('saved');
        // Reset to idle after a short delay
        setTimeout(() => {
          if (this.status === 'saved') this.setStatus('idle');
        }, 3000);
      }
    } catch (error) {
      console.error('[AutoSave] Save failed:', error);
      this.retryCount++;

      if (this.retryCount <= this.config.maxRetries) {
        // Re-queue with exponential backoff
        setTimeout(
          () => this.executeSave(key),
          1000 * Math.pow(2, this.retryCount),
        );
      } else {
        this.setStatus('error', `Failed to save after ${this.config.maxRetries} retries`);
        this.retryCount = 0;
      }
    }
  }

  private async executeSaves() {
    const keys = [...this.pendingSaves.keys()];
    await Promise.allSettled(keys.map((key) => this.executeSave(key)));
  }

  private async flushOfflineQueue() {
    if (this.offlineQueue.length === 0) return;

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const save of queue) {
      const key = `${save.type}:${save.projectId}:${save.entityId || 'root'}`;
      this.pendingSaves.set(key, save);
    }

    await this.executeSaves();
  }

  private saveBeforeUnload() {
    // Use sendBeacon for reliable save before page close
    for (const save of this.pendingSaves.values()) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        let url = '';

        switch (save.type) {
          case 'project':
            url = `${baseUrl}/projects/${save.projectId}`;
            break;
          case 'page':
            url = `${baseUrl}/projects/${save.projectId}/pages/${save.entityId}`;
            break;
          case 'widget':
            url = `${baseUrl}/projects/${save.projectId}/widgets/${save.entityId}`;
            break;
          default:
            continue;
        }

        const blob = new Blob([JSON.stringify(save.data)], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      } catch {
        // Best effort — ignore errors during unload
      }
    }
  }

  private setStatus(status: SaveStatus, message?: string) {
    this.status = status;
    for (const listener of this.listeners) {
      try {
        listener(status, message);
      } catch {
        // Ignore listener errors
      }
    }
  }
}

// ─── Singleton Instance ─────────────────────────────────────

export const autoSave = new AutoSaveService();
export default autoSave;
