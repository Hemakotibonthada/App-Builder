// =============================================================================
// Layout Engine - Advanced layout system with Grid, Flexbox, constraints, guides
// Features: CSS Grid/Flexbox, smart guides, snapping, alignment, distribution
// =============================================================================

export interface LayoutConfig {
  type: LayoutType;
  direction: LayoutDirection;
  wrap: boolean;
  gap: number;
  rowGap: number;
  columnGap: number;
  alignItems: AlignItems;
  justifyContent: JustifyContent;
  alignContent: AlignContent;
  padding: BoxSpacing;
  margin: BoxSpacing;
  overflow: OverflowMode;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  aspectRatio: string;
}

export type LayoutType = 'flex' | 'grid' | 'absolute' | 'relative' | 'fixed' | 'sticky' | 'auto' | 'none';
export type LayoutDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
export type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
export type AlignContent = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'space-between' | 'space-around';
export type OverflowMode = 'visible' | 'hidden' | 'scroll' | 'auto' | 'clip';

export interface BoxSpacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// =============================================================================
// Grid Types
// =============================================================================

export interface GridConfig {
  columns: GridTrack[];
  rows: GridTrack[];
  templateAreas: string[][];
  autoColumns: string;
  autoRows: string;
  autoFlow: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  gap: number;
  rowGap: number;
  columnGap: number;
}

export interface GridTrack {
  type: 'fixed' | 'fraction' | 'auto' | 'minmax' | 'fit-content' | 'repeat';
  value: number | string;
  min?: number | string;
  max?: number | string;
  repeatCount?: number | 'auto-fill' | 'auto-fit';
  unit: 'px' | '%' | 'em' | 'rem' | 'fr' | 'auto' | 'min-content' | 'max-content';
}

export interface GridItemPlacement {
  columnStart: number | string;
  columnEnd: number | string;
  rowStart: number | string;
  rowEnd: number | string;
  area: string;
  justifySelf: 'start' | 'end' | 'center' | 'stretch';
  alignSelf: 'start' | 'end' | 'center' | 'stretch';
  order: number;
}

// =============================================================================
// Flexbox Types
// =============================================================================

export interface FlexItemConfig {
  grow: number;
  shrink: number;
  basis: string;
  alignSelf: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  order: number;
}

// =============================================================================
// Constraint Types
// =============================================================================

export interface ConstraintConfig {
  horizontal: HorizontalConstraint;
  vertical: VerticalConstraint;
  fixWidth: boolean;
  fixHeight: boolean;
  pinLeft: boolean;
  pinRight: boolean;
  pinTop: boolean;
  pinBottom: boolean;
  centerX: boolean;
  centerY: boolean;
  aspectRatioLock: boolean;
}

export type HorizontalConstraint = 'left' | 'right' | 'center' | 'left-right' | 'scale';
export type VerticalConstraint = 'top' | 'bottom' | 'center' | 'top-bottom' | 'scale';

// =============================================================================
// Smart Guides & Snapping
// =============================================================================

export interface SmartGuide {
  id: string;
  type: 'edge' | 'center' | 'spacing' | 'custom' | 'grid' | 'baseline';
  orientation: 'horizontal' | 'vertical';
  position: number;
  label?: string;
  color?: string;
  sourceId?: string;
  permanent: boolean;
}

export interface SnapConfig {
  enabled: boolean;
  gridSnap: boolean;
  guideSnap: boolean;
  elementSnap: boolean;
  gridSize: number;
  snapThreshold: number;
  showGuides: boolean;
  showDistances: boolean;
  showDimensions: boolean;
  showAlignment: boolean;
  magnetism: number;
  snapToMargins: boolean;
  snapToCenter: boolean;
  snapToPadding: boolean;
}

export interface SnapResult {
  snapped: boolean;
  x: number;
  y: number;
  guides: SmartGuide[];
  distances: DistanceInfo[];
}

export interface DistanceInfo {
  from: string;
  to: string;
  distance: number;
  orientation: 'horizontal' | 'vertical';
  position: { x: number; y: number };
}

// =============================================================================
// Alignment & Distribution
// =============================================================================

export type AlignmentType = 
  | 'align-left' | 'align-center' | 'align-right'
  | 'align-top' | 'align-middle' | 'align-bottom'
  | 'distribute-horizontal' | 'distribute-vertical'
  | 'distribute-left' | 'distribute-center' | 'distribute-right'
  | 'distribute-top' | 'distribute-middle' | 'distribute-bottom'
  | 'space-horizontal' | 'space-vertical'
  | 'match-width' | 'match-height' | 'match-size'
  | 'center-canvas';

// =============================================================================
// Grid System Presets
// =============================================================================

export interface GridPreset {
  name: string;
  description: string;
  columns: number;
  gutter: number;
  margin: number;
  maxWidth: number;
  breakpoints: GridBreakpoint[];
}

export interface GridBreakpoint {
  name: string;
  minWidth: number;
  columns: number;
  gutter: number;
  margin: number;
  maxWidth: number;
}

