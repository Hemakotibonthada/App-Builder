/**
 * New Store Slices — Collaboration, Theme, Code Editor, and Notifications
 * Comprehensive Redux state management for advanced features.
 */

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

/* ══════════════════════════════════════════════
 * COLLABORATION SLICE
 * ══════════════════════════════════════════════ */

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number; page?: string };
  selection?: string[];
  status: 'online' | 'idle' | 'offline';
  lastSeen: number;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  timestamp: number;
  resolved: boolean;
  widgetId?: string;
  position?: { x: number; y: number };
  replies: Comment[];
  reactions: { emoji: string; userIds: string[] }[];
}

interface CollaborationState {
  collaborators: Collaborator[];
  comments: Comment[];
  activeThread: string | null;
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  unreadCount: number;
  showPresence: boolean;
  showCursors: boolean;
  showComments: boolean;
  typingUsers: { userId: string; widgetId: string }[];
}

const initialCollabState: CollaborationState = {
  collaborators: [],
  comments: [],
  activeThread: null,
  isConnected: false,
  connectionStatus: 'disconnected',
  unreadCount: 0,
  showPresence: true,
  showCursors: true,
  showComments: true,
  typingUsers: [],
};

export const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState: initialCollabState,
  reducers: {
    setConnectionStatus(state, action: PayloadAction<CollaborationState['connectionStatus']>) {
      state.connectionStatus = action.payload;
      state.isConnected = action.payload === 'connected';
    },
    addCollaborator(state, action: PayloadAction<Collaborator>) {
      const exists = state.collaborators.find(c => c.id === action.payload.id);
      if (!exists) state.collaborators.push(action.payload);
    },
    removeCollaborator(state, action: PayloadAction<string>) {
      state.collaborators = state.collaborators.filter(c => c.id !== action.payload);
    },
    updateCollaboratorCursor(state, action: PayloadAction<{ id: string; cursor: { x: number; y: number; page?: string } }>) {
      const collab = state.collaborators.find(c => c.id === action.payload.id);
      if (collab) collab.cursor = action.payload.cursor;
    },
    updateCollaboratorSelection(state, action: PayloadAction<{ id: string; selection: string[] }>) {
      const collab = state.collaborators.find(c => c.id === action.payload.id);
      if (collab) collab.selection = action.payload.selection;
    },
    updateCollaboratorStatus(state, action: PayloadAction<{ id: string; status: Collaborator['status'] }>) {
      const collab = state.collaborators.find(c => c.id === action.payload.id);
      if (collab) {
        collab.status = action.payload.status;
        collab.lastSeen = Date.now();
      }
    },
    addComment(state, action: PayloadAction<Comment>) {
      state.comments.push(action.payload);
      state.unreadCount += 1;
    },
    resolveComment(state, action: PayloadAction<string>) {
      const comment = state.comments.find(c => c.id === action.payload);
      if (comment) comment.resolved = true;
    },
    unresolveComment(state, action: PayloadAction<string>) {
      const comment = state.comments.find(c => c.id === action.payload);
      if (comment) comment.resolved = false;
    },
    addReply(state, action: PayloadAction<{ commentId: string; reply: Comment }>) {
      const comment = state.comments.find(c => c.id === action.payload.commentId);
      if (comment) {
        comment.replies.push(action.payload.reply);
        state.unreadCount += 1;
      }
    },
    deleteComment(state, action: PayloadAction<string>) {
      state.comments = state.comments.filter(c => c.id !== action.payload);
    },
    addReaction(state, action: PayloadAction<{ commentId: string; emoji: string; userId: string }>) {
      const comment = state.comments.find(c => c.id === action.payload.commentId);
      if (comment) {
        const reaction = comment.reactions.find(r => r.emoji === action.payload.emoji);
        if (reaction) {
          if (!reaction.userIds.includes(action.payload.userId)) {
            reaction.userIds.push(action.payload.userId);
          }
        } else {
          comment.reactions.push({ emoji: action.payload.emoji, userIds: [action.payload.userId] });
        }
      }
    },
    setActiveThread(state, action: PayloadAction<string | null>) {
      state.activeThread = action.payload;
    },
    markAllRead(state) {
      state.unreadCount = 0;
    },
    togglePresence(state) {
      state.showPresence = !state.showPresence;
    },
    toggleCursors(state) {
      state.showCursors = !state.showCursors;
    },
    toggleComments(state) {
      state.showComments = !state.showComments;
    },
    setTypingUser(state, action: PayloadAction<{ userId: string; widgetId: string }>) {
      if (!state.typingUsers.find(t => t.userId === action.payload.userId && t.widgetId === action.payload.widgetId)) {
        state.typingUsers.push(action.payload);
      }
    },
    removeTypingUser(state, action: PayloadAction<string>) {
      state.typingUsers = state.typingUsers.filter(t => t.userId !== action.payload);
    },
  },
});

