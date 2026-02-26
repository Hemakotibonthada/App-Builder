/**
 * Collision Detector
 * 
 * Provides efficient spatial queries for the canvas.
 * Uses a simple partitioning approach for hit testing,
 * overlap detection, and containment queries.
 */

import { Point2D, Rect } from '@/types/canvas.types';
import { CollisionResult, SpatialNode } from '@/types/engine.types';
import { isPointInRect, doRectsIntersect, getIntersection, getBoundingRect } from '@/utils';

/* ──────────────────────────────────────────────
 * Quadtree Implementation
 * ────────────────────────────────────────────── */

interface QuadTreeEntry {
  readonly id: string;
  readonly rect: Rect;
}

const MAX_OBJECTS = 10;
const MAX_LEVELS = 8;

/**
 * Quadtree node for spatial indexing of widgets.
 */
class QuadTreeNode {
  private level: number;
  private bounds: Rect;
  private objects: QuadTreeEntry[] = [];
  private nodes: QuadTreeNode[] = [];

  constructor(level: number, bounds: Rect) {
    this.level = level;
    this.bounds = bounds;
  }

  /**
   * Clears the quadtree.
   */
  clear(): void {
    this.objects = [];
    for (const node of this.nodes) {
      node.clear();
    }
    this.nodes = [];
  }

  /**
   * Splits the node into 4 sub-nodes.
   */
  private split(): void {
    const halfWidth = this.bounds.width / 2;
    const halfHeight = this.bounds.height / 2;
    const x = this.bounds.x;
    const y = this.bounds.y;

    this.nodes = [
      new QuadTreeNode(this.level + 1, { x: x + halfWidth, y, width: halfWidth, height: halfHeight }), // NE
      new QuadTreeNode(this.level + 1, { x, y, width: halfWidth, height: halfHeight }), // NW
      new QuadTreeNode(this.level + 1, { x, y: y + halfHeight, width: halfWidth, height: halfHeight }), // SW
      new QuadTreeNode(this.level + 1, { x: x + halfWidth, y: y + halfHeight, width: halfWidth, height: halfHeight }), // SE
    ];
  }

  /**
   * Determines which quadrant(s) a rect belongs to.
   * Returns -1 if the rect spans multiple quadrants.
   */
  private getIndex(rect: Rect): number {
    const midX = this.bounds.x + this.bounds.width / 2;
    const midY = this.bounds.y + this.bounds.height / 2;

    const fitsTop = rect.y < midY && rect.y + rect.height < midY;
    const fitsBottom = rect.y > midY;
    const fitsLeft = rect.x < midX && rect.x + rect.width < midX;
    const fitsRight = rect.x > midX;

    if (fitsTop) {
      if (fitsRight) return 0; // NE
      if (fitsLeft) return 1;  // NW
    }
    if (fitsBottom) {
      if (fitsLeft) return 2;  // SW
      if (fitsRight) return 3; // SE
    }

    return -1; // Spans multiple quadrants
  }

  /**
   * Inserts an entry into the quadtree.
   */
  insert(entry: QuadTreeEntry): void {
    if (this.nodes.length > 0) {
      const index = this.getIndex(entry.rect);
      if (index !== -1) {
        this.nodes[index]!.insert(entry);
        return;
      }
    }

    this.objects.push(entry);

    if (this.objects.length > MAX_OBJECTS && this.level < MAX_LEVELS) {
      if (this.nodes.length === 0) {
        this.split();
      }

      let i = 0;
      while (i < this.objects.length) {
        const obj = this.objects[i]!;
        const index = this.getIndex(obj.rect);
        if (index !== -1) {
          this.objects.splice(i, 1);
          this.nodes[index]!.insert(obj);
        } else {
          i++;
        }
      }
    }
  }

  /**
   * Returns all entries that could potentially collide with the given rect.
   */
  retrieve(rect: Rect): QuadTreeEntry[] {
    const result: QuadTreeEntry[] = [];

    const index = this.getIndex(rect);
    if (index !== -1 && this.nodes.length > 0) {
      result.push(...this.nodes[index]!.retrieve(rect));
    } else if (this.nodes.length > 0) {
      // Rect spans multiple quadrants, check all
      for (const node of this.nodes) {
        result.push(...node.retrieve(rect));
      }
    }

    result.push(...this.objects);
    return result;
  }

  /**
   * Returns all entries at a specific point.
   */
  queryPoint(point: Point2D): QuadTreeEntry[] {
    return this.retrieve({ x: point.x, y: point.y, width: 1, height: 1 })
      .filter(entry => isPointInRect(point, entry.rect));
  }
}

/* ──────────────────────────────────────────────
 * Collision Detector
 * ────────────────────────────────────────────── */

export class CollisionDetector {
  private quadTree: QuadTreeNode;
  private widgetRects: Map<string, Rect> = new Map();
  private bounds: Rect;