export const GRID_PRESETS: GridPreset[] = [
  {
    name: 'Bootstrap 5',
    description: '12-column responsive grid',
    columns: 12,
    gutter: 24,
    margin: 12,
    maxWidth: 1320,
    breakpoints: [
      { name: 'xs', minWidth: 0, columns: 12, gutter: 24, margin: 12, maxWidth: 576 },
      { name: 'sm', minWidth: 576, columns: 12, gutter: 24, margin: 12, maxWidth: 768 },
      { name: 'md', minWidth: 768, columns: 12, gutter: 24, margin: 12, maxWidth: 992 },
      { name: 'lg', minWidth: 992, columns: 12, gutter: 24, margin: 12, maxWidth: 1200 },
      { name: 'xl', minWidth: 1200, columns: 12, gutter: 24, margin: 12, maxWidth: 1400 },
      { name: 'xxl', minWidth: 1400, columns: 12, gutter: 24, margin: 12, maxWidth: 1320 },
    ],
  },
  {
    name: 'Material Design',
    description: '4/8/12 column responsive grid',
    columns: 12,
    gutter: 16,
    margin: 16,
    maxWidth: 1280,
    breakpoints: [
      { name: 'compact', minWidth: 0, columns: 4, gutter: 16, margin: 16, maxWidth: 600 },
      { name: 'medium', minWidth: 600, columns: 8, gutter: 24, margin: 32, maxWidth: 840 },
      { name: 'expanded', minWidth: 840, columns: 12, gutter: 24, margin: 200, maxWidth: 1280 },
    ],
  },
  {
    name: 'Tailwind CSS',
    description: 'Responsive container widths',
    columns: 12,
    gutter: 32,
    margin: 16,
    maxWidth: 1280,
    breakpoints: [
      { name: 'sm', minWidth: 640, columns: 12, gutter: 16, margin: 16, maxWidth: 640 },
      { name: 'md', minWidth: 768, columns: 12, gutter: 24, margin: 24, maxWidth: 768 },
      { name: 'lg', minWidth: 1024, columns: 12, gutter: 32, margin: 32, maxWidth: 1024 },
      { name: 'xl', minWidth: 1280, columns: 12, gutter: 32, margin: 40, maxWidth: 1280 },
      { name: '2xl', minWidth: 1536, columns: 12, gutter: 32, margin: 48, maxWidth: 1536 },
    ],
  },
  {
    name: 'Foundation',
    description: '12-column responsive grid',
    columns: 12,
    gutter: 30,
    margin: 15,
    maxWidth: 1200,
    breakpoints: [
      { name: 'small', minWidth: 0, columns: 12, gutter: 20, margin: 10, maxWidth: 640 },
      { name: 'medium', minWidth: 640, columns: 12, gutter: 30, margin: 15, maxWidth: 1024 },
      { name: 'large', minWidth: 1024, columns: 12, gutter: 30, margin: 15, maxWidth: 1200 },
      { name: 'xlarge', minWidth: 1200, columns: 12, gutter: 30, margin: 15, maxWidth: 1440 },
    ],
  },
  {
    name: '8px Grid',
    description: 'Baseline 8px spacing grid',
    columns: 12,
    gutter: 16,
    margin: 16,
    maxWidth: 1200,
    breakpoints: [
      { name: 'mobile', minWidth: 0, columns: 4, gutter: 8, margin: 16, maxWidth: 375 },
      { name: 'tablet', minWidth: 768, columns: 8, gutter: 16, margin: 24, maxWidth: 768 },
      { name: 'desktop', minWidth: 1024, columns: 12, gutter: 16, margin: 32, maxWidth: 1200 },
    ],
  },
  {
    name: 'Golden Ratio',
    description: 'Grid based on golden ratio',
    columns: 8,
    gutter: 16,
    margin: 32,
    maxWidth: 1200,
    breakpoints: [
      { name: 'small', minWidth: 0, columns: 4, gutter: 8, margin: 16, maxWidth: 480 },
      { name: 'medium', minWidth: 768, columns: 6, gutter: 16, margin: 24, maxWidth: 960 },
      { name: 'large', minWidth: 1200, columns: 8, gutter: 16, margin: 32, maxWidth: 1200 },
    ],
  },
];

// =============================================================================
// Layout Engine Class
// =============================================================================

export class LayoutEngine {
  private guides: Map<string, SmartGuide> = new Map();
  private snapConfig: SnapConfig;
  private gridPreset: GridPreset | null = null;
  private customBreakpoints: GridBreakpoint[] = [];
  private listeners: Map<string, Array<(data: unknown) => void>> = new Map();

  constructor(config?: Partial<SnapConfig>) {
    this.snapConfig = {
      enabled: true,
      gridSnap: true,
      guideSnap: true,
      elementSnap: true,
      gridSize: 8,
      snapThreshold: 5,
      showGuides: true,
      showDistances: true,
      showDimensions: true,
      showAlignment: true,
      magnetism: 8,
      snapToMargins: true,
      snapToCenter: true,
      snapToPadding: true,
      ...config,
    };
  }

  // ---------------------------------------------------------------------------
  // Grid System
  // ---------------------------------------------------------------------------

  setGridPreset(presetName: string): void {
    const preset = GRID_PRESETS.find(p => p.name === presetName);
    if (preset) {
      this.gridPreset = preset;
      this.emit('grid:changed', { preset });
    }
  }

  setCustomGrid(preset: GridPreset): void {
    this.gridPreset = preset;
    this.emit('grid:changed', { preset });
  }

  getGridPreset(): GridPreset | null {
    return this.gridPreset;
  }

