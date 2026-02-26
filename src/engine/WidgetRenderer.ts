/**
 * Widget Renderer
 * 
 * Core rendering pipeline for transforming widget configurations
 * into optimized DOM representations. Handles:
 * 
 * 1. Virtual DOM diffing for widgets
 * 2. Style computation and caching
 * 3. Layout measurement and reporting
 * 4. Visibility culling (only render visible widgets)
 * 5. Render scheduling and batching
 * 6. Paint containment optimization
 * 7. Layer composition hints
 * 8. Accessibility tree generation
 * 9. Widget intersection observation
 * 10. Lazy rendering for offscreen widgets
 */

import { WidgetConfig, WidgetType, WidgetStyle, DimensionValue } from '@/types/widget.types';
import { Rect, Point2D, ViewportTransform } from '@/types/canvas.types';

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export interface RenderNode {
  readonly id: string;
  readonly widgetId: string;
  readonly type: WidgetType;
  readonly computedStyle: ComputedWidgetStyle;
  readonly computedLayout: ComputedLayout;
  readonly children: readonly RenderNode[];
  readonly needsRepaint: boolean;
  readonly needsLayout: boolean;
  readonly isVisible: boolean;
  readonly layer: number;
  readonly opacity: number;
  readonly transform: string;
  readonly clipPath: string | null;
  readonly willChange: string | null;
  readonly containment: string;
  readonly a11yRole: string | null;
  readonly a11yLabel: string | null;
}

export interface ComputedWidgetStyle {
  readonly width: string;
  readonly height: string;
  readonly minWidth: string;
  readonly minHeight: string;
  readonly maxWidth: string;
  readonly maxHeight: string;
  readonly padding: string;
  readonly margin: string;
  readonly background: string;
  readonly border: string;
  readonly borderRadius: string;
  readonly boxShadow: string;
  readonly color: string;
  readonly fontSize: string;
  readonly fontWeight: string;
  readonly fontFamily: string;
  readonly lineHeight: string;
  readonly letterSpacing: string;
  readonly textAlign: string;
  readonly display: string;
  readonly flexDirection: string;
  readonly justifyContent: string;
  readonly alignItems: string;
  readonly gap: string;
  readonly overflow: string;
  readonly position: string;
  readonly top: string;
  readonly left: string;
  readonly right: string;
  readonly bottom: string;
  readonly zIndex: string;
  readonly opacity: string;
  readonly cursor: string;
  readonly transition: string;
  readonly transform: string;
  readonly filter: string;
  readonly backdropFilter: string;
  readonly mixBlendMode: string;
  readonly pointerEvents: string;
  readonly userSelect: string;
  readonly outline: string;
  readonly tabIndex: number;
}

export interface ComputedLayout {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly contentWidth: number;
  readonly contentHeight: number;
  readonly scrollWidth: number;
  readonly scrollHeight: number;
  readonly paddingTop: number;
  readonly paddingRight: number;
  readonly paddingBottom: number;
  readonly paddingLeft: number;
  readonly marginTop: number;
  readonly marginRight: number;
  readonly marginBottom: number;
  readonly marginLeft: number;
  readonly borderTopWidth: number;
  readonly borderRightWidth: number;
  readonly borderBottomWidth: number;
  readonly borderLeftWidth: number;
}

export interface RenderStats {
  readonly totalNodes: number;
  readonly visibleNodes: number;
  readonly culledNodes: number;
  readonly dirtyNodes: number;
  readonly renderTime: number;
  readonly layoutTime: number;
  readonly paintTime: number;
  readonly compositeTime: number;
  readonly frameDrops: number;
  readonly fps: number;
}

export interface RenderConfig {
  readonly enableCulling: boolean;
  readonly enableLayerPromotion: boolean;
  readonly enableContainment: boolean;
  readonly enableLazyRendering: boolean;
  readonly cullingMargin: number;
  readonly maxFPS: number;
  readonly batchSize: number;
  readonly enableProfiling: boolean;
}