  constructor(bounds: Rect = { x: 0, y: 0, width: 4000, height: 4000 }) {
    this.bounds = bounds;
    this.quadTree = new QuadTreeNode(0, bounds);
  }

  /**
   * Updates all widget bounds in the spatial index.
   * Should be called whenever widgets move or resize.
   */
  updateAll(widgets: ReadonlyMap<string, Rect>): void {
    this.widgetRects.clear();
    this.quadTree.clear();

    for (const [id, rect] of widgets) {
      this.widgetRects.set(id, rect);
      this.quadTree.insert({ id, rect });
    }
  }

  /**
   * Updates a single widget's bounds.
   */
  updateWidget(id: string, rect: Rect): void {
    this.widgetRects.set(id, rect);
    // Rebuild index (could be optimized with removal support)
    this.rebuild();
  }

  /**
   * Removes a widget from the spatial index.
   */
  removeWidget(id: string): void {
    this.widgetRects.delete(id);
    this.rebuild();
  }

  /**
   * Rebuilds the quadtree from current widget map.
   */
  private rebuild(): void {
    this.quadTree = new QuadTreeNode(0, this.bounds);
    for (const [id, rect] of this.widgetRects) {
      this.quadTree.insert({ id, rect });
    }
  }

  /**
   * Tests if a widget collides with any other widgets.
   */
  testCollision(widgetId: string, rect: Rect): CollisionResult {
    const candidates = this.quadTree.retrieve(rect);
    const collidingWidgets: string[] = [];
    let totalOverlap = 0;
    let overlapRect: Rect | null = null;

    for (const candidate of candidates) {
      if (candidate.id === widgetId) continue;

      if (doRectsIntersect(rect, candidate.rect)) {
        collidingWidgets.push(candidate.id);
        const intersection = getIntersection(rect, candidate.rect);
        if (intersection) {
          totalOverlap += intersection.width * intersection.height;
          if (!overlapRect) {
            overlapRect = intersection;
          } else {
            overlapRect = getBoundingRect([overlapRect, intersection]);
          }
        }
      }
    }

    return {
      collides: collidingWidgets.length > 0,
      collidingWidgets,
      overlapArea: totalOverlap,
      overlapRect,
    };
  }

  /**
   * Finds the widget at a specific point (topmost).
   * Returns widget IDs sorted by z-index (last = topmost).
   */
  hitTest(point: Point2D): string[] {
    return this.quadTree
      .queryPoint(point)
      .map(entry => entry.id);
  }

  /**
   * Finds all widgets within a rectangular selection.
   */
  queryRect(rect: Rect): string[] {
    const candidates = this.quadTree.retrieve(rect);
    return candidates
      .filter(c => doRectsIntersect(rect, c.rect))
      .map(c => c.id);
  }

  /**
   * Finds all widgets fully contained within a rect.
   */
  queryContained(rect: Rect): string[] {
    const candidates = this.quadTree.retrieve(rect);
    return candidates
      .filter(c => {
        const r = c.rect;
        return (
          r.x >= rect.x &&
          r.y >= rect.y &&
          r.x + r.width <= rect.x + rect.width &&
          r.y + r.height <= rect.y + rect.height
        );
      })
      .map(c => c.id);
  }

  /**
   * Gets the nearest widget edges to a point.
   */
  getNearestEdges(
    point: Point2D,
    maxDistance: number = 50,
  ): { widgetId: string; edge: 'left' | 'right' | 'top' | 'bottom'; distance: number }[] {
    const searchRect: Rect = {
      x: point.x - maxDistance,
      y: point.y - maxDistance,
      width: maxDistance * 2,
      height: maxDistance * 2,
    };

    const candidates = this.quadTree.retrieve(searchRect);
    const results: { widgetId: string; edge: 'left' | 'right' | 'top' | 'bottom'; distance: number }[] = [];

    for (const candidate of candidates) {
      const r = candidate.rect;
      const edges: { edge: 'left' | 'right' | 'top' | 'bottom'; dist: number }[] = [
        { edge: 'left', dist: Math.abs(point.x - r.x) },
        { edge: 'right', dist: Math.abs(point.x - (r.x + r.width)) },
        { edge: 'top', dist: Math.abs(point.y - r.y) },
        { edge: 'bottom', dist: Math.abs(point.y - (r.y + r.height)) },
      ];

      for (const { edge, dist } of edges) {
        if (dist <= maxDistance) {
          results.push({ widgetId: candidate.id, edge, distance: dist });
        }
      }
    }

    return results.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Returns the current widget bounds map.
   */
  getWidgetRects(): ReadonlyMap<string, Rect> {
    return this.widgetRects;
  }

  /**
   * Clears all data.
   */
  clear(): void {
    this.widgetRects.clear();
    this.quadTree.clear();
  }
}

/** Singleton instance */
export const collisionDetector = new CollisionDetector();
