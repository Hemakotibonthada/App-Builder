/**
 * UI Slice
 * 
 * Manages all UI state for the builder interface:
 * - Panel visibility and sizes
 * - Modal states
 * - Sidebar tabs
 * - Notifications
 * - Theme preferences
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { generateId } from '@/utils';

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export enum SidebarTab {
  Components = 'components',
  Templates = 'templates',
  Layers = 'layers',
  Pages = 'pages',
  Data = 'data',
  Assets = 'assets',
  Code = 'code',
  Settings = 'settings',
}

export enum RightPanelTab {
  Properties = 'properties',
  Style = 'style',
  Events = 'events',
  Animation = 'animation',
  Responsive = 'responsive',
}

export enum ModalType {
  None = 'none',
  Build = 'build',
  Export = 'export',
  Settings = 'settings',
  NewProject = 'new-project',
  OpenProject = 'open-project',
  ApiEditor = 'api-editor',
  VariableEditor = 'variable-editor',
  CodeEditor = 'code-editor',
  AssetManager = 'asset-manager',
  ThemeEditor = 'theme-editor',
  Shortcuts = 'shortcuts',
  Preview = 'preview',
  Confirm = 'confirm',
}

export interface Notification {
  readonly id: string;
  readonly type: 'info' | 'success' | 'warning' | 'error';
  readonly title: string;
  readonly message: string;
  readonly duration: number; // ms, 0 = persistent
  readonly timestamp: number;
  readonly dismissible: boolean;
  readonly action?: {
    label: string;
    callback: string; // Action identifier
  };
}

export interface ConfirmDialogConfig {
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly variant: 'danger' | 'warning' | 'info';
  readonly onConfirmAction: string;
}

export interface UIState {
  // Panels
  readonly leftPanelOpen: boolean;
  readonly leftPanelWidth: number;
  readonly leftPanelTab: SidebarTab;
  readonly rightPanelOpen: boolean;
  readonly rightPanelWidth: number;
  readonly rightPanelTab: RightPanelTab;
  readonly bottomPanelOpen: boolean;
  readonly bottomPanelHeight: number;

  // Modals
  readonly activeModal: ModalType;
  readonly modalData: Record<string, unknown>;

  // Confirm dialog
  readonly confirmDialog: ConfirmDialogConfig | null;

  // Notifications
  readonly notifications: readonly Notification[];

  // Search
  readonly searchOpen: boolean;
  readonly searchQuery: string;
  readonly commandPaletteOpen: boolean;

  // Preview
  readonly previewMode: boolean;
  readonly previewDevice: string;

  // Theme
  readonly darkMode: boolean;

  // Builder state
  readonly showGrid: boolean;
  readonly showRulers: boolean;
  readonly showGuides: boolean;
  readonly showOutlines: boolean;
  readonly showSpacing: boolean;

  // Misc
  readonly isFullscreen: boolean;
  readonly tooltipsEnabled: boolean;
  readonly animationsEnabled: boolean;
  readonly autoSave: boolean;
  readonly autoSaveInterval: number; // ms
}

const initialState: UIState = {
  leftPanelOpen: true,
  leftPanelWidth: 280,
  leftPanelTab: SidebarTab.Components,
  rightPanelOpen: true,
  rightPanelWidth: 300,
  rightPanelTab: RightPanelTab.Properties,
  bottomPanelOpen: false,
  bottomPanelHeight: 200,
  activeModal: ModalType.None,
  modalData: {},
  confirmDialog: null,
  notifications: [],
  searchOpen: false,
  searchQuery: '',
  commandPaletteOpen: false,
  previewMode: false,
  previewDevice: 'desktop',
  darkMode: true,
  showGrid: true,
  showRulers: true,
  showGuides: true,
  showOutlines: true,
  showSpacing: false,
  isFullscreen: false,
  tooltipsEnabled: true,
  animationsEnabled: true,
  autoSave: true,
  autoSaveInterval: 30000,
};

/* ──────────────────────────────────────────────
 * Slice
 * ────────────────────────────────────────────── */

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /* ── Left Panel ── */
    toggleLeftPanel(state) {
      state.leftPanelOpen = !state.leftPanelOpen;
    },
    setLeftPanelOpen(state, action: PayloadAction<boolean>) {
      state.leftPanelOpen = action.payload;
    },
    setLeftPanelWidth(state, action: PayloadAction<number>) {
      state.leftPanelWidth = Math.max(200, Math.min(500, action.payload));
    },
    setLeftPanelTab(state, action: PayloadAction<SidebarTab>) {
      state.leftPanelTab = action.payload;
      if (!state.leftPanelOpen) {
        state.leftPanelOpen = true;
      }
    },

    /* ── Right Panel ── */
    toggleRightPanel(state) {
      state.rightPanelOpen = !state.rightPanelOpen;
    },
    setRightPanelOpen(state, action: PayloadAction<boolean>) {
      state.rightPanelOpen = action.payload;
    },
    setRightPanelWidth(state, action: PayloadAction<number>) {
      state.rightPanelWidth = Math.max(200, Math.min(500, action.payload));
    },
    setRightPanelTab(state, action: PayloadAction<RightPanelTab>) {
      state.rightPanelTab = action.payload;
      if (!state.rightPanelOpen) {
        state.rightPanelOpen = true;
      }
    },

    /* ── Bottom Panel ── */
    toggleBottomPanel(state) {
      state.bottomPanelOpen = !state.bottomPanelOpen;
    },
    setBottomPanelHeight(state, action: PayloadAction<number>) {
      state.bottomPanelHeight = Math.max(100, Math.min(500, action.payload));
    },

    /* ── Modals ── */
    openModal(
      state,
      action: PayloadAction<{
        type: ModalType;
        data?: Record<string, unknown>;
      }>,
    ) {
      state.activeModal = action.payload.type;
      state.modalData = action.payload.data ?? {};
    },
    closeModal(state) {
      state.activeModal = ModalType.None;
      state.modalData = {};
    },

    /* ── Confirm Dialog ── */
    showConfirmDialog(state, action: PayloadAction<ConfirmDialogConfig>) {
      state.confirmDialog = action.payload;
      state.activeModal = ModalType.Confirm;
    },
    hideConfirmDialog(state) {
      state.confirmDialog = null;
      if (state.activeModal === ModalType.Confirm) {
        state.activeModal = ModalType.None;
      }
    },

    /* ── Notifications ── */
    addNotification(
      state,
      action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>,
    ) {
      const notification: Notification = {
        ...action.payload,
        id: generateId('notif'),
        timestamp: Date.now(),
      };
      state.notifications = [...state.notifications, notification];

      // Keep max 10 notifications
      if (state.notifications.length > 10) {
        state.notifications = state.notifications.slice(-10);
      }
    },
    removeNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter(
        n => n.id !== action.payload,
      );
    },
    clearNotifications(state) {
      state.notifications = [];
    },

    /* ── Search ── */
    toggleSearch(state) {
      state.searchOpen = !state.searchOpen;
      if (state.searchOpen) {
        state.searchQuery = '';
      }
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    closeSearch(state) {
      state.searchOpen = false;
      state.searchQuery = '';
    },

    /* ── Command Palette ── */
    toggleCommandPalette(state) {
      state.commandPaletteOpen = !state.commandPaletteOpen;
    },
    closeCommandPalette(state) {
      state.commandPaletteOpen = false;
    },

    /* ── Preview ── */
    togglePreviewMode(state) {
      state.previewMode = !state.previewMode;
    },
    setPreviewDevice(state, action: PayloadAction<string>) {
      state.previewDevice = action.payload;
    },

    /* ── Theme ── */
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
    },
    setDarkMode(state, action: PayloadAction<boolean>) {
      state.darkMode = action.payload;
    },

    /* ── Canvas Display Options ── */
    toggleShowGrid(state) {
      state.showGrid = !state.showGrid;
    },
    toggleShowRulers(state) {
      state.showRulers = !state.showRulers;
    },
    toggleShowGuides(state) {
      state.showGuides = !state.showGuides;
    },
    toggleShowOutlines(state) {
      state.showOutlines = !state.showOutlines;
    },
    toggleShowSpacing(state) {
      state.showSpacing = !state.showSpacing;
    },

    /* ── Fullscreen ── */
    toggleFullscreen(state) {
      state.isFullscreen = !state.isFullscreen;
    },

    /* ── Settings ── */
    toggleAutoSave(state) {
      state.autoSave = !state.autoSave;
    },
    setAutoSaveInterval(state, action: PayloadAction<number>) {
      state.autoSaveInterval = Math.max(5000, action.payload);
    },
    toggleAnimations(state) {
      state.animationsEnabled = !state.animationsEnabled;
    },
    toggleTooltips(state) {
      state.tooltipsEnabled = !state.tooltipsEnabled;
    },
  },
});

