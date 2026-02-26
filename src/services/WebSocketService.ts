// =============================================================================
// WebSocket Service - Real-time communication, reconnection, rooms,
// message queuing, heartbeat, and event-based messaging
// =============================================================================

// =============================================================================
// Types
// =============================================================================

export type WebSocketState = 'connecting' | 'connected' | 'disconnecting' | 'disconnected' | 'reconnecting';

export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  autoConnect?: boolean;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  reconnectBackoff?: 'linear' | 'exponential' | 'fibonacci';
  maxReconnectInterval?: number;
  heartbeatInterval?: number;
  heartbeatMessage?: string | object;
  heartbeatTimeout?: number;
  messageQueueSize?: number;
  binaryType?: BinaryType;
  debug?: boolean;
}

export interface WebSocketMessage<T = unknown> {
  id: string;
  type: string;
  payload: T;
  timestamp: number;
  sender?: string;
  room?: string;
  meta?: Record<string, unknown>;
}

export interface WebSocketRoom {
  id: string;
  name: string;
  members: string[];
  createdAt: number;
  meta?: Record<string, unknown>;
}

export type WebSocketEventType =
  | 'connect'
  | 'disconnect'
  | 'reconnect'
  | 'reconnecting'
  | 'error'
  | 'message'
  | 'state-change'
  | 'room-join'
  | 'room-leave'
  | 'heartbeat'
  | 'queue-overflow';

export interface WebSocketEvent {
  type: WebSocketEventType;
  data?: unknown;
  timestamp: number;
}

export interface WebSocketMetrics {
  messagesSent: number;
  messagesReceived: number;
  bytesTransferred: number;
  reconnectAttempts: number;
  uptime: number;
  latency: number;
  lastHeartbeat: number;
  connectionStartTime: number;
  errors: number;
}

// =============================================================================
// WebSocket Service Class
// =============================================================================

export class WebSocketService {
  private config: Required<WebSocketConfig>;
  private socket: WebSocket | null = null;
  private state: WebSocketState = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private listeners: Map<string, Set<(event: WebSocketEvent) => void>> = new Map();
  private messageHandlers: Map<string, Set<(message: WebSocketMessage) => void>> = new Map();
  private rooms: Map<string, WebSocketRoom> = new Map();
  private pendingMessages: Map<string, {
    resolve: (response: WebSocketMessage) => void;
    reject: (error: Error) => void;
    timeout: ReturnType<typeof setTimeout>;
  }> = new Map();
  private metrics: WebSocketMetrics = {
    messagesSent: 0,
    messagesReceived: 0,
    bytesTransferred: 0,
    reconnectAttempts: 0,
    uptime: 0,
    latency: 0,
    lastHeartbeat: 0,
    connectionStartTime: 0,
    errors: 0,
  };
  private clientId: string;

  constructor(config: WebSocketConfig) {
    this.config = {
      url: config.url,
      protocols: config.protocols ?? [],
      autoConnect: config.autoConnect ?? true,
      reconnect: config.reconnect ?? true,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 10,
      reconnectInterval: config.reconnectInterval ?? 1000,
      reconnectBackoff: config.reconnectBackoff ?? 'exponential',
      maxReconnectInterval: config.maxReconnectInterval ?? 30000,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      heartbeatMessage: config.heartbeatMessage ?? { type: 'ping' },
      heartbeatTimeout: config.heartbeatTimeout ?? 10000,
      messageQueueSize: config.messageQueueSize ?? 100,
      binaryType: config.binaryType ?? 'blob',
      debug: config.debug ?? false,
    };

    this.clientId = this.generateId();

    if (this.config.autoConnect) {
      this.connect();
    }
  }

  // =========================================================================
  // Connection Management
  // =========================================================================

  connect(): void {
    if (this.state === 'connected' || this.state === 'connecting') return;

    this.setState('connecting');
    this.log('Connecting to', this.config.url);

    try {
      this.socket = new WebSocket(
        this.config.url,
        this.config.protocols.length > 0 ? this.config.protocols : undefined
      );
      this.socket.binaryType = this.config.binaryType;
      this.setupSocketHandlers();
    } catch (error) {
      this.log('Connection error:', error);
      this.handleError(error);
    }
  }

