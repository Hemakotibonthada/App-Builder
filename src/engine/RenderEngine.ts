/**
 * Render Engine
 * 
 * Manages the render pipeline for the canvas.
 * Handles selective re-rendering, dirty tracking,
 * and performance metrics collection.
 */

import { Rect } from '@/types/canvas.types';
import { WidgetConfig, WidgetType } from '@/types/widget.types';
import { RenderNode, RenderMetrics, DirtyRegion, ComputedLayout } from '@/types/engine.types';
import { LayoutEngine, layoutEngine } from './LayoutEngine';

/* ──────────────────────────────────────────────
 * Render Engine
 * ────────────────────────────────────────────── */

export class RenderEngine {
  private widgetMap: Map<string, WidgetConfig> = new Map();
  private renderTree: RenderNode[] = [];
  private dirtyRegions: DirtyRegion[] = [];
  private metrics: RenderMetrics = {
    frameTime: 0,
    widgetCount: 0,
    visibleWidgetCount: 0,
    renderCalls: 0,
    layoutPasses: 0,
    paintTime: 0,
    fps: 60,
    memoryUsage: 0,
  };
  private frameCount = 0;
  private lastFrameTime = 0;
  private fpsHistory: number[] = [];

  constructor(private layout: LayoutEngine = layoutEngine) {}

  /**
   * Updates the widget map for rendering.
   */
  setWidgets(widgets: Record<string, WidgetConfig>): void {
    this.widgetMap.clear();
    for (const [id, widget] of Object.entries(widgets)) {
      this.widgetMap.set(id, widget);
    }
    this.layout.setWidgets(widgets);
  }

  /**
   * Builds the render tree from root widget IDs.
   */
  buildRenderTree(
    rootIds: readonly string[],
    containerRect: Rect,
  ): readonly RenderNode[] {
    const startTime = performance.now();
    
    // Compute layout
    const layouts = this.layout.computeLayout(rootIds, containerRect);
    this.metrics.layoutPasses++;

    // Build render nodes
    this.renderTree = this.buildNodes(rootIds, layouts);

    // Update metrics
    const endTime = performance.now();
    this.updateMetrics(endTime - startTime);

    return this.renderTree;
  }

  /**
   * Recursively builds render nodes from computed layouts.
   */
  private buildNodes(
    ids: readonly string[],
    layouts: readonly ComputedLayout[],
    zBase: number = 0,
  ): RenderNode[] {
    const nodes: RenderNode[] = [];

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]!;
      const widget = this.widgetMap.get(id);
      const layout = layouts[i];

      if (!widget || !layout) continue;

      const visible = widget.visibility.visible;
      const zIndex = widget.style.zIndex ?? (zBase + i);

      const childNodes = widget.childIds.length > 0
        ? this.buildNodes(widget.childIds, layout.children, zIndex * 100)
        : [];

      nodes.push({
        widgetId: id,
        type: widget.type,
        layout,
        visible,
        needsRepaint: this.isWidgetDirty(id),
        children: childNodes,
        zIndex,
      });
    }

    // Sort by z-index
    nodes.sort((a, b) => a.zIndex - b.zIndex);

    return nodes;
  }

  /**
   * Marks a widget as needing re-render.
   */
  markDirty(widgetId: string, reason: DirtyRegion['reason']): void {
    const rect = this.layout.getCachedLayout(widgetId)?.rect;
    if (!rect) return;

    this.dirtyRegions.push({
      rect,
      widgetIds: [widgetId],
      reason,
    });

    // Also invalidate layout
    this.layout.invalidate(widgetId);
  }

  /**
   * Marks multiple widgets as dirty.
   */
  markMultipleDirty(widgetIds: readonly string[], reason: DirtyRegion['reason']): void {
    for (const id of widgetIds) {
      this.markDirty(id, reason);
    }
  }

  /**
   * Clears all dirty regions after a successful render.
   */
  clearDirty(): void {
    this.dirtyRegions = [];
  }

  /**
   * Returns whether a widget needs re-rendering.
   */
  isWidgetDirty(widgetId: string): boolean {
    return this.dirtyRegions.some(r => r.widgetIds.includes(widgetId));
  }

  /**
   * Returns current render performance metrics.
   */
  getMetrics(): Readonly<RenderMetrics> {
    return { ...this.metrics };
  }

  /**
   * Returns the most recently built render tree.
   */
  getRenderTree(): readonly RenderNode[] {
    return this.renderTree;
  }

  /**
   * Gets the total number of widgets (including nested).
   */
  getWidgetCount(): number {
    return this.widgetMap.size;
  }

  /**
   * Counts visible widgets in the render tree.
   */
  private countVisibleWidgets(nodes: readonly RenderNode[]): number {
    let count = 0;
    for (const node of nodes) {
      if (node.visible) {
        count++;
        count += this.countVisibleWidgets(node.children);
      }
    }
    return count;
  }

  /**
   * Updates performance metrics.
   */
  private updateMetrics(frameTime: number): void {
    this.frameCount++;

    // FPS calculation
    const now = performance.now();
    if (this.lastFrameTime > 0) {
      const delta = now - this.lastFrameTime;
      const fps = delta > 0 ? 1000 / delta : 60;
      this.fpsHistory.push(fps);
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }
    }
    this.lastFrameTime = now;

    const avgFps = this.fpsHistory.length > 0
      ? this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length
      : 60;

    this.metrics = {
      frameTime,
      widgetCount: this.widgetMap.size,
      visibleWidgetCount: this.countVisibleWidgets(this.renderTree),
      renderCalls: this.frameCount,
      layoutPasses: this.metrics.layoutPasses,
      paintTime: frameTime,
      fps: Math.round(avgFps),
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Rough estimate of memory usage based on widget count.
   */
  private estimateMemoryUsage(): number {
    // Approximate: 2KB per widget config + 0.5KB per render node
    return this.widgetMap.size * 2560;
  }

  /**
   * Clears all state.
   */
  reset(): void {
    this.widgetMap.clear();
    this.renderTree = [];
    this.dirtyRegions = [];
    this.frameCount = 0;
    this.lastFrameTime = 0;
    this.fpsHistory = [];
    this.layout.clearCache();
    this.metrics = {
      frameTime: 0,
      widgetCount: 0,
      visibleWidgetCount: 0,
      renderCalls: 0,
      layoutPasses: 0,
      paintTime: 0,
      fps: 60,
      memoryUsage: 0,
    };
  }
}

/** Singleton instance */
export const renderEngine = new RenderEngine();