export const collaborationActions = collaborationSlice.actions;

/* ══════════════════════════════════════════════
 * THEME SLICE
 * ══════════════════════════════════════════════ */

export interface DesignToken {
  name: string;
  value: string;
  category: 'color' | 'spacing' | 'typography' | 'border' | 'shadow' | 'animation';
  description?: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  mode: 'light' | 'dark' | 'system';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
    overlay: string;
    shadow: string;
  };
  typography: {
    fontFamily: string;
    headingFamily: string;
    monoFamily: string;
    baseFontSize: number;
    lineHeight: number;
    headingWeight: number;
    bodyWeight: number;
    letterSpacing: number;
    scale: number[];
  };
  spacing: {
    unit: number;
    scale: number[];
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    inner: string;
    glow: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
    easing: string;
  };
  customTokens: DesignToken[];
}

interface ThemeState {
  activeThemeId: string;
  themes: ThemeConfig[];
  previewThemeId: string | null;
  cssVariables: Record<string, string>;
  isDirty: boolean;
}

const defaultLightTheme: ThemeConfig = {
  id: 'light-default',
  name: 'Light Default',
  mode: 'light',
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#22c55e',
    info: '#3b82f6',
    overlay: 'rgba(0,0,0,0.5)',
    shadow: 'rgba(0,0,0,0.1)',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    headingFamily: 'Inter, system-ui, sans-serif',
    monoFamily: 'JetBrains Mono, Fira Code, monospace',
    baseFontSize: 16,
    lineHeight: 1.5,
    headingWeight: 700,
    bodyWeight: 400,
    letterSpacing: 0,
    scale: [12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72],
  },
  spacing: {
    unit: 4,
    scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96],
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0,0,0,.05)',
    md: '0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)',
    xl: '0 20px 25px -5px rgba(0,0,0,.1), 0 8px 10px -6px rgba(0,0,0,.1)',
    inner: 'inset 0 2px 4px rgba(0,0,0,.06)',
    glow: '0 0 20px rgba(99,102,241,0.3)',
  },
  transitions: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  customTokens: [],
};

const defaultDarkTheme: ThemeConfig = {
  ...defaultLightTheme,
  id: 'dark-default',
  name: 'Dark Default',
  mode: 'dark',
  colors: {
    primary: '#818cf8',
    secondary: '#a78bfa',
    accent: '#22d3ee',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    error: '#f87171',
    warning: '#fbbf24',
    success: '#4ade80',
    info: '#60a5fa',
    overlay: 'rgba(0,0,0,0.7)',
    shadow: 'rgba(0,0,0,0.3)',
  },
};