  disconnect(code: number = 1000, reason: string = 'Client disconnect'): void {
    this.setState('disconnecting');
    this.clearTimers();
    this.reconnectAttempts = 0;

    if (this.socket) {
      this.socket.close(code, reason);
      this.socket = null;
    }

    this.setState('disconnected');
    this.emit('disconnect', { code, reason });
  }

  private setupSocketHandlers(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      this.log('Connected');
      this.setState('connected');
      this.reconnectAttempts = 0;
      this.metrics.connectionStartTime = Date.now();
      this.startHeartbeat();
      this.flushMessageQueue();
      this.emit('connect', { clientId: this.clientId });
    };

    this.socket.onclose = (event) => {
      this.log('Disconnected:', event.code, event.reason);
      this.stopHeartbeat();

      if (this.state !== 'disconnecting' && this.config.reconnect) {
        this.attemptReconnect();
      } else {
        this.setState('disconnected');
      }

      this.emit('disconnect', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
    };

    this.socket.onmessage = (event) => {
      this.metrics.messagesReceived++;
      const byteLength = typeof event.data === 'string'
        ? new Blob([event.data]).size
        : event.data instanceof ArrayBuffer
          ? event.data.byteLength
          : 0;
      this.metrics.bytesTransferred += byteLength;

      this.handleHeartbeatResponse();

      try {
        const message = typeof event.data === 'string'
          ? JSON.parse(event.data) as WebSocketMessage
          : event.data;

        this.handleIncomingMessage(message);
      } catch {
        this.emit('message', { raw: event.data });
      }
    };

    this.socket.onerror = (event) => {
      this.log('WebSocket error:', event);
      this.metrics.errors++;
      this.handleError(event);
    };
  }

