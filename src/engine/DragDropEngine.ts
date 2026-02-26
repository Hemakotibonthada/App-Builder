/**
 * Drag-Drop Engine
 * 
 * Core engine handling all drag-and-drop interactions in the builder.
 * Coordinates with SnapEngine and CollisionDetector for precise placement.
 * Manages drag from component palette, canvas reordering, and layer tree.
 */

import { Point2D, Rect } from '@/types/canvas.types';
import { DragEventData, DragOperation, DropValidation } from '@/types/engine.types';
import { WidgetConfig, WidgetType } from '@/types/widget.types';
import { generateId, screenToCanvas, isPointInRect } from '@/utils';
import { SnapEngine, snapEngine } from './SnapEngine';
import { CollisionDetector, collisionDetector } from './CollisionDetector';

/* ──────────────────────────────────────────────
 * Drop Zone Computation
 * ────────────────────────────────────────────── */

export interface ComputedDropZone {
  readonly widgetId: string;
  readonly position: 'before' | 'after' | 'inside';
  readonly insertIndex: number;
  readonly rect: Rect;
  readonly depth: number;
}

/* ──────────────────────────────────────────────
 * Drag-Drop Engine
 * ────────────────────────────────────────────── */

export class DragDropEngine {
  private activeDrag: DragOperation | null = null;
  private dropZones: ComputedDropZone[] = [];
  private widgetMap: Map<string, WidgetConfig> = new Map();
  private widgetRects: Map<string, Rect> = new Map();
  private containerTypes: Set<WidgetType> = new Set([
    WidgetType.Container,
    WidgetType.Row,
    WidgetType.Column,
    WidgetType.Stack,
    WidgetType.Grid,
    WidgetType.Card,
    WidgetType.Form,
    WidgetType.ScrollView,
    WidgetType.Accordion,
    WidgetType.Tabs,
    WidgetType.Navbar,
    WidgetType.Sidebar,
    WidgetType.Drawer,
    WidgetType.Modal,
  ]);

  private onDragStartCallbacks: ((op: DragOperation) => void)[] = [];
  private onDragMoveCallbacks: ((op: DragOperation, dropZone: ComputedDropZone | null) => void)[] = [];
  private onDragEndCallbacks: ((op: DragOperation, dropZone: ComputedDropZone | null) => void)[] = [];
  private onDragCancelCallbacks: ((op: DragOperation) => void)[] = [];

  constructor(
    private snap: SnapEngine = snapEngine,
    private collision: CollisionDetector = collisionDetector,
  ) {}

  /**
   * Updates the widget map used for drop zone calculations.
   */
  setWidgets(widgets: Record<string, WidgetConfig>): void {
    this.widgetMap.clear();
    for (const [id, widget] of Object.entries(widgets)) {
      this.widgetMap.set(id, widget);
    }
  }

  /**
   * Updates cached widget rects (from DOM measurements).
   */
  setWidgetRects(rects: Map<string, Rect>): void {
    this.widgetRects = rects;
    this.snap.updateWidgetBounds(rects);
    this.collision.updateAll(rects);
  }

  /**
   * Starts a drag operation from the component palette.
   */
  startPaletteDrag(widgetType: WidgetType, position: Point2D): DragOperation {
    const op: DragOperation = {
      id: generateId('drag'),
      sourceType: 'palette',
      widgetType,
      startPosition: position,
      currentPosition: position,
      startTime: Date.now(),
      isActive: true,
    };

    this.activeDrag = op;
    this.computeDropZones();
    this.notifyDragStart(op);

    return op;
  }

  /**
   * Starts a drag operation from the canvas (moving existing widget).
   */
  startCanvasDrag(widgetId: string, position: Point2D): DragOperation {
    const op: DragOperation = {
      id: generateId('drag'),
      sourceType: 'canvas',
      widgetId,
      startPosition: position,
      currentPosition: position,
      startTime: Date.now(),
      isActive: true,
    };

    this.activeDrag = op;
    this.computeDropZones(widgetId);
    this.notifyDragStart(op);

    return op;
  }