  calculateGridColumns(containerWidth: number): GridBreakpoint | null {
    if (!this.gridPreset) return null;

    const breakpoints = [...this.gridPreset.breakpoints].sort((a, b) => b.minWidth - a.minWidth);
    return breakpoints.find(bp => containerWidth >= bp.minWidth) || breakpoints[breakpoints.length - 1];
  }

  generateGridCSS(containerWidth: number): string {
    const bp = this.calculateGridColumns(containerWidth);
    if (!bp) return '';

    const columnWidth = (bp.maxWidth - bp.margin * 2 - bp.gutter * (bp.columns - 1)) / bp.columns;
    let css = `.container { max-width: ${bp.maxWidth}px; margin: 0 auto; padding: 0 ${bp.margin}px; }\n`;
    css += `.row { display: flex; flex-wrap: wrap; margin: 0 -${bp.gutter / 2}px; }\n`;
    
    for (let i = 1; i <= bp.columns; i++) {
      const width = ((i / bp.columns) * 100).toFixed(4);
      css += `.col-${i} { flex: 0 0 ${width}%; max-width: ${width}%; padding: 0 ${bp.gutter / 2}px; }\n`;
    }

    css += `/* Column width: ${columnWidth.toFixed(2)}px, Gutter: ${bp.gutter}px */\n`;
    return css;
  }

  getGridLines(containerWidth: number, containerHeight: number): Array<{ x: number; y: number; width: number; height: number; type: 'column' | 'gutter' | 'margin' }> {
    const bp = this.calculateGridColumns(containerWidth);
    if (!bp) return [];

    const lines: Array<{ x: number; y: number; width: number; height: number; type: 'column' | 'gutter' | 'margin' }> = [];
    const contentWidth = bp.maxWidth - bp.margin * 2;
    const startX = (containerWidth - bp.maxWidth) / 2 + bp.margin;
    const columnWidth = (contentWidth - bp.gutter * (bp.columns - 1)) / bp.columns;

    // Margin guides
    lines.push({ x: startX - bp.margin, y: 0, width: bp.margin, height: containerHeight, type: 'margin' });
    lines.push({ x: startX + contentWidth, y: 0, width: bp.margin, height: containerHeight, type: 'margin' });

    // Column and gutter guides
    for (let i = 0; i < bp.columns; i++) {
      const x = startX + i * (columnWidth + bp.gutter);
      lines.push({ x, y: 0, width: columnWidth, height: containerHeight, type: 'column' });
      if (i < bp.columns - 1) {
        lines.push({ x: x + columnWidth, y: 0, width: bp.gutter, height: containerHeight, type: 'gutter' });
      }
    }

    return lines;
  }

  // ---------------------------------------------------------------------------
  // Smart Guides
  // ---------------------------------------------------------------------------

  addGuide(guide: SmartGuide): void {
    this.guides.set(guide.id, guide);
    this.emit('guide:added', { guide });
  }

  removeGuide(id: string): boolean {
    const result = this.guides.delete(id);
    if (result) this.emit('guide:removed', { id });
    return result;
  }

  clearGuides(permanentOnly = false): void {
    if (permanentOnly) {
      for (const [id, guide] of this.guides.entries()) {
        if (!guide.permanent) this.guides.delete(id);
      }
    } else {
      this.guides.clear();
    }
  }

  getGuides(): SmartGuide[] {
    return Array.from(this.guides.values());
  }

  generateSmartGuides(
    movingElement: ElementBounds,
    otherElements: ElementBounds[],
    canvasBounds: { width: number; height: number }
  ): SmartGuide[] {
    const guides: SmartGuide[] = [];
    const threshold = this.snapConfig.snapThreshold;
    let guideId = 0;

    const makeGuide = (type: SmartGuide['type'], orientation: SmartGuide['orientation'], position: number, sourceId?: string): SmartGuide => ({
      id: `sg_${guideId++}`,
      type,
      orientation,
      position,
      sourceId,
      permanent: false,
    });

    // Canvas center guides
    if (this.snapConfig.snapToCenter) {
      const centerX = canvasBounds.width / 2;
      const centerY = canvasBounds.height / 2;
      const elCenterX = movingElement.x + movingElement.width / 2;
      const elCenterY = movingElement.y + movingElement.height / 2;

      if (Math.abs(elCenterX - centerX) < threshold) {
        guides.push(makeGuide('center', 'vertical', centerX));
      }
      if (Math.abs(elCenterY - centerY) < threshold) {
        guides.push(makeGuide('center', 'horizontal', centerY));
      }
    }

    // Element-to-element guides
    for (const other of otherElements) {
      const otherCenterX = other.x + other.width / 2;
      const otherCenterY = other.y + other.height / 2;
      const elCenterX = movingElement.x + movingElement.width / 2;
      const elCenterY = movingElement.y + movingElement.height / 2;

      // Left edge alignment
      if (Math.abs(movingElement.x - other.x) < threshold) {
        guides.push(makeGuide('edge', 'vertical', other.x, other.id));
      }
      // Right edge alignment
      if (Math.abs(movingElement.x + movingElement.width - (other.x + other.width)) < threshold) {
        guides.push(makeGuide('edge', 'vertical', other.x + other.width, other.id));
      }
      // Left to right edge
      if (Math.abs(movingElement.x - (other.x + other.width)) < threshold) {
        guides.push(makeGuide('edge', 'vertical', other.x + other.width, other.id));
      }
      // Right to left edge
      if (Math.abs(movingElement.x + movingElement.width - other.x) < threshold) {
        guides.push(makeGuide('edge', 'vertical', other.x, other.id));
      }

      // Top edge
      if (Math.abs(movingElement.y - other.y) < threshold) {
        guides.push(makeGuide('edge', 'horizontal', other.y, other.id));
      }
      // Bottom edge
      if (Math.abs(movingElement.y + movingElement.height - (other.y + other.height)) < threshold) {
        guides.push(makeGuide('edge', 'horizontal', other.y + other.height, other.id));
      }
      // Top to bottom
      if (Math.abs(movingElement.y - (other.y + other.height)) < threshold) {
        guides.push(makeGuide('edge', 'horizontal', other.y + other.height, other.id));
      }
      // Bottom to top
      if (Math.abs(movingElement.y + movingElement.height - other.y) < threshold) {
        guides.push(makeGuide('edge', 'horizontal', other.y, other.id));
      }

      // Center alignment
      if (Math.abs(elCenterX - otherCenterX) < threshold) {
        guides.push(makeGuide('center', 'vertical', otherCenterX, other.id));
      }
      if (Math.abs(elCenterY - otherCenterY) < threshold) {
        guides.push(makeGuide('center', 'horizontal', otherCenterY, other.id));
      }
    }

    // Spacing guides (equal spacing)
    if (this.snapConfig.showDistances) {
      const spacingGuides = this.generateSpacingGuides(movingElement, otherElements, threshold);
      guides.push(...spacingGuides);
    }

    return guides;
  }

