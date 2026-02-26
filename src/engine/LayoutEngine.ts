/**
 * Layout Engine
 * 
 * Computes the actual layout (bounding boxes) for all widgets
 * based on their style properties, parent constraints, and
 * layout mode (flex, grid, absolute, flow).
 */

import { Rect } from '@/types/canvas.types';
import { WidgetConfig, DisplayType, FlexDirection, Alignment, Overflow } from '@/types/widget.types';
import { ComputedLayout, LayoutConstraint, LayoutMode } from '@/types/engine.types';
import { dimensionToCSS } from '@/utils';

/* ──────────────────────────────────────────────
 * Layout Engine
 * ────────────────────────────────────────────── */

export class LayoutEngine {
  private widgetMap: Map<string, WidgetConfig> = new Map();
  private layoutCache: Map<string, ComputedLayout> = new Map();
  private dirty: Set<string> = new Set();
  
  /**
   * Updates the widget registry used for layout computation.
   */
  setWidgets(widgets: Record<string, WidgetConfig>): void {
    this.widgetMap.clear();
    for (const [id, widget] of Object.entries(widgets)) {
      this.widgetMap.set(id, widget);
    }
    // Invalidate all
    this.dirty = new Set(this.widgetMap.keys());
  }

  /**
   * Marks a widget (and its descendants) as needing re-layout.
   */
  invalidate(widgetId: string): void {
    this.dirty.add(widgetId);
    const widget = this.widgetMap.get(widgetId);
    if (widget) {
      for (const childId of widget.childIds) {
        this.invalidate(childId);
      }
    }
  }

  /**
   * Computes layout for a set of root widget IDs within a container.
   */
  computeLayout(
    rootIds: readonly string[],
    containerRect: Rect,
  ): readonly ComputedLayout[] {
    const results: ComputedLayout[] = [];

    let yOffset = containerRect.y;

    for (const id of rootIds) {
      const widget = this.widgetMap.get(id);
      if (!widget) continue;

      const constraint: LayoutConstraint = {
        minWidth: 0,
        maxWidth: containerRect.width,
        minHeight: 0,
        maxHeight: containerRect.height,
      };

      const layout = this.computeWidgetLayout(widget, {
        x: containerRect.x,
        y: yOffset,
        width: containerRect.width,
        height: containerRect.height - (yOffset - containerRect.y),
      }, constraint);

      results.push(layout);
      yOffset += layout.rect.height;
    }

    return results;
  }

  /**
   * Computes layout for a single widget and its children.
   */
  private computeWidgetLayout(
    widget: WidgetConfig,
    parentRect: Rect,
    constraint: LayoutConstraint,
  ): ComputedLayout {
    // Check cache
    if (!this.dirty.has(widget.id)) {
      const cached = this.layoutCache.get(widget.id);
      if (cached) return cached;
    }

    const style = widget.style;

    // Resolve dimensions
    const resolvedWidth = this.resolveDimension(
      style.width,
      parentRect.width,
      constraint.minWidth,
      constraint.maxWidth,
    );

    const resolvedHeight = this.resolveDimension(
      style.height,
      parentRect.height,
      constraint.minHeight,
      constraint.maxHeight,
    );

    // Resolve position
    let x = parentRect.x;
    let y = parentRect.y;

    if (style.position === 'absolute' || style.position === 'fixed') {
      if (style.left) x = parentRect.x + this.resolveValue(style.left, parentRect.width);
      if (style.top) y = parentRect.y + this.resolveValue(style.top, parentRect.height);
    } else {
      x = widget.position.x || parentRect.x;
      y = widget.position.y || parentRect.y;
    }

    // Compute padding
    const paddingTop = style.padding?.top ?? 0;
    const paddingRight = style.padding?.right ?? 0;
    const paddingBottom = style.padding?.bottom ?? 0;
    const paddingLeft = style.padding?.left ?? 0;

    const rect: Rect = {
      x,
      y,
      width: resolvedWidth,
      height: resolvedHeight,
    };

    const contentRect: Rect = {
      x: x + paddingLeft,
      y: y + paddingTop,
      width: resolvedWidth - paddingLeft - paddingRight,
      height: resolvedHeight - paddingTop - paddingBottom,
    };

    // Compute children layouts
    const childLayouts = this.computeChildrenLayout(widget, contentRect);

    // Auto-size if height is not set
    let finalHeight = resolvedHeight;
    if (!style.height && childLayouts.length > 0) {
      const childrenBottom = Math.max(
        ...childLayouts.map(c => c.rect.y + c.rect.height),
      );
      finalHeight = Math.max(resolvedHeight, childrenBottom - y + paddingBottom);
    }

    const layout: ComputedLayout = {
      widgetId: widget.id,
      rect: { ...rect, height: finalHeight },
      contentRect,
      children: childLayouts,
      overflow: false,
      visible: widget.visibility.visible,
    };

    // Cache result
    this.layoutCache.set(widget.id, layout);
    this.dirty.delete(widget.id);

    return layout;
  }