  /**
   * Starts a drag operation from the layer tree (reordering).
   */
  startLayerDrag(widgetId: string, position: Point2D): DragOperation {
    const op: DragOperation = {
      id: generateId('drag'),
      sourceType: 'layer-tree',
      widgetId,
      startPosition: position,
      currentPosition: position,
      startTime: Date.now(),
      isActive: true,
    };

    this.activeDrag = op;
    this.computeDropZones(widgetId);
    this.notifyDragStart(op);

    return op;
  }

  /**
   * Updates the drag position and determines the active drop zone.
   */
  updateDrag(position: Point2D): ComputedDropZone | null {
    if (!this.activeDrag) return null;

    this.activeDrag = {
      ...this.activeDrag,
      currentPosition: position,
    };

    // Find the best matching drop zone
    const dropZone = this.findDropZone(position);
    this.notifyDragMove(this.activeDrag, dropZone);

    return dropZone;
  }

  /**
   * Ends the drag and returns the target drop zone.
   */
  endDrag(): { operation: DragOperation; dropZone: ComputedDropZone | null } | null {
    if (!this.activeDrag) return null;

    const dropZone = this.findDropZone(this.activeDrag.currentPosition);
    const operation = { ...this.activeDrag, isActive: false };

    this.notifyDragEnd(operation, dropZone);
    this.activeDrag = null;
    this.dropZones = [];

    return { operation, dropZone };
  }

  /**
   * Cancels the current drag operation.
   */
  cancelDrag(): void {
    if (!this.activeDrag) return;

    const operation = { ...this.activeDrag, isActive: false };
    this.notifyDragCancel(operation);
    this.activeDrag = null;
    this.dropZones = [];
  }

  /**
   * Validates whether a drop is valid at the given location.
   */
  validateDrop(
    widgetType: WidgetType,
    targetId: string | null,
    insertIndex: number,
  ): DropValidation {
    // Check if target exists
    if (targetId) {
      const target = this.widgetMap.get(targetId);
      if (!target) {
        return {
          isValid: false,
          reason: 'Target widget not found',
          targetWidgetId: null,
          insertIndex: 0,
          dropEffect: 'none',
        };
      }

      // Check if target can accept children
      if (!this.containerTypes.has(target.type)) {
        return {
          isValid: false,
          reason: `${target.type} cannot contain children`,
          targetWidgetId: targetId,
          insertIndex,
          dropEffect: 'none',
        };
      }

      // Check for circular reference (when moving existing widget)
      if (this.activeDrag?.widgetId) {
        if (this.isDescendant(targetId, this.activeDrag.widgetId)) {
          return {
            isValid: false,
            reason: 'Cannot drop a widget inside its own descendant',
            targetWidgetId: targetId,
            insertIndex,
            dropEffect: 'none',
          };
        }
      }
    }

    return {
      isValid: true,
      reason: 'Valid drop location',
      targetWidgetId: targetId,
      insertIndex,
      dropEffect: this.activeDrag?.sourceType === 'palette' ? 'copy' : 'move',
    };
  }

  /**
   * Returns the currently computed drop zones.
   */
  getDropZones(): readonly ComputedDropZone[] {
    return this.dropZones;
  }

  /**
   * Returns the active drag operation.
   */
  getActiveDrag(): DragOperation | null {
    return this.activeDrag;
  }

  /**
   * Whether a drag is currently active.
   */
  isDragging(): boolean {
    return this.activeDrag !== null && this.activeDrag.isActive;
  }

  /* ──────────────────────────────────────────
   * Event Handlers
   * ────────────────────────────────────────── */

  onDragStart(callback: (op: DragOperation) => void): () => void {
    this.onDragStartCallbacks.push(callback);
    return () => {
      this.onDragStartCallbacks = this.onDragStartCallbacks.filter(c => c !== callback);
    };
  }

  onDragMove(callback: (op: DragOperation, dropZone: ComputedDropZone | null) => void): () => void {
    this.onDragMoveCallbacks.push(callback);
    return () => {
      this.onDragMoveCallbacks = this.onDragMoveCallbacks.filter(c => c !== callback);
    };
  }