  // ---------------------------------------------------------------------------
  // Snapping
  // ---------------------------------------------------------------------------

  snapPosition(
    pos: { x: number; y: number },
    elementSize: { width: number; height: number },
    otherElements: ElementBounds[],
    canvasBounds: { width: number; height: number }
  ): SnapResult {
    if (!this.snapConfig.enabled) {
      return { snapped: false, x: pos.x, y: pos.y, guides: [], distances: [] };
    }

    let x = pos.x;
    let y = pos.y;
    const guides: SmartGuide[] = [];
    const distances: DistanceInfo[] = [];
    let snapped = false;

    // Grid snapping
    if (this.snapConfig.gridSnap) {
      const gridSize = this.snapConfig.gridSize;
      const snappedX = Math.round(x / gridSize) * gridSize;
      const snappedY = Math.round(y / gridSize) * gridSize;
      
      if (Math.abs(x - snappedX) < this.snapConfig.snapThreshold) {
        x = snappedX;
        snapped = true;
      }
      if (Math.abs(y - snappedY) < this.snapConfig.snapThreshold) {
        y = snappedY;
        snapped = true;
      }
    }

    // Guide snapping
    if (this.snapConfig.guideSnap) {
      for (const guide of this.guides.values()) {
        if (guide.orientation === 'vertical') {
          if (Math.abs(x - guide.position) < this.snapConfig.magnetism) {
            x = guide.position;
            guides.push(guide);
            snapped = true;
          }
          if (Math.abs(x + elementSize.width - guide.position) < this.snapConfig.magnetism) {
            x = guide.position - elementSize.width;
            guides.push(guide);
            snapped = true;
          }
          if (Math.abs(x + elementSize.width / 2 - guide.position) < this.snapConfig.magnetism) {
            x = guide.position - elementSize.width / 2;
            guides.push(guide);
            snapped = true;
          }
        } else {
          if (Math.abs(y - guide.position) < this.snapConfig.magnetism) {
            y = guide.position;
            guides.push(guide);
            snapped = true;
          }
          if (Math.abs(y + elementSize.height - guide.position) < this.snapConfig.magnetism) {
            y = guide.position - elementSize.height;
            guides.push(guide);
            snapped = true;
          }
          if (Math.abs(y + elementSize.height / 2 - guide.position) < this.snapConfig.magnetism) {
            y = guide.position - elementSize.height / 2;
            guides.push(guide);
            snapped = true;
          }
        }
      }
    }

    // Element snapping
    if (this.snapConfig.elementSnap) {
      const threshold = this.snapConfig.magnetism;
      const movingBounds: ElementBounds = { id: '__moving__', x, y, width: elementSize.width, height: elementSize.height };
      const smartGuides = this.generateSmartGuides(movingBounds, otherElements, canvasBounds);

      for (const guide of smartGuides) {
        if (guide.orientation === 'vertical') {
          const positions = [x, x + elementSize.width / 2, x + elementSize.width];
          for (const p of positions) {
            if (Math.abs(p - guide.position) < threshold) {
              x = guide.position - (p - x);
              guides.push(guide);
              snapped = true;
              break;
            }
          }
        } else {
          const positions = [y, y + elementSize.height / 2, y + elementSize.height];
          for (const p of positions) {
            if (Math.abs(p - guide.position) < threshold) {
              y = guide.position - (p - y);
              guides.push(guide);
              snapped = true;
              break;
            }
          }
        }
      }

      // Calculate distances to nearby elements
      if (this.snapConfig.showDistances) {
        for (const other of otherElements) {
          const distX = this.calculateDistance(movingBounds, other, 'horizontal');
          const distY = this.calculateDistance(movingBounds, other, 'vertical');

          if (distX !== null && distX.distance < 200) {
            distances.push(distX);
          }
          if (distY !== null && distY.distance < 200) {
            distances.push(distY);
          }
        }
      }
    }

    return { snapped, x, y, guides, distances };
  }

