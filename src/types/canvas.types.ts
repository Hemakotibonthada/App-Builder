/**
 * Canvas Type Definitions
 * 
 * Defines the complete type system for the builder canvas,
 * including viewport, selection, guides, and interaction states.
 */

import { WidgetConfig, WidgetType } from './widget.types';

/* ──────────────────────────────────────────────
 * Viewport & Transform
 * ────────────────────────────────────────────── */

/** Represents a 2D point on the canvas */
export interface Point2D {
  readonly x: number;
  readonly y: number;
}

/** Represents a rectangular region */
export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Canvas viewport transform */
export interface ViewportTransform {
  readonly x: number; // Pan offset X
  readonly y: number; // Pan offset Y
  readonly zoom: number; // Scale factor (0.1 - 5.0)
}

/** Device preview sizes */
export enum DevicePreset {
  Desktop = 'desktop',
  DesktopLarge = 'desktop-lg',
  Laptop = 'laptop',
  TabletLandscape = 'tablet-landscape',
  TabletPortrait = 'tablet-portrait',
  MobileLarge = 'mobile-lg',
  MobileSmall = 'mobile-sm',
  Custom = 'custom',
}

/** Device preset dimensions */
export interface DeviceConfig {
  readonly preset: DevicePreset;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly scaleFactor: number;
  readonly hasNotch: boolean;
  readonly platform: 'web' | 'ios' | 'android';
}

/** Built-in device presets */
export const DEVICE_PRESETS: Record<DevicePreset, DeviceConfig> = {
  [DevicePreset.Desktop]: {
    preset: DevicePreset.Desktop,
    name: 'Desktop',
    width: 1440,
    height: 900,
    scaleFactor: 1,
    hasNotch: false,
    platform: 'web',
  },
  [DevicePreset.DesktopLarge]: {
    preset: DevicePreset.DesktopLarge,
    name: 'Desktop Large',
    width: 1920,
    height: 1080,
    scaleFactor: 1,
    hasNotch: false,
    platform: 'web',
  },
  [DevicePreset.Laptop]: {
    preset: DevicePreset.Laptop,
    name: 'Laptop',
    width: 1366,
    height: 768,
    scaleFactor: 1,
    hasNotch: false,
    platform: 'web',
  },
  [DevicePreset.TabletLandscape]: {
    preset: DevicePreset.TabletLandscape,
    name: 'Tablet Landscape',
    width: 1024,
    height: 768,
    scaleFactor: 2,
    hasNotch: false,
    platform: 'ios',
  },
  [DevicePreset.TabletPortrait]: {
    preset: DevicePreset.TabletPortrait,
    name: 'Tablet Portrait',
    width: 768,
    height: 1024,
    scaleFactor: 2,
    hasNotch: false,
    platform: 'ios',
  },
  [DevicePreset.MobileLarge]: {
    preset: DevicePreset.MobileLarge,
    name: 'iPhone 15 Pro Max',
    width: 430,
    height: 932,
    scaleFactor: 3,
    hasNotch: true,
    platform: 'ios',
  },
  [DevicePreset.MobileSmall]: {
    preset: DevicePreset.MobileSmall,
    name: 'iPhone SE',
    width: 375,
    height: 667,
    scaleFactor: 2,
    hasNotch: false,
    platform: 'ios',
  },
  [DevicePreset.Custom]: {
    preset: DevicePreset.Custom,
    name: 'Custom',
    width: 800,
    height: 600,
    scaleFactor: 1,
    hasNotch: false,
    platform: 'web',
  },
};

/* ──────────────────────────────────────────────
 * Grid & Snapping
 * ────────────────────────────────────────────── */

/** Grid configuration */
export interface GridConfig {
  readonly enabled: boolean;
  readonly size: number; // Grid cell size in px
  readonly subdivisions: number;
  readonly color: string;
  readonly opacity: number;
  readonly snapToGrid: boolean;
  readonly showOnDrag: boolean;
}

/** Snap guide line */
export interface SnapGuide {
  readonly id: string;
  readonly orientation: 'horizontal' | 'vertical';
  readonly position: number; // Position in canvas coordinates
  readonly type: 'center' | 'edge' | 'spacing' | 'custom';
  readonly sourceWidgetId?: string;
  readonly targetWidgetId?: string;
  readonly label?: string;
}

/** Ruler marks on the edge of the canvas */
export interface RulerConfig {
  readonly enabled: boolean;
  readonly unit: 'px' | 'rem' | '%';
  readonly showNumbers: boolean;
  readonly showGuides: boolean;
  readonly customGuides: readonly number[];
}

/* ──────────────────────────────────────────────
 * Selection & Interaction
 * ────────────────────────────────────────────── */

/** Current selection state */
export interface SelectionState {
  readonly selectedIds: readonly string[];
  readonly hoveredId: string | null;
  readonly focusedId: string | null;
  readonly multiSelectMode: boolean;
  readonly selectionBox: Rect | null; // Rubber-band selection
}

/** Resize handle positions */
export enum ResizeHandle {
  TopLeft = 'top-left',
  TopCenter = 'top-center',
  TopRight = 'top-right',
  MiddleLeft = 'middle-left',
  MiddleRight = 'middle-right',
  BottomLeft = 'bottom-left',
  BottomCenter = 'bottom-center',
  BottomRight = 'bottom-right',
}

