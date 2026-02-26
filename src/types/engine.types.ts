/**
 * Engine Type Definitions
 * 
 * Types for the internal engines: drag-drop, snap, layout,
 * render pipeline, and collision detection systems.
 */

import { Point2D, Rect, SnapGuide, ViewportTransform } from './canvas.types';
import { WidgetConfig, WidgetType } from './widget.types';

/* ──────────────────────────────────────────────
 * Snap Engine Types
 * ────────────────────────────────────────────── */

/** Snap result from the snap engine */
export interface SnapResult {
  readonly snappedPosition: Point2D;
  readonly guides: readonly SnapGuide[];
  readonly didSnapX: boolean;
  readonly didSnapY: boolean;
  readonly snapDistanceX: number;
  readonly snapDistanceY: number;
}

/** Configuration for the snap engine */
export interface SnapEngineConfig {
  readonly enabled: boolean;
  readonly threshold: number; // Distance in px at which snap activates
  readonly snapToGrid: boolean;
  readonly snapToEdges: boolean;
  readonly snapToCenter: boolean;
  readonly snapToSpacing: boolean;
  readonly snapToSiblings: boolean;
  readonly gridSize: number;
}

/** Cached widget bounds for fast lookup */
export interface WidgetBounds {
  readonly id: string;
  readonly rect: Rect;
  readonly centerX: number;
  readonly centerY: number;
  readonly edges: {
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly bottom: number;
  };
}

/* ──────────────────────────────────────────────
 * Layout Engine Types
 * ────────────────────────────────────────────── */

/** Layout mode */
export enum LayoutMode {
  Flex = 'flex',
  Grid = 'grid',
  Absolute = 'absolute',
  Flow = 'flow',
}

/** Computed layout output for a widget */
export interface ComputedLayout {
  readonly widgetId: string;
  readonly rect: Rect;
  readonly contentRect: Rect; // Inner bounds (padding excluded)
  readonly children: readonly ComputedLayout[];
  readonly overflow: boolean;
  readonly visible: boolean;
}

/** Layout constraint */
export interface LayoutConstraint {
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly minHeight: number;
  readonly maxHeight: number;
}

/* ──────────────────────────────────────────────
 * Render Engine Types
 * ────────────────────────────────────────────── */

/** Render tree node */
export interface RenderNode {
  readonly widgetId: string;
  readonly type: WidgetType;
  readonly layout: ComputedLayout;
  readonly visible: boolean;
  readonly needsRepaint: boolean;
  readonly children: readonly RenderNode[];
  readonly zIndex: number;
}

/** Render performance metrics */
export interface RenderMetrics {
  frameTime: number; // ms
  widgetCount: number;
  visibleWidgetCount: number;
  renderCalls: number;
  layoutPasses: number;
  paintTime: number;
  fps: number;
  memoryUsage: number;
}

/** Dirty tracking for selective re-render */
export interface DirtyRegion {
  readonly rect: Rect;
  readonly widgetIds: readonly string[];
  readonly reason: 'style' | 'layout' | 'content' | 'add' | 'remove' | 'reorder';
}

/* ──────────────────────────────────────────────
 * Collision Detection Types
 * ────────────────────────────────────────────── */

/** Collision test result */
export interface CollisionResult {
  readonly collides: boolean;
  readonly collidingWidgets: readonly string[];
  readonly overlapArea: number;
  readonly overlapRect: Rect | null;
}

/** Spatial index node for efficient queries */
export interface SpatialNode {
  readonly bounds: Rect;
  readonly widgetId: string | null;
  readonly children: readonly SpatialNode[];
  readonly depth: number;
  readonly isLeaf: boolean;
}

/* ──────────────────────────────────────────────
 * Drag-Drop Engine Types
 * ────────────────────────────────────────────── */

/** Drop validation result */
export interface DropValidation {
  readonly isValid: boolean;
  readonly reason: string;
  readonly targetWidgetId: string | null;
  readonly insertIndex: number;
  readonly dropEffect: 'move' | 'copy' | 'none';
}

