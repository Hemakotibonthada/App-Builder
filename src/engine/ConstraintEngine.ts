/**
 * Constraint Engine
 * 
 * Manages spatial constraints between widgets:
 * 1. Anchor constraints (pin edges to parent or siblings)
 * 2. Aspect ratio constraints
 * 3. Size constraints (min/max bounds)
 * 4. Spacing constraints (maintain fixed gaps)
 * 5. Alignment constraints (center, distribute)
 * 6. Chain constraints (linked sequences)
 * 7. Barrier constraints (invisible boundaries)
 * 8. Guideline constraints (percentage-based guides)
 * 9. Constraint solver (iterative relaxation)
 * 10. Constraint visualization
 */

import { Rect, Point2D } from '@/types/canvas.types';

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export type ConstraintEdge = 'top' | 'right' | 'bottom' | 'left' | 'centerX' | 'centerY';

export type ConstraintType =
  | 'anchor'
  | 'aspectRatio'
  | 'sizeMin'
  | 'sizeMax'
  | 'spacing'
  | 'alignment'
  | 'chain'
  | 'barrier'
  | 'guideline'
  | 'equalSize'
  | 'proportional';

export interface Constraint {
  readonly id: string;
  readonly type: ConstraintType;
  readonly sourceId: string;
  readonly targetId: string | null; // null = parent
  readonly sourceEdge: ConstraintEdge;
  readonly targetEdge: ConstraintEdge;
  readonly value: number;
  readonly priority: ConstraintPriority;
  readonly isActive: boolean;
  readonly metadata?: Record<string, any>;
}

export type ConstraintPriority = 'required' | 'high' | 'medium' | 'low';

export interface AnchorConstraint extends Constraint {
  readonly type: 'anchor';
  readonly bias: number; // 0-1, used when opposing constraints exist
}

export interface AspectRatioConstraint extends Constraint {
  readonly type: 'aspectRatio';
  readonly ratio: number; // width/height
}

export interface SpacingConstraint extends Constraint {
  readonly type: 'spacing';
  readonly minSpacing: number;
  readonly maxSpacing: number;
}

export interface ChainConstraint extends Constraint {
  readonly type: 'chain';
  readonly chainStyle: 'spread' | 'spread_inside' | 'packed' | 'weighted';
  readonly chainIds: readonly string[];
  readonly weights: readonly number[];
}

export interface BarrierConstraint {
  readonly id: string;
  readonly type: 'barrier';
  readonly direction: 'top' | 'bottom' | 'left' | 'right';
  readonly referencedIds: readonly string[];
  readonly margin: number;
}

export interface Guideline {
  readonly id: string;
  readonly type: 'guideline';
  readonly orientation: 'horizontal' | 'vertical';
  readonly position: number; // percentage 0-100
  readonly isAbsolute: boolean;
}

export interface ConstraintSolverResult {
  readonly layouts: Record<string, Rect>;
  readonly iterations: number;
  readonly converged: boolean;
  readonly maxError: number;
  readonly satisfiedConstraints: number;
  readonly totalConstraints: number;
  readonly violations: readonly ConstraintViolation[];
}

export interface ConstraintViolation {
  readonly constraintId: string;
  readonly error: number;
  readonly description: string;
}

export interface ConstraintVisualization {
  readonly arrows: readonly ConstraintArrow[];
  readonly guides: readonly ConstraintGuideLine[];
  readonly labels: readonly ConstraintLabel[];
}

export interface ConstraintArrow {
  readonly from: Point2D;
  readonly to: Point2D;
  readonly color: string;
  readonly dashed: boolean;
  readonly label: string;
}

export interface ConstraintGuideLine {
  readonly start: Point2D;
  readonly end: Point2D;
  readonly color: string;
  readonly dashed: boolean;
}

export interface ConstraintLabel {
  readonly position: Point2D;
  readonly text: string;
  readonly color: string;
}

/* ──────────────────────────────────────────────
 * Constraint Engine
 * ────────────────────────────────────────────── */

export class ConstraintEngine {
  private constraints: Map<string, Constraint> = new Map();
  private barriers: Map<string, BarrierConstraint> = new Map();
  private guidelines: Map<string, Guideline> = new Map();
  private layouts: Map<string, Rect> = new Map();
  private parentRect: Rect = { x: 0, y: 0, width: 1200, height: 800 };
  private maxIterations: number = 100;
  private convergenceThreshold: number = 0.5;

