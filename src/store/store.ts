/**
 * Redux Store Configuration
 * 
 * Central store combining all slices with middleware setup.
 * Provides typed hooks for use throughout the application.
 */

import { configureStore, createSelector } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './authSlice';
import canvasReducer from './canvasSlice';
import historyReducer from './historySlice';
import projectReducer from './projectSlice';
import uiReducer from './uiSlice';

/* ──────────────────────────────────────────────
 * Store Configuration
 * ────────────────────────────────────────────── */

export const store = configureStore({
  reducer: {
    auth: authReducer,
    canvas: canvasReducer,
    history: historyReducer,
    project: projectReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in specific paths
        ignoredActions: [
          'ui/addNotification',
          'ui/showConfirmDialog',
        ],
        ignoredPaths: [
          'ui.notifications',
          'ui.confirmDialog',
        ],
      },
      immutableCheck: {
        // Increase limit for large canvas states
        warnAfter: 128,
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

/* ──────────────────────────────────────────────
 * Type Exports
 * ────────────────────────────────────────────── */

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/* ──────────────────────────────────────────────
 * Typed Hooks
 * ────────────────────────────────────────────── */

/**
 * Typed version of useDispatch for the app store.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed version of useSelector for the app store.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/* ──────────────────────────────────────────────
 * Cross-Slice Selectors
 * ────────────────────────────────────────────── */

/** Selects a widget by ID from the canvas */
export const selectWidgetById = (state: RootState, id: string) =>
  state.canvas.widgets[id] ?? null;

const EMPTY_ARRAY: readonly string[] = [];
const EMPTY_WIDGETS: readonly unknown[] = [];

/** Selects all widgets on the active page */
export const selectActivePageWidgets = createSelector(
  [(state: RootState) => state.canvas.pages, (state: RootState) => state.canvas.activePageId, (state: RootState) => state.canvas.widgets],
  (pages, activePageId, widgets) => {
    const activePage = pages.find(p => p.id === activePageId);
    if (!activePage) return EMPTY_WIDGETS;
    return activePage.rootWidgetIds
      .map(id => widgets[id])
      .filter(Boolean);
  },
);

/** Selects root widget IDs for the active page */
export const selectActivePageRootIds = createSelector(
  [(state: RootState) => state.canvas.pages, (state: RootState) => state.canvas.activePageId],
  (pages, activePageId): readonly string[] => {
    const activePage = pages.find(p => p.id === activePageId);
    return activePage?.rootWidgetIds ?? EMPTY_ARRAY;
  },
);

/** Selects children of a widget */
export const selectWidgetChildren = (state: RootState, parentId: string) => {
  const parent = state.canvas.widgets[parentId];
  if (!parent) return EMPTY_WIDGETS;
  return parent.childIds
    .map(id => state.canvas.widgets[id])
    .filter(Boolean);
};

/** Selects the currently selected widgets */
export const selectSelectedWidgets = createSelector(
  [(state: RootState) => state.canvas.selection.selectedIds, (state: RootState) => state.canvas.widgets],
  (selectedIds, widgets) => selectedIds.map(id => widgets[id]).filter(Boolean),
);

/** Selects the single selected widget (first if multiple) */
export const selectPrimarySelectedWidget = (state: RootState) => {
  const firstId = state.canvas.selection.selectedIds[0];
  return firstId ? state.canvas.widgets[firstId] ?? null : null;
};

/** Returns whether a specific widget is selected */
export const selectIsWidgetSelected = (state: RootState, id: string) =>
  state.canvas.selection.selectedIds.includes(id);

/** Selects the active page */
export const selectActivePage = (state: RootState) =>
  state.canvas.pages.find(p => p.id === state.canvas.activePageId) ?? null;

/** Selects all pages */
export const selectPages = (state: RootState) => state.canvas.pages;

/** Returns the widget tree for the active page (nested structure) */
export interface WidgetTreeNode {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly locked: boolean;
  readonly visible: boolean;
  readonly children: readonly WidgetTreeNode[];
  readonly depth: number;
}

export const selectWidgetTree = createSelector(
  [
    (state: RootState) => state.canvas.pages,
    (state: RootState) => state.canvas.activePageId,
    (state: RootState) => state.canvas.widgets,
  ],
  (pages, activePageId, widgets): readonly WidgetTreeNode[] => {
    const activePage = pages.find(p => p.id === activePageId);
    const rootIds = activePage?.rootWidgetIds ?? [];

    const buildNode = (id: string, depth: number): WidgetTreeNode | null => {
      const widget = widgets[id];
      if (!widget) return null;

      return {
        id: widget.id,
        name: widget.name,
        type: widget.type,
        locked: widget.locked,
        visible: widget.visibility.visible,
        children: widget.childIds
          .map(childId => buildNode(childId, depth + 1))
          .filter(Boolean) as WidgetTreeNode[],
        depth,
      };
    };

    return rootIds
      .map(id => buildNode(id, 0))
      .filter(Boolean) as WidgetTreeNode[];
  },
);
