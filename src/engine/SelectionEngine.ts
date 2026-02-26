/**
 * Selection Engine
 * 
 * Advanced selection management with support for:
 * 1. Single / multi-select with Shift/Ctrl modifiers
 * 2. Rubber-band (marquee) selection
 * 3. Selection groups
 * 4. Selection locking
 * 5. Selection filters by widget type
 * 6. Selection history (undo/redo selection changes)
 * 7. Selection events and callbacks
 * 8. Hit testing with tolerance
 * 9. Tab-order selection cycling
 * 10. Programmatic selection API
 */

import { WidgetConfig, WidgetType } from '@/types/widget.types';
import { Rect, Point2D } from '@/types/canvas.types';

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export interface SelectionState {
  readonly selectedIds: readonly string[];
  readonly hoveredId: string | null;
  readonly focusedId: string | null;
  readonly anchorId: string | null;
  readonly selectionRect: Rect | null;
  readonly isSelecting: boolean;
  readonly selectionMode: SelectionMode;
  readonly lockedIds: readonly string[];
  readonly groupedSelections: Record<string, readonly string[]>;
}

export type SelectionMode = 'single' | 'multi' | 'range' | 'group';

export interface SelectionEvent {
  readonly type: SelectionEventType;
  readonly widgetIds: readonly string[];
  readonly previousIds: readonly string[];
  readonly source: SelectionSource;
  readonly timestamp: number;
}

export type SelectionEventType =
  | 'select'
  | 'deselect'
  | 'toggle'
  | 'clear'
  | 'hover'
  | 'focus'
  | 'blur'
  | 'lock'
  | 'unlock'
  | 'group'
  | 'ungroup';

export type SelectionSource =
  | 'click'
  | 'marquee'
  | 'keyboard'
  | 'api'
  | 'context-menu'
  | 'double-click'
  | 'tab';

export type SelectionFilter = (widget: WidgetConfig) => boolean;

export type SelectionListener = (event: SelectionEvent) => void;

export interface HitTestResult {
  readonly widgetId: string;
  readonly distance: number;
  readonly isEdge: boolean;
  readonly edgeDirection: 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null;
  readonly depth: number;
}

export interface MarqueeConfig {
  readonly startPoint: Point2D;
  readonly endPoint: Point2D;
  readonly mode: 'intersect' | 'contain';
  readonly color: string;
  readonly opacity: number;
  readonly borderStyle: string;
}

/* ──────────────────────────────────────────────
 * Selection Engine
 * ────────────────────────────────────────────── */

export class SelectionEngine {
  private state: SelectionState;
  private listeners: Set<SelectionListener> = new Set();
  private history: SelectionState[] = [];
  private historyIndex: number = -1;
  private maxHistory: number = 50;
  private filters: Map<string, SelectionFilter> = new Map();
  private widgets: Record<string, WidgetConfig> = {};
  private hitTolerance: number = 4;

  constructor() {
    this.state = this.createInitialState();
  }

  /* ──────────────────────────────────────────
   * Public API - Selection
   * ────────────────────────────────────────── */

  /**
   * Select a single widget, replacing existing selection.
   */
  select(widgetId: string, source: SelectionSource = 'api'): void {
    if (this.isLocked(widgetId)) return;
    if (!this.passesFilters(widgetId)) return;

    const prev = [...this.state.selectedIds];
    this.pushHistory();
    this.state = {
      ...this.state,
      selectedIds: [widgetId],
      anchorId: widgetId,
      focusedId: widgetId,
    };
    this.emit({ type: 'select', widgetIds: [widgetId], previousIds: prev, source, timestamp: Date.now() });
  }

  /**
   * Add a widget to the current selection.
   */
  addToSelection(widgetId: string, source: SelectionSource = 'api'): void {
    if (this.isLocked(widgetId)) return;
    if (!this.passesFilters(widgetId)) return;
    if (this.isSelected(widgetId)) return;

    const prev = [...this.state.selectedIds];
    this.pushHistory();
    this.state = {
      ...this.state,
      selectedIds: [...this.state.selectedIds, widgetId],
      focusedId: widgetId,
    };
    this.emit({ type: 'select', widgetIds: [widgetId], previousIds: prev, source, timestamp: Date.now() });
  }