/** Current drag state */
export interface DragState {
  readonly isDragging: boolean;
  readonly dragSource: DragSource | null;
  readonly dragTarget: DragTarget | null;
  readonly dragPreview: DragPreview | null;
  readonly dragOffset: Point2D;
  readonly currentPosition: Point2D;
}

/** Where the drag originated from */
export interface DragSource {
  readonly type: 'palette' | 'canvas' | 'layer-tree';
  readonly widgetType?: WidgetType;
  readonly widgetId?: string;
  readonly originalPosition?: Point2D;
  readonly originalParentId?: string | null;
  readonly originalIndex?: number;
}

/** Where the drag is targeting */
export interface DragTarget {
  readonly widgetId: string | null;
  readonly position: 'before' | 'after' | 'inside' | 'replace';
  readonly insertIndex: number;
  readonly dropZone: Rect;
  readonly isValid: boolean;
}

/** Visual preview during drag */
export interface DragPreview {
  readonly width: number;
  readonly height: number;
  readonly label: string;
  readonly icon: string;
  readonly opacity: number;
}

/** Resize interaction state */
export interface ResizeState {
  readonly isResizing: boolean;
  readonly widgetId: string | null;
  readonly handle: ResizeHandle | null;
  readonly startRect: Rect | null;
  readonly currentRect: Rect | null;
  readonly maintainAspectRatio: boolean;
}

/* ──────────────────────────────────────────────
 * Canvas Interaction Mode
 * ────────────────────────────────────────────── */

/** Current interaction mode */
export enum InteractionMode {
  Select = 'select',
  Pan = 'pan',
  Zoom = 'zoom',
  Draw = 'draw',
  Text = 'text',
  Comment = 'comment',
  Measure = 'measure',
}

/** Canvas cursor state */
export interface CursorState {
  readonly mode: InteractionMode;
  readonly customCursor: string | null;
  readonly position: Point2D;
  readonly isOverCanvas: boolean;
}

/* ──────────────────────────────────────────────
 * Drop Zones
 * ────────────────────────────────────────────── */

/** A designated area where widgets can be dropped */
export interface DropZoneConfig {
  readonly id: string;
  readonly parentWidgetId: string;
  readonly rect: Rect;
  readonly index: number; // Insert position
  readonly accepts: readonly WidgetType[] | 'all';
  readonly isHighlighted: boolean;
  readonly isValid: boolean;
}

/* ──────────────────────────────────────────────
 * Canvas Page Structure
 * ────────────────────────────────────────────── */

/** A page/screen in the app being built */
export interface AppPage {
  readonly id: string;
  readonly name: string;
  readonly path: string; // Route path
  readonly rootWidgetIds: readonly string[];
  readonly isHomePage: boolean;
  readonly meta: PageMeta;
  readonly createdAt: number;
  readonly updatedAt: number;
}

/** Page metadata */
export interface PageMeta {
  readonly title: string;
  readonly description: string;
  readonly favicon?: string;
  readonly ogImage?: string;
  readonly bodyBackground?: string;
  readonly customHead?: string;
}

/* ──────────────────────────────────────────────
 * Complete Canvas State
 * ────────────────────────────────────────────── */

/** The master state object for the entire canvas system */
export interface CanvasState {
  // Widget registry (all widgets keyed by ID)
  readonly widgets: Record<string, WidgetConfig>;
  
  // Page management
  readonly pages: readonly AppPage[];
  readonly activePageId: string;
  
  // Viewport
  readonly viewport: ViewportTransform;
  readonly deviceConfig: DeviceConfig;
  
  // Grid & guides
  readonly grid: GridConfig;
  readonly rulers: RulerConfig;
  readonly activeGuides: readonly SnapGuide[];
  
  // Selection
  readonly selection: SelectionState;
  
  // Drag & Drop
  readonly drag: DragState;
  
  // Resize
  readonly resize: ResizeState;
  
  // Interaction mode
  readonly interactionMode: InteractionMode;
  readonly cursor: CursorState;
  
  // Canvas dimensions
  readonly canvasWidth: number;
  readonly canvasHeight: number;
  
  // Performance
  readonly renderCount: number;
  readonly lastRenderTime: number;
}

/** Default initial canvas state */
export const DEFAULT_CANVAS_STATE: CanvasState = {
  widgets: {},
  pages: [],
  activePageId: '',
  viewport: { x: 0, y: 0, zoom: 1 },
  deviceConfig: DEVICE_PRESETS[DevicePreset.Desktop],
  grid: {
    enabled: true,
    size: 8,
    subdivisions: 4,
    color: '#6366f1',
    opacity: 0.08,
    snapToGrid: true,
    showOnDrag: true,
  },
  rulers: {
    enabled: true,
    unit: 'px',
    showNumbers: true,
    showGuides: true,
    customGuides: [],
  },
  activeGuides: [],
  selection: {
    selectedIds: [],
    hoveredId: null,
    focusedId: null,
    multiSelectMode: false,
    selectionBox: null,
  },
  drag: {
    isDragging: false,
    dragSource: null,
    dragTarget: null,
    dragPreview: null,
    dragOffset: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
  },
  resize: {
    isResizing: false,
    widgetId: null,
    handle: null,
    startRect: null,
    currentRect: null,
    maintainAspectRatio: false,
  },
  interactionMode: InteractionMode.Select,
  cursor: {
    mode: InteractionMode.Select,
    customCursor: null,
    position: { x: 0, y: 0 },
    isOverCanvas: false,
  },
  canvasWidth: 1440,
  canvasHeight: 900,
  renderCount: 0,
  lastRenderTime: 0,
};