  /* ──────────────────────────────────────────
   * Setup
   * ────────────────────────────────────────── */

  setParentRect(rect: Rect): void {
    this.parentRect = rect;
  }

  setLayout(widgetId: string, rect: Rect): void {
    this.layouts.set(widgetId, rect);
  }

  setLayouts(layouts: Record<string, Rect>): void {
    for (const [id, rect] of Object.entries(layouts)) {
      this.layouts.set(id, rect);
    }
  }

  removeLayout(widgetId: string): void {
    this.layouts.delete(widgetId);
  }

  /* ──────────────────────────────────────────
   * Constraint Management
   * ────────────────────────────────────────── */

  addConstraint(constraint: Constraint): void {
    this.constraints.set(constraint.id, constraint);
  }

  removeConstraint(constraintId: string): void {
    this.constraints.delete(constraintId);
  }

  getConstraint(constraintId: string): Constraint | null {
    return this.constraints.get(constraintId) ?? null;
  }

  getConstraintsForWidget(widgetId: string): readonly Constraint[] {
    return Array.from(this.constraints.values()).filter(
      c => c.sourceId === widgetId || c.targetId === widgetId,
    );
  }

  getAllConstraints(): readonly Constraint[] {
    return Array.from(this.constraints.values());
  }

  clearConstraints(): void {
    this.constraints.clear();
  }

  toggleConstraint(constraintId: string, active: boolean): void {
    const constraint = this.constraints.get(constraintId);
    if (constraint) {
      this.constraints.set(constraintId, { ...constraint, isActive: active });
    }
  }

  /* ──────────────────────────────────────────
   * Barrier Management
   * ────────────────────────────────────────── */

  addBarrier(barrier: BarrierConstraint): void {
    this.barriers.set(barrier.id, barrier);
  }

  removeBarrier(barrierId: string): void {
    this.barriers.delete(barrierId);
  }

  getBarrierPosition(barrierId: string): number | null {
    const barrier = this.barriers.get(barrierId);
    if (!barrier) return null;

    const positions = barrier.referencedIds
      .map(id => this.layouts.get(id))
      .filter((r): r is Rect => r != null)
      .map(r => {
        switch (barrier.direction) {
          case 'top': return r.y;
          case 'bottom': return r.y + r.height;
          case 'left': return r.x;
          case 'right': return r.x + r.width;
        }
      });

    if (positions.length === 0) return null;

    switch (barrier.direction) {
      case 'top':
      case 'left':
        return Math.min(...positions) - barrier.margin;
      case 'bottom':
      case 'right':
        return Math.max(...positions) + barrier.margin;
    }
  }

  /* ──────────────────────────────────────────
   * Guideline Management
   * ────────────────────────────────────────── */

  addGuideline(guideline: Guideline): void {
    this.guidelines.set(guideline.id, guideline);
  }

  removeGuideline(guidelineId: string): void {
    this.guidelines.delete(guidelineId);
  }

  getGuidelinePosition(guidelineId: string): number | null {
    const guideline = this.guidelines.get(guidelineId);
    if (!guideline) return null;

    if (guideline.isAbsolute) return guideline.position;

    if (guideline.orientation === 'horizontal') {
      return this.parentRect.y + (guideline.position / 100) * this.parentRect.height;
    } else {
      return this.parentRect.x + (guideline.position / 100) * this.parentRect.width;
    }
  }

  /* ──────────────────────────────────────────
   * Constraint Solver
   * ────────────────────────────────────────── */

