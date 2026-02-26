// =============================================================================
// EventBus Service - Decoupled event-driven communication system
// Features: Pub/sub, wildcards, namespaces, middleware, replay, async handlers
// =============================================================================

export interface EventDescriptor {
  name: string;
  namespace: string;
  category: EventCategory;
  description: string;
  payload: Record<string, string>;
  cancelable: boolean;
  bubbles: boolean;
}

export type EventCategory =
  | 'ui' | 'data' | 'navigation' | 'widget' | 'canvas' | 'project'
  | 'auth' | 'network' | 'performance' | 'error' | 'lifecycle' | 'custom'
  | 'clipboard' | 'drag' | 'keyboard' | 'mouse' | 'touch' | 'resize'
  | 'scroll' | 'animation' | 'media' | 'form' | 'validation' | 'sync';

export interface EventPayload {
  type: string;
  data: unknown;
  source: string;
  timestamp: number;
  id: string;
  cancelable: boolean;
  cancelled: boolean;
  propagationStopped: boolean;
  metadata: Record<string, unknown>;
}

export interface EventSubscription {
  id: string;
  pattern: string;
  handler: EventHandler;
  options: SubscriptionOptions;
  createdAt: number;
  callCount: number;
  lastCalledAt: number;
  active: boolean;
}

export type EventHandler = (payload: EventPayload) => void | Promise<void>;

export interface SubscriptionOptions {
  once: boolean;
  priority: number;
  async: boolean;
  debounce: number;
  throttle: number;
  filter?: (payload: EventPayload) => boolean;
  transform?: (payload: EventPayload) => EventPayload;
  errorHandler?: (error: Error, payload: EventPayload) => void;
  maxCalls: number;
  namespace?: string;
  tags: string[];
}

export interface EventMiddleware {
  name: string;
  priority: number;
  handler: (payload: EventPayload, next: () => void) => void | Promise<void>;
  enabled: boolean;
}

export interface EventLog {
  id: string;
  type: string;
  payload: EventPayload;
  timestamp: number;
  handlers: number;
  duration: number;
  errors: string[];
}

export interface EventStats {
  totalEmitted: number;
  totalHandled: number;
  totalErrors: number;
  activeSubscriptions: number;
  eventTypes: Map<string, number>;
  averageHandlerTime: number;
  peakHandlerTime: number;
  memoryUsage: number;
}

export interface EventBusConfig {
  maxListeners: number;
  maxHistory: number;
  enableLogging: boolean;
  enableReplay: boolean;
  enableWildcards: boolean;
  enableNamespaces: boolean;
  enableMiddleware: boolean;
  asyncDefault: boolean;
  errorStrategy: 'throw' | 'log' | 'silent' | 'handler';
  performanceTracking: boolean;
}

// =============================================================================
// Debounce / Throttle utilities
// =============================================================================