const initialThemeState: ThemeState = {
  activeThemeId: 'dark-default',
  themes: [defaultLightTheme, defaultDarkTheme],
  previewThemeId: null,
  cssVariables: {},
  isDirty: false,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState: initialThemeState,
  reducers: {
    setActiveTheme(state, action: PayloadAction<string>) {
      state.activeThemeId = action.payload;
    },
    addTheme(state, action: PayloadAction<ThemeConfig>) {
      state.themes.push(action.payload);
    },
    updateTheme(state, action: PayloadAction<{ id: string; updates: Partial<ThemeConfig> }>) {
      const theme = state.themes.find(t => t.id === action.payload.id);
      if (theme) {
        Object.assign(theme, action.payload.updates);
        state.isDirty = true;
      }
    },
    updateThemeColor(state, action: PayloadAction<{ themeId: string; key: keyof ThemeConfig['colors']; value: string }>) {
      const theme = state.themes.find(t => t.id === action.payload.themeId);
      if (theme) {
        theme.colors[action.payload.key] = action.payload.value;
        state.isDirty = true;
      }
    },
    updateTypography(state, action: PayloadAction<{ themeId: string; key: keyof ThemeConfig['typography']; value: any }>) {
      const theme = state.themes.find(t => t.id === action.payload.themeId);
      if (theme) {
        (theme.typography as any)[action.payload.key] = action.payload.value;
        state.isDirty = true;
      }
    },
    deleteTheme(state, action: PayloadAction<string>) {
      state.themes = state.themes.filter(t => t.id !== action.payload);
      if (state.activeThemeId === action.payload) {
        state.activeThemeId = state.themes[0]?.id ?? '';
      }
    },
    duplicateTheme(state, action: PayloadAction<{ sourceId: string; newId: string; newName: string }>) {
      const source = state.themes.find(t => t.id === action.payload.sourceId);
      if (source) {
        state.themes.push({
          ...JSON.parse(JSON.stringify(source)),
          id: action.payload.newId,
          name: action.payload.newName,
        });
      }
    },
    addDesignToken(state, action: PayloadAction<{ themeId: string; token: DesignToken }>) {
      const theme = state.themes.find(t => t.id === action.payload.themeId);
      if (theme) {
        theme.customTokens.push(action.payload.token);
      }
    },
    removeDesignToken(state, action: PayloadAction<{ themeId: string; tokenName: string }>) {
      const theme = state.themes.find(t => t.id === action.payload.themeId);
      if (theme) {
        theme.customTokens = theme.customTokens.filter(t => t.name !== action.payload.tokenName);
      }
    },
    setPreviewTheme(state, action: PayloadAction<string | null>) {
      state.previewThemeId = action.payload;
    },
    setCssVariables(state, action: PayloadAction<Record<string, string>>) {
      state.cssVariables = action.payload;
    },
    markClean(state) {
      state.isDirty = false;
    },
  },
});

export const themeActions = themeSlice.actions;

/* ══════════════════════════════════════════════
 * CODE EDITOR SLICE
 * ══════════════════════════════════════════════ */

export interface CodeFile {
  id: string;
  name: string;
  path: string;
  language: string;
  content: string;
  isModified: boolean;
  isReadOnly: boolean;
  cursor?: { line: number; column: number };
  selections?: { startLine: number; startCol: number; endLine: number; endCol: number }[];
}

interface CodeEditorState {
  files: CodeFile[];
  activeFileId: string | null;
  openFileIds: string[];
  isVisible: boolean;
  splitView: boolean;
  secondaryFileId: string | null;
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  theme: 'dark' | 'light' | 'monokai' | 'github' | 'dracula';
  outputLogs: { type: 'log' | 'warn' | 'error' | 'info'; message: string; timestamp: number }[];
  isConsoleOpen: boolean;
  searchQuery: string;
  searchResults: { fileId: string; line: number; column: number; match: string }[];
  formatOnSave: boolean;
  autoSave: boolean;
}

const initialCodeEditorState: CodeEditorState = {
  files: [],
  activeFileId: null,
  openFileIds: [],
  isVisible: false,
  splitView: false,
  secondaryFileId: null,
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: true,
  lineNumbers: true,
  theme: 'dark',
  outputLogs: [],
  isConsoleOpen: false,
  searchQuery: '',
  searchResults: [],
  formatOnSave: true,
  autoSave: true,
};