  onDragEnd(callback: (op: DragOperation, dropZone: ComputedDropZone | null) => void): () => void {
    this.onDragEndCallbacks.push(callback);
    return () => {
      this.onDragEndCallbacks = this.onDragEndCallbacks.filter(c => c !== callback);
    };
  }

  onDragCancel(callback: (op: DragOperation) => void): () => void {
    this.onDragCancelCallbacks.push(callback);
    return () => {
      this.onDragCancelCallbacks = this.onDragCancelCallbacks.filter(c => c !== callback);
    };
  }

  /* ──────────────────────────────────────────
   * Private Methods
   * ────────────────────────────────────────── */

  /**
   * Computes all valid drop zones based on current widget tree.
   */
  private computeDropZones(excludeId?: string): void {
    this.dropZones = [];

    // Add root-level drop zone (canvas)
    this.dropZones.push({
      widgetId: '__root__',
      position: 'inside',
      insertIndex: 0,
      rect: { x: 0, y: 0, width: 1440, height: 900 },
      depth: 0,
    });

    // Recursively compute drop zones for container widgets
    for (const [id, widget] of this.widgetMap) {
      if (id === excludeId) continue;
      if (excludeId && this.isDescendant(id, excludeId)) continue;

      if (this.containerTypes.has(widget.type)) {
        const rect = this.widgetRects.get(id);
        if (rect) {
          // Inside drop zone
          this.dropZones.push({
            widgetId: id,
            position: 'inside',
            insertIndex: widget.childIds.length,
            rect,
            depth: this.getDepth(id),
          });

          // Before/after each child
          for (let i = 0; i < widget.childIds.length; i++) {
            const childId = widget.childIds[i]!;
            const childRect = this.widgetRects.get(childId);
            if (childRect) {
              this.dropZones.push({
                widgetId: id,
                position: 'before',
                insertIndex: i,
                rect: {
                  x: childRect.x,
                  y: childRect.y,
                  width: childRect.width,
                  height: 4,
                },
                depth: this.getDepth(id) + 1,
              });
            }
          }
        }
      }
    }

    // Sort by depth (deepest first) for more precise drop targeting
    this.dropZones.sort((a, b) => b.depth - a.depth);
  }

  /**
   * Finds the best drop zone for a given position.
   */
  private findDropZone(position: Point2D): ComputedDropZone | null {
    // First, try to find deepest container that contains the point
    for (const zone of this.dropZones) {
      if (isPointInRect(position, zone.rect)) {
        return zone;
      }
    }
    return null;
  }

  /**
   * Checks if `widgetId` is a descendant of `ancestorId`.
   */
  private isDescendant(widgetId: string, ancestorId: string): boolean {
    let current = this.widgetMap.get(widgetId);
    while (current) {
      if (current.parentId === ancestorId) return true;
      if (!current.parentId) return false;
      current = this.widgetMap.get(current.parentId);
    }
    return false;
  }

  /**
   * Gets the nesting depth of a widget.
   */
  private getDepth(widgetId: string): number {
    let depth = 0;
    let current = this.widgetMap.get(widgetId);
    while (current?.parentId) {
      depth++;
      current = this.widgetMap.get(current.parentId);
    }
    return depth;
  }

  /* ── Notification Helpers ── */

  private notifyDragStart(op: DragOperation): void {
    for (const cb of this.onDragStartCallbacks) cb(op);
  }

  private notifyDragMove(op: DragOperation, zone: ComputedDropZone | null): void {
    for (const cb of this.onDragMoveCallbacks) cb(op, zone);
  }

  private notifyDragEnd(op: DragOperation, zone: ComputedDropZone | null): void {
    for (const cb of this.onDragEndCallbacks) cb(op, zone);
  }

  private notifyDragCancel(op: DragOperation): void {
    for (const cb of this.onDragCancelCallbacks) cb(op);
  }
}

/** Singleton instance */
export const dragDropEngine = new DragDropEngine();