  solve(): ConstraintSolverResult {
    const startTime = performance.now();
    const activeConstraints = Array.from(this.constraints.values()).filter(c => c.isActive);

    // Sort by priority
    const priorityOrder: Record<ConstraintPriority, number> = {
      required: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    activeConstraints.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Working copy of layouts
    const working = new Map<string, Rect>();
    for (const [id, rect] of this.layouts) {
      working.set(id, { ...rect });
    }

    let converged = false;
    let iterations = 0;
    let maxError = 0;
    const violations: ConstraintViolation[] = [];

    // Iterative relaxation
    for (iterations = 0; iterations < this.maxIterations; iterations++) {
      maxError = 0;

      for (const constraint of activeConstraints) {
        const error = this.applyConstraint(constraint, working);
        maxError = Math.max(maxError, Math.abs(error));
      }

      // Apply barrier constraints
      for (const barrier of this.barriers.values()) {
        this.applyBarrier(barrier, working);
      }

      if (maxError < this.convergenceThreshold) {
        converged = true;
        break;
      }
    }

    // Check for violations
    let satisfiedCount = 0;
    for (const constraint of activeConstraints) {
      const error = this.measureConstraintError(constraint, working);
      if (Math.abs(error) < this.convergenceThreshold) {
        satisfiedCount++;
      } else {
        violations.push({
          constraintId: constraint.id,
          error,
          description: `Constraint ${constraint.type} on ${constraint.sourceId}: error ${error.toFixed(2)}px`,
        });
      }
    }

    // Copy results back
    const resultLayouts: Record<string, Rect> = {};
    for (const [id, rect] of working) {
      resultLayouts[id] = rect;
      this.layouts.set(id, rect);
    }

    return {
      layouts: resultLayouts,
      iterations,
      converged,
      maxError,
      satisfiedConstraints: satisfiedCount,
      totalConstraints: activeConstraints.length,
      violations,
    };
  }

  /* ──────────────────────────────────────────
   * Quick Constraint Builders
   * ────────────────────────────────────────── */

  pinToParentEdges(widgetId: string, margins: { top?: number; right?: number; bottom?: number; left?: number }): string[] {
    const ids: string[] = [];

    if (margins.top !== undefined) {
      const id = `pin_${widgetId}_top`;
      this.addConstraint({
        id, type: 'anchor', sourceId: widgetId, targetId: null,
        sourceEdge: 'top', targetEdge: 'top', value: margins.top,
        priority: 'required', isActive: true,
      });
      ids.push(id);
    }
    if (margins.right !== undefined) {
      const id = `pin_${widgetId}_right`;
      this.addConstraint({
        id, type: 'anchor', sourceId: widgetId, targetId: null,
        sourceEdge: 'right', targetEdge: 'right', value: margins.right,
        priority: 'required', isActive: true,
      });
      ids.push(id);
    }
    if (margins.bottom !== undefined) {
      const id = `pin_${widgetId}_bottom`;
      this.addConstraint({
        id, type: 'anchor', sourceId: widgetId, targetId: null,
        sourceEdge: 'bottom', targetEdge: 'bottom', value: margins.bottom,
        priority: 'required', isActive: true,
      });
      ids.push(id);
    }
    if (margins.left !== undefined) {
      const id = `pin_${widgetId}_left`;
      this.addConstraint({
        id, type: 'anchor', sourceId: widgetId, targetId: null,
        sourceEdge: 'left', targetEdge: 'left', value: margins.left,
        priority: 'required', isActive: true,
      });
      ids.push(id);
    }

    return ids;
  }

  centerInParent(widgetId: string): string[] {
    const hId = `center_${widgetId}_h`;
    const vId = `center_${widgetId}_v`;

    this.addConstraint({
      id: hId, type: 'anchor', sourceId: widgetId, targetId: null,
      sourceEdge: 'centerX', targetEdge: 'centerX', value: 0,
      priority: 'required', isActive: true,
    });

    this.addConstraint({
      id: vId, type: 'anchor', sourceId: widgetId, targetId: null,
      sourceEdge: 'centerY', targetEdge: 'centerY', value: 0,
      priority: 'required', isActive: true,
    });

    return [hId, vId];
  }

  constrainAspectRatio(widgetId: string, ratio: number): string {
    const id = `aspect_${widgetId}`;
    this.addConstraint({
      id, type: 'aspectRatio', sourceId: widgetId, targetId: null,
      sourceEdge: 'centerX', targetEdge: 'centerX', value: ratio,
      priority: 'high', isActive: true,
    });
    return id;
  }

  constrainMinSize(widgetId: string, minWidth: number, minHeight: number): string {
    const id = `minsize_${widgetId}`;
    this.addConstraint({
      id, type: 'sizeMin', sourceId: widgetId, targetId: null,
      sourceEdge: 'centerX', targetEdge: 'centerX',
      value: 0, priority: 'required', isActive: true,
      metadata: { minWidth, minHeight },
    });
    return id;
  }

  constrainMaxSize(widgetId: string, maxWidth: number, maxHeight: number): string {
    const id = `maxsize_${widgetId}`;
    this.addConstraint({
      id, type: 'sizeMax', sourceId: widgetId, targetId: null,
      sourceEdge: 'centerX', targetEdge: 'centerX',
      value: 0, priority: 'required', isActive: true,
      metadata: { maxWidth, maxHeight },
    });
    return id;
  }

  constrainSpacing(sourceId: string, targetId: string, spacing: number, edge: 'horizontal' | 'vertical'): string {
    const id = `spacing_${sourceId}_${targetId}`;
    this.addConstraint({
      id, type: 'spacing', sourceId, targetId,
      sourceEdge: edge === 'horizontal' ? 'right' : 'bottom',
      targetEdge: edge === 'horizontal' ? 'left' : 'top',
      value: spacing, priority: 'high', isActive: true,
    });
    return id;
  }

  equalizeWidths(widgetIds: readonly string[]): string[] {
    const ids: string[] = [];
    for (let i = 1; i < widgetIds.length; i++) {
      const id = `eqw_${widgetIds[0]}_${widgetIds[i]}`;
      this.addConstraint({
        id, type: 'equalSize', sourceId: widgetIds[i], targetId: widgetIds[0],
        sourceEdge: 'left', targetEdge: 'left', value: 0,
        priority: 'medium', isActive: true,
        metadata: { dimension: 'width' },
      });
      ids.push(id);
    }
    return ids;
  }

  equalizeHeights(widgetIds: readonly string[]): string[] {
    const ids: string[] = [];
    for (let i = 1; i < widgetIds.length; i++) {
      const id = `eqh_${widgetIds[0]}_${widgetIds[i]}`;
      this.addConstraint({
        id, type: 'equalSize', sourceId: widgetIds[i], targetId: widgetIds[0],
        sourceEdge: 'top', targetEdge: 'top', value: 0,
        priority: 'medium', isActive: true,
        metadata: { dimension: 'height' },
      });
      ids.push(id);
    }
    return ids;
  }

  /* ──────────────────────────────────────────
   * Visualization
   * ────────────────────────────────────────── */

  getVisualization(): ConstraintVisualization {
    const arrows: ConstraintArrow[] = [];
    const guides: ConstraintGuideLine[] = [];
    const labels: ConstraintLabel[] = [];

    // Constraint arrows
    for (const constraint of this.constraints.values()) {
      if (!constraint.isActive) continue;

      const sourceRect = this.layouts.get(constraint.sourceId);
      if (!sourceRect) continue;

      const targetRect = constraint.targetId
        ? this.layouts.get(constraint.targetId)
        : this.parentRect;
      if (!targetRect) continue;

      const from = this.getEdgePoint(sourceRect, constraint.sourceEdge);
      const to = this.getEdgePoint(targetRect, constraint.targetEdge);

      const color = this.getConstraintColor(constraint.type);

      arrows.push({
        from, to, color,
        dashed: constraint.priority !== 'required',
        label: `${constraint.value}px`,
      });

      labels.push({
        position: {
          x: (from.x + to.x) / 2,
          y: (from.y + to.y) / 2,
        },
        text: `${constraint.value}`,
        color,
      });
    }

    // Guidelines
    for (const guideline of this.guidelines.values()) {
      const pos = this.getGuidelinePosition(guideline.id);
      if (pos === null) continue;

      if (guideline.orientation === 'horizontal') {
        guides.push({
          start: { x: this.parentRect.x, y: pos },
          end: { x: this.parentRect.x + this.parentRect.width, y: pos },
          color: '#14b8a6',
          dashed: true,
        });
      } else {
        guides.push({
          start: { x: pos, y: this.parentRect.y },
          end: { x: pos, y: this.parentRect.y + this.parentRect.height },
          color: '#14b8a6',
          dashed: true,
        });
      }
    }

    return { arrows, guides, labels };
  }

  /* ──────────────────────────────────────────
   * Private - Constraint Application
   * ────────────────────────────────────────── */

  private applyConstraint(constraint: Constraint, layouts: Map<string, Rect>): number {
    const source = layouts.get(constraint.sourceId);
    if (!source) return 0;

    const target = constraint.targetId
      ? layouts.get(constraint.targetId)
      : this.parentRect;
    if (!target) return 0;

    switch (constraint.type) {
      case 'anchor': return this.applyAnchorConstraint(constraint, source, target, layouts);
      case 'aspectRatio': return this.applyAspectRatioConstraint(constraint, source, layouts);
      case 'sizeMin': return this.applySizeMinConstraint(constraint, source, layouts);
      case 'sizeMax': return this.applySizeMaxConstraint(constraint, source, layouts);
      case 'spacing': return this.applySpacingConstraint(constraint, source, target, layouts);
      case 'equalSize': return this.applyEqualSizeConstraint(constraint, source, target, layouts);
      default: return 0;
    }
  }

  private applyAnchorConstraint(
    constraint: Constraint, source: Rect, target: Rect, layouts: Map<string, Rect>,
  ): number {
    const targetEdgeValue = this.getEdgeValue(target, constraint.targetEdge);
    const sourceEdgeValue = this.getEdgeValue(source, constraint.sourceEdge);
    const desired = targetEdgeValue + constraint.value;
    const error = desired - sourceEdgeValue;

    if (Math.abs(error) < this.convergenceThreshold) return 0;

    const damping = 0.5; // Relaxation factor
    const adjustment = error * damping;

    const updated = { ...source };

    switch (constraint.sourceEdge) {
      case 'top':
        (updated as any).y = source.y + adjustment;
        break;
      case 'bottom':
        (updated as any).y = source.y + adjustment;
        break;
      case 'left':
        (updated as any).x = source.x + adjustment;
        break;
      case 'right':
        (updated as any).x = source.x + adjustment;
        break;
      case 'centerX':
        (updated as any).x = source.x + adjustment;
        break;
      case 'centerY':
        (updated as any).y = source.y + adjustment;
        break;
    }

    layouts.set(constraint.sourceId, updated);
    return error;
  }

  private applyAspectRatioConstraint(
    constraint: Constraint, source: Rect, layouts: Map<string, Rect>,
  ): number {
    const ratio = constraint.value;
    const currentRatio = source.width / (source.height || 1);
    const error = ratio - currentRatio;

    if (Math.abs(error) < 0.01) return 0;

    // Adjust height to match ratio
    const newHeight = source.width / ratio;
    layouts.set(constraint.sourceId, { ...source, height: newHeight });
    return error;
  }

  private applySizeMinConstraint(
    constraint: Constraint, source: Rect, layouts: Map<string, Rect>,
  ): number {
    const meta = constraint.metadata ?? {};
    const minW = meta.minWidth ?? 0;
    const minH = meta.minHeight ?? 0;
    let error = 0;

    const updated = { ...source };
    if (source.width < minW) {
      (updated as any).width = minW;
      error += minW - source.width;
    }
    if (source.height < minH) {
      (updated as any).height = minH;
      error += minH - source.height;
    }

    layouts.set(constraint.sourceId, updated);
    return error;
  }

  private applySizeMaxConstraint(
    constraint: Constraint, source: Rect, layouts: Map<string, Rect>,
  ): number {
    const meta = constraint.metadata ?? {};
    const maxW = meta.maxWidth ?? Infinity;
    const maxH = meta.maxHeight ?? Infinity;
    let error = 0;

    const updated = { ...source };
    if (source.width > maxW) {
      (updated as any).width = maxW;
      error += source.width - maxW;
    }
    if (source.height > maxH) {
      (updated as any).height = maxH;
      error += source.height - maxH;
    }

    layouts.set(constraint.sourceId, updated);
    return error;
  }

  private applySpacingConstraint(
    constraint: Constraint, source: Rect, target: Rect, layouts: Map<string, Rect>,
  ): number {
    const sourceEdge = this.getEdgeValue(source, constraint.sourceEdge);
    const targetEdge = this.getEdgeValue(target, constraint.targetEdge);
    const actualSpacing = targetEdge - sourceEdge;
    const error = constraint.value - actualSpacing;

    if (Math.abs(error) < this.convergenceThreshold) return 0;

    const adjustment = error * 0.5;
    const updated = { ...source };

    if (constraint.sourceEdge === 'right' || constraint.sourceEdge === 'bottom') {
      if (constraint.sourceEdge === 'right') {
        (updated as any).x = source.x - adjustment;
      } else {
        (updated as any).y = source.y - adjustment;
      }
    }

    layouts.set(constraint.sourceId, updated);
    return error;
  }

  private applyEqualSizeConstraint(
    constraint: Constraint, source: Rect, target: Rect, layouts: Map<string, Rect>,
  ): number {
    const dim = constraint.metadata?.dimension ?? 'width';
    const targetSize = dim === 'width' ? target.width : target.height;
    const sourceSize = dim === 'width' ? source.width : source.height;
    const error = targetSize - sourceSize;

    if (Math.abs(error) < this.convergenceThreshold) return 0;

    const updated = { ...source };
    if (dim === 'width') {
      (updated as any).width = targetSize;
    } else {
      (updated as any).height = targetSize;
    }

    layouts.set(constraint.sourceId, updated);
    return error;
  }

  private applyBarrier(barrier: BarrierConstraint, layouts: Map<string, Rect>): void {
    const pos = this.getBarrierPosition(barrier.id);
    if (pos === null) return;

    for (const [id, rect] of layouts) {
      if (barrier.referencedIds.includes(id)) continue;

      switch (barrier.direction) {
        case 'top':
          if (rect.y < pos) layouts.set(id, { ...rect, y: pos });
          break;
        case 'bottom':
          if (rect.y + rect.height > pos) layouts.set(id, { ...rect, y: pos - rect.height });
          break;
        case 'left':
          if (rect.x < pos) layouts.set(id, { ...rect, x: pos });
          break;
        case 'right':
          if (rect.x + rect.width > pos) layouts.set(id, { ...rect, x: pos - rect.width });
          break;
      }
    }
  }

  private measureConstraintError(constraint: Constraint, layouts: Map<string, Rect>): number {
    const source = layouts.get(constraint.sourceId);
    if (!source) return 0;
    const target = constraint.targetId ? layouts.get(constraint.targetId) : this.parentRect;
    if (!target) return 0;

    const targetEdge = this.getEdgeValue(target, constraint.targetEdge);
    const sourceEdge = this.getEdgeValue(source, constraint.sourceEdge);
    return (targetEdge + constraint.value) - sourceEdge;
  }

  /* ──────────────────────────────────────────
   * Private - Helpers
   * ────────────────────────────────────────── */

  private getEdgeValue(rect: Rect, edge: ConstraintEdge): number {
    switch (edge) {
      case 'top': return rect.y;
      case 'right': return rect.x + rect.width;
      case 'bottom': return rect.y + rect.height;
      case 'left': return rect.x;
      case 'centerX': return rect.x + rect.width / 2;
      case 'centerY': return rect.y + rect.height / 2;
    }
  }

  private getEdgePoint(rect: Rect, edge: ConstraintEdge): Point2D {
    switch (edge) {
      case 'top': return { x: rect.x + rect.width / 2, y: rect.y };
      case 'right': return { x: rect.x + rect.width, y: rect.y + rect.height / 2 };
      case 'bottom': return { x: rect.x + rect.width / 2, y: rect.y + rect.height };
      case 'left': return { x: rect.x, y: rect.y + rect.height / 2 };
      case 'centerX': return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      case 'centerY': return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    }
  }

  private getConstraintColor(type: ConstraintType): string {
    switch (type) {
      case 'anchor': return '#6366f1';
      case 'aspectRatio': return '#ec4899';
      case 'sizeMin': return '#f59e0b';
      case 'sizeMax': return '#ef4444';
      case 'spacing': return '#14b8a6';
      case 'alignment': return '#8b5cf6';
      case 'chain': return '#06b6d4';
      case 'equalSize': return '#84cc16';
      case 'proportional': return '#f97316';
      default: return '#94a3b8';
    }
  }
}

/* ──────────────────────────────────────────────
 * Singleton
 * ────────────────────────────────────────────── */

let _constraintEngine: ConstraintEngine | null = null;

export function getConstraintEngine(): ConstraintEngine {
  if (!_constraintEngine) _constraintEngine = new ConstraintEngine();
  return _constraintEngine;
}