export const codeEditorSlice = createSlice({
  name: 'codeEditor',
  initialState: initialCodeEditorState,
  reducers: {
    setVisible(state, action: PayloadAction<boolean>) {
      state.isVisible = action.payload;
    },
    toggleVisible(state) {
      state.isVisible = !state.isVisible;
    },
    addFile(state, action: PayloadAction<CodeFile>) {
      if (!state.files.find(f => f.id === action.payload.id)) {
        state.files.push(action.payload);
      }
    },
    updateFileContent(state, action: PayloadAction<{ fileId: string; content: string }>) {
      const file = state.files.find(f => f.id === action.payload.fileId);
      if (file) {
        file.content = action.payload.content;
        file.isModified = true;
      }
    },
    setActiveFile(state, action: PayloadAction<string>) {
      state.activeFileId = action.payload;
      if (!state.openFileIds.includes(action.payload)) {
        state.openFileIds.push(action.payload);
      }
    },
    closeFile(state, action: PayloadAction<string>) {
      state.openFileIds = state.openFileIds.filter(id => id !== action.payload);
      if (state.activeFileId === action.payload) {
        state.activeFileId = state.openFileIds[state.openFileIds.length - 1] ?? null;
      }
    },
    closeAllFiles(state) {
      state.openFileIds = [];
      state.activeFileId = null;
    },
    markFileSaved(state, action: PayloadAction<string>) {
      const file = state.files.find(f => f.id === action.payload);
      if (file) file.isModified = false;
    },
    setSplitView(state, action: PayloadAction<boolean>) {
      state.splitView = action.payload;
    },
    setSecondaryFile(state, action: PayloadAction<string | null>) {
      state.secondaryFileId = action.payload;
    },
    setFontSize(state, action: PayloadAction<number>) {
      state.fontSize = Math.max(10, Math.min(30, action.payload));
    },
    setTabSize(state, action: PayloadAction<number>) {
      state.tabSize = action.payload;
    },
    toggleWordWrap(state) {
      state.wordWrap = !state.wordWrap;
    },
    toggleMinimap(state) {
      state.minimap = !state.minimap;
    },
    toggleLineNumbers(state) {
      state.lineNumbers = !state.lineNumbers;
    },
    setEditorTheme(state, action: PayloadAction<CodeEditorState['theme']>) {
      state.theme = action.payload;
    },
    addLog(state, action: PayloadAction<{ type: 'log' | 'warn' | 'error' | 'info'; message: string }>) {
      state.outputLogs.push({ ...action.payload, timestamp: Date.now() });
      if (state.outputLogs.length > 500) {
        state.outputLogs = state.outputLogs.slice(-250);
      }
    },
    clearLogs(state) {
      state.outputLogs = [];
    },
    toggleConsole(state) {
      state.isConsoleOpen = !state.isConsoleOpen;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setSearchResults(state, action: PayloadAction<CodeEditorState['searchResults']>) {
      state.searchResults = action.payload;
    },
    updateFileCursor(state, action: PayloadAction<{ fileId: string; line: number; column: number }>) {
      const file = state.files.find(f => f.id === action.payload.fileId);
      if (file) {
        file.cursor = { line: action.payload.line, column: action.payload.column };
      }
    },
    toggleFormatOnSave(state) {
      state.formatOnSave = !state.formatOnSave;
    },
    toggleAutoSave(state) {
      state.autoSave = !state.autoSave;
    },
  },
});

export const codeEditorActions = codeEditorSlice.actions;

/* ══════════════════════════════════════════════
 * NOTIFICATION SLICE
 * ══════════════════════════════════════════════ */

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  timestamp: number;
  read: boolean;
  persistent: boolean;
  action?: {
    label: string;
    type: string;
    payload?: any;
  };
  group?: string;
  source?: string;
  icon?: string;
  progress?: number;
}

interface NotificationState {
  notifications: Notification[];
  toasts: Notification[];
  maxToasts: number;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  isPanelOpen: boolean;
  filter: 'all' | 'unread' | 'info' | 'success' | 'warning' | 'error';
  muteAll: boolean;
  soundEnabled: boolean;
}