  // =========================================================================
  // Reconnection
  // =========================================================================

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.log('Max reconnect attempts reached');
      this.setState('disconnected');
      this.emit('error', {
        type: 'max-reconnect',
        message: `Failed to reconnect after ${this.config.maxReconnectAttempts} attempts`,
      });
      return;
    }

    this.setState('reconnecting');
    this.reconnectAttempts++;
    this.metrics.reconnectAttempts++;

    const delay = this.calculateReconnectDelay();
    this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);

    this.emit('reconnecting', {
      attempt: this.reconnectAttempts,
      maxAttempts: this.config.maxReconnectAttempts,
      delay,
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private calculateReconnectDelay(): number {
    const baseInterval = this.config.reconnectInterval;
    let delay: number;

    switch (this.config.reconnectBackoff) {
      case 'linear':
        delay = baseInterval * this.reconnectAttempts;
        break;
      case 'exponential':
        delay = baseInterval * Math.pow(2, this.reconnectAttempts - 1);
        break;
      case 'fibonacci': {
        let a = 1, b = 1;
        for (let i = 2; i < this.reconnectAttempts; i++) {
          [a, b] = [b, a + b];
        }
        delay = baseInterval * b;
        break;
      }
      default:
        delay = baseInterval;
    }

    // Add jitter (± 20%)
    const jitter = delay * 0.2 * (Math.random() * 2 - 1);
    delay = Math.round(delay + jitter);

    return Math.min(delay, this.config.maxReconnectInterval);
  }

  // =========================================================================
  // Heartbeat
  // =========================================================================

  private startHeartbeat(): void {
    if (this.config.heartbeatInterval <= 0) return;

    this.heartbeatTimer = setInterval(() => {
      if (this.state !== 'connected') return;

      const heartbeat = typeof this.config.heartbeatMessage === 'string'
        ? this.config.heartbeatMessage
        : JSON.stringify(this.config.heartbeatMessage);

      this.socket?.send(heartbeat);
      this.metrics.lastHeartbeat = Date.now();

      // Set timeout for heartbeat response
      this.heartbeatTimeoutTimer = setTimeout(() => {
        this.log('Heartbeat timeout - connection may be dead');
        this.emit('error', { type: 'heartbeat-timeout' });
        this.socket?.close();
      }, this.config.heartbeatTimeout);
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.heartbeatTimeoutTimer) clearTimeout(this.heartbeatTimeoutTimer);
    this.heartbeatTimer = null;
    this.heartbeatTimeoutTimer = null;
  }

  private handleHeartbeatResponse(): void {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }

    const now = Date.now();
    if (this.metrics.lastHeartbeat > 0) {
      this.metrics.latency = now - this.metrics.lastHeartbeat;
    }

    this.emit('heartbeat', { latency: this.metrics.latency });
  }

  // =========================================================================
  // Message Sending
  // =========================================================================

  send<T = unknown>(type: string, payload: T, options?: {
    room?: string;
    meta?: Record<string, unknown>;
  }): string {
    const message: WebSocketMessage<T> = {
      id: this.generateId(),
      type,
      payload,
      timestamp: Date.now(),
      sender: this.clientId,
      room: options?.room,
      meta: options?.meta,
    };

    if (this.state === 'connected' && this.socket?.readyState === WebSocket.OPEN) {
      const data = JSON.stringify(message);
      this.socket.send(data);
      this.metrics.messagesSent++;
      this.metrics.bytesTransferred += new Blob([data]).size;
    } else {
      this.queueMessage(message);
    }

    return message.id;
  }

  sendRaw(data: string | ArrayBuffer | Blob): void {
    if (this.state === 'connected' && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(data);
      this.metrics.messagesSent++;
    }
  }

  async request<TReq = unknown, TRes = unknown>(
    type: string,
    payload: TReq,
    timeout: number = 10000
  ): Promise<WebSocketMessage<TRes>> {
    return new Promise((resolve, reject) => {
      const id = this.send(type, payload);

      const timeoutHandle = setTimeout(() => {
        this.pendingMessages.delete(id);
        reject(new Error(`Request ${type} timed out after ${timeout}ms`));
      }, timeout);

      this.pendingMessages.set(id, {
        resolve: resolve as (response: WebSocketMessage) => void,
        reject,
        timeout: timeoutHandle,
      });
    });
  }

  // =========================================================================
  // Message Queue
  // =========================================================================

  private queueMessage(message: WebSocketMessage): void {
    if (this.messageQueue.length >= this.config.messageQueueSize) {
      this.messageQueue.shift(); // Remove oldest
      this.emit('queue-overflow', {
        queueSize: this.messageQueue.length,
        dropped: 1,
      });
    }

    this.messageQueue.push(message);
    this.log(`Message queued (${this.messageQueue.length} in queue)`);
  }

  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    this.log(`Flushing ${this.messageQueue.length} queued messages`);
    const queue = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of queue) {
      if (this.socket?.readyState === WebSocket.OPEN) {
        const data = JSON.stringify(message);
        this.socket.send(data);
        this.metrics.messagesSent++;
        this.metrics.bytesTransferred += new Blob([data]).size;
      } else {
        this.queueMessage(message);
        break;
      }
    }
  }

  // =========================================================================
  // Message Handling
  // =========================================================================

  private handleIncomingMessage(message: WebSocketMessage): void {
    // Check for pending request responses
    const pending = this.pendingMessages.get(message.id);
    if (pending) {
      clearTimeout(pending.timeout);
      pending.resolve(message);
      this.pendingMessages.delete(message.id);
      return;
    }

    // Emit to type-specific handlers
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => handler(message));
    }

    // Emit general message event
    this.emit('message', message);
  }

  onMessage<T = unknown>(type: string, handler: (message: WebSocketMessage<T>) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }

    const wrappedHandler = handler as (message: WebSocketMessage) => void;
    this.messageHandlers.get(type)!.add(wrappedHandler);

    return () => {
      this.messageHandlers.get(type)?.delete(wrappedHandler);
    };
  }

  // =========================================================================
  // Room Management
  // =========================================================================

  joinRoom(roomId: string, meta?: Record<string, unknown>): void {
    const room: WebSocketRoom = {
      id: roomId,
      name: roomId,
      members: [this.clientId],
      createdAt: Date.now(),
      meta,
    };

    this.rooms.set(roomId, room);
    this.send('__room:join', { roomId, meta });
    this.emit('room-join', { roomId });
    this.log(`Joined room: ${roomId}`);
  }

  leaveRoom(roomId: string): void {
    this.rooms.delete(roomId);
    this.send('__room:leave', { roomId });
    this.emit('room-leave', { roomId });
    this.log(`Left room: ${roomId}`);
  }

  sendToRoom<T = unknown>(roomId: string, type: string, payload: T): string {
    return this.send(type, payload, { room: roomId });
  }

  getRooms(): WebSocketRoom[] {
    return Array.from(this.rooms.values());
  }

  isInRoom(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  // =========================================================================
  // Event System
  // =========================================================================

  on(event: WebSocketEventType, handler: (event: WebSocketEvent) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(handler);

    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  off(event: WebSocketEventType, handler: (event: WebSocketEvent) => void): void {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(type: WebSocketEventType, data?: unknown): void {
    const event: WebSocketEvent = {
      type,
      data,
      timestamp: Date.now(),
    };

    const handlers = this.listeners.get(type);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
  }

  // =========================================================================
  // State Management
  // =========================================================================

  private setState(newState: WebSocketState): void {
    const oldState = this.state;
    this.state = newState;

    if (oldState !== newState) {
      this.emit('state-change', { from: oldState, to: newState });
    }
  }

  getState(): WebSocketState {
    return this.state;
  }

  isConnected(): boolean {
    return this.state === 'connected';
  }

  getMetrics(): WebSocketMetrics {
    return {
      ...this.metrics,
      uptime: this.state === 'connected'
        ? Date.now() - this.metrics.connectionStartTime
        : 0,
    };
  }

  getClientId(): string {
    return this.clientId;
  }

  // =========================================================================
  // Error Handling
  // =========================================================================

  private handleError(error: unknown): void {
    this.metrics.errors++;
    this.emit('error', { error });
  }

  // =========================================================================
  // Cleanup
  // =========================================================================

  destroy(): void {
    this.disconnect();
    this.clearTimers();
    this.listeners.clear();
    this.messageHandlers.clear();
    this.messageQueue = [];
    this.rooms.clear();

    // Reject all pending requests
    this.pendingMessages.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error('WebSocket service destroyed'));
    });
    this.pendingMessages.clear();
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopHeartbeat();
  }

  // =========================================================================
  // Utilities
  // =========================================================================

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[WebSocket]', ...args);
    }
  }
}