  /**
   * Computes layout for children based on parent's display mode.
   */
  private computeChildrenLayout(
    parent: WidgetConfig,
    contentRect: Rect,
  ): ComputedLayout[] {
    if (parent.childIds.length === 0) return [];

    const display = parent.style.display ?? DisplayType.Flex;

    switch (display) {
      case DisplayType.Flex:
      case DisplayType.InlineFlex:
        return this.computeFlexLayout(parent, contentRect);
      case DisplayType.Grid:
        return this.computeGridLayout(parent, contentRect);
      default:
        return this.computeFlowLayout(parent, contentRect);
    }
  }

  /**
   * Flex layout computation.
   */
  private computeFlexLayout(
    parent: WidgetConfig,
    contentRect: Rect,
  ): ComputedLayout[] {
    const results: ComputedLayout[] = [];
    const direction = parent.style.flexDirection ?? FlexDirection.Column;
    const isRow = direction === FlexDirection.Row || direction === FlexDirection.RowReverse;
    const isReverse = direction === FlexDirection.RowReverse || direction === FlexDirection.ColumnReverse;
    const gap = parent.style.gap ?? 0;

    const children = parent.childIds
      .map(id => this.widgetMap.get(id))
      .filter((w): w is WidgetConfig => w !== undefined);

    if (children.length === 0) return [];

    // Calculate total available space
    const totalGaps = (children.length - 1) * gap;
    const availableMainSize = isRow
      ? contentRect.width - totalGaps
      : contentRect.height - totalGaps;

    // Compute base sizes and flex factors
    let totalFlexGrow = 0;
    let totalFixedSize = 0;
    const childInfos = children.map(child => {
      const flexGrow = child.style.flexGrow ?? 0;
      const baseSize = isRow
        ? this.resolveDimension(child.style.width, contentRect.width, 0, contentRect.width)
        : this.resolveDimension(child.style.height, contentRect.height, 0, contentRect.height);

      totalFlexGrow += flexGrow;
      if (flexGrow === 0) totalFixedSize += baseSize;

      return { child, flexGrow, baseSize };
    });

    // Distribute remaining space
    const remainingSpace = Math.max(0, availableMainSize - totalFixedSize);

    let mainOffset = isRow ? contentRect.x : contentRect.y;

    // Handle justify-content
    const justify = parent.style.justifyContent;
    if (totalFlexGrow === 0) {
      switch (justify) {
        case Alignment.Center:
          mainOffset += remainingSpace / 2;
          break;
        case Alignment.End:
          mainOffset += remainingSpace;
          break;
        case Alignment.SpaceBetween: {
          // Handled per-item below
          break;
        }
        case Alignment.SpaceAround: {
          const spacing = remainingSpace / children.length;
          mainOffset += spacing / 2;
          break;
        }
        case Alignment.SpaceEvenly: {
          const spacing = remainingSpace / (children.length + 1);
          mainOffset += spacing;
          break;
        }
      }
    }

    const spaceBetween = justify === Alignment.SpaceBetween && children.length > 1
      ? remainingSpace / (children.length - 1)
      : 0;
    const spaceAround = justify === Alignment.SpaceAround
      ? remainingSpace / children.length
      : 0;
    const spaceEvenly = justify === Alignment.SpaceEvenly
      ? remainingSpace / (children.length + 1)
      : 0;

    const orderedInfos = isReverse ? [...childInfos].reverse() : childInfos;

    for (const info of orderedInfos) {
      const { child, flexGrow, baseSize } = info;

      const mainSize = flexGrow > 0 && totalFlexGrow > 0
        ? baseSize + (remainingSpace * flexGrow) / totalFlexGrow
        : baseSize;

      const crossSize = isRow
        ? this.resolveDimension(child.style.height, contentRect.height, 0, contentRect.height)
        : this.resolveDimension(child.style.width, contentRect.width, 0, contentRect.width);

      // Handle align-items for cross-axis
      let crossOffset = isRow ? contentRect.y : contentRect.x;
      const alignItems = parent.style.alignItems;
      const crossAvail = isRow ? contentRect.height : contentRect.width;
      
      switch (alignItems) {
        case Alignment.Center:
          crossOffset += (crossAvail - crossSize) / 2;
          break;
        case Alignment.End:
          crossOffset += crossAvail - crossSize;
          break;
        case Alignment.Stretch:
          // crossSize = crossAvail; // fill
          break;
      }

      const childRect: Rect = isRow
        ? { x: mainOffset, y: crossOffset, width: mainSize, height: crossSize }
        : { x: crossOffset, y: mainOffset, width: crossSize, height: mainSize };

      const childConstraint: LayoutConstraint = {
        minWidth: 0,
        maxWidth: childRect.width,
        minHeight: 0,
        maxHeight: childRect.height,
      };

      const layout = this.computeWidgetLayout(child, childRect, childConstraint);
      results.push(layout);

      mainOffset += mainSize + gap;

      // Add distribution spacing
      if (spaceBetween > 0) mainOffset += spaceBetween;
      if (spaceAround > 0) mainOffset += spaceAround;
      if (spaceEvenly > 0) mainOffset += spaceEvenly;
    }

    return results;
  }