  // ---------------------------------------------------------------------------
  // Alignment Operations
  // ---------------------------------------------------------------------------

  align(elements: ElementBounds[], type: AlignmentType, canvasBounds?: { width: number; height: number }): ElementBounds[] {
    if (elements.length === 0) return elements;

    const result = elements.map(e => ({ ...e }));

    switch (type) {
      case 'align-left': {
        const minX = Math.min(...result.map(e => e.x));
        result.forEach(e => { e.x = minX; });
        break;
      }
      case 'align-center': {
        const avgX = result.reduce((sum, e) => sum + e.x + e.width / 2, 0) / result.length;
        result.forEach(e => { e.x = avgX - e.width / 2; });
        break;
      }
      case 'align-right': {
        const maxRight = Math.max(...result.map(e => e.x + e.width));
        result.forEach(e => { e.x = maxRight - e.width; });
        break;
      }
      case 'align-top': {
        const minY = Math.min(...result.map(e => e.y));
        result.forEach(e => { e.y = minY; });
        break;
      }
      case 'align-middle': {
        const avgY = result.reduce((sum, e) => sum + e.y + e.height / 2, 0) / result.length;
        result.forEach(e => { e.y = avgY - e.height / 2; });
        break;
      }
      case 'align-bottom': {
        const maxBottom = Math.max(...result.map(e => e.y + e.height));
        result.forEach(e => { e.y = maxBottom - e.height; });
        break;
      }
      case 'distribute-horizontal': {
        if (result.length < 3) break;
        const sorted = [...result].sort((a, b) => a.x - b.x);
        const totalWidth = sorted.reduce((sum, e) => sum + e.width, 0);
        const totalSpace = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width - sorted[0].x - totalWidth;
        const spacing = totalSpace / (result.length - 1);

        let x = sorted[0].x;
        for (const el of sorted) {
          const original = result.find(e => e.id === el.id)!;
          original.x = x;
          x += el.width + spacing;
        }
        break;
      }
      case 'distribute-vertical': {
        if (result.length < 3) break;
        const sorted = [...result].sort((a, b) => a.y - b.y);
        const totalHeight = sorted.reduce((sum, e) => sum + e.height, 0);
        const totalSpace = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height - sorted[0].y - totalHeight;
        const spacing = totalSpace / (result.length - 1);

        let y = sorted[0].y;
        for (const el of sorted) {
          const original = result.find(e => e.id === el.id)!;
          original.y = y;
          y += el.height + spacing;
        }
        break;
      }
      case 'space-horizontal': {
        const sorted = [...result].sort((a, b) => a.x - b.x);
        const totalWidth = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width - sorted[0].x;
        const spacing = totalWidth / (result.length - 1);

        for (let i = 0; i < sorted.length; i++) {
          const original = result.find(e => e.id === sorted[i].id)!;
          original.x = sorted[0].x + i * spacing - original.width / 2;
        }
        break;
      }
      case 'space-vertical': {
        const sorted = [...result].sort((a, b) => a.y - b.y);
        const totalHeight = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height - sorted[0].y;
        const spacing = totalHeight / (result.length - 1);

        for (let i = 0; i < sorted.length; i++) {
          const original = result.find(e => e.id === sorted[i].id)!;
          original.y = sorted[0].y + i * spacing - original.height / 2;
        }
        break;
      }
      case 'match-width': {
        const maxWidth = Math.max(...result.map(e => e.width));
        result.forEach(e => { e.width = maxWidth; });
        break;
      }
      case 'match-height': {
        const maxHeight = Math.max(...result.map(e => e.height));
        result.forEach(e => { e.height = maxHeight; });
        break;
      }
      case 'match-size': {
        const maxWidth = Math.max(...result.map(e => e.width));
        const maxHeight = Math.max(...result.map(e => e.height));
        result.forEach(e => { e.width = maxWidth; e.height = maxHeight; });
        break;
      }
      case 'center-canvas': {
        if (canvasBounds) {
          const bounds = this.getBoundingBox(result);
          const offsetX = (canvasBounds.width - bounds.width) / 2 - bounds.x;
          const offsetY = (canvasBounds.height - bounds.height) / 2 - bounds.y;
          result.forEach(e => { e.x += offsetX; e.y += offsetY; });
        }
        break;
      }
    }

    return result;
  }

  // ---------------------------------------------------------------------------
  // CSS Generation
  // ---------------------------------------------------------------------------