  /**
   * Remove a widget from the current selection.
   */
  removeFromSelection(widgetId: string, source: SelectionSource = 'api'): void {
    if (!this.isSelected(widgetId)) return;

    const prev = [...this.state.selectedIds];
    this.pushHistory();
    this.state = {
      ...this.state,
      selectedIds: this.state.selectedIds.filter(id => id !== widgetId),
      focusedId: this.state.focusedId === widgetId ? null : this.state.focusedId,
    };
    this.emit({ type: 'deselect', widgetIds: [widgetId], previousIds: prev, source, timestamp: Date.now() });
  }

  /**
   * Toggle selection of a widget.
   */
  toggleSelection(widgetId: string, source: SelectionSource = 'api'): void {
    if (this.isSelected(widgetId)) {
      this.removeFromSelection(widgetId, source);
    } else {
      this.addToSelection(widgetId, source);
    }
  }

  /**
   * Select multiple widgets at once.
   */
  selectMultiple(widgetIds: readonly string[], source: SelectionSource = 'api'): void {
    const valid = widgetIds.filter(id => !this.isLocked(id) && this.passesFilters(id));
    if (valid.length === 0) return;

    const prev = [...this.state.selectedIds];
    this.pushHistory();
    this.state = {
      ...this.state,
      selectedIds: valid,
      anchorId: valid[0],
      focusedId: valid[valid.length - 1],
    };
    this.emit({ type: 'select', widgetIds: valid, previousIds: prev, source, timestamp: Date.now() });
  }

  /**
   * Clear all selections.
   */
  clearSelection(source: SelectionSource = 'api'): void {
    if (this.state.selectedIds.length === 0) return;

    const prev = [...this.state.selectedIds];
    this.pushHistory();
    this.state = {
      ...this.state,
      selectedIds: [],
      anchorId: null,
      focusedId: null,
    };
    this.emit({ type: 'clear', widgetIds: [], previousIds: prev, source, timestamp: Date.now() });
  }

  /**
   * Select all widgets.
   */
  selectAll(source: SelectionSource = 'api'): void {
    const allIds = Object.keys(this.widgets).filter(
      id => !this.isLocked(id) && this.passesFilters(id),
    );
    this.selectMultiple(allIds, source);
  }

  /**
   * Invert the current selection.
   */
  invertSelection(source: SelectionSource = 'api'): void {
    const allIds = Object.keys(this.widgets);
    const selected = new Set(this.state.selectedIds);
    const inverted = allIds.filter(id => !selected.has(id) && !this.isLocked(id) && this.passesFilters(id));
    this.selectMultiple(inverted, source);
  }

  /* ──────────────────────────────────────────
   * Public API - Hover & Focus
   * ────────────────────────────────────────── */

  setHovered(widgetId: string | null): void {
    if (this.state.hoveredId === widgetId) return;
    this.state = { ...this.state, hoveredId: widgetId };
    this.emit({
      type: 'hover',
      widgetIds: widgetId ? [widgetId] : [],
      previousIds: this.state.hoveredId ? [this.state.hoveredId] : [],
      source: 'api',
      timestamp: Date.now(),
    });
  }

  setFocused(widgetId: string | null): void {
    if (this.state.focusedId === widgetId) return;
    const prevFocused = this.state.focusedId;
    this.state = { ...this.state, focusedId: widgetId };

    if (widgetId) {
      this.emit({ type: 'focus', widgetIds: [widgetId], previousIds: prevFocused ? [prevFocused] : [], source: 'api', timestamp: Date.now() });
    } else if (prevFocused) {
      this.emit({ type: 'blur', widgetIds: [], previousIds: [prevFocused], source: 'api', timestamp: Date.now() });
    }
  }

