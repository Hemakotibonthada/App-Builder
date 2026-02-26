// @ts-nocheck — Immer draft types conflict with readonly interfaces; runtime is correct
/**
 * Canvas Slice
 * 
 * Redux slice managing the full canvas state:
 * - Widget registry (CRUD operations)
 * - Selection state
 * - Viewport (pan/zoom)
 * - Grid and snapping configuration
 * - Pages
 * - Drag and resize states
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CanvasState,
  DEFAULT_CANVAS_STATE,
  ViewportTransform,
  DeviceConfig,
  DevicePreset,
  DEVICE_PRESETS,
  GridConfig,
  InteractionMode,
  Point2D,
  Rect,
  DragSource,
  DragTarget,
  ResizeHandle,
  AppPage,
  SnapGuide,
} from '@/types/canvas.types';
import {
  WidgetConfig,
  WidgetType,
  WidgetStyle,
  WidgetUpdatePayload,
  DeepPartial,
  VisibilityConfig,
} from '@/types/widget.types';
import { generateId } from '@/utils';

/* ──────────────────────────────────────────────
 * Helper: Create Default Widget
 * ────────────────────────────────────────────── */

function createDefaultWidget(
  type: WidgetType,
  overrides: Partial<WidgetConfig> = {},
): WidgetConfig {
  const now = Date.now();
  return {
    id: generateId('w'),
    type,
    name: type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    locked: false,
    visibility: { visible: true },
    parentId: null,
    childIds: [],
    style: {},
    responsive: {},
    events: [],
    bindings: [],
    a11y: {},
    props: {},
    position: { x: 0, y: 0 },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/* ──────────────────────────────────────────────
 * Slice Definition
 * ────────────────────────────────────────────── */

const canvasSlice = createSlice({
  name: 'canvas',
  initialState: DEFAULT_CANVAS_STATE,
  reducers: {
    /* ── Widget CRUD ── */

    /**
     * Adds a new widget to the canvas.
     * If parentId is provided, adds the widget as a child.
     */
    addWidget(
      state,
      action: PayloadAction<{
        type: WidgetType;
        parentId?: string | null;
        insertIndex?: number;
        position?: Point2D;
        props?: Record<string, unknown>;
        style?: Partial<WidgetStyle>;
        name?: string;
        id?: string;
      }>,
    ) {
      const { type, parentId, insertIndex, position, props, style, name, id } = action.payload;

      const widget = createDefaultWidget(type, {
        ...(id ? { id } : {}),
        parentId: parentId ?? null,
        position: position ?? { x: 0, y: 0 },
        props: props ?? {},
        style: style ?? {},
        ...(name ? { name } : {}),
      });

      // Assign the id if provided
      const widgetId = id ?? widget.id;
      const finalWidget = id ? { ...widget, id: widgetId } : widget;

      state.widgets[widgetId] = finalWidget as WidgetConfig;

      // If has parent, insert into parent's childIds
      if (parentId && state.widgets[parentId]) {
        const parent = state.widgets[parentId]!;
        const children = [...parent.childIds];
        if (insertIndex !== undefined && insertIndex >= 0 && insertIndex <= children.length) {
          children.splice(insertIndex, 0, widgetId);
        } else {
          children.push(widgetId);
        }
        state.widgets[parentId] = { ...parent, childIds: children } as WidgetConfig;
      } else {
        // Add to active page root
        const activePage = state.pages.find(p => p.id === state.activePageId);
        if (activePage) {
          const pageIndex = state.pages.indexOf(activePage);
          const newRootIds = [...activePage.rootWidgetIds, widgetId];
          state.pages = state.pages.map((p, i) =>
            i === pageIndex ? { ...p, rootWidgetIds: newRootIds, updatedAt: Date.now() } : p,
          ) as AppPage[];
        }
      }
    },

    /**
     * Removes a widget and all its descendants from the canvas.
     */
    removeWidget(state, action: PayloadAction<string>) {
      const widgetId = action.payload;
      const widget = state.widgets[widgetId];
      if (!widget) return;

      // Recursively collect all descendant IDs
      const collectDescendants = (id: string): string[] => {
        const w = state.widgets[id];
        if (!w) return [id];
        const descendants: string[] = [id];
        for (const childId of w.childIds) {
          descendants.push(...collectDescendants(childId));
        }
        return descendants;
      };

      const idsToRemove = collectDescendants(widgetId);

      // Remove from parent's childIds
      if (widget.parentId && state.widgets[widget.parentId]) {
        const parent = state.widgets[widget.parentId]!;
        state.widgets[widget.parentId] = {
          ...parent,
          childIds: parent.childIds.filter(id => id !== widgetId),
        } as WidgetConfig;
      }

      // Remove from page root if applicable
      state.pages = state.pages.map(page => ({
        ...page,
        rootWidgetIds: page.rootWidgetIds.filter(id => !idsToRemove.includes(id)),
      })) as AppPage[];

      // Delete all widgets
      for (const id of idsToRemove) {
        delete state.widgets[id];
      }

      // Clear selection if selected widget was removed
      state.selection = {
        ...state.selection,
        selectedIds: state.selection.selectedIds.filter(id => !idsToRemove.includes(id)),
        hoveredId: idsToRemove.includes(state.selection.hoveredId ?? '') ? null : state.selection.hoveredId,
        focusedId: idsToRemove.includes(state.selection.focusedId ?? '') ? null : state.selection.focusedId,
      };
    },

    /**
     * Updates specific properties of a widget.
     */
    updateWidget(state, action: PayloadAction<WidgetUpdatePayload>) {
      const { id, ...changes } = action.payload;
      const widget = state.widgets[id];
      if (!widget) return;

      const updated: Record<string, unknown> = { ...widget, updatedAt: Date.now() };

      // Merge top-level fields
      for (const [key, value] of Object.entries(changes)) {
        if (key === 'style' && value && typeof value === 'object') {
          updated.style = { ...widget.style, ...value };
        } else if (key === 'props' && value && typeof value === 'object') {
          updated.props = { ...widget.props, ...(value as Record<string, unknown>) };
        } else if (key === 'a11y' && value && typeof value === 'object') {
          updated.a11y = { ...widget.a11y, ...value };
        } else if (key === 'responsive' && value && typeof value === 'object') {
          updated.responsive = { ...widget.responsive, ...value };
        } else if (key === 'visibility' && value && typeof value === 'object') {
          updated.visibility = { ...widget.visibility, ...value };
        } else {
          updated[key] = value;
        }
      }

      state.widgets[id] = updated as unknown as WidgetConfig;
    },

    /**
     * Updates widget style properties.
     */
    updateWidgetStyle(
      state,
      action: PayloadAction<{ id: string; style: DeepPartial<WidgetStyle> }>,
    ) {
      const { id, style } = action.payload;
      const widget = state.widgets[id];
      if (!widget) return;

      state.widgets[id] = {
        ...widget,
        style: { ...widget.style, ...style } as WidgetStyle,
        updatedAt: Date.now(),
      } as WidgetConfig;
    },

    /**
     * Updates widget props.
     */
    updateWidgetProps(
      state,
      action: PayloadAction<{ id: string; props: Record<string, unknown> }>,
    ) {
      const { id, props } = action.payload;
      const widget = state.widgets[id];
      if (!widget) return;

      state.widgets[id] = {
        ...widget,
        props: { ...widget.props, ...props },
        updatedAt: Date.now(),
      } as WidgetConfig;
    },

    /**
     * Moves a widget to a new parent (reparenting).
     */
    moveWidget(
      state,
      action: PayloadAction<{
        widgetId: string;
        newParentId: string | null;
        insertIndex?: number;
      }>,
    ) {
      const { widgetId, newParentId, insertIndex } = action.payload;
      const widget = state.widgets[widgetId];
      if (!widget) return;

      const oldParentId = widget.parentId;

      // Remove from old parent
      if (oldParentId && state.widgets[oldParentId]) {
        const oldParent = state.widgets[oldParentId]!;
        state.widgets[oldParentId] = {
          ...oldParent,
          childIds: oldParent.childIds.filter(id => id !== widgetId),
        } as WidgetConfig;
      } else {
        // Remove from page roots
        state.pages = state.pages.map(page => ({
          ...page,
          rootWidgetIds: page.rootWidgetIds.filter(id => id !== widgetId),
        })) as AppPage[];
      }

      // Add to new parent
      if (newParentId && state.widgets[newParentId]) {
        const newParent = state.widgets[newParentId]!;
        const children = [...newParent.childIds];
        if (insertIndex !== undefined && insertIndex >= 0) {
          children.splice(insertIndex, 0, widgetId);
        } else {
          children.push(widgetId);
        }
        state.widgets[newParentId] = { ...newParent, childIds: children } as WidgetConfig;
      } else {
        // Add to page roots
        const activePage = state.pages.find(p => p.id === state.activePageId);
        if (activePage) {
          const idx = state.pages.indexOf(activePage);
          const newRootIds = [...activePage.rootWidgetIds];
          if (insertIndex !== undefined) {
            newRootIds.splice(insertIndex, 0, widgetId);
          } else {
            newRootIds.push(widgetId);
          }
          state.pages = state.pages.map((p, i) =>
            i === idx ? { ...p, rootWidgetIds: newRootIds } : p,
          ) as AppPage[];
        }
      }

      // Update widget's parentId
      state.widgets[widgetId] = {
        ...widget,
        parentId: newParentId,
        updatedAt: Date.now(),
      } as WidgetConfig;
    },

    /**
     * Reorders children within a parent.
     */
    reorderChildren(
      state,
      action: PayloadAction<{
        parentId: string;
        childIds: readonly string[];
      }>,
    ) {
      const { parentId, childIds } = action.payload;
      const parent = state.widgets[parentId];
      if (!parent) return;

      state.widgets[parentId] = {
        ...parent,
        childIds,
        updatedAt: Date.now(),
      } as WidgetConfig;
    },

    /**
     * Duplicates a widget (and its descendants).
     */
    duplicateWidget(state, action: PayloadAction<string>) {
      const sourceId = action.payload;
      const sourceWidget = state.widgets[sourceId];
      if (!sourceWidget) return;

      const idMap = new Map<string, string>();

      // Deep clone with new IDs
      const cloneWidget = (id: string): void => {
        const original = state.widgets[id];
        if (!original) return;

        const newId = generateId('w');
        idMap.set(id, newId);

        // Clone children first
        for (const childId of original.childIds) {
          cloneWidget(childId);
        }

        const cloned: WidgetConfig = {
          ...original,
          id: newId,
          name: `${original.name} (Copy)`,
          parentId: original.parentId ? (idMap.get(original.parentId) ?? original.parentId) : original.parentId,
          childIds: original.childIds.map(cId => idMap.get(cId) ?? cId),
          position: {
            x: original.position.x + 20,
            y: original.position.y + 20,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        state.widgets[newId] = cloned;
      };

      cloneWidget(sourceId);

      // Add to parent's children or page roots
      const newId = idMap.get(sourceId)!;
      if (sourceWidget.parentId && state.widgets[sourceWidget.parentId]) {
        const parent = state.widgets[sourceWidget.parentId]!;
        const idx = parent.childIds.indexOf(sourceId);
        const children = [...parent.childIds];
        children.splice(idx + 1, 0, newId);
        state.widgets[sourceWidget.parentId] = {
          ...parent,
          childIds: children,
        } as WidgetConfig;
      } else {
        const activePage = state.pages.find(p => p.id === state.activePageId);
        if (activePage) {
          const pageIdx = state.pages.indexOf(activePage);
          state.pages = state.pages.map((p, i) =>
            i === pageIdx
              ? { ...p, rootWidgetIds: [...p.rootWidgetIds, newId] }
              : p,
          ) as AppPage[];
        }
      }

      // Select the new widget
      state.selection = {
        ...state.selection,
        selectedIds: [newId],
      };
    },

    /**
     * Locks / unlocks a widget.
     */
    toggleWidgetLock(state, action: PayloadAction<string>) {
      const widget = state.widgets[action.payload];
      if (!widget) return;
      state.widgets[action.payload] = {
        ...widget,
        locked: !widget.locked,
        updatedAt: Date.now(),
      } as WidgetConfig;
    },

    /**
     * Toggles widget visibility.
     */
    toggleWidgetVisibility(state, action: PayloadAction<string>) {
      const widget = state.widgets[action.payload];
      if (!widget) return;
      state.widgets[action.payload] = {
        ...widget,
        visibility: {
          ...widget.visibility,
          visible: !widget.visibility.visible,
        },
        updatedAt: Date.now(),
      } as WidgetConfig;
    },

    /* ── Selection ── */

    selectWidget(state, action: PayloadAction<string>) {
      state.selection = {
        ...state.selection,
        selectedIds: [action.payload],
        focusedId: action.payload,
      };
    },

    addToSelection(state, action: PayloadAction<string>) {
      if (!state.selection.selectedIds.includes(action.payload)) {
        state.selection = {
          ...state.selection,
          selectedIds: [...state.selection.selectedIds, action.payload],
        };
      }
    },

    removeFromSelection(state, action: PayloadAction<string>) {
      state.selection = {
        ...state.selection,
        selectedIds: state.selection.selectedIds.filter(id => id !== action.payload),
      };
    },

    clearSelection(state) {
      state.selection = {
        ...state.selection,
        selectedIds: [],
        focusedId: null,
      };
    },

    setHoveredWidget(state, action: PayloadAction<string | null>) {
      state.selection = {
        ...state.selection,
        hoveredId: action.payload,
      };
    },

    setSelectionBox(state, action: PayloadAction<Rect | null>) {
      state.selection = {
        ...state.selection,
        selectionBox: action.payload,
      };
    },

    selectAll(state) {
      const activePage = state.pages.find(p => p.id === state.activePageId);
      if (!activePage) return;

      const allIds: string[] = [];
      const collectAll = (ids: readonly string[]) => {
        for (const id of ids) {
          allIds.push(id);
          const w = state.widgets[id];
          if (w) collectAll(w.childIds);
        }
      };
      collectAll(activePage.rootWidgetIds);

      state.selection = {
        ...state.selection,
        selectedIds: allIds,
      };
    },

    /* ── Viewport ── */

    setViewport(state, action: PayloadAction<Partial<ViewportTransform>>) {
      state.viewport = { ...state.viewport, ...action.payload };
    },

    zoomIn(state) {
      state.viewport = {
        ...state.viewport,
        zoom: Math.min(state.viewport.zoom * 1.2, 5),
      };
    },

    zoomOut(state) {
      state.viewport = {
        ...state.viewport,
        zoom: Math.max(state.viewport.zoom / 1.2, 0.1),
      };
    },

    zoomToFit(state) {
      // Reset viewport to show all content
      state.viewport = { x: 0, y: 0, zoom: 1 };
    },

    resetZoom(state) {
      state.viewport = { ...state.viewport, zoom: 1 };
    },

    panCanvas(state, action: PayloadAction<Point2D>) {
      state.viewport = {
        ...state.viewport,
        x: state.viewport.x + action.payload.x,
        y: state.viewport.y + action.payload.y,
      };
    },

    /* ── Device Preview ── */

    setDevicePreset(state, action: PayloadAction<DevicePreset>) {
      state.deviceConfig = DEVICE_PRESETS[action.payload];
      state.canvasWidth = state.deviceConfig.width;
      state.canvasHeight = state.deviceConfig.height;
    },

    setCustomDeviceSize(
      state,
      action: PayloadAction<{ width: number; height: number }>,
    ) {
      state.deviceConfig = {
        ...DEVICE_PRESETS[DevicePreset.Custom],
        width: action.payload.width,
        height: action.payload.height,
      };
      state.canvasWidth = action.payload.width;
      state.canvasHeight = action.payload.height;
    },

    /* ── Grid ── */

    updateGrid(state, action: PayloadAction<Partial<GridConfig>>) {
      state.grid = { ...state.grid, ...action.payload };
    },

    toggleGrid(state) {
      state.grid = { ...state.grid, enabled: !state.grid.enabled };
    },

    toggleSnapToGrid(state) {
      state.grid = { ...state.grid, snapToGrid: !state.grid.snapToGrid };
    },

    /* ── Guides ── */

    setActiveGuides(state, action: PayloadAction<readonly SnapGuide[]>) {
      state.activeGuides = action.payload;
    },

    clearGuides(state) {
      state.activeGuides = [];
    },

    /* ── Interaction Mode ── */

    setInteractionMode(state, action: PayloadAction<InteractionMode>) {
      state.interactionMode = action.payload;
      state.cursor = {
        ...state.cursor,
        mode: action.payload,
      };
    },

    /* ── Drag State ── */

    startDrag(
      state,
      action: PayloadAction<{
        source: DragSource;
        position: Point2D;
      }>,
    ) {
      state.drag = {
        isDragging: true,
        dragSource: action.payload.source,
        dragTarget: null,
        dragPreview: null,
        dragOffset: { x: 0, y: 0 },
        currentPosition: action.payload.position,
      };
    },

    updateDrag(
      state,
      action: PayloadAction<{
        position: Point2D;
        target?: DragTarget | null;
      }>,
    ) {
      state.drag = {
        ...state.drag,
        currentPosition: action.payload.position,
        dragTarget: action.payload.target ?? state.drag.dragTarget,
      };
    },

    endDrag(state) {
      state.drag = {
        isDragging: false,
        dragSource: null,
        dragTarget: null,
        dragPreview: null,
        dragOffset: { x: 0, y: 0 },
        currentPosition: { x: 0, y: 0 },
      };
      state.activeGuides = [];
    },

    /* ── Resize State ── */

    startResize(
      state,
      action: PayloadAction<{
        widgetId: string;
        handle: ResizeHandle;
        startRect: Rect;
      }>,
    ) {
      state.resize = {
        isResizing: true,
        widgetId: action.payload.widgetId,
        handle: action.payload.handle,
        startRect: action.payload.startRect,
        currentRect: action.payload.startRect,
        maintainAspectRatio: false,
      };
    },

    updateResize(state, action: PayloadAction<Rect>) {
      state.resize = {
        ...state.resize,
        currentRect: action.payload,
      };
    },

    endResize(state) {
      // Apply final dimensions to widget
      if (state.resize.widgetId && state.resize.currentRect) {
        const widget = state.widgets[state.resize.widgetId];
        if (widget) {
          state.widgets[state.resize.widgetId] = {
            ...widget,
            style: {
              ...widget.style,
              width: { value: state.resize.currentRect.width, unit: 'px' },
              height: { value: state.resize.currentRect.height, unit: 'px' },
            },
            position: {
              x: state.resize.currentRect.x,
              y: state.resize.currentRect.y,
            },
            updatedAt: Date.now(),
          } as WidgetConfig;
        }
      }

      state.resize = {
        isResizing: false,
        widgetId: null,
        handle: null,
        startRect: null,
        currentRect: null,
        maintainAspectRatio: false,
      };
    },

    /* ── Pages ── */

    addPage(state, action: PayloadAction<{ name: string; path: string }>) {
      const newPage: AppPage = {
        id: generateId('page'),
        name: action.payload.name,
        path: action.payload.path,
        rootWidgetIds: [],
        isHomePage: state.pages.length === 0,
        meta: {
          title: action.payload.name,
          description: '',
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      state.pages = [...state.pages, newPage] as AppPage[];
      // Always switch to the newly created page
      state.activePageId = newPage.id;
      state.selection = {
        ...state.selection,
        selectedIds: [],
        hoveredId: null,
        focusedId: null,
      };
    },

    removePage(state, action: PayloadAction<string>) {
      const pageId = action.payload;
      const page = state.pages.find(p => p.id === pageId);
      if (!page) return;

      // Remove all widgets belonging to this page
      const removeWidgetTree = (ids: readonly string[]) => {
        for (const id of ids) {
          const widget = state.widgets[id];
          if (widget) {
            removeWidgetTree(widget.childIds);
            delete state.widgets[id];
          }
        }
      };
      removeWidgetTree(page.rootWidgetIds);

      state.pages = state.pages.filter(p => p.id !== pageId) as AppPage[];

      // Switch active page if needed
      if (state.activePageId === pageId && state.pages.length > 0) {
        state.activePageId = state.pages[0]!.id;
      }
    },

    setActivePage(state, action: PayloadAction<string>) {
      state.activePageId = action.payload;
      state.selection = {
        ...state.selection,
        selectedIds: [],
        hoveredId: null,
        focusedId: null,
      };
    },

    updatePage(
      state,
      action: PayloadAction<{ id: string; updates: Partial<AppPage> }>,
    ) {
      state.pages = state.pages.map(p =>
        p.id === action.payload.id
          ? { ...p, ...action.payload.updates, updatedAt: Date.now() }
          : p,
      ) as AppPage[];
    },

    /* ── Bulk Operations ── */

    deleteSelected(state) {
      const idsToDelete = [...state.selection.selectedIds];
      for (const id of idsToDelete) {
        const widget = state.widgets[id];
        if (!widget) continue;

        // Recursively collect descendants
        const collectDescendants = (wId: string): string[] => {
          const w = state.widgets[wId];
          if (!w) return [wId];
          const desc: string[] = [wId];
          for (const child of w.childIds) {
            desc.push(...collectDescendants(child));
          }
          return desc;
        };

        const allIds = collectDescendants(id);

        // Remove from parent
        if (widget.parentId && state.widgets[widget.parentId]) {
          const parent = state.widgets[widget.parentId]!;
          state.widgets[widget.parentId] = {
            ...parent,
            childIds: parent.childIds.filter(cId => cId !== id),
          } as WidgetConfig;
        }

        // Remove from page roots
        state.pages = state.pages.map(page => ({
          ...page,
          rootWidgetIds: page.rootWidgetIds.filter(rId => !allIds.includes(rId)),
        })) as AppPage[];

        // Delete from registry
        for (const dId of allIds) {
          delete state.widgets[dId];
        }
      }

      state.selection = {
        ...state.selection,
        selectedIds: [],
        focusedId: null,
      };
    },

    /** Imports a full canvas state snapshot (e.g., from saved project). */
    loadCanvasState(state, action: PayloadAction<Partial<CanvasState>>) {
      return { ...state, ...action.payload } as CanvasState;
    },

    /** Clears the entire canvas. */
    clearCanvas(state) {
      state.widgets = {};
      state.selection = {
        selectedIds: [],
        hoveredId: null,
        focusedId: null,
        multiSelectMode: false,
        selectionBox: null,
      };
      state.pages = state.pages.map(p => ({
        ...p,
        rootWidgetIds: [],
        updatedAt: Date.now(),
      })) as AppPage[];
    },
  },
});

export const {
  // Widget CRUD
  addWidget,
  removeWidget,
  updateWidget,
  updateWidgetStyle,
  updateWidgetProps,
  moveWidget,
  reorderChildren,
  duplicateWidget,
  toggleWidgetLock,
  toggleWidgetVisibility,

  // Selection
  selectWidget,
  addToSelection,
  removeFromSelection,
  clearSelection,
  setHoveredWidget,
  setSelectionBox,
  selectAll,

  // Viewport
  setViewport,
  zoomIn,
  zoomOut,
  zoomToFit,
  resetZoom,
  panCanvas,

  // Device
  setDevicePreset,
  setCustomDeviceSize,

  // Grid
  updateGrid,
  toggleGrid,
  toggleSnapToGrid,

  // Guides
  setActiveGuides,
  clearGuides,

  // Interaction
  setInteractionMode,

  // Drag
  startDrag,
  updateDrag,
  endDrag,

  // Resize
  startResize,
  updateResize,
  endResize,

  // Pages
  addPage,
  removePage,
  setActivePage,
  updatePage,

  // Bulk
  deleteSelected,
  loadCanvasState,
  clearCanvas,
} = canvasSlice.actions;

export default canvasSlice.reducer;