/** Drag event data passed through the engine */
export interface DragEventData {
  readonly type: 'start' | 'move' | 'end' | 'cancel';
  readonly clientPosition: Point2D;
  readonly canvasPosition: Point2D;
  readonly delta: Point2D;
  readonly velocity: Point2D;
  readonly timestamp: number;
  readonly modifiers: {
    readonly shift: boolean;
    readonly ctrl: boolean;
    readonly alt: boolean;
    readonly meta: boolean;
  };
}

/** Drag operation descriptor */
export interface DragOperation {
  readonly id: string;
  readonly sourceType: 'palette' | 'canvas' | 'layer-tree';
  readonly widgetType?: WidgetType;
  readonly widgetId?: string;
  readonly startPosition: Point2D;
  readonly currentPosition: Point2D;
  readonly startTime: number;
  readonly isActive: boolean;
}

/* ──────────────────────────────────────────────
 * History (Undo/Redo) Engine Types
 * ────────────────────────────────────────────── */

/** Types of mutations that can be undone */
export enum MutationType {
  AddWidget = 'add-widget',
  RemoveWidget = 'remove-widget',
  MoveWidget = 'move-widget',
  ResizeWidget = 'resize-widget',
  UpdateProps = 'update-props',
  UpdateStyle = 'update-style',
  UpdateEvents = 'update-events',
  UpdateBindings = 'update-bindings',
  ReorderChildren = 'reorder-children',
  ReparentWidget = 'reparent-widget',
  AddPage = 'add-page',
  RemovePage = 'remove-page',
  UpdatePage = 'update-page',
  BatchMutation = 'batch-mutation',
  UpdateVariable = 'update-variable',
  UpdateAPI = 'update-api',
}

/** A single mutation in the history stack */
export interface HistoryEntry {
  readonly id: string;
  readonly type: MutationType;
  readonly label: string; // Human-readable description
  readonly timestamp: number;
  readonly patches: readonly StatePatch[];
  readonly inversePatch: readonly StatePatch[];
}

/** JSON Patch operation */
export interface StatePatch {
  readonly op: 'add' | 'remove' | 'replace' | 'move' | 'copy';
  readonly path: string;
  readonly value?: unknown;
  readonly from?: string;
}

/** History state */
export interface HistoryState {
  readonly entries: readonly HistoryEntry[];
  readonly currentIndex: number;
  readonly maxSize: number;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly isSaved: boolean;
  readonly lastSavedIndex: number;
}

/* ──────────────────────────────────────────────
 * Canvas-Screen Coordinate Conversion
 * ────────────────────────────────────────────── */

/** Functions for converting between coordinate spaces */
export interface CoordinateTransformer {
  /** Convert screen (client) coordinates to canvas coordinates */
  screenToCanvas(screenPoint: Point2D, viewport: ViewportTransform): Point2D;
  
  /** Convert canvas coordinates to screen (client) coordinates */
  canvasToScreen(canvasPoint: Point2D, viewport: ViewportTransform): Point2D;
  
  /** Convert canvas coordinates to widget-local coordinates */
  canvasToWidget(canvasPoint: Point2D, widgetRect: Rect): Point2D;
  
  /** Get the visible canvas area in canvas coordinates */
  getVisibleArea(viewport: ViewportTransform, screenSize: { width: number; height: number }): Rect;
}

/* ──────────────────────────────────────────────
 * Plugin / Extension System Types
 * ────────────────────────────────────────────── */

/** A builder plugin that extends the system */
export interface BuilderPlugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  readonly enabled: boolean;
  readonly hooks: Partial<PluginHooks>;
}

/** Lifecycle hooks a plugin can implement */
export interface PluginHooks {
  readonly onWidgetCreate: (widget: WidgetConfig) => WidgetConfig;
  readonly onWidgetUpdate: (widget: WidgetConfig, changes: Partial<WidgetConfig>) => WidgetConfig;
  readonly onWidgetDelete: (widgetId: string) => void;
  readonly onBeforeBuild: (project: unknown) => unknown;
  readonly onAfterBuild: (output: unknown) => unknown;
  readonly onPageCreate: (page: unknown) => unknown;
  readonly onPageDelete: (pageId: string) => void;
  readonly registerWidgets: () => readonly unknown[];
  readonly registerActions: () => readonly unknown[];
}
