/**
 * Snap Engine
 * 
 * Handles intelligent snapping of widgets to grids, edges,
 * centers, and spacing guides. Provides visual guide lines
 * that appear during drag operations.
 */

import { Point2D, Rect, SnapGuide } from '@/types/canvas.types';
import { SnapEngineConfig, SnapResult, WidgetBounds } from '@/types/engine.types';
import { generateId, snapToGrid as snapValueToGrid } from '@/utils';

/* ──────────────────────────────────────────────
 * Default Configuration
 * ────────────────────────────────────────────── */

export const DEFAULT_SNAP_CONFIG: SnapEngineConfig = {
  enabled: true,
  threshold: 5,
  snapToGrid: true,
  snapToEdges: true,
  snapToCenter: true,
  snapToSpacing: true,
  snapToSiblings: true,
  gridSize: 8,
};

/* ──────────────────────────────────────────────
 * Snap Engine Class
 * ────────────────────────────────────────────── */

export class SnapEngine {
  private config: SnapEngineConfig;
  private widgetBoundsCache: Map<string, WidgetBounds> = new Map();
  private containerBounds: Rect = { x: 0, y: 0, width: 1440, height: 900 };

  constructor(config: Partial<SnapEngineConfig> = {}) {
    this.config = { ...DEFAULT_SNAP_CONFIG, ...config };
  }