function createDebounce(fn: (...args: unknown[]) => void, delay: number): (...args: unknown[]) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: unknown[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function createThrottle(fn: (...args: unknown[]) => void, limit: number): (...args: unknown[]) => void {
  let inThrottle = false;
  return (...args: unknown[]) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

// =============================================================================
// EventBus Implementation
// =============================================================================

export class EventBus {
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private middleware: EventMiddleware[] = [];
  private history: EventLog[] = [];
  private config: EventBusConfig;
  private stats: EventStats = {
    totalEmitted: 0,
    totalHandled: 0,
    totalErrors: 0,
    activeSubscriptions: 0,
    eventTypes: new Map(),
    averageHandlerTime: 0,
    peakHandlerTime: 0,
    memoryUsage: 0,
  };
  private debouncedHandlers: Map<string, (...args: unknown[]) => void> = new Map();
  private throttledHandlers: Map<string, (...args: unknown[]) => void> = new Map();
  private interceptors: Map<string, Array<(payload: EventPayload) => EventPayload | null>> = new Map();
  private channels: Map<string, Set<string>> = new Map();

  constructor(config?: Partial<EventBusConfig>) {
    this.config = {
      maxListeners: 100,
      maxHistory: 1000,
      enableLogging: false,
      enableReplay: true,
      enableWildcards: true,
      enableNamespaces: true,
      enableMiddleware: true,
      asyncDefault: false,
      errorStrategy: 'log',
      performanceTracking: true,
      ...config,
    };
  }

  // ---------------------------------------------------------------------------
  // Subscribe
  // ---------------------------------------------------------------------------

  on(pattern: string, handler: EventHandler, options?: Partial<SubscriptionOptions>): string {
    const subId = this.generateId();
    const opts: SubscriptionOptions = {
      once: false,
      priority: 0,
      async: this.config.asyncDefault,
      debounce: 0,
      throttle: 0,
      maxCalls: 0,
      tags: [],
      ...options,
    };

    const subscription: EventSubscription = {
      id: subId,
      pattern,
      handler: this.wrapHandler(subId, handler, opts),
      options: opts,
      createdAt: Date.now(),
      callCount: 0,
      lastCalledAt: 0,
      active: true,
    };

    if (!this.subscriptions.has(pattern)) {
      this.subscriptions.set(pattern, []);
    }

    const subs = this.subscriptions.get(pattern)!;

    // Check max listeners
    if (subs.length >= this.config.maxListeners) {
      console.warn(`EventBus: Max listeners (${this.config.maxListeners}) reached for pattern "${pattern}"`);
    }

    subs.push(subscription);
    subs.sort((a, b) => b.options.priority - a.options.priority);

    this.stats.activeSubscriptions++;

    // Add to channel if namespaced
    if (opts.namespace) {
      if (!this.channels.has(opts.namespace)) {
        this.channels.set(opts.namespace, new Set());
      }
      this.channels.get(opts.namespace)!.add(subId);
    }

    return subId;
  }

  once(pattern: string, handler: EventHandler, options?: Partial<SubscriptionOptions>): string {
    return this.on(pattern, handler, { ...options, once: true });
  }

  // ---------------------------------------------------------------------------
  // Unsubscribe
  // ---------------------------------------------------------------------------

  off(subscriptionId: string): boolean {
    for (const [pattern, subs] of this.subscriptions.entries()) {
      const idx = subs.findIndex(s => s.id === subscriptionId);
      if (idx >= 0) {
        subs.splice(idx, 1);
        this.stats.activeSubscriptions--;
        if (subs.length === 0) {
          this.subscriptions.delete(pattern);
        }

        // Remove from channels
        for (const channel of this.channels.values()) {
          channel.delete(subscriptionId);
        }

        // Cleanup debounce/throttle handlers
        this.debouncedHandlers.delete(subscriptionId);
        this.throttledHandlers.delete(subscriptionId);

        return true;
      }
    }
    return false;
  }

  offAll(pattern?: string): number {
    if (pattern) {
      const subs = this.subscriptions.get(pattern);
      if (!subs) return 0;
      const count = subs.length;
      this.stats.activeSubscriptions -= count;
      this.subscriptions.delete(pattern);
      return count;
    }

    const total = this.stats.activeSubscriptions;
    this.subscriptions.clear();
    this.channels.clear();
    this.debouncedHandlers.clear();
    this.throttledHandlers.clear();
    this.stats.activeSubscriptions = 0;
    return total;
  }

  offByTag(tag: string): number {
    let count = 0;
    for (const [pattern, subs] of this.subscriptions.entries()) {
      const remaining = subs.filter(s => {
        if (s.options.tags.includes(tag)) {
          count++;
          this.stats.activeSubscriptions--;
          return false;
        }
        return true;
      });
      if (remaining.length === 0) {
        this.subscriptions.delete(pattern);
      } else {
        this.subscriptions.set(pattern, remaining);
      }
    }
    return count;
  }

  offByNamespace(namespace: string): number {
    const channel = this.channels.get(namespace);
    if (!channel) return 0;

    let count = 0;
    for (const subId of channel) {
      if (this.off(subId)) count++;
    }
    this.channels.delete(namespace);
    return count;
  }

  // ---------------------------------------------------------------------------
  // Emit
  // ---------------------------------------------------------------------------

  emit(type: string, data: unknown = {}, source = 'system'): EventPayload {
    const startTime = performance.now();
    const payload: EventPayload = {
      type,
      data,
      source,
      timestamp: Date.now(),
      id: this.generateId(),
      cancelable: true,
      cancelled: false,
      propagationStopped: false,
      metadata: {},
    };

    // Run interceptors
    const interceptors = this.interceptors.get(type) || [];
    let currentPayload: EventPayload | null = payload;
    for (const interceptor of interceptors) {
      currentPayload = interceptor(currentPayload!);
      if (!currentPayload) {
        if (this.config.enableLogging) {
          console.log(`EventBus: Event "${type}" intercepted and cancelled`);
        }
        return payload;
      }
    }

    // Run middleware
    if (this.config.enableMiddleware && this.middleware.length > 0) {
      this.runMiddleware(currentPayload, () => {
        this.dispatchEvent(currentPayload!, startTime);
      });
    } else {
      this.dispatchEvent(currentPayload, startTime);
    }

    return currentPayload;
  }

  async emitAsync(type: string, data: unknown = {}, source = 'system'): Promise<EventPayload> {
    const payload: EventPayload = {
      type,
      data,
      source,
      timestamp: Date.now(),
      id: this.generateId(),
      cancelable: true,
      cancelled: false,
      propagationStopped: false,
      metadata: {},
    };

    const handlers = this.getMatchingHandlers(type);
    const errors: string[] = [];

    for (const sub of handlers) {
      if (payload.propagationStopped) break;
      if (!sub.active) continue;

      try {
        await sub.handler(payload);
        sub.callCount++;
        sub.lastCalledAt = Date.now();
      } catch (e) {
        errors.push(String(e));
        this.stats.totalErrors++;
      }
    }

    this.stats.totalEmitted++;
    this.stats.totalHandled += handlers.length;

    // Log
    if (this.config.enableLogging || this.config.enableReplay) {
      this.logEvent(type, payload, handlers.length, 0, errors);
    }

    return payload;
  }

  emitBatch(events: Array<{ type: string; data: unknown; source?: string }>): EventPayload[] {
    return events.map(e => this.emit(e.type, e.data, e.source));
  }

  // ---------------------------------------------------------------------------
  // Emit with wait for all handlers  
  // ---------------------------------------------------------------------------

  async emitAndWait(type: string, data: unknown = {}, source = 'system'): Promise<unknown[]> {
    const payload: EventPayload = {
      type,
      data,
      source,
      timestamp: Date.now(),
      id: this.generateId(),
      cancelable: false,
      cancelled: false,
      propagationStopped: false,
      metadata: {},
    };

    const handlers = this.getMatchingHandlers(type);
    const results: unknown[] = [];

    for (const sub of handlers) {
      if (!sub.active) continue;
      try {
        const result = await sub.handler(payload);
        results.push(result);
      } catch (e) {
        results.push({ error: String(e) });
        this.stats.totalErrors++;
      }
    }

    return results;
  }

  // ---------------------------------------------------------------------------
  // Interceptors
  // ---------------------------------------------------------------------------

  intercept(type: string, interceptor: (payload: EventPayload) => EventPayload | null): () => void {
    if (!this.interceptors.has(type)) {
      this.interceptors.set(type, []);
    }
    this.interceptors.get(type)!.push(interceptor);

    return () => {
      const list = this.interceptors.get(type);
      if (list) {
        const idx = list.indexOf(interceptor);
        if (idx >= 0) list.splice(idx, 1);
      }
    };
  }

  // ---------------------------------------------------------------------------
  // Middleware
  // ---------------------------------------------------------------------------

  use(middleware: EventMiddleware): () => void {
    this.middleware.push(middleware);
    this.middleware.sort((a, b) => a.priority - b.priority);

    return () => {
      const idx = this.middleware.findIndex(m => m.name === middleware.name);
      if (idx >= 0) this.middleware.splice(idx, 1);
    };
  }

  // ---------------------------------------------------------------------------
  // Channels (Namespaced groups)
  // ---------------------------------------------------------------------------

  createChannel(name: string): void {
    if (!this.channels.has(name)) {
      this.channels.set(name, new Set());
    }
  }

  deleteChannel(name: string): number {
    return this.offByNamespace(name);
  }

  getChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  // ---------------------------------------------------------------------------
  // Replay / History
  // ---------------------------------------------------------------------------

  replay(pattern: string, handler: EventHandler, limit = 10): void {
    if (!this.config.enableReplay) return;

    const matching = this.history
      .filter(log => this.matchPattern(log.type, pattern))
      .slice(-limit);

    for (const log of matching) {
      try {
        handler(log.payload);
      } catch (e) {
        console.error(`EventBus: Replay error for "${log.type}":`, e);
      }
    }
  }

  getHistory(pattern?: string, limit = 50): EventLog[] {
    let logs = this.history;
    if (pattern) {
      logs = logs.filter(l => this.matchPattern(l.type, pattern));
    }
    return logs.slice(-limit);
  }

  clearHistory(): void {
    this.history = [];
  }

  // ---------------------------------------------------------------------------
  // Query subscriptions
  // ---------------------------------------------------------------------------

  getSubscriptions(pattern?: string): EventSubscription[] {
    if (pattern) {
      return this.subscriptions.get(pattern) || [];
    }
    const all: EventSubscription[] = [];
    for (const subs of this.subscriptions.values()) {
      all.push(...subs);
    }
    return all;
  }

  getSubscriptionCount(pattern?: string): number {
    if (pattern) {
      return (this.subscriptions.get(pattern) || []).length;
    }
    return this.stats.activeSubscriptions;
  }

  hasSubscribers(pattern: string): boolean {
    return this.getMatchingHandlers(pattern).length > 0;
  }

  // ---------------------------------------------------------------------------
  // Pause / Resume
  // ---------------------------------------------------------------------------

  pauseSubscription(subscriptionId: string): boolean {
    for (const subs of this.subscriptions.values()) {
      const sub = subs.find(s => s.id === subscriptionId);
      if (sub) {
        sub.active = false;
        return true;
      }
    }
    return false;
  }

  resumeSubscription(subscriptionId: string): boolean {
    for (const subs of this.subscriptions.values()) {
      const sub = subs.find(s => s.id === subscriptionId);
      if (sub) {
        sub.active = true;
        return true;
      }
    }
    return false;
  }

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  getStats(): EventStats {
    return { ...this.stats };
  }

  resetStats(): void {
    this.stats = {
      totalEmitted: 0,
      totalHandled: 0,
      totalErrors: 0,
      activeSubscriptions: this.stats.activeSubscriptions,
      eventTypes: new Map(),
      averageHandlerTime: 0,
      peakHandlerTime: 0,
      memoryUsage: 0,
    };
  }

  // ---------------------------------------------------------------------------
  // Utility: Wait for event
  // ---------------------------------------------------------------------------

  waitFor(type: string, timeout = 5000): Promise<EventPayload> {
    return new Promise((resolve, reject) => {
      const timer = timeout > 0
        ? setTimeout(() => {
            reject(new Error(`EventBus: Timeout waiting for event "${type}" (${timeout}ms)`));
          }, timeout)
        : null;

      this.once(type, (payload) => {
        if (timer) clearTimeout(timer);
        resolve(payload);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Utility: Pipe events
  // ---------------------------------------------------------------------------

  pipe(sourcePattern: string, targetType: string, transform?: (payload: EventPayload) => unknown): string {
    return this.on(sourcePattern, (payload) => {
      const data = transform ? transform(payload) : payload.data;
      this.emit(targetType, data, `pipe:${sourcePattern}`);
    });
  }

  // ---------------------------------------------------------------------------
  // Utility: Merge events
  // ---------------------------------------------------------------------------

  merge(patterns: string[], targetType: string): string[] {
    return patterns.map(pattern =>
      this.on(pattern, (payload) => {
        this.emit(targetType, { source: pattern, data: payload.data }, 'merge');
      })
    );
  }

  // ---------------------------------------------------------------------------
  // Utility: Filter events
  // ---------------------------------------------------------------------------

  filter(pattern: string, predicate: (payload: EventPayload) => boolean, handler: EventHandler): string {
    return this.on(pattern, (payload) => {
      if (predicate(payload)) {
        handler(payload);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Utility: Map events
  // ---------------------------------------------------------------------------

  map(pattern: string, transform: (data: unknown) => unknown, targetType: string): string {
    return this.on(pattern, (payload) => {
      const transformed = transform(payload.data);
      this.emit(targetType, transformed, `map:${pattern}`);
    });
  }

  // ---------------------------------------------------------------------------
  // Utility: Buffer events
  // ---------------------------------------------------------------------------

  buffer(pattern: string, bufferTime: number, handler: (payloads: EventPayload[]) => void): string {
    const buffer: EventPayload[] = [];
    let timer: ReturnType<typeof setTimeout> | null = null;

    return this.on(pattern, (payload) => {
      buffer.push(payload);
      if (!timer) {
        timer = setTimeout(() => {
          handler([...buffer]);
          buffer.length = 0;
          timer = null;
        }, bufferTime);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Utility: Sample events
  // ---------------------------------------------------------------------------

  sample(pattern: string, interval: number, handler: EventHandler): string {
    let lastPayload: EventPayload | null = null;

    const timer = setInterval(() => {
      if (lastPayload) {
        handler(lastPayload);
        lastPayload = null;
      }
    }, interval);

    const subId = this.on(pattern, (payload) => {
      lastPayload = payload;
    });

    // Store cleanup
    const origOff = this.off.bind(this);
    const origSubId = subId;
    this.off = (id: string) => {
      if (id === origSubId) {
        clearInterval(timer);
      }
      return origOff(id);
    };

    return subId;
  }

  // ---------------------------------------------------------------------------
  // Destroy
  // ---------------------------------------------------------------------------

  destroy(): void {
    this.offAll();
    this.clearHistory();
    this.middleware = [];
    this.interceptors.clear();
    this.debouncedHandlers.clear();
    this.throttledHandlers.clear();
    this.channels.clear();
    this.resetStats();
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  private dispatchEvent(payload: EventPayload, startTime: number): void {
    const handlers = this.getMatchingHandlers(payload.type);
    const errors: string[] = [];
    let handlersRun = 0;

    for (const sub of handlers) {
      if (payload.propagationStopped) break;
      if (payload.cancelled && payload.cancelable) break;
      if (!sub.active) continue;

      // Check max calls
      if (sub.options.maxCalls > 0 && sub.callCount >= sub.options.maxCalls) {
        sub.active = false;
        continue;
      }

      // Apply filter
      if (sub.options.filter && !sub.options.filter(payload)) continue;

      // Apply transform
      let processedPayload = payload;
      if (sub.options.transform) {
        processedPayload = sub.options.transform(payload);
      }

      try {
        sub.handler(processedPayload);
        sub.callCount++;
        sub.lastCalledAt = Date.now();
        handlersRun++;
        this.stats.totalHandled++;
      } catch (e) {
        const errorMsg = String(e);
        errors.push(errorMsg);
        this.stats.totalErrors++;

        switch (this.config.errorStrategy) {
          case 'throw':
            throw e;
          case 'log':
            console.error(`EventBus: Error in handler for "${payload.type}":`, e);
            break;
          case 'handler':
            if (sub.options.errorHandler) {
              sub.options.errorHandler(e as Error, processedPayload);
            }
            break;
          case 'silent':
            break;
        }
      }

      // Handle once
      if (sub.options.once) {
        sub.active = false;
        this.off(sub.id);
      }
    }

    const duration = performance.now() - startTime;
    this.stats.totalEmitted++;

    // Update performance stats
    if (this.config.performanceTracking) {
      if (duration > this.stats.peakHandlerTime) {
        this.stats.peakHandlerTime = duration;
      }
      const totalEvents = this.stats.totalEmitted;
      this.stats.averageHandlerTime =
        (this.stats.averageHandlerTime * (totalEvents - 1) + duration) / totalEvents;
    }

    // Update event type count
    const currentCount = this.stats.eventTypes.get(payload.type) || 0;
    this.stats.eventTypes.set(payload.type, currentCount + 1);

    // Log
    if (this.config.enableLogging || this.config.enableReplay) {
      this.logEvent(payload.type, payload, handlersRun, duration, errors);
    }
  }

  private getMatchingHandlers(type: string): EventSubscription[] {
    const handlers: EventSubscription[] = [];

    for (const [pattern, subs] of this.subscriptions.entries()) {
      if (this.matchPattern(type, pattern)) {
        handlers.push(...subs);
      }
    }

    return handlers.sort((a, b) => b.options.priority - a.options.priority);
  }

  private matchPattern(type: string, pattern: string): boolean {
    if (type === pattern) return true;

    if (!this.config.enableWildcards) return false;

    // Wildcard matching
    if (pattern === '*') return true;

    // Namespace wildcard: "widget.*" matches "widget.click", "widget.drag", etc.
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      return type.startsWith(prefix + '.') || type === prefix;
    }

    // Prefix wildcard: "*.click" matches "widget.click", "button.click", etc.
    if (pattern.startsWith('*.')) {
      const suffix = pattern.slice(2);
      return type.endsWith('.' + suffix) || type === suffix;
    }

    // Double wildcard: "widget.**" matches nested namespaces
    if (pattern.endsWith('.**')) {
      const prefix = pattern.slice(0, -3);
      return type.startsWith(prefix);
    }

    // Glob-style: convert * to regex
    if (pattern.includes('*')) {
      const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
      try {
        return new RegExp(`^${escaped}$`).test(type);
      } catch {
        return false;
      }
    }

    return false;
  }

  private wrapHandler(subId: string, handler: EventHandler, options: SubscriptionOptions): EventHandler {
    let wrapped = handler;

    // Apply debounce
    if (options.debounce > 0) {
      const debounced = createDebounce(
        (payload: unknown) => handler(payload as EventPayload),
        options.debounce
      );
      this.debouncedHandlers.set(subId, debounced);
      wrapped = (payload: EventPayload) => debounced(payload);
    }

    // Apply throttle
    if (options.throttle > 0) {
      const throttled = createThrottle(
        (payload: unknown) => handler(payload as EventPayload),
        options.throttle
      );
      this.throttledHandlers.set(subId, throttled);
      wrapped = (payload: EventPayload) => throttled(payload);
    }

    return wrapped;
  }

  private runMiddleware(payload: EventPayload, finalHandler: () => void): void {
    const enabledMiddleware = this.middleware.filter(m => m.enabled);
    if (enabledMiddleware.length === 0) {
      finalHandler();
      return;
    }

    let index = 0;
    const next = () => {
      if (index >= enabledMiddleware.length) {
        finalHandler();
        return;
      }
      const mw = enabledMiddleware[index++];
      try {
        mw.handler(payload, next);
      } catch (e) {
        console.error(`EventBus: Middleware "${mw.name}" error:`, e);
        next();
      }
    };

    next();
  }

  private logEvent(type: string, payload: EventPayload, handlers: number, duration: number, errors: string[]): void {
    const log: EventLog = {
      id: this.generateId(),
      type,
      payload: { ...payload },
      timestamp: Date.now(),
      handlers,
      duration,
      errors,
    };

    this.history.push(log);

    // Trim history
    if (this.history.length > this.config.maxHistory) {
      this.history = this.history.slice(-Math.floor(this.config.maxHistory * 0.8));
    }
  }

  private generateId(): string {
    return `evt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  }
}

// =============================================================================
// Predefined Event Descriptors
// =============================================================================

export const BUILDER_EVENTS: EventDescriptor[] = [
  // Widget events
  { name: 'widget.created', namespace: 'widget', category: 'widget', description: 'A new widget was added to the canvas', payload: { widgetId: 'string', type: 'WidgetType', position: 'Position' }, cancelable: true, bubbles: true },
  { name: 'widget.updated', namespace: 'widget', category: 'widget', description: 'Widget properties were modified', payload: { widgetId: 'string', changes: 'object' }, cancelable: false, bubbles: true },
  { name: 'widget.deleted', namespace: 'widget', category: 'widget', description: 'A widget was removed from the canvas', payload: { widgetId: 'string' }, cancelable: true, bubbles: true },
  { name: 'widget.selected', namespace: 'widget', category: 'widget', description: 'A widget was selected', payload: { widgetId: 'string', multiSelect: 'boolean' }, cancelable: false, bubbles: false },
  { name: 'widget.deselected', namespace: 'widget', category: 'widget', description: 'A widget was deselected', payload: { widgetId: 'string' }, cancelable: false, bubbles: false },
  { name: 'widget.moved', namespace: 'widget', category: 'widget', description: 'A widget was repositioned', payload: { widgetId: 'string', from: 'Position', to: 'Position' }, cancelable: false, bubbles: true },
  { name: 'widget.resized', namespace: 'widget', category: 'widget', description: 'A widget was resized', payload: { widgetId: 'string', from: 'Size', to: 'Size' }, cancelable: false, bubbles: true },
  { name: 'widget.locked', namespace: 'widget', category: 'widget', description: 'A widget was locked/unlocked', payload: { widgetId: 'string', locked: 'boolean' }, cancelable: false, bubbles: false },
  { name: 'widget.visibility', namespace: 'widget', category: 'widget', description: 'Widget visibility changed', payload: { widgetId: 'string', visible: 'boolean' }, cancelable: false, bubbles: false },
  { name: 'widget.duplicated', namespace: 'widget', category: 'widget', description: 'A widget was duplicated', payload: { sourceId: 'string', newId: 'string' }, cancelable: false, bubbles: true },
  { name: 'widget.grouped', namespace: 'widget', category: 'widget', description: 'Widgets were grouped', payload: { widgetIds: 'string[]', groupId: 'string' }, cancelable: false, bubbles: true },
  { name: 'widget.ungrouped', namespace: 'widget', category: 'widget', description: 'Widgets were ungrouped', payload: { groupId: 'string', widgetIds: 'string[]' }, cancelable: false, bubbles: true },
  { name: 'widget.style.changed', namespace: 'widget', category: 'widget', description: 'Widget style was modified', payload: { widgetId: 'string', property: 'string', value: 'unknown' }, cancelable: false, bubbles: false },
  { name: 'widget.props.changed', namespace: 'widget', category: 'widget', description: 'Widget props were modified', payload: { widgetId: 'string', property: 'string', value: 'unknown' }, cancelable: false, bubbles: false },
  
  // Canvas events
  { name: 'canvas.zoom', namespace: 'canvas', category: 'canvas', description: 'Canvas zoom level changed', payload: { zoom: 'number', previous: 'number' }, cancelable: false, bubbles: false },
  { name: 'canvas.pan', namespace: 'canvas', category: 'canvas', description: 'Canvas was panned', payload: { x: 'number', y: 'number' }, cancelable: false, bubbles: false },
  { name: 'canvas.resize', namespace: 'canvas', category: 'canvas', description: 'Canvas dimensions changed', payload: { width: 'number', height: 'number' }, cancelable: false, bubbles: false },
  { name: 'canvas.grid.toggle', namespace: 'canvas', category: 'canvas', description: 'Grid visibility toggled', payload: { visible: 'boolean' }, cancelable: false, bubbles: false },
  { name: 'canvas.snap.toggle', namespace: 'canvas', category: 'canvas', description: 'Snap to grid toggled', payload: { enabled: 'boolean' }, cancelable: false, bubbles: false },
  { name: 'canvas.rulers.toggle', namespace: 'canvas', category: 'canvas', description: 'Rulers toggled', payload: { visible: 'boolean' }, cancelable: false, bubbles: false },
  { name: 'canvas.mode.changed', namespace: 'canvas', category: 'canvas', description: 'Interaction mode changed', payload: { mode: 'string', previous: 'string' }, cancelable: false, bubbles: false },
  
  // Project events
  { name: 'project.created', namespace: 'project', category: 'project', description: 'New project created', payload: { projectId: 'string', name: 'string' }, cancelable: false, bubbles: false },
  { name: 'project.saved', namespace: 'project', category: 'project', description: 'Project saved', payload: { projectId: 'string' }, cancelable: false, bubbles: false },
  { name: 'project.loaded', namespace: 'project', category: 'project', description: 'Project loaded', payload: { projectId: 'string' }, cancelable: false, bubbles: false },
  { name: 'project.exported', namespace: 'project', category: 'project', description: 'Project exported', payload: { format: 'string' }, cancelable: false, bubbles: false },
  { name: 'project.settings.changed', namespace: 'project', category: 'project', description: 'Project settings modified', payload: { setting: 'string', value: 'unknown' }, cancelable: false, bubbles: false },
  
  // Page events
  { name: 'page.created', namespace: 'page', category: 'navigation', description: 'New page added', payload: { pageId: 'string', name: 'string' }, cancelable: false, bubbles: false },
  { name: 'page.deleted', namespace: 'page', category: 'navigation', description: 'Page deleted', payload: { pageId: 'string' }, cancelable: true, bubbles: false },
  { name: 'page.switched', namespace: 'page', category: 'navigation', description: 'Active page changed', payload: { from: 'string', to: 'string' }, cancelable: false, bubbles: false },
  { name: 'page.renamed', namespace: 'page', category: 'navigation', description: 'Page renamed', payload: { pageId: 'string', name: 'string' }, cancelable: false, bubbles: false },
  { name: 'page.reordered', namespace: 'page', category: 'navigation', description: 'Page order changed', payload: { order: 'string[]' }, cancelable: false, bubbles: false },
  
  // UI events
  { name: 'ui.panel.toggle', namespace: 'ui', category: 'ui', description: 'Panel visibility toggled', payload: { panel: 'string', visible: 'boolean' }, cancelable: false, bubbles: false },
  { name: 'ui.theme.changed', namespace: 'ui', category: 'ui', description: 'UI theme changed', payload: { theme: 'string' }, cancelable: false, bubbles: false },
  { name: 'ui.notification', namespace: 'ui', category: 'ui', description: 'Notification shown', payload: { type: 'string', message: 'string' }, cancelable: false, bubbles: false },
  { name: 'ui.modal.opened', namespace: 'ui', category: 'ui', description: 'Modal opened', payload: { modal: 'string' }, cancelable: false, bubbles: false },
  { name: 'ui.modal.closed', namespace: 'ui', category: 'ui', description: 'Modal closed', payload: { modal: 'string' }, cancelable: false, bubbles: false },
  { name: 'ui.search.opened', namespace: 'ui', category: 'ui', description: 'Search opened', payload: {}, cancelable: false, bubbles: false },
  { name: 'ui.search.query', namespace: 'ui', category: 'ui', description: 'Search query changed', payload: { query: 'string' }, cancelable: false, bubbles: false },
  { name: 'ui.sidebar.tab', namespace: 'ui', category: 'ui', description: 'Sidebar tab changed', payload: { tab: 'string' }, cancelable: false, bubbles: false },
  
  // Data events
  { name: 'data.binding.created', namespace: 'data', category: 'data', description: 'Data binding created', payload: { widgetId: 'string', property: 'string', expression: 'string' }, cancelable: false, bubbles: false },
  { name: 'data.binding.updated', namespace: 'data', category: 'data', description: 'Data binding updated', payload: { widgetId: 'string', property: 'string' }, cancelable: false, bubbles: false },
  { name: 'data.source.connected', namespace: 'data', category: 'data', description: 'Data source connected', payload: { sourceId: 'string', type: 'string' }, cancelable: false, bubbles: false },
  { name: 'data.source.error', namespace: 'data', category: 'data', description: 'Data source error', payload: { sourceId: 'string', error: 'string' }, cancelable: false, bubbles: false },
  
  // Clipboard events
  { name: 'clipboard.copy', namespace: 'clipboard', category: 'clipboard', description: 'Widgets copied', payload: { count: 'number' }, cancelable: false, bubbles: false },
  { name: 'clipboard.cut', namespace: 'clipboard', category: 'clipboard', description: 'Widgets cut', payload: { count: 'number' }, cancelable: false, bubbles: false },
  { name: 'clipboard.paste', namespace: 'clipboard', category: 'clipboard', description: 'Widgets pasted', payload: { count: 'number' }, cancelable: false, bubbles: false },
  
  // Drag events
  { name: 'drag.start', namespace: 'drag', category: 'drag', description: 'Drag started', payload: { widgetId: 'string', position: 'Position' }, cancelable: true, bubbles: true },
  { name: 'drag.move', namespace: 'drag', category: 'drag', description: 'Dragging', payload: { widgetId: 'string', position: 'Position' }, cancelable: false, bubbles: false },
  { name: 'drag.end', namespace: 'drag', category: 'drag', description: 'Drag ended', payload: { widgetId: 'string', position: 'Position' }, cancelable: false, bubbles: true },
  { name: 'drag.drop', namespace: 'drag', category: 'drag', description: 'Widget dropped on target', payload: { widgetId: 'string', targetId: 'string' }, cancelable: true, bubbles: true },
  
  // History events
  { name: 'history.undo', namespace: 'history', category: 'lifecycle', description: 'Undo performed', payload: { action: 'string' }, cancelable: false, bubbles: false },
  { name: 'history.redo', namespace: 'history', category: 'lifecycle', description: 'Redo performed', payload: { action: 'string' }, cancelable: false, bubbles: false },
  { name: 'history.checkpoint', namespace: 'history', category: 'lifecycle', description: 'History checkpoint created', payload: { label: 'string' }, cancelable: false, bubbles: false },
  
  // Performance events
  { name: 'performance.fps.low', namespace: 'performance', category: 'performance', description: 'FPS dropped below threshold', payload: { fps: 'number', threshold: 'number' }, cancelable: false, bubbles: false },
  { name: 'performance.memory.high', namespace: 'performance', category: 'performance', description: 'Memory usage high', payload: { usage: 'number', limit: 'number' }, cancelable: false, bubbles: false },
  { name: 'performance.render.slow', namespace: 'performance', category: 'performance', description: 'Render took too long', payload: { duration: 'number', component: 'string' }, cancelable: false, bubbles: false },
  
  // Error events
  { name: 'error.runtime', namespace: 'error', category: 'error', description: 'Runtime error occurred', payload: { error: 'string', stack: 'string' }, cancelable: false, bubbles: false },
  { name: 'error.validation', namespace: 'error', category: 'error', description: 'Validation error', payload: { field: 'string', message: 'string' }, cancelable: false, bubbles: false },
  { name: 'error.network', namespace: 'error', category: 'error', description: 'Network error', payload: { url: 'string', status: 'number' }, cancelable: false, bubbles: false },
  
  // Keyboard events
  { name: 'keyboard.shortcut', namespace: 'keyboard', category: 'keyboard', description: 'Keyboard shortcut triggered', payload: { shortcut: 'string', action: 'string' }, cancelable: true, bubbles: false },
  
  // Animation events
  { name: 'animation.started', namespace: 'animation', category: 'animation', description: 'Animation started', payload: { widgetId: 'string', animation: 'string' }, cancelable: false, bubbles: false },
  { name: 'animation.completed', namespace: 'animation', category: 'animation', description: 'Animation completed', payload: { widgetId: 'string', animation: 'string' }, cancelable: false, bubbles: false },
  { name: 'animation.cancelled', namespace: 'animation', category: 'animation', description: 'Animation cancelled', payload: { widgetId: 'string', animation: 'string' }, cancelable: false, bubbles: false },
  
  // Form events
  { name: 'form.submitted', namespace: 'form', category: 'form', description: 'Form submitted', payload: { formId: 'string', data: 'object' }, cancelable: true, bubbles: true },
  { name: 'form.validated', namespace: 'form', category: 'form', description: 'Form validated', payload: { formId: 'string', valid: 'boolean', errors: 'object[]' }, cancelable: false, bubbles: false },
  { name: 'form.field.changed', namespace: 'form', category: 'form', description: 'Form field value changed', payload: { formId: 'string', field: 'string', value: 'unknown' }, cancelable: false, bubbles: false },
  { name: 'form.field.blur', namespace: 'form', category: 'form', description: 'Form field lost focus', payload: { formId: 'string', field: 'string' }, cancelable: false, bubbles: false },
  
  // Sync events
  { name: 'sync.started', namespace: 'sync', category: 'sync', description: 'Sync started', payload: {}, cancelable: false, bubbles: false },
  { name: 'sync.completed', namespace: 'sync', category: 'sync', description: 'Sync completed', payload: { changes: 'number' }, cancelable: false, bubbles: false },
  { name: 'sync.error', namespace: 'sync', category: 'sync', description: 'Sync error', payload: { error: 'string' }, cancelable: false, bubbles: false },
  { name: 'sync.conflict', namespace: 'sync', category: 'sync', description: 'Sync conflict detected', payload: { recordId: 'string', collection: 'string' }, cancelable: false, bubbles: false },
];

// =============================================================================
// Singleton Instance
// =============================================================================

export const eventBus = new EventBus();