// =============================================================================
// WebSocket Channel - Topic-based pub/sub over WebSocket
// =============================================================================

export class WebSocketChannel<T = unknown> {
  private ws: WebSocketService;
  private topic: string;
  private handlers: Set<(data: T) => void> = new Set();
  private unsubscribe: (() => void) | null = null;

  constructor(ws: WebSocketService, topic: string) {
    this.ws = ws;
    this.topic = topic;

    this.unsubscribe = ws.onMessage<T>(`channel:${topic}`, (message) => {
      this.handlers.forEach(handler => handler(message.payload));
    });
  }

  publish(data: T): void {
    this.ws.send(`channel:${this.topic}`, data);
  }

  subscribe(handler: (data: T) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  destroy(): void {
    this.handlers.clear();
    this.unsubscribe?.();
  }
}

// =============================================================================
// Presence System
// =============================================================================

export interface PresenceUser {
  id: string;
  name?: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: number;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
  meta?: Record<string, unknown>;
}

export class PresenceService {
  private ws: WebSocketService;
  private users: Map<string, PresenceUser> = new Map();
  private updateInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(users: PresenceUser[]) => void> = new Set();
  private localUser: PresenceUser;

  constructor(ws: WebSocketService, user: Partial<PresenceUser>) {
    this.ws = ws;
    this.localUser = {
      id: ws.getClientId(),
      status: 'online',
      lastSeen: Date.now(),
      ...user,
    };

    // Listen for presence updates
    ws.onMessage<PresenceUser>('__presence:update', (message) => {
      this.users.set(message.payload.id, message.payload);
      this.notifyListeners();
    });

    ws.onMessage<{ id: string }>('__presence:leave', (message) => {
      this.users.delete(message.payload.id);
      this.notifyListeners();
    });

    ws.onMessage<PresenceUser[]>('__presence:list', (message) => {
      this.users.clear();
      message.payload.forEach(user => this.users.set(user.id, user));
      this.notifyListeners();
    });

    // Start broadcasting
    this.startBroadcasting();
  }