  /* ──────────────────────────────────────────
   * Public API - Locking
   * ────────────────────────────────────────── */

  lockWidget(widgetId: string): void {
    if (this.isLocked(widgetId)) return;
    this.state = {
      ...this.state,
      lockedIds: [...this.state.lockedIds, widgetId],
    };
    // Remove from selection if locked
    if (this.isSelected(widgetId)) {
      this.removeFromSelection(widgetId, 'api');
    }
    this.emit({ type: 'lock', widgetIds: [widgetId], previousIds: [], source: 'api', timestamp: Date.now() });
  }

  unlockWidget(widgetId: string): void {
    if (!this.isLocked(widgetId)) return;
    this.state = {
      ...this.state,
      lockedIds: this.state.lockedIds.filter(id => id !== widgetId),
    };
    this.emit({ type: 'unlock', widgetIds: [widgetId], previousIds: [], source: 'api', timestamp: Date.now() });
  }

  lockAll(): void {
    Object.keys(this.widgets).forEach(id => this.lockWidget(id));
  }

  unlockAll(): void {
    this.state = { ...this.state, lockedIds: [] };
  }

  /* ──────────────────────────────────────────
   * Public API - Groups
   * ────────────────────────────────────────── */

  createGroup(groupName: string, widgetIds: readonly string[]): void {
    this.state = {
      ...this.state,
      groupedSelections: {
        ...this.state.groupedSelections,
        [groupName]: widgetIds,
      },
    };
    this.emit({ type: 'group', widgetIds: [...widgetIds], previousIds: [], source: 'api', timestamp: Date.now() });
  }

  deleteGroup(groupName: string): void {
    const { [groupName]: removed, ...rest } = this.state.groupedSelections;
    this.state = {
      ...this.state,
      groupedSelections: rest,
    };
    if (removed) {
      this.emit({ type: 'ungroup', widgetIds: [...removed], previousIds: [], source: 'api', timestamp: Date.now() });
    }
  }

  selectGroup(groupName: string, source: SelectionSource = 'api'): void {
    const group = this.state.groupedSelections[groupName];
    if (group) {
      this.selectMultiple(group, source);
    }
  }

  getGroupNames(): readonly string[] {
    return Object.keys(this.state.groupedSelections);
  }

  /* ──────────────────────────────────────────
   * Public API - Marquee Selection
   * ────────────────────────────────────────── */

  startMarquee(point: Point2D): void {
    this.state = {
      ...this.state,
      isSelecting: true,
      selectionRect: { x: point.x, y: point.y, width: 0, height: 0 },
    };
  }

  updateMarquee(point: Point2D): void {
    if (!this.state.isSelecting || !this.state.selectionRect) return;

    const startX = this.state.selectionRect.x;
    const startY = this.state.selectionRect.y;

    this.state = {
      ...this.state,
      selectionRect: {
        x: Math.min(startX, point.x),
        y: Math.min(startY, point.y),
        width: Math.abs(point.x - startX),
        height: Math.abs(point.y - startY),
      },
    };
  }

  endMarquee(mode: 'intersect' | 'contain' = 'intersect'): readonly string[] {
    if (!this.state.selectionRect) return [];

    const rect = this.state.selectionRect;
    const selected = Object.values(this.widgets)
      .filter(w => {
        if (this.isLocked(w.id) || !this.passesFilters(w.id)) return false;
        const wRect = this.getWidgetRect(w);
        return mode === 'intersect'
          ? this.rectsIntersect(rect, wRect)
          : this.rectContains(rect, wRect);
      })
      .map(w => w.id);

    this.state = {
      ...this.state,
      isSelecting: false,
      selectionRect: null,
    };

    this.selectMultiple(selected, 'marquee');
    return selected;
  }

  cancelMarquee(): void {
    this.state = {
      ...this.state,
      isSelecting: false,
      selectionRect: null,
    };
  }

  /* ──────────────────────────────────────────
   * Public API - Hit Testing
   * ────────────────────────────────────────── */