export const {
  toggleLeftPanel,
  setLeftPanelOpen,
  setLeftPanelWidth,
  setLeftPanelTab,
  toggleRightPanel,
  setRightPanelOpen,
  setRightPanelWidth,
  setRightPanelTab,
  toggleBottomPanel,
  setBottomPanelHeight,
  openModal,
  closeModal,
  showConfirmDialog,
  hideConfirmDialog,
  addNotification,
  removeNotification,
  clearNotifications,
  toggleSearch,
  setSearchQuery,
  closeSearch,
  toggleCommandPalette,
  closeCommandPalette,
  togglePreviewMode,
  setPreviewDevice,
  toggleDarkMode,
  setDarkMode,
  toggleShowGrid,
  toggleShowRulers,
  toggleShowGuides,
  toggleShowOutlines,
  toggleShowSpacing,
  toggleFullscreen,
  toggleAutoSave,
  setAutoSaveInterval,
  toggleAnimations,
  toggleTooltips,
} = uiSlice.actions;

export default uiSlice.reducer;

/* ── Selectors ── */

export const selectLeftPanel = (state: { ui: UIState }) => ({
  open: state.ui.leftPanelOpen,
  width: state.ui.leftPanelWidth,
  tab: state.ui.leftPanelTab,
});

export const selectRightPanel = (state: { ui: UIState }) => ({
  open: state.ui.rightPanelOpen,
  width: state.ui.rightPanelWidth,
  tab: state.ui.rightPanelTab,
});

export const selectActiveModal = (state: { ui: UIState }) =>
  state.ui.activeModal;

export const selectNotifications = (state: { ui: UIState }) =>
  state.ui.notifications;

export const selectIsDarkMode = (state: { ui: UIState }) =>
  state.ui.darkMode;

export const selectPreviewMode = (state: { ui: UIState }) =>
  state.ui.previewMode;