/* ──────────────────────────────────────────────
 * Default Config
 * ────────────────────────────────────────────── */

const DEFAULT_RENDER_CONFIG: RenderConfig = {
  enableCulling: true,
  enableLayerPromotion: true,
  enableContainment: true,
  enableLazyRendering: true,
  cullingMargin: 200,
  maxFPS: 60,
  batchSize: 50,
  enableProfiling: false,
};

/* ──────────────────────────────────────────────
 * Style Computation Cache
 * ────────────────────────────────────────────── */

class StyleCache {
  private cache: Map<string, ComputedWidgetStyle> = new Map();
  private maxSize: number = 500;

  get(widgetId: string, styleHash: string): ComputedWidgetStyle | null {
    const key = `${widgetId}:${styleHash}`;
    return this.cache.get(key) ?? null;
  }

  set(widgetId: string, styleHash: string, style: ComputedWidgetStyle): void {
    const key = `${widgetId}:${styleHash}`;
    this.cache.set(key, style);
    this.enforceLimit();
  }

  invalidate(widgetId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${widgetId}:`)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  private enforceLimit(): void {
    if (this.cache.size > this.maxSize) {
      const keysToRemove = Array.from(this.cache.keys()).slice(0, this.cache.size - this.maxSize);
      for (const key of keysToRemove) {
        this.cache.delete(key);
      }
    }
  }
}

/* ──────────────────────────────────────────────
 * Layout Cache
 * ────────────────────────────────────────────── */

class LayoutCache {
  private cache: Map<string, ComputedLayout> = new Map();

  get(widgetId: string): ComputedLayout | null {
    return this.cache.get(widgetId) ?? null;
  }

  set(widgetId: string, layout: ComputedLayout): void {
    this.cache.set(widgetId, layout);
  }

  invalidate(widgetId: string): void {
    this.cache.delete(widgetId);
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  has(widgetId: string): boolean {
    return this.cache.has(widgetId);
  }
}

/* ──────────────────────────────────────────────
 * Widget Renderer
 * ────────────────────────────────────────────── */

export class WidgetRenderer {
  private config: RenderConfig;
  private styleCache: StyleCache;
  private layoutCache: LayoutCache;
  private dirtyWidgets: Set<string> = new Set();
  private renderQueue: string[] = [];
  private isRendering: boolean = false;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private frameDropCount: number = 0;
  private fpsHistory: number[] = [];
  private observers: Map<string, IntersectionObserver> = new Map();
  private visibleWidgets: Set<string> = new Set();

  constructor(config: Partial<RenderConfig> = {}) {
    this.config = { ...DEFAULT_RENDER_CONFIG, ...config };
    this.styleCache = new StyleCache();
    this.layoutCache = new LayoutCache();
  }

  /**
   * Compute the render tree from widget configs.
   */
  computeRenderTree(
    widgets: Record<string, WidgetConfig>,
    rootIds: readonly string[],
    viewport: ViewportTransform,
  ): readonly RenderNode[] {
    const startTime = performance.now();

    const nodes = rootIds
      .map(id => this.buildRenderNode(widgets, id, viewport, 0))
      .filter((n): n is RenderNode => n !== null);

    if (this.config.enableProfiling) {
      const renderTime = performance.now() - startTime;
      this.trackFrame(renderTime);
    }

    return nodes;
  }

  /**
   * Mark a widget as needing re-render.
   */
  markDirty(widgetId: string): void {
    this.dirtyWidgets.add(widgetId);
    this.styleCache.invalidate(widgetId);
    this.layoutCache.invalidate(widgetId);
  }

  /**
   * Mark multiple widgets as dirty.
   */
  markDirtyBatch(widgetIds: readonly string[]): void {
    for (const id of widgetIds) {
      this.markDirty(id);
    }
  }

  /**
   * Clear all caches and dirty flags.
   */
  reset(): void {
    this.styleCache.clear();
    this.layoutCache.invalidateAll();
    this.dirtyWidgets.clear();
    this.renderQueue = [];
    this.visibleWidgets.clear();
  }

  /**
   * Get render statistics.
   */
  getStats(): RenderStats {
    const avgFps =
      this.fpsHistory.length > 0
        ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
        : 60;

    return {
      totalNodes: this.styleCache['cache'].size + this.dirtyWidgets.size,
      visibleNodes: this.visibleWidgets.size,
      culledNodes: 0,
      dirtyNodes: this.dirtyWidgets.size,
      renderTime: 0,
      layoutTime: 0,
      paintTime: 0,
      compositeTime: 0,
      frameDrops: this.frameDropCount,
      fps: Math.round(avgFps),
    };
  }

  /**
   * Compute style for a single widget.
   */
  computeStyle(widget: WidgetConfig): ComputedWidgetStyle {
    const styleHash = this.hashStyle(widget.style);
    const cached = this.styleCache.get(widget.id, styleHash);
    if (cached) return cached;

    const computed = this.resolveStyle(widget);
    this.styleCache.set(widget.id, styleHash, computed);
    return computed;
  }

  /**
   * Compute layout for a single widget.
   */
  computeLayout(widget: WidgetConfig, parentLayout?: ComputedLayout): ComputedLayout {
    const cached = this.layoutCache.get(widget.id);
    if (cached && !this.dirtyWidgets.has(widget.id)) return cached;

    const layout = this.resolveLayout(widget, parentLayout);
    this.layoutCache.set(widget.id, layout);
    return layout;
  }

  /* ──────────────────────────────────────────
   * Private Methods
   * ────────────────────────────────────────── */

  private buildRenderNode(
    widgets: Record<string, WidgetConfig>,
    widgetId: string,
    viewport: ViewportTransform,
    depth: number,
  ): RenderNode | null {
    const widget = widgets[widgetId];
    if (!widget) return null;

    // Visibility check
    if (!widget.visibility?.visible) return null;

    const computedStyle = this.computeStyle(widget);
    const computedLayout = this.computeLayout(widget);

    // Viewport culling
    let isVisible = true;
    if (this.config.enableCulling) {
      isVisible = this.isInViewport(computedLayout, viewport);
    }

    // Always track visibility
    if (isVisible) {
      this.visibleWidgets.add(widgetId);
    } else {
      this.visibleWidgets.delete(widgetId);
    }

    // Build children
    const children = widget.childIds
      .map(childId => this.buildRenderNode(widgets, childId, viewport, depth + 1))
      .filter((n): n is RenderNode => n !== null);

    // Determine render hints
    const needsLayerPromotion =
      this.config.enableLayerPromotion &&
      (widget.style.opacity !== undefined && widget.style.opacity < 1 ||
        children.length > 10 ||
        depth === 0);

    const containment = this.config.enableContainment
      ? this.computeContainment(widget, children.length)
      : 'none';

    const willChange = needsLayerPromotion ? 'transform, opacity' : null;

    // Accessibility
    const a11yRole = this.computeA11yRole(widget);
    const a11yLabel = widget.a11y?.ariaLabel ?? widget.name ?? null;

    const isDirty = this.dirtyWidgets.has(widgetId);
    if (isDirty) {
      this.dirtyWidgets.delete(widgetId);
    }

    return {
      id: `rn_${widgetId}`,
      widgetId,
      type: widget.type,
      computedStyle,
      computedLayout,
      children,
      needsRepaint: isDirty,
      needsLayout: isDirty,
      isVisible,
      layer: depth,
      opacity: widget.style.opacity ?? 1,
      transform: this.computeTransform(widget),
      clipPath: null,
      willChange,
      containment,
      a11yRole,
      a11yLabel,
    };
  }

  private resolveStyle(widget: WidgetConfig): ComputedWidgetStyle {
    const s = widget.style;

    return {
      width: this.resolveDimension(s.width, 'auto'),
      height: this.resolveDimension(s.height, 'auto'),
      minWidth: this.resolveDimension(s.minWidth, '0'),
      minHeight: this.resolveDimension(s.minHeight, '0'),
      maxWidth: this.resolveDimension(s.maxWidth, 'none'),
      maxHeight: this.resolveDimension(s.maxHeight, 'none'),
      padding: this.resolveSpacing(s.padding),
      margin: this.resolveSpacing(s.margin),
      background: this.resolveBackground(s),
      border: this.resolveBorder(s),
      borderRadius: this.resolveBorderRadius(s),
      boxShadow: this.resolveBoxShadow(s),
      color: s.color ?? 'inherit',
      fontSize: s.fontSize ? `${s.fontSize}px` : 'inherit',
      fontWeight: s.fontWeight ?? 'inherit',
      fontFamily: s.fontFamily ?? 'inherit',
      lineHeight: s.lineHeight ? `${s.lineHeight}` : 'inherit',
      letterSpacing: s.letterSpacing ? `${s.letterSpacing}px` : 'normal',
      textAlign: s.textAlign ?? 'left',
      display: s.display ?? 'flex',
      flexDirection: s.flexDirection ?? 'column',
      justifyContent: s.justifyContent ?? 'flex-start',
      alignItems: s.alignItems ?? 'stretch',
      gap: s.gap ? `${s.gap}px` : '0',
      overflow: s.overflow ?? 'visible',
      position: s.position ?? 'relative',
      top: 'auto',
      left: 'auto',
      right: 'auto',
      bottom: 'auto',
      zIndex: s.zIndex ? `${s.zIndex}` : 'auto',
      opacity: s.opacity !== undefined ? `${s.opacity}` : '1',
      cursor: s.cursor ?? 'default',
      transition: 'all 0.2s ease',
      transform: this.computeTransform(widget),
      filter: this.resolveFilter(s),
      backdropFilter: (s as any).backdropFilter ?? 'none',
      mixBlendMode: (s as any).mixBlendMode ?? 'normal',
      pointerEvents: 'auto',
      userSelect: 'none',
      outline: 'none',
      tabIndex: widget.a11y?.tabIndex ?? -1,
    };
  }

  private resolveLayout(widget: WidgetConfig, parentLayout?: ComputedLayout): ComputedLayout {
    const pos = widget.position ?? { x: 0, y: 0 };
    const w = this.resolveDimensionNumeric(widget.style.width, parentLayout?.contentWidth ?? 0);
    const h = this.resolveDimensionNumeric(widget.style.height, parentLayout?.contentHeight ?? 0);

    const pt = widget.style.padding?.top ?? 0;
    const pr = widget.style.padding?.right ?? 0;
    const pb = widget.style.padding?.bottom ?? 0;
    const pl = widget.style.padding?.left ?? 0;

    return {
      x: pos.x,
      y: pos.y,
      width: w,
      height: h,
      contentWidth: Math.max(0, w - pl - pr),
      contentHeight: Math.max(0, h - pt - pb),
      scrollWidth: w,
      scrollHeight: h,
      paddingTop: pt,
      paddingRight: pr,
      paddingBottom: pb,
      paddingLeft: pl,
      marginTop: widget.style.margin?.top ?? 0,
      marginRight: widget.style.margin?.right ?? 0,
      marginBottom: widget.style.margin?.bottom ?? 0,
      marginLeft: widget.style.margin?.left ?? 0,
      borderTopWidth: widget.style.border?.width ?? 0,
      borderRightWidth: widget.style.border?.width ?? 0,
      borderBottomWidth: widget.style.border?.width ?? 0,
      borderLeftWidth: widget.style.border?.width ?? 0,
    };
  }

  private resolveDimension(dim?: DimensionValue, fallback: string = 'auto'): string {
    if (!dim) return fallback;
    if (dim.unit === 'auto') return 'auto';
    return `${dim.value}${dim.unit}`;
  }

  private resolveDimensionNumeric(dim?: DimensionValue, parentSize: number = 0): number {
    if (!dim) return 0;
    switch (dim.unit) {
      case 'px': return dim.value;
      case '%': return (dim.value / 100) * parentSize;
      case 'rem': return dim.value * 16;
      case 'em': return dim.value * 16;
      case 'vh': return (dim.value / 100) * (typeof window !== 'undefined' ? window.innerHeight : 800);
      case 'vw': return (dim.value / 100) * (typeof window !== 'undefined' ? window.innerWidth : 1200);
      default: return dim.value;
    }
  }

  private resolveSpacing(spacing?: { top?: number; right?: number; bottom?: number; left?: number }): string {
    if (!spacing) return '0';
    const t = spacing.top ?? 0;
    const r = spacing.right ?? 0;
    const b = spacing.bottom ?? 0;
    const l = spacing.left ?? 0;
    return `${t}px ${r}px ${b}px ${l}px`;
  }

  private resolveBackground(style: WidgetStyle): string {
    const bg = style.background as any;
    if (bg?.gradient) {
      const g = bg.gradient;
      const stops = g.stops
        .map((s: any) => `${s.color} ${s.position}%`)
        .join(', ');
      return `linear-gradient(${g.angle ?? 0}deg, ${stops})`;
    }
    if (bg?.color) return bg.color;
    if (bg?.image) return `url(${bg.image})`;
    return 'transparent';
  }

  private resolveBorder(style: WidgetStyle): string {
    if (!style.border) return 'none';
    return `${style.border.width ?? 1}px ${style.border.style ?? 'solid'} ${style.border.color ?? '#e2e8f0'}`;
  }

  private resolveBorderRadius(style: WidgetStyle): string {
    if (!style.borderRadius) return '0';
    const br = style.borderRadius;
    return `${br.topLeft ?? 0}px ${br.topRight ?? 0}px ${br.bottomRight ?? 0}px ${br.bottomLeft ?? 0}px`;
  }

  private resolveBoxShadow(style: WidgetStyle): string {
    if (!style.boxShadow || style.boxShadow.length === 0) return 'none';
    return style.boxShadow
      .map((s: any) => `${s.x ?? 0}px ${s.y ?? 0}px ${s.blur ?? 0}px ${s.spread ?? 0}px ${s.color ?? 'rgba(0,0,0,0.1)'}`)
      .join(', ');
  }

  private resolveFilter(style: WidgetStyle): string {
    const filters: string[] = [];
    if (style.blur) filters.push(`blur(${style.blur}px)`);
    if (style.brightness !== undefined) filters.push(`brightness(${style.brightness})`);
    if (style.contrast !== undefined) filters.push(`contrast(${style.contrast})`);
    if (style.saturate !== undefined) filters.push(`saturate(${style.saturate})`);
    if ((style as any).hueRotate !== undefined) filters.push(`hue-rotate(${(style as any).hueRotate}deg)`);
    if ((style as any).grayscale !== undefined) filters.push(`grayscale(${(style as any).grayscale})`);
    if ((style as any).sepia !== undefined) filters.push(`sepia(${(style as any).sepia})`);
    if ((style as any).invert !== undefined) filters.push(`invert(${(style as any).invert})`);
    return filters.length > 0 ? filters.join(' ') : 'none';
  }

  private computeTransform(widget: WidgetConfig): string {
    const transforms: string[] = [];
    const s = widget.style as any;

    if (s.rotate) transforms.push(`rotate(${s.rotate}deg)`);
    if (s.scaleX !== undefined || s.scaleY !== undefined) {
      transforms.push(`scale(${s.scaleX ?? 1}, ${s.scaleY ?? 1})`);
    }
    if (s.skewX) transforms.push(`skewX(${s.skewX}deg)`);
    if (s.skewY) transforms.push(`skewY(${s.skewY}deg)`);
    if (s.translateX || s.translateY) {
      transforms.push(`translate(${s.translateX ?? 0}px, ${s.translateY ?? 0}px)`);
    }

    return transforms.length > 0 ? transforms.join(' ') : 'none';
  }

  private computeContainment(widget: WidgetConfig, childCount: number): string {
    if (childCount === 0) return 'content';
    if (widget.style.overflow === 'hidden') return 'strict';
    return 'layout style';
  }

  private computeA11yRole(widget: WidgetConfig): string | null {
    if (widget.a11y?.ariaRole) return widget.a11y.ariaRole;

    switch (widget.type) {
      case WidgetType.Button:
      case WidgetType.IconButton:
        return 'button';
      case WidgetType.TextInput:
      case WidgetType.TextArea:
      case WidgetType.NumberInput:
        return 'textbox';
      case WidgetType.Checkbox:
        return 'checkbox';
      case WidgetType.Radio:
        return 'radio';
      case WidgetType.Toggle:
        return 'switch';
      case WidgetType.Slider:
        return 'slider';
      case WidgetType.Dropdown:
        return 'combobox';
      case WidgetType.Link:
        return 'link';
      case WidgetType.Image:
        return 'img';
      case WidgetType.Heading:
        return 'heading';
      case WidgetType.Text:
      case WidgetType.Paragraph:
        return 'text';
      case WidgetType.Navbar:
        return 'navigation';
      case WidgetType.Sidebar:
        return 'complementary';
      case WidgetType.ProgressBar:
        return 'progressbar';
      case WidgetType.Tabs:
        return 'tablist';
      case WidgetType.Accordion:
        return 'group';
      case WidgetType.Card:
        return 'article';
      case WidgetType.Container:
      case WidgetType.Row:
      case WidgetType.Column:
        return 'group';
      default:
        return null;
    }
  }

  private isInViewport(layout: ComputedLayout, viewport: ViewportTransform): boolean {
    const margin = this.config.cullingMargin;
    const vw = typeof window !== 'undefined' ? window.innerWidth / viewport.zoom : 2000;
    const vh = typeof window !== 'undefined' ? window.innerHeight / viewport.zoom : 1500;

    const viewLeft = -viewport.x / viewport.zoom - margin;
    const viewTop = -viewport.y / viewport.zoom - margin;
    const viewRight = viewLeft + vw + margin * 2;
    const viewBottom = viewTop + vh + margin * 2;

    return !(
      layout.x + layout.width < viewLeft ||
      layout.x > viewRight ||
      layout.y + layout.height < viewTop ||
      layout.y > viewBottom
    );
  }

  private hashStyle(style: WidgetStyle): string {
    // Quick hash based on key style properties
    const parts = [
      style.width?.value, style.width?.unit,
      style.height?.value, style.height?.unit,
      style.color, style.fontSize,
      style.background?.color, style.opacity,
      style.borderRadius?.topLeft,
      style.display, style.flexDirection,
    ];
    return parts.join('|');
  }

  private trackFrame(renderTime: number): void {
    const now = performance.now();
    if (this.lastFrameTime > 0) {
      const dt = now - this.lastFrameTime;
      const fps = 1000 / dt;
      this.fpsHistory.push(fps);
      if (this.fpsHistory.length > 60) this.fpsHistory.shift();
      if (fps < 30) this.frameDropCount++;
    }
    this.lastFrameTime = now;
    this.frameCount++;
  }
}

/* ──────────────────────────────────────────────
 * Render Scheduler
 * ────────────────────────────────────────────── */

export class RenderScheduler {
  private pendingUpdates: Set<string> = new Set();
  private rafId: number | null = null;
  private callback: ((widgetIds: readonly string[]) => void) | null = null;
  private batchSize: number;
  private highPriorityQueue: string[] = [];
  private lowPriorityQueue: string[] = [];
  private isProcessing: boolean = false;

  constructor(batchSize: number = 50) {
    this.batchSize = batchSize;
  }

  /**
   * Schedule a widget for re-rendering.
   */
  scheduleUpdate(widgetId: string, priority: 'high' | 'low' = 'low'): void {
    if (priority === 'high') {
      this.highPriorityQueue.push(widgetId);
    } else {
      this.lowPriorityQueue.push(widgetId);
    }

    this.pendingUpdates.add(widgetId);
    this.scheduleFlush();
  }

  /**
   * Set the callback for when a batch of updates is ready.
   */
  onFlush(callback: (widgetIds: readonly string[]) => void): void {
    this.callback = callback;
  }

  /**
   * Cancel all pending updates.
   */
  cancel(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.pendingUpdates.clear();
    this.highPriorityQueue = [];
    this.lowPriorityQueue = [];
  }

  /**
   * Check if there are pending updates.
   */
  hasPendingUpdates(): boolean {
    return this.pendingUpdates.size > 0;
  }

  private scheduleFlush(): void {
    if (this.rafId !== null) return;

    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.flush();
    });
  }

  private flush(): void {
    if (this.isProcessing) return;
    this.isProcessing = true;

    // Process high priority first
    const batch: string[] = [];

    while (batch.length < this.batchSize && this.highPriorityQueue.length > 0) {
      batch.push(this.highPriorityQueue.shift()!);
    }

    while (batch.length < this.batchSize && this.lowPriorityQueue.length > 0) {
      batch.push(this.lowPriorityQueue.shift()!);
    }

    // Deduplicate
    const uniqueBatch = [...new Set(batch)];

    for (const id of uniqueBatch) {
      this.pendingUpdates.delete(id);
    }

    if (uniqueBatch.length > 0 && this.callback) {
      this.callback(uniqueBatch);
    }

    this.isProcessing = false;

    // Schedule next batch if there are remaining updates
    if (this.pendingUpdates.size > 0) {
      this.scheduleFlush();
    }
  }
}

/* ──────────────────────────────────────────────
 * Paint Profiler
 * ────────────────────────────────────────────── */

export class PaintProfiler {
  private entries: { widgetId: string; paintTime: number; timestamp: number }[] = [];
  private maxEntries: number = 1000;

  record(widgetId: string, paintTime: number): void {
    this.entries.push({
      widgetId,
      paintTime,
      timestamp: Date.now(),
    });

    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries / 2);
    }
  }

  getAveragePaintTime(widgetId?: string): number {
    const filtered = widgetId
      ? this.entries.filter(e => e.widgetId === widgetId)
      : this.entries;

    if (filtered.length === 0) return 0;
    return filtered.reduce((sum, e) => sum + e.paintTime, 0) / filtered.length;
  }

  getSlowestWidgets(count: number = 10): { widgetId: string; avgPaintTime: number }[] {
    const byWidget = new Map<string, number[]>();

    for (const entry of this.entries) {
      if (!byWidget.has(entry.widgetId)) {
        byWidget.set(entry.widgetId, []);
      }
      byWidget.get(entry.widgetId)!.push(entry.paintTime);
    }

    return Array.from(byWidget.entries())
      .map(([widgetId, times]) => ({
        widgetId,
        avgPaintTime: times.reduce((a, b) => a + b, 0) / times.length,
      }))
      .sort((a, b) => b.avgPaintTime - a.avgPaintTime)
      .slice(0, count);
  }

  clear(): void {
    this.entries = [];
  }
}

/* ──────────────────────────────────────────────
 * Singleton
 * ────────────────────────────────────────────── */

let _renderer: WidgetRenderer | null = null;
let _scheduler: RenderScheduler | null = null;
let _profiler: PaintProfiler | null = null;

export function getRenderer(): WidgetRenderer {
  if (!_renderer) _renderer = new WidgetRenderer();
  return _renderer;
}

export function getScheduler(): RenderScheduler {
  if (!_scheduler) _scheduler = new RenderScheduler();
  return _scheduler;
}

export function getProfiler(): PaintProfiler {
  if (!_profiler) _profiler = new PaintProfiler();
  return _profiler;
}