const initialNotificationState: NotificationState = {
  notifications: [],
  toasts: [],
  maxToasts: 5,
  position: 'bottom-right',
  isPanelOpen: false,
  filter: 'all',
  muteAll: false,
  soundEnabled: true,
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState: initialNotificationState,
  reducers: {
    addNotification(state, action: PayloadAction<Omit<Notification, 'timestamp' | 'read'>>) {
      const notification: Notification = {
        ...action.payload,
        timestamp: Date.now(),
        read: false,
      };
      state.notifications.unshift(notification);
      if (!state.muteAll) {
        state.toasts.push(notification);
        if (state.toasts.length > state.maxToasts) {
          state.toasts = state.toasts.slice(-state.maxToasts);
        }
      }
      // Keep max 200 notifications
      if (state.notifications.length > 200) {
        state.notifications = state.notifications.slice(0, 200);
      }
    },
    dismissToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
    dismissAllToasts(state) {
      state.toasts = [];
    },
    markAsRead(state, action: PayloadAction<string>) {
      const n = state.notifications.find(n => n.id === action.payload);
      if (n) n.read = true;
    },
    markAllAsRead(state) {
      state.notifications.forEach(n => n.read = true);
    },
    deleteNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearAll(state) {
      state.notifications = [];
      state.toasts = [];
    },
    togglePanel(state) {
      state.isPanelOpen = !state.isPanelOpen;
    },
    setFilter(state, action: PayloadAction<NotificationState['filter']>) {
      state.filter = action.payload;
    },
    setPosition(state, action: PayloadAction<NotificationState['position']>) {
      state.position = action.payload;
    },
    toggleMute(state) {
      state.muteAll = !state.muteAll;
    },
    toggleSound(state) {
      state.soundEnabled = !state.soundEnabled;
    },
    updateProgress(state, action: PayloadAction<{ id: string; progress: number }>) {
      const n = state.notifications.find(n => n.id === action.payload.id);
      if (n) n.progress = action.payload.progress;
    },
  },
});

export const notificationActions = notificationSlice.actions;

/* ══════════════════════════════════════════════
 * SETTINGS SLICE
 * ══════════════════════════════════════════════ */

interface SettingsState {
  general: {
    language: string;
    autoSave: boolean;
    autoSaveInterval: number; // ms
    showWelcome: boolean;
    analytics: boolean;
    crashReports: boolean;
  };
  editor: {
    defaultPageWidth: number;
    defaultPageHeight: number;
    gridSize: number;
    snapThreshold: number;
    showGuides: boolean;
    showSmartGuides: boolean;
    selectionColor: string;
    backgroundColor: string;
    showPixelGrid: boolean;
  };
  performance: {
    hardwareAcceleration: boolean;
    maxUndoSteps: number;
    lazyLoadWidgets: boolean;
    virtualizeCanvas: boolean;
    debounceResize: number;
    throttleScroll: number;
  };
  export: {
    defaultFormat: 'png' | 'jpg' | 'svg' | 'pdf' | 'webp';
    quality: number;
    scale: number;
    includeBackground: boolean;
    flattenLayers: boolean;
    optimizeAssets: boolean;
  };
  accessibility: {
    reduceMotion: boolean;
    highContrast: boolean;
    largeText: boolean;
    screenReaderAnnouncements: boolean;
    focusIndicators: boolean;
    keyboardNavigation: boolean;
  };
  shortcuts: Record<string, string>;
}