  /**
   * Updates the snap engine configuration.
   */
  updateConfig(config: Partial<SnapEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Sets the container bounds (the canvas artboard).
   */
  setContainerBounds(bounds: Rect): void {
    this.containerBounds = bounds;
  }

  /**
   * Caches the bounds of all widgets for efficient snapping.
   * Call this whenever widgets are added, removed, or repositioned.
   */
  updateWidgetBounds(widgets: ReadonlyMap<string, Rect>): void {
    this.widgetBoundsCache.clear();
    for (const [id, rect] of widgets) {
      this.widgetBoundsCache.set(id, {
        id,
        rect,
        centerX: rect.x + rect.width / 2,
        centerY: rect.y + rect.height / 2,
        edges: {
          left: rect.x,
          right: rect.x + rect.width,
          top: rect.y,
          bottom: rect.y + rect.height,
        },
      });
    }
  }

  /**
   * Calculates the snapped position for a widget being dragged.
   * Returns the adjusted position and any active snap guides.
   */
  snap(
    widgetId: string,
    dragRect: Rect,
    excludeIds: readonly string[] = [],
  ): SnapResult {
    if (!this.config.enabled) {
      return {
        snappedPosition: { x: dragRect.x, y: dragRect.y },
        guides: [],
        didSnapX: false,
        didSnapY: false,
        snapDistanceX: 0,
        snapDistanceY: 0,
      };
    }

    const guides: SnapGuide[] = [];
    let bestSnapX: { offset: number; distance: number } | null = null as { offset: number; distance: number } | null;
    let bestSnapY: { offset: number; distance: number } | null = null as { offset: number; distance: number } | null;

    const dragCenter = {
      x: dragRect.x + dragRect.width / 2,
      y: dragRect.y + dragRect.height / 2,
    };

    const dragEdges = {
      left: dragRect.x,
      right: dragRect.x + dragRect.width,
      top: dragRect.y,
      bottom: dragRect.y + dragRect.height,
    };

    // 1. Snap to grid
    if (this.config.snapToGrid) {
      const gridSnapResult = this.snapToGrid(dragRect);
      if (gridSnapResult.x !== null && (bestSnapX === null || Math.abs(gridSnapResult.x) < bestSnapX.distance)) {
        bestSnapX = { offset: gridSnapResult.x, distance: Math.abs(gridSnapResult.x) };
      }
      if (gridSnapResult.y !== null && (bestSnapY === null || Math.abs(gridSnapResult.y) < bestSnapY.distance)) {
        bestSnapY = { offset: gridSnapResult.y, distance: Math.abs(gridSnapResult.y) };
      }
    }

    // 2. Snap to container edges/center
    this.snapToContainer(dragRect, dragCenter, dragEdges, bestSnapX, bestSnapY, guides)
      .then(result => {
        if (result.snapX) bestSnapX = result.snapX;
        if (result.snapY) bestSnapY = result.snapY;
      })
      .catch(() => { /* sync path below */ });

    // Synchronous container snap
    const containerSnap = this.snapToContainerSync(dragRect, dragCenter, dragEdges, bestSnapX, bestSnapY);
    if (containerSnap.snapX) bestSnapX = containerSnap.snapX;
    if (containerSnap.snapY) bestSnapY = containerSnap.snapY;
    guides.push(...containerSnap.guides);

    // 3. Snap to sibling widgets
    if (this.config.snapToSiblings) {
      const siblingSnap = this.snapToSiblings(
        widgetId,
        dragRect,
        dragCenter,
        dragEdges,
        excludeIds,
        bestSnapX,
        bestSnapY,
      );
      if (siblingSnap.snapX) bestSnapX = siblingSnap.snapX;
      if (siblingSnap.snapY) bestSnapY = siblingSnap.snapY;
      guides.push(...siblingSnap.guides);
    }

    // Calculate snapped position
    const snappedX = bestSnapX ? dragRect.x + bestSnapX.offset : dragRect.x;
    const snappedY = bestSnapY ? dragRect.y + bestSnapY.offset : dragRect.y;

    return {
      snappedPosition: { x: snappedX, y: snappedY },
      guides,
      didSnapX: bestSnapX !== null,
      didSnapY: bestSnapY !== null,
      snapDistanceX: bestSnapX?.distance ?? 0,
      snapDistanceY: bestSnapY?.distance ?? 0,
    };
  }

  /**
   * Snaps position to the nearest grid lines.
   */
  private snapToGrid(rect: Rect): { x: number | null; y: number | null } {
    const gridSize = this.config.gridSize;
    const threshold = this.config.threshold;

    const snappedLeft = snapValueToGrid(rect.x, gridSize);
    const snappedTop = snapValueToGrid(rect.y, gridSize);

    const deltaX = snappedLeft - rect.x;
    const deltaY = snappedTop - rect.y;

    return {
      x: Math.abs(deltaX) <= threshold ? deltaX : null,
      y: Math.abs(deltaY) <= threshold ? deltaY : null,
    };
  }

  /**
   * Synchronous container edge/center snapping.
   */
  private snapToContainerSync(
    dragRect: Rect,
    dragCenter: Point2D,
    dragEdges: { left: number; right: number; top: number; bottom: number },
    currentBestX: { offset: number; distance: number } | null,
    currentBestY: { offset: number; distance: number } | null,
  ): {
    snapX: { offset: number; distance: number } | null;
    snapY: { offset: number; distance: number } | null;
    guides: SnapGuide[];
  } {
    const threshold = this.config.threshold;
    const guides: SnapGuide[] = [];
    let snapX = currentBestX;
    let snapY = currentBestY;

    const cb = this.containerBounds;
    const containerCenter = {
      x: cb.x + cb.width / 2,
      y: cb.y + cb.height / 2,
    };

    // Snap to container center X
    if (this.config.snapToCenter) {
      const centerOffsetX = containerCenter.x - dragCenter.x;
      if (Math.abs(centerOffsetX) <= threshold && (!snapX || Math.abs(centerOffsetX) < snapX.distance)) {
        snapX = { offset: centerOffsetX, distance: Math.abs(centerOffsetX) };
        guides.push({
          id: generateId('guide'),
          orientation: 'vertical',
          position: containerCenter.x,
          type: 'center',
          label: 'Center',
        });
      }

      // Snap to container center Y
      const centerOffsetY = containerCenter.y - dragCenter.y;
      if (Math.abs(centerOffsetY) <= threshold && (!snapY || Math.abs(centerOffsetY) < snapY.distance)) {
        snapY = { offset: centerOffsetY, distance: Math.abs(centerOffsetY) };
        guides.push({
          id: generateId('guide'),
          orientation: 'horizontal',
          position: containerCenter.y,
          type: 'center',
          label: 'Center',
        });
      }
    }

    // Snap to container edges
    if (this.config.snapToEdges) {
      // Left edge
      const leftOffset = cb.x - dragEdges.left;
      if (Math.abs(leftOffset) <= threshold && (!snapX || Math.abs(leftOffset) < snapX.distance)) {
        snapX = { offset: leftOffset, distance: Math.abs(leftOffset) };
        guides.push({
          id: generateId('guide'),
          orientation: 'vertical',
          position: cb.x,
          type: 'edge',
        });
      }

      // Right edge
      const rightOffset = (cb.x + cb.width) - dragEdges.right;
      if (Math.abs(rightOffset) <= threshold && (!snapX || Math.abs(rightOffset) < snapX.distance)) {
        snapX = { offset: rightOffset, distance: Math.abs(rightOffset) };
        guides.push({
          id: generateId('guide'),
          orientation: 'vertical',
          position: cb.x + cb.width,
          type: 'edge',
        });
      }

      // Top edge
      const topOffset = cb.y - dragEdges.top;
      if (Math.abs(topOffset) <= threshold && (!snapY || Math.abs(topOffset) < snapY.distance)) {
        snapY = { offset: topOffset, distance: Math.abs(topOffset) };
        guides.push({
          id: generateId('guide'),
          orientation: 'horizontal',
          position: cb.y,
          type: 'edge',
        });
      }

      // Bottom edge
      const bottomOffset = (cb.y + cb.height) - dragEdges.bottom;
      if (Math.abs(bottomOffset) <= threshold && (!snapY || Math.abs(bottomOffset) < snapY.distance)) {
        snapY = { offset: bottomOffset, distance: Math.abs(bottomOffset) };
        guides.push({
          id: generateId('guide'),
          orientation: 'horizontal',
          position: cb.y + cb.height,
          type: 'edge',
        });
      }
    }

    return { snapX, snapY, guides };
  }

  /**
   * Snaps to sibling widgets' edges, centers, and spacing.
   */
  private snapToSiblings(
    widgetId: string,
    dragRect: Rect,
    dragCenter: Point2D,
    dragEdges: { left: number; right: number; top: number; bottom: number },
    excludeIds: readonly string[],
    currentBestX: { offset: number; distance: number } | null,
    currentBestY: { offset: number; distance: number } | null,
  ): {
    snapX: { offset: number; distance: number } | null;
    snapY: { offset: number; distance: number } | null;
    guides: SnapGuide[];
  } {
    const threshold = this.config.threshold;
    const guides: SnapGuide[] = [];
    let snapX = currentBestX;
    let snapY = currentBestY;

    const excludeSet = new Set([widgetId, ...excludeIds]);

    for (const [id, bounds] of this.widgetBoundsCache) {
      if (excludeSet.has(id)) continue;

      // Snap to sibling left edge
      const leftToLeft = bounds.edges.left - dragEdges.left;
      if (Math.abs(leftToLeft) <= threshold && (!snapX || Math.abs(leftToLeft) < snapX.distance)) {
        snapX = { offset: leftToLeft, distance: Math.abs(leftToLeft) };
        guides.push({
          id: generateId('guide'),
          orientation: 'vertical',
          position: bounds.edges.left,
          type: 'edge',
          sourceWidgetId: widgetId,
          targetWidgetId: id,
        });
      }

      // Snap to sibling right edge
      const rightToRight = bounds.edges.right - dragEdges.right;
      if (Math.abs(rightToRight) <= threshold && (!snapX || Math.abs(rightToRight) < snapX.distance)) {
        snapX = { offset: rightToRight, distance: Math.abs(rightToRight) };
        guides.push({
          id: generateId('guide'),
          orientation: 'vertical',
          position: bounds.edges.right,
          type: 'edge',
          sourceWidgetId: widgetId,
          targetWidgetId: id,
        });
      }

      // Snap drag left to sibling right (and vice versa)
      const leftToRight = bounds.edges.right - dragEdges.left;
      if (Math.abs(leftToRight) <= threshold && (!snapX || Math.abs(leftToRight) < snapX.distance)) {
        snapX = { offset: leftToRight, distance: Math.abs(leftToRight) };
        guides.push({
          id: generateId('guide'),
          orientation: 'vertical',
          position: bounds.edges.right,
          type: 'edge',
          sourceWidgetId: widgetId,
          targetWidgetId: id,
        });
      }

      const rightToLeft = bounds.edges.left - dragEdges.right;
      if (Math.abs(rightToLeft) <= threshold && (!snapX || Math.abs(rightToLeft) < snapX.distance)) {
        snapX = { offset: rightToLeft, distance: Math.abs(rightToLeft) };
        guides.push({
          id: generateId('guide'),
          orientation: 'vertical',
          position: bounds.edges.left,
          type: 'edge',
          sourceWidgetId: widgetId,
          targetWidgetId: id,
        });
      }

      // Snap to sibling center X
      if (this.config.snapToCenter) {
        const centerXOffset = bounds.centerX - dragCenter.x;
        if (Math.abs(centerXOffset) <= threshold && (!snapX || Math.abs(centerXOffset) < snapX.distance)) {
          snapX = { offset: centerXOffset, distance: Math.abs(centerXOffset) };
          guides.push({
            id: generateId('guide'),
            orientation: 'vertical',
            position: bounds.centerX,
            type: 'center',
            sourceWidgetId: widgetId,
            targetWidgetId: id,
          });
        }
      }

      // Vertical snapping (top, bottom, center Y)
      const topToTop = bounds.edges.top - dragEdges.top;
      if (Math.abs(topToTop) <= threshold && (!snapY || Math.abs(topToTop) < snapY.distance)) {
        snapY = { offset: topToTop, distance: Math.abs(topToTop) };
        guides.push({
          id: generateId('guide'),
          orientation: 'horizontal',
          position: bounds.edges.top,
          type: 'edge',
          sourceWidgetId: widgetId,
          targetWidgetId: id,
        });
      }

      const bottomToBottom = bounds.edges.bottom - dragEdges.bottom;
      if (Math.abs(bottomToBottom) <= threshold && (!snapY || Math.abs(bottomToBottom) < snapY.distance)) {
        snapY = { offset: bottomToBottom, distance: Math.abs(bottomToBottom) };
        guides.push({
          id: generateId('guide'),
          orientation: 'horizontal',
          position: bounds.edges.bottom,
          type: 'edge',
          sourceWidgetId: widgetId,
          targetWidgetId: id,
        });
      }

      const topToBottom = bounds.edges.bottom - dragEdges.top;
      if (Math.abs(topToBottom) <= threshold && (!snapY || Math.abs(topToBottom) < snapY.distance)) {
        snapY = { offset: topToBottom, distance: Math.abs(topToBottom) };
        guides.push({
          id: generateId('guide'),
          orientation: 'horizontal',
          position: bounds.edges.bottom,
          type: 'edge',
          sourceWidgetId: widgetId,
          targetWidgetId: id,
        });
      }

      const bottomToTop = bounds.edges.top - dragEdges.bottom;
      if (Math.abs(bottomToTop) <= threshold && (!snapY || Math.abs(bottomToTop) < snapY.distance)) {
        snapY = { offset: bottomToTop, distance: Math.abs(bottomToTop) };
        guides.push({
          id: generateId('guide'),
          orientation: 'horizontal',
          position: bounds.edges.top,
          type: 'edge',
          sourceWidgetId: widgetId,
          targetWidgetId: id,
        });
      }

      if (this.config.snapToCenter) {
        const centerYOffset = bounds.centerY - dragCenter.y;
        if (Math.abs(centerYOffset) <= threshold && (!snapY || Math.abs(centerYOffset) < snapY.distance)) {
          snapY = { offset: centerYOffset, distance: Math.abs(centerYOffset) };
          guides.push({
            id: generateId('guide'),
            orientation: 'horizontal',
            position: bounds.centerY,
            type: 'center',
            sourceWidgetId: widgetId,
            targetWidgetId: id,
          });
        }
      }
    }

    return { snapX, snapY, guides };
  }

  /**
   * Async container snap - kept for API compatibility.
   */
  private async snapToContainer(
    _dragRect: Rect,
    _dragCenter: Point2D,
    _dragEdges: { left: number; right: number; top: number; bottom: number },
    _currentBestX: { offset: number; distance: number } | null,
    _currentBestY: { offset: number; distance: number } | null,
    _guides: SnapGuide[],
  ): Promise<{
    snapX: { offset: number; distance: number } | null;
    snapY: { offset: number; distance: number } | null;
  }> {
    // Handled synchronously in snapToContainerSync
    return { snapX: null, snapY: null };
  }

  /**
   * Clears cached widget bounds.
   */
  clearCache(): void {
    this.widgetBoundsCache.clear();
  }

  /**
   * Returns the current configuration.
   */
  getConfig(): Readonly<SnapEngineConfig> {
    return { ...this.config };
  }
}

/**
 * Singleton snap engine instance for global use.
 */
export const snapEngine = new SnapEngine();