  generateLayoutCSS(config: LayoutConfig): Record<string, string> {
    const styles: Record<string, string> = {};

    switch (config.type) {
      case 'flex':
        styles.display = 'flex';
        styles['flex-direction'] = config.direction;
        styles['flex-wrap'] = config.wrap ? 'wrap' : 'nowrap';
        styles['align-items'] = config.alignItems;
        styles['justify-content'] = config.justifyContent;
        if (config.gap) styles.gap = `${config.gap}px`;
        if (config.rowGap && config.columnGap) {
          styles.gap = `${config.rowGap}px ${config.columnGap}px`;
        }
        break;

      case 'grid':
        styles.display = 'grid';
        if (config.gap) styles.gap = `${config.gap}px`;
        break;

      case 'absolute':
        styles.position = 'absolute';
        break;

      case 'relative':
        styles.position = 'relative';
        break;

      case 'fixed':
        styles.position = 'fixed';
        break;

      case 'sticky':
        styles.position = 'sticky';
        break;
    }

    if (config.padding) {
      styles.padding = `${config.padding.top}px ${config.padding.right}px ${config.padding.bottom}px ${config.padding.left}px`;
    }
    if (config.margin) {
      styles.margin = `${config.margin.top}px ${config.margin.right}px ${config.margin.bottom}px ${config.margin.left}px`;
    }
    if (config.overflow !== 'visible') {
      styles.overflow = config.overflow;
    }
    if (config.minWidth) styles['min-width'] = `${config.minWidth}px`;
    if (config.maxWidth) styles['max-width'] = `${config.maxWidth}px`;
    if (config.minHeight) styles['min-height'] = `${config.minHeight}px`;
    if (config.maxHeight) styles['max-height'] = `${config.maxHeight}px`;
    if (config.aspectRatio) styles['aspect-ratio'] = config.aspectRatio;

    return styles;
  }

  generateGridCSS2(config: GridConfig): Record<string, string> {
    const styles: Record<string, string> = {};
    styles.display = 'grid';

    if (config.columns.length) {
      styles['grid-template-columns'] = config.columns.map(t => this.trackToCSS(t)).join(' ');
    }
    if (config.rows.length) {
      styles['grid-template-rows'] = config.rows.map(t => this.trackToCSS(t)).join(' ');
    }
    if (config.templateAreas.length) {
      styles['grid-template-areas'] = config.templateAreas.map(row => `"${row.join(' ')}"`).join(' ');
    }
    if (config.autoColumns) styles['grid-auto-columns'] = config.autoColumns;
    if (config.autoRows) styles['grid-auto-rows'] = config.autoRows;
    if (config.autoFlow !== 'row') styles['grid-auto-flow'] = config.autoFlow;
    if (config.gap) styles.gap = `${config.gap}px`;
    if (config.rowGap && config.columnGap) {
      styles.gap = `${config.rowGap}px ${config.columnGap}px`;
    }

    return styles;
  }

  generateFlexItemCSS(config: FlexItemConfig): Record<string, string> {
    const styles: Record<string, string> = {};
    if (config.grow !== 0) styles['flex-grow'] = String(config.grow);
    if (config.shrink !== 1) styles['flex-shrink'] = String(config.shrink);
    if (config.basis && config.basis !== 'auto') styles['flex-basis'] = config.basis;
    if (config.alignSelf !== 'auto') styles['align-self'] = config.alignSelf;
    if (config.order !== 0) styles.order = String(config.order);
    return styles;
  }

  generateGridItemCSS(placement: GridItemPlacement): Record<string, string> {
    const styles: Record<string, string> = {};
    if (placement.columnStart) styles['grid-column-start'] = String(placement.columnStart);
    if (placement.columnEnd) styles['grid-column-end'] = String(placement.columnEnd);
    if (placement.rowStart) styles['grid-row-start'] = String(placement.rowStart);
    if (placement.rowEnd) styles['grid-row-end'] = String(placement.rowEnd);
    if (placement.area) styles['grid-area'] = placement.area;
    if (placement.justifySelf !== 'stretch') styles['justify-self'] = placement.justifySelf;
    if (placement.alignSelf !== 'stretch') styles['align-self'] = placement.alignSelf;
    if (placement.order !== 0) styles.order = String(placement.order);
    return styles;
  }

  // ---------------------------------------------------------------------------
  // Constraint Resolution
  // ---------------------------------------------------------------------------

  resolveConstraints(
    element: ElementBounds,
    constraints: ConstraintConfig,
    parentBounds: ElementBounds,
    originalBounds: ElementBounds
  ): ElementBounds {
    const result = { ...element };

    // Horizontal constraints
    switch (constraints.horizontal) {
      case 'left':
        result.x = originalBounds.x;
        if (constraints.fixWidth) result.width = originalBounds.width;
        break;
      case 'right':
        result.x = parentBounds.width - (parentBounds.width - originalBounds.x - originalBounds.width);
        if (constraints.fixWidth) {
          result.x = parentBounds.width - (parentBounds.width - originalBounds.x - originalBounds.width) - result.width;
        }
        break;
      case 'center':
        result.x = parentBounds.width / 2 - result.width / 2;
        break;
      case 'left-right':
        result.x = originalBounds.x;
        result.width = parentBounds.width - originalBounds.x - (parentBounds.width - originalBounds.x - originalBounds.width);
        break;
      case 'scale': {
        const scaleX = parentBounds.width / (parentBounds.width || 1);
        result.x = originalBounds.x * scaleX;
        result.width = originalBounds.width * scaleX;
        break;
      }
    }

    // Vertical constraints
    switch (constraints.vertical) {
      case 'top':
        result.y = originalBounds.y;
        if (constraints.fixHeight) result.height = originalBounds.height;
        break;
      case 'bottom':
        result.y = parentBounds.height - (parentBounds.height - originalBounds.y - originalBounds.height);
        if (constraints.fixHeight) {
          result.y = parentBounds.height - (parentBounds.height - originalBounds.y - originalBounds.height) - result.height;
        }
        break;
      case 'center':
        result.y = parentBounds.height / 2 - result.height / 2;
        break;
      case 'top-bottom':
        result.y = originalBounds.y;
        result.height = parentBounds.height - originalBounds.y - (parentBounds.height - originalBounds.y - originalBounds.height);
        break;
      case 'scale': {
        const scaleY = parentBounds.height / (parentBounds.height || 1);
        result.y = originalBounds.y * scaleY;
        result.height = originalBounds.height * scaleY;
        break;
      }
    }

    // Aspect ratio lock
    if (constraints.aspectRatioLock && originalBounds.width && originalBounds.height) {
      const ratio = originalBounds.width / originalBounds.height;
      if (result.width !== originalBounds.width) {
        result.height = result.width / ratio;
      } else if (result.height !== originalBounds.height) {
        result.width = result.height * ratio;
      }
    }

    return result;
  }