const initialSettingsState: SettingsState = {
  general: {
    language: 'en',
    autoSave: true,
    autoSaveInterval: 30000,
    showWelcome: true,
    analytics: false,
    crashReports: true,
  },
  editor: {
    defaultPageWidth: 1440,
    defaultPageHeight: 900,
    gridSize: 8,
    snapThreshold: 5,
    showGuides: true,
    showSmartGuides: true,
    selectionColor: '#6366f1',
    backgroundColor: '#0f172a',
    showPixelGrid: false,
  },
  performance: {
    hardwareAcceleration: true,
    maxUndoSteps: 100,
    lazyLoadWidgets: true,
    virtualizeCanvas: true,
    debounceResize: 100,
    throttleScroll: 16,
  },
  export: {
    defaultFormat: 'png',
    quality: 90,
    scale: 2,
    includeBackground: true,
    flattenLayers: false,
    optimizeAssets: true,
  },
  accessibility: {
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    screenReaderAnnouncements: true,
    focusIndicators: true,
    keyboardNavigation: true,
  },
  shortcuts: {
    'select-tool': 'V',
    'hand-tool': 'H',
    'text-tool': 'T',
    'rectangle-tool': 'R',
    'circle-tool': 'O',
    'undo': 'Ctrl+Z',
    'redo': 'Ctrl+Shift+Z',
    'copy': 'Ctrl+C',
    'paste': 'Ctrl+V',
    'cut': 'Ctrl+X',
    'delete': 'Delete',
    'duplicate': 'Ctrl+D',
    'select-all': 'Ctrl+A',
    'deselect': 'Escape',
    'zoom-in': 'Ctrl+=',
    'zoom-out': 'Ctrl+-',
    'zoom-fit': 'Ctrl+0',
    'zoom-100': 'Ctrl+1',
    'save': 'Ctrl+S',
    'export': 'Ctrl+E',
    'preview': 'Ctrl+P',
    'toggle-grid': "Ctrl+'",
    'toggle-rulers': 'Ctrl+R',
    'group': 'Ctrl+G',
    'ungroup': 'Ctrl+Shift+G',
    'lock': 'Ctrl+L',
    'bring-forward': 'Ctrl+]',
    'send-backward': 'Ctrl+[',
    'bring-to-front': 'Ctrl+Shift+]',
    'send-to-back': 'Ctrl+Shift+[',
    'command-palette': 'Ctrl+K',
    'search': 'Ctrl+F',
    'toggle-sidebar': 'Ctrl+B',
    'toggle-code': 'Ctrl+`',
    'new-page': 'Ctrl+N',
    'flip-horizontal': 'Shift+H',
    'flip-vertical': 'Shift+V',
  },
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: initialSettingsState,
  reducers: {
    updateGeneral(state, action: PayloadAction<Partial<SettingsState['general']>>) {
      Object.assign(state.general, action.payload);
    },
    updateEditor(state, action: PayloadAction<Partial<SettingsState['editor']>>) {
      Object.assign(state.editor, action.payload);
    },
    updatePerformance(state, action: PayloadAction<Partial<SettingsState['performance']>>) {
      Object.assign(state.performance, action.payload);
    },
    updateExport(state, action: PayloadAction<Partial<SettingsState['export']>>) {
      Object.assign(state.export, action.payload);
    },
    updateAccessibility(state, action: PayloadAction<Partial<SettingsState['accessibility']>>) {
      Object.assign(state.accessibility, action.payload);
    },
    updateShortcut(state, action: PayloadAction<{ action: string; shortcut: string }>) {
      state.shortcuts[action.payload.action] = action.payload.shortcut;
    },
    resetShortcuts(state) {
      state.shortcuts = initialSettingsState.shortcuts;
    },
    resetAll(state) {
      return initialSettingsState;
    },
    importSettings(state, action: PayloadAction<Partial<SettingsState>>) {
      if (action.payload.general) Object.assign(state.general, action.payload.general);
      if (action.payload.editor) Object.assign(state.editor, action.payload.editor);
      if (action.payload.performance) Object.assign(state.performance, action.payload.performance);
      if (action.payload.export) Object.assign(state.export, action.payload.export);
      if (action.payload.accessibility) Object.assign(state.accessibility, action.payload.accessibility);
      if (action.payload.shortcuts) Object.assign(state.shortcuts, action.payload.shortcuts);
    },
  },
});

export const settingsActions = settingsSlice.actions;

/* ══════════════════════════════════════════════
 * ASSETS SLICE
 * ══════════════════════════════════════════════ */

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'font' | 'icon' | 'svg' | 'document' | 'other';
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
  uploadedAt: number;
  folderId?: string;
  tags: string[];
  metadata: Record<string, any>;
}

export interface AssetFolder {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
  icon?: string;
}

interface AssetsState {
  assets: Asset[];
  folders: AssetFolder[];
  selectedIds: string[];
  currentFolderId: string | null;
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'date' | 'size' | 'type';
  sortDirection: 'asc' | 'desc';
  searchQuery: string;
  filterType: string | null;
  uploadProgress: Record<string, number>;
  isUploading: boolean;
  totalStorageUsed: number;
  storageLimit: number;
}