  /**
   * Grid layout computation (simplified).
   */
  private computeGridLayout(
    parent: WidgetConfig,
    contentRect: Rect,
  ): ComputedLayout[] {
    const results: ComputedLayout[] = [];
    const gap = parent.style.gap ?? 0;
    const columns = this.parseGridTemplate(
      parent.style.gridTemplateColumns ?? 'repeat(1, 1fr)',
      contentRect.width,
      gap,
    );

    const children = parent.childIds
      .map(id => this.widgetMap.get(id))
      .filter((w): w is WidgetConfig => w !== undefined);

    let col = 0;
    let row = 0;
    let yOffset = contentRect.y;
    let maxRowHeight = 0;

    for (const child of children) {
      if (col >= columns.length) {
        col = 0;
        row++;
        yOffset += maxRowHeight + gap;
        maxRowHeight = 0;
      }

      const colWidth = columns[col] ?? 100;
      let xOffset = contentRect.x;
      for (let c = 0; c < col; c++) {
        xOffset += (columns[c] ?? 0) + gap;
      }

      const childHeight = this.resolveDimension(
        child.style.height,
        contentRect.height,
        0,
        contentRect.height,
      );

      const childRect: Rect = {
        x: xOffset,
        y: yOffset,
        width: colWidth,
        height: childHeight,
      };

      const layout = this.computeWidgetLayout(child, childRect, {
        minWidth: 0,
        maxWidth: colWidth,
        minHeight: 0,
        maxHeight: contentRect.height,
      });

      results.push(layout);
      maxRowHeight = Math.max(maxRowHeight, layout.rect.height);
      col++;
    }

    return results;
  }