  hitTest(point: Point2D): HitTestResult | null {
    let bestResult: HitTestResult | null = null;
    let bestDepth = -1;

    for (const widget of Object.values(this.widgets)) {
      if (this.isLocked(widget.id)) continue;

      const rect = this.getWidgetRect(widget);
      const result = this.testWidgetHit(point, widget, rect, 0);

      if (result && result.depth >= bestDepth) {
        bestResult = result;
        bestDepth = result.depth;
      }
    }

    return bestResult;
  }

  hitTestAll(point: Point2D): readonly HitTestResult[] {
    const results: HitTestResult[] = [];

    for (const widget of Object.values(this.widgets)) {
      if (this.isLocked(widget.id)) continue;

      const rect = this.getWidgetRect(widget);
      const result = this.testWidgetHit(point, widget, rect, 0);
      if (result) results.push(result);
    }

    return results.sort((a, b) => b.depth - a.depth);
  }

  /* ──────────────────────────────────────────
   * Public API - Tab Cycling
   * ────────────────────────────────────────── */

  selectNext(source: SelectionSource = 'tab'): void {
    const ids = this.getSelectableIds();
    if (ids.length === 0) return;

    const currentIndex = this.state.focusedId
      ? ids.indexOf(this.state.focusedId)
      : -1;

    const nextIndex = (currentIndex + 1) % ids.length;
    this.select(ids[nextIndex], source);
  }

  selectPrevious(source: SelectionSource = 'tab'): void {
    const ids = this.getSelectableIds();
    if (ids.length === 0) return;

    const currentIndex = this.state.focusedId
      ? ids.indexOf(this.state.focusedId)
      : 0;

    const prevIndex = (currentIndex - 1 + ids.length) % ids.length;
    this.select(ids[prevIndex], source);
  }

  /* ──────────────────────────────────────────
   * Public API - Filters
   * ────────────────────────────────────────── */

  addFilter(name: string, filter: SelectionFilter): void {
    this.filters.set(name, filter);
  }

  removeFilter(name: string): void {
    this.filters.delete(name);
  }

  clearFilters(): void {
    this.filters.clear();
  }

  /* ──────────────────────────────────────────
   * Public API - History
   * ────────────────────────────────────────── */

  undoSelection(): void {
    if (this.historyIndex <= 0) return;
    this.historyIndex--;
    this.state = this.history[this.historyIndex];
  }

  redoSelection(): void {
    if (this.historyIndex >= this.history.length - 1) return;
    this.historyIndex++;
    this.state = this.history[this.historyIndex];
  }

  /* ──────────────────────────────────────────
   * Public API - State
   * ────────────────────────────────────────── */

  getState(): SelectionState {
    return this.state;
  }

  getSelectedIds(): readonly string[] {
    return this.state.selectedIds;
  }

  getSelectedWidgets(): readonly WidgetConfig[] {
    return this.state.selectedIds
      .map(id => this.widgets[id])
      .filter((w): w is WidgetConfig => w != null);
  }

  isSelected(widgetId: string): boolean {
    return this.state.selectedIds.includes(widgetId);
  }

  isHovered(widgetId: string): boolean {
    return this.state.hoveredId === widgetId;
  }

  isFocused(widgetId: string): boolean {
    return this.state.focusedId === widgetId;
  }

  isLocked(widgetId: string): boolean {
    return this.state.lockedIds.includes(widgetId);
  }

  getSelectionBounds(): Rect | null {
    const selected = this.getSelectedWidgets();
    if (selected.length === 0) return null;

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const widget of selected) {
      const rect = this.getWidgetRect(widget);
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /* ──────────────────────────────────────────
   * Public API - Events
   * ────────────────────────────────────────── */

  subscribe(listener: SelectionListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Update the widget store reference.
   */
  setWidgets(widgets: Record<string, WidgetConfig>): void {
    this.widgets = widgets;
  }

  /* ──────────────────────────────────────────
   * Private Methods
   * ────────────────────────────────────────── */

  private createInitialState(): SelectionState {
    return {
      selectedIds: [],
      hoveredId: null,
      focusedId: null,
      anchorId: null,
      selectionRect: null,
      isSelecting: false,
      selectionMode: 'single',
      lockedIds: [],
      groupedSelections: {},
    };
  }

  private pushHistory(): void {
    // Truncate future history
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push({ ...this.state });
    this.historyIndex = this.history.length - 1;

    // Enforce limit
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
      this.historyIndex = this.history.length - 1;
    }
  }

  private emit(event: SelectionEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (e) {
        console.error('[SelectionEngine] Listener error:', e);
      }
    }
  }