const initialAssetsState: AssetsState = {
  assets: [],
  folders: [],
  selectedIds: [],
  currentFolderId: null,
  viewMode: 'grid',
  sortBy: 'date',
  sortDirection: 'desc',
  searchQuery: '',
  filterType: null,
  uploadProgress: {},
  isUploading: false,
  totalStorageUsed: 0,
  storageLimit: 1073741824, // 1GB
};

export const assetsSlice = createSlice({
  name: 'assets',
  initialState: initialAssetsState,
  reducers: {
    addAsset(state, action: PayloadAction<Asset>) {
      state.assets.push(action.payload);
      state.totalStorageUsed += action.payload.size;
    },
    removeAsset(state, action: PayloadAction<string>) {
      const asset = state.assets.find(a => a.id === action.payload);
      if (asset) {
        state.totalStorageUsed -= asset.size;
        state.assets = state.assets.filter(a => a.id !== action.payload);
        state.selectedIds = state.selectedIds.filter(id => id !== action.payload);
      }
    },
    updateAsset(state, action: PayloadAction<{ id: string; updates: Partial<Asset> }>) {
      const asset = state.assets.find(a => a.id === action.payload.id);
      if (asset) Object.assign(asset, action.payload.updates);
    },
    addFolder(state, action: PayloadAction<AssetFolder>) {
      state.folders.push(action.payload);
    },
    removeFolder(state, action: PayloadAction<string>) {
      state.folders = state.folders.filter(f => f.id !== action.payload);
    },
    setCurrentFolder(state, action: PayloadAction<string | null>) {
      state.currentFolderId = action.payload;
    },
    selectAsset(state, action: PayloadAction<string>) {
      if (!state.selectedIds.includes(action.payload)) {
        state.selectedIds.push(action.payload);
      }
    },
    deselectAsset(state, action: PayloadAction<string>) {
      state.selectedIds = state.selectedIds.filter(id => id !== action.payload);
    },
    toggleAssetSelection(state, action: PayloadAction<string>) {
      const idx = state.selectedIds.indexOf(action.payload);
      if (idx >= 0) state.selectedIds.splice(idx, 1);
      else state.selectedIds.push(action.payload);
    },
    selectAll(state) {
      state.selectedIds = state.assets.map(a => a.id);
    },
    deselectAll(state) {
      state.selectedIds = [];
    },
    setViewMode(state, action: PayloadAction<'grid' | 'list'>) {
      state.viewMode = action.payload;
    },
    setSortBy(state, action: PayloadAction<AssetsState['sortBy']>) {
      state.sortBy = action.payload;
    },
    toggleSortDirection(state) {
      state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setFilterType(state, action: PayloadAction<string | null>) {
      state.filterType = action.payload;
    },
    setUploadProgress(state, action: PayloadAction<{ id: string; progress: number }>) {
      state.uploadProgress[action.payload.id] = action.payload.progress;
      state.isUploading = Object.values(state.uploadProgress).some(p => p < 100);
    },
    clearUploadProgress(state, action: PayloadAction<string>) {
      delete state.uploadProgress[action.payload];
      state.isUploading = Object.values(state.uploadProgress).some(p => p < 100);
    },
    addTag(state, action: PayloadAction<{ assetId: string; tag: string }>) {
      const asset = state.assets.find(a => a.id === action.payload.assetId);
      if (asset && !asset.tags.includes(action.payload.tag)) {
        asset.tags.push(action.payload.tag);
      }
    },
    removeTag(state, action: PayloadAction<{ assetId: string; tag: string }>) {
      const asset = state.assets.find(a => a.id === action.payload.assetId);
      if (asset) {
        asset.tags = asset.tags.filter(t => t !== action.payload.tag);
      }
    },
    moveToFolder(state, action: PayloadAction<{ assetIds: string[]; folderId: string | undefined }>) {
      for (const id of action.payload.assetIds) {
        const asset = state.assets.find(a => a.id === id);
        if (asset) asset.folderId = action.payload.folderId;
      }
    },
  },
});

export const assetsActions = assetsSlice.actions;