  private startBroadcasting(interval: number = 5000): void {
    this.broadcastPresence();
    this.updateInterval = setInterval(() => {
      this.localUser.lastSeen = Date.now();
      this.broadcastPresence();
    }, interval);
  }

  private broadcastPresence(): void {
    this.ws.send('__presence:update', this.localUser);
  }

  private notifyListeners(): void {
    const userList = Array.from(this.users.values());
    this.listeners.forEach(listener => listener(userList));
  }

  updateStatus(status: PresenceUser['status']): void {
    this.localUser.status = status;
    this.broadcastPresence();
  }

  updateCursor(x: number, y: number): void {
    this.localUser.cursor = { x, y };
    this.broadcastPresence();
  }

  updateSelection(start: number, end: number): void {
    this.localUser.selection = { start, end };
    this.broadcastPresence();
  }

  updateMeta(meta: Record<string, unknown>): void {
    this.localUser.meta = { ...this.localUser.meta, ...meta };
    this.broadcastPresence();
  }

  getUsers(): PresenceUser[] {
    return Array.from(this.users.values());
  }

  getUser(id: string): PresenceUser | undefined {
    return this.users.get(id);
  }

  getOnlineCount(): number {
    return Array.from(this.users.values()).filter(u => u.status !== 'offline').length;
  }

  onUsersChange(handler: (users: PresenceUser[]) => void): () => void {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  destroy(): void {
    if (this.updateInterval) clearInterval(this.updateInterval);
    this.ws.send('__presence:leave', { id: this.localUser.id });
    this.listeners.clear();
    this.users.clear();
  }
}

// =============================================================================
// WebSocket CSS for Connection Status Indicators
// =============================================================================

export function generateWebSocketCSS(): string {
  return `.ws-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  font-family: system-ui, sans-serif;
  transition: all 300ms ease;
}

.ws-status__indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background-color 300ms ease;
}

.ws-status--connected {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}
.ws-status--connected .ws-status__indicator {
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.5);
  animation: ws-pulse 2s infinite;
}

.ws-status--connecting,
.ws-status--reconnecting {
  background: rgba(250, 204, 21, 0.1);
  color: #ca8a04;
}
.ws-status--connecting .ws-status__indicator,
.ws-status--reconnecting .ws-status__indicator {
  background: #facc15;
  animation: ws-blink 1s infinite;
}

.ws-status--disconnected,
.ws-status--disconnecting {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}
.ws-status--disconnected .ws-status__indicator,
.ws-status--disconnecting .ws-status__indicator {
  background: #ef4444;
}

@keyframes ws-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes ws-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Presence avatars */
.ws-presence {
  display: flex;
  align-items: center;
}

.ws-presence__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid white;
  margin-left: -8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: transform 200ms ease;
  cursor: pointer;
}

.ws-presence__avatar:first-child {
  margin-left: 0;
}

.ws-presence__avatar:hover {
  transform: translateY(-2px);
  z-index: 1;
}

.ws-presence__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ws-presence__avatar-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid white;
}

.ws-presence__avatar-badge--online { background: #22c55e; }
.ws-presence__avatar-badge--away { background: #facc15; }
.ws-presence__avatar-badge--busy { background: #ef4444; }
.ws-presence__avatar-badge--offline { background: #9ca3af; }

.ws-presence__more {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  margin-left: -8px;
  border: 2px solid white;
}

/* Cursor overlay */
.ws-cursor {
  position: absolute;
  pointer-events: none;
  z-index: 1000;
  transition: transform 100ms ease;
}

.ws-cursor__pointer {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 10px solid var(--cursor-color, #6366f1);
  transform: rotate(-30deg);
}

.ws-cursor__label {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  color: white;
  background: var(--cursor-color, #6366f1);
  white-space: nowrap;
  margin-left: 12px;
  margin-top: -2px;
}`;
}

// =============================================================================
// Factory Functions
// =============================================================================

export function createWebSocket(config: WebSocketConfig): WebSocketService {
  return new WebSocketService(config);
}

export function createPresence(
  ws: WebSocketService,
  user: Partial<PresenceUser>
): PresenceService {
  return new PresenceService(ws, user);
}

export function createChannel<T>(ws: WebSocketService, topic: string): WebSocketChannel<T> {
  return new WebSocketChannel<T>(ws, topic);
}