  // ---------------------------------------------------------------------------
  // Auto-Layout
  // ---------------------------------------------------------------------------

  autoLayout(
    elements: ElementBounds[],
    containerBounds: ElementBounds,
    options: AutoLayoutOptions
  ): ElementBounds[] {
    const result = elements.map(e => ({ ...e }));

    switch (options.type) {
      case 'stack-horizontal': {
        let x = containerBounds.x + options.padding;
        for (const el of result) {
          el.x = x;
          el.y = containerBounds.y + options.padding;
          if (options.alignItems === 'center') {
            el.y = containerBounds.y + (containerBounds.height - el.height) / 2;
          } else if (options.alignItems === 'flex-end') {
            el.y = containerBounds.y + containerBounds.height - el.height - options.padding;
          }
          x += el.width + options.gap;
        }
        break;
      }
      case 'stack-vertical': {
        let y = containerBounds.y + options.padding;
        for (const el of result) {
          el.y = y;
          el.x = containerBounds.x + options.padding;
          if (options.alignItems === 'center') {
            el.x = containerBounds.x + (containerBounds.width - el.width) / 2;
          } else if (options.alignItems === 'flex-end') {
            el.x = containerBounds.x + containerBounds.width - el.width - options.padding;
          }
          y += el.height + options.gap;
        }
        break;
      }
      case 'grid': {
        const cols = options.columns || Math.ceil(Math.sqrt(result.length));
        const cellWidth = (containerBounds.width - options.padding * 2 - options.gap * (cols - 1)) / cols;
        const cellHeight = options.cellHeight || cellWidth;

        for (let i = 0; i < result.length; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          result[i].x = containerBounds.x + options.padding + col * (cellWidth + options.gap);
          result[i].y = containerBounds.y + options.padding + row * (cellHeight + options.gap);
          if (options.fillCell) {
            result[i].width = cellWidth;
            result[i].height = cellHeight;
          }
        }
        break;
      }
      case 'wrap': {
        let x = containerBounds.x + options.padding;
        let y = containerBounds.y + options.padding;
        let rowHeight = 0;

        for (const el of result) {
          if (x + el.width > containerBounds.x + containerBounds.width - options.padding && x > containerBounds.x + options.padding) {
            x = containerBounds.x + options.padding;
            y += rowHeight + options.gap;
            rowHeight = 0;
          }
          el.x = x;
          el.y = y;
          x += el.width + options.gap;
          rowHeight = Math.max(rowHeight, el.height);
        }
        break;
      }
      case 'masonry': {
        const cols = options.columns || 3;
        const columnWidth = (containerBounds.width - options.padding * 2 - options.gap * (cols - 1)) / cols;
        const columnHeights = new Array(cols).fill(containerBounds.y + options.padding);

        for (const el of result) {
          const shortestCol = columnHeights.indexOf(Math.min(...columnHeights));
          el.x = containerBounds.x + options.padding + shortestCol * (columnWidth + options.gap);
          el.y = columnHeights[shortestCol];
          if (options.fillCell) {
            el.width = columnWidth;
          }
          columnHeights[shortestCol] += el.height + options.gap;
        }
        break;
      }
    }

    return result;
  }

  // ---------------------------------------------------------------------------
  // Utility
  // ---------------------------------------------------------------------------