  private passesFilters(widgetId: string): boolean {
    const widget = this.widgets[widgetId];
    if (!widget) return false;

    for (const filter of this.filters.values()) {
      if (!filter(widget)) return false;
    }

    return true;
  }

  private getWidgetRect(widget: WidgetConfig): Rect {
    const pos = widget.position ?? { x: 0, y: 0 };
    const w = this.getDimensionValue(widget.style.width);
    const h = this.getDimensionValue(widget.style.height);
    return { x: pos.x, y: pos.y, width: w, height: h };
  }

  private getDimensionValue(dim?: { value: number; unit: string }): number {
    if (!dim) return 100;
    if (dim.unit === 'px') return dim.value;
    if (dim.unit === '%') return (dim.value / 100) * 1200;
    return dim.value;
  }

  private rectsIntersect(a: Rect, b: Rect): boolean {
    return !(
      a.x + a.width < b.x ||
      b.x + b.width < a.x ||
      a.y + a.height < b.y ||
      b.y + b.height < a.y
    );
  }

  private rectContains(outer: Rect, inner: Rect): boolean {
    return (
      inner.x >= outer.x &&
      inner.y >= outer.y &&
      inner.x + inner.width <= outer.x + outer.width &&
      inner.y + inner.height <= outer.y + outer.height
    );
  }

  private testWidgetHit(
    point: Point2D,
    widget: WidgetConfig,
    rect: Rect,
    depth: number,
  ): HitTestResult | null {
    const tolerance = this.hitTolerance;

    // Check if point is inside rect
    const inside =
      point.x >= rect.x - tolerance &&
      point.x <= rect.x + rect.width + tolerance &&
      point.y >= rect.y - tolerance &&
      point.y <= rect.y + rect.height + tolerance;

    if (!inside) return null;

    // Check if on edge
    const onLeft = Math.abs(point.x - rect.x) <= tolerance;
    const onRight = Math.abs(point.x - (rect.x + rect.width)) <= tolerance;
    const onTop = Math.abs(point.y - rect.y) <= tolerance;
    const onBottom = Math.abs(point.y - (rect.y + rect.height)) <= tolerance;

    let edgeDirection: HitTestResult['edgeDirection'] = null;
    if (onTop && onLeft) edgeDirection = 'top-left';
    else if (onTop && onRight) edgeDirection = 'top-right';
    else if (onBottom && onLeft) edgeDirection = 'bottom-left';
    else if (onBottom && onRight) edgeDirection = 'bottom-right';
    else if (onTop) edgeDirection = 'top';
    else if (onRight) edgeDirection = 'right';
    else if (onBottom) edgeDirection = 'bottom';
    else if (onLeft) edgeDirection = 'left';

    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const distance = Math.sqrt(
      Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2),
    );

    return {
      widgetId: widget.id,
      distance,
      isEdge: edgeDirection !== null,
      edgeDirection,
      depth,
    };
  }

  private getSelectableIds(): string[] {
    return Object.keys(this.widgets).filter(
      id => !this.isLocked(id) && this.passesFilters(id),
    );
  }
}

/* ──────────────────────────────────────────────
 * Singleton
 * ────────────────────────────────────────────── */

let _selectionEngine: SelectionEngine | null = null;

export function getSelectionEngine(): SelectionEngine {
  if (!_selectionEngine) _selectionEngine = new SelectionEngine();
  return _selectionEngine;
}