  /**
   * Flow layout (block-level stacking).
   */
  private computeFlowLayout(
    parent: WidgetConfig,
    contentRect: Rect,
  ): ComputedLayout[] {
    const results: ComputedLayout[] = [];
    let yOffset = contentRect.y;

    for (const childId of parent.childIds) {
      const child = this.widgetMap.get(childId);
      if (!child) continue;

      const childWidth = this.resolveDimension(
        child.style.width,
        contentRect.width,
        0,
        contentRect.width,
      );

      const childHeight = this.resolveDimension(
        child.style.height,
        contentRect.height,
        0,
        contentRect.height,
      );

      const childRect: Rect = {
        x: contentRect.x,
        y: yOffset,
        width: childWidth || contentRect.width,
        height: childHeight,
      };

      const layout = this.computeWidgetLayout(child, childRect, {
        minWidth: 0,
        maxWidth: contentRect.width,
        minHeight: 0,
        maxHeight: contentRect.height - (yOffset - contentRect.y),
      });

      results.push(layout);
      yOffset += layout.rect.height;
    }

    return results;
  }

  /**
   * Resolves a dimension value to a pixel number.
   */
  private resolveDimension(
    dim: { value: number; unit: string } | undefined,
    parentSize: number,
    min: number,
    max: number,
  ): number {
    if (!dim) return Math.min(max, Math.max(min, 100)); // Default size

    let resolved: number;
    switch (dim.unit) {
      case '%':
        resolved = (dim.value / 100) * parentSize;
        break;
      case 'rem':
        resolved = dim.value * 16;
        break;
      case 'em':
        resolved = dim.value * 16;
        break;
      case 'vw':
        resolved = (dim.value / 100) * 1440; // Approximate
        break;
      case 'vh':
        resolved = (dim.value / 100) * 900; // Approximate
        break;
      case 'auto':
        resolved = Math.min(max, Math.max(min, parentSize));
        break;
      default:
        resolved = dim.value;
    }

    return Math.min(max, Math.max(min, resolved));
  }

  /**
   * Resolves a positioned value to pixels.
   */
  private resolveValue(
    dim: { value: number; unit: string } | undefined,
    parentSize: number,
  ): number {
    if (!dim) return 0;
    if (dim.unit === '%') return (dim.value / 100) * parentSize;
    return dim.value;
  }

  /**
   * Parses a CSS grid-template-columns string.
   */
  private parseGridTemplate(
    template: string,
    totalWidth: number,
    gap: number,
  ): number[] {
    // Handle repeat(n, size)
    const repeatMatch = template.match(/repeat\((\d+),\s*(.+)\)/);
    if (repeatMatch) {
      const count = parseInt(repeatMatch[1]!, 10);
      const sizeStr = repeatMatch[2]!.trim();
      const totalGaps = (count - 1) * gap;
      
      if (sizeStr === '1fr' || sizeStr === 'auto') {
        const colWidth = (totalWidth - totalGaps) / count;
        return Array(count).fill(colWidth);
      }
    }

    // Handle space-separated values
    const parts = template.split(/\s+/);
    const frParts = parts.filter(p => p.endsWith('fr'));
    const fixedParts = parts.filter(p => !p.endsWith('fr'));

    let fixedTotal = 0;
    const columns: number[] = [];

    for (const part of parts) {
      if (part.endsWith('px')) {
        const val = parseFloat(part);
        columns.push(val);
        fixedTotal += val;
      } else if (part.endsWith('fr')) {
        columns.push(-parseFloat(part)); // Negative = fr placeholder
      } else if (part === 'auto') {
        columns.push(-1);
      } else {
        columns.push(parseFloat(part) || 100);
      }
    }

    // Resolve fr units
    const totalGaps = (columns.length - 1) * gap;
    const availableForFr = totalWidth - fixedTotal - totalGaps;
    const totalFr = columns.filter(c => c < 0).reduce((sum, c) => sum + Math.abs(c), 0);

    return columns.map(c => {
      if (c < 0) {
        return totalFr > 0 ? (Math.abs(c) / totalFr) * availableForFr : 100;
      }
      return c;
    });
  }

  /**
   * Gets cached layout for a widget.
   */
  getCachedLayout(widgetId: string): ComputedLayout | undefined {
    return this.layoutCache.get(widgetId);
  }

  /**
   * Clears all caches.
   */
  clearCache(): void {
    this.layoutCache.clear();
    this.dirty.clear();
  }
}

/** Singleton instance */
export const layoutEngine = new LayoutEngine();