  getBoundingBox(elements: ElementBounds[]): ElementBounds {
    if (elements.length === 0) return { id: 'bbox', x: 0, y: 0, width: 0, height: 0 };

    const minX = Math.min(...elements.map(e => e.x));
    const minY = Math.min(...elements.map(e => e.y));
    const maxX = Math.max(...elements.map(e => e.x + e.width));
    const maxY = Math.max(...elements.map(e => e.y + e.height));

    return { id: 'bbox', x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  getSnapConfig(): SnapConfig {
    return { ...this.snapConfig };
  }

  updateSnapConfig(config: Partial<SnapConfig>): void {
    Object.assign(this.snapConfig, config);
    this.emit('config:changed', this.snapConfig);
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private trackToCSS(track: GridTrack): string {
    switch (track.type) {
      case 'fixed': return `${track.value}${track.unit}`;
      case 'fraction': return `${track.value}fr`;
      case 'auto': return 'auto';
      case 'minmax': return `minmax(${track.min}, ${track.max})`;
      case 'fit-content': return `fit-content(${track.value}${track.unit})`;
      case 'repeat': return `repeat(${track.repeatCount}, ${track.value}${track.unit})`;
      default: return `${track.value}${track.unit}`;
    }
  }

  private generateSpacingGuides(moving: ElementBounds, others: ElementBounds[], threshold: number): SmartGuide[] {
    const guides: SmartGuide[] = [];
    let id = 0;

    // Find elements with equal horizontal spacing
    for (let i = 0; i < others.length; i++) {
      for (let j = i + 1; j < others.length; j++) {
        const a = others[i];
        const b = others[j];
        
        // Horizontal spacing between a and b
        const spacingAB = Math.abs(b.x - (a.x + a.width));
        const spacingMovingA = Math.abs(moving.x - (a.x + a.width));
        const spacingMovingB = Math.abs(b.x - (moving.x + moving.width));

        if (Math.abs(spacingAB - spacingMovingA) < threshold) {
          guides.push({
            id: `spacing_${id++}`,
            type: 'spacing',
            orientation: 'vertical',
            position: moving.x,
            label: `${spacingAB}px`,
            permanent: false,
          });
        }
        if (Math.abs(spacingAB - spacingMovingB) < threshold) {
          guides.push({
            id: `spacing_${id++}`,
            type: 'spacing',
            orientation: 'vertical',
            position: moving.x + moving.width,
            label: `${spacingAB}px`,
            permanent: false,
          });
        }
      }
    }

    return guides;
  }

  private calculateDistance(a: ElementBounds, b: ElementBounds, orientation: 'horizontal' | 'vertical'): DistanceInfo | null {
    if (orientation === 'horizontal') {
      if (a.x + a.width <= b.x) {
        return {
          from: a.id,
          to: b.id,
          distance: b.x - (a.x + a.width),
          orientation: 'horizontal',
          position: { x: a.x + a.width, y: Math.min(a.y, b.y) + Math.abs(a.y - b.y) / 2 },
        };
      }
      if (b.x + b.width <= a.x) {
        return {
          from: b.id,
          to: a.id,
          distance: a.x - (b.x + b.width),
          orientation: 'horizontal',
          position: { x: b.x + b.width, y: Math.min(a.y, b.y) + Math.abs(a.y - b.y) / 2 },
        };
      }
    } else {
      if (a.y + a.height <= b.y) {
        return {
          from: a.id,
          to: b.id,
          distance: b.y - (a.y + a.height),
          orientation: 'vertical',
          position: { x: Math.min(a.x, b.x) + Math.abs(a.x - b.x) / 2, y: a.y + a.height },
        };
      }
      if (b.y + b.height <= a.y) {
        return {
          from: b.id,
          to: a.id,
          distance: a.y - (b.y + b.height),
          orientation: 'vertical',
          position: { x: Math.min(a.x, b.x) + Math.abs(a.x - b.x) / 2, y: b.y + b.height },
        };
      }
    }
    return null;
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try { handler(data); } catch (e) { console.error(`LayoutEngine error:`, e); }
      }
    }
  }

  on(event: string, handler: (data: unknown) => void): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(handler);
    return () => {
      const handlers = this.listeners.get(event);
      if (handlers) {
        const idx = handlers.indexOf(handler);
        if (idx >= 0) handlers.splice(idx, 1);
      }
    };
  }
}

// =============================================================================
// Types
// =============================================================================

export interface ElementBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AutoLayoutOptions {
  type: 'stack-horizontal' | 'stack-vertical' | 'grid' | 'wrap' | 'masonry';
  gap: number;
  padding: number;
  alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  columns?: number;
  cellHeight?: number;
  fillCell?: boolean;
}

// =============================================================================
// Layout Presets
// =============================================================================

export const LAYOUT_PRESETS: Array<{
  name: string;
  description: string;
  category: string;
  config: Partial<LayoutConfig>;
}> = [
  { name: 'Horizontal Stack', description: 'Items stacked horizontally', category: 'Flex', config: { type: 'flex', direction: 'row', gap: 16, alignItems: 'center' } },
  { name: 'Vertical Stack', description: 'Items stacked vertically', category: 'Flex', config: { type: 'flex', direction: 'column', gap: 16, alignItems: 'stretch' } },
  { name: 'Center', description: 'Centered content', category: 'Flex', config: { type: 'flex', direction: 'column', alignItems: 'center', justifyContent: 'center' } },
  { name: 'Space Between', description: 'Evenly spaced items', category: 'Flex', config: { type: 'flex', direction: 'row', justifyContent: 'space-between', alignItems: 'center' } },
  { name: 'Wrap', description: 'Wrapping items', category: 'Flex', config: { type: 'flex', direction: 'row', wrap: true, gap: 16, alignItems: 'flex-start' } },
  { name: '2 Column Grid', description: 'Two equal columns', category: 'Grid', config: { type: 'grid', gap: 16 } },
  { name: '3 Column Grid', description: 'Three equal columns', category: 'Grid', config: { type: 'grid', gap: 16 } },
  { name: '4 Column Grid', description: 'Four equal columns', category: 'Grid', config: { type: 'grid', gap: 16 } },
  { name: 'Sidebar Layout', description: 'Sidebar with main content', category: 'Grid', config: { type: 'grid', gap: 24 } },
  { name: 'Holy Grail', description: 'Header, sidebar, main, sidebar, footer', category: 'Grid', config: { type: 'grid', gap: 16 } },
  { name: 'Absolute Position', description: 'Free positioning', category: 'Position', config: { type: 'absolute' } },
  { name: 'Sticky Header', description: 'Header that sticks to top', category: 'Position', config: { type: 'sticky' } },
];

// =============================================================================
// Singleton Instance
// =============================================================================

export const layoutEngine = new LayoutEngine();
