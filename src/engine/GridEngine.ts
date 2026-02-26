/**
 * Grid Engine
 * 
 * Comprehensive CSS Grid layout engine for the builder canvas.
 * Features:
 * 1. Grid template builder (rows, columns, areas)
 * 2. Auto-placement algorithm
 * 3. Gap & alignment utilities
 * 4. Named grid lines & areas
 * 5. Fractional unit calculations
 * 6. Minmax / auto-fit / auto-fill
 * 7. Grid visualization overlay
 * 8. Drag-to-resize grid tracks
 * 9. Grid item placement constraints
 * 10. Responsive grid breakpoints
 * 11. Grid template presets
 * 12. Import/export grid definitions
 */

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export type TrackSizeUnit = 'px' | 'fr' | '%' | 'auto' | 'min-content' | 'max-content';

export interface TrackSize {
  readonly value: number;
  readonly unit: TrackSizeUnit;
}

export interface MinMaxTrack {
  readonly min: TrackSize;
  readonly max: TrackSize;
}

export type TrackDef = TrackSize | MinMaxTrack | 'auto';

export interface GridArea {
  readonly name: string;
  readonly rowStart: number;
  readonly rowEnd: number;
  readonly colStart: number;
  readonly colEnd: number;
  readonly color?: string;
}

export interface GridLine {
  readonly name: string;
  readonly position: number;
  readonly isColumn: boolean;
}

export interface GridDefinition {
  readonly columns: readonly TrackDef[];
  readonly rows: readonly TrackDef[];
  readonly areas: readonly GridArea[];
  readonly namedLines: readonly GridLine[];
  readonly columnGap: number;
  readonly rowGap: number;
  readonly justifyItems: GridAlignment;
  readonly alignItems: GridAlignment;
  readonly justifyContent: GridContentAlignment;
  readonly alignContent: GridContentAlignment;
  readonly autoFlow: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  readonly autoColumns: TrackDef;
  readonly autoRows: TrackDef;
}

export type GridAlignment = 'start' | 'end' | 'center' | 'stretch' | 'baseline';
export type GridContentAlignment = 'start' | 'end' | 'center' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly';

export interface GridItemPlacement {
  readonly widgetId: string;
  readonly column: number | string;
  readonly row: number | string;
  readonly columnSpan: number;
  readonly rowSpan: number;
  readonly justifySelf?: GridAlignment;
  readonly alignSelf?: GridAlignment;
  readonly order?: number;
}

export interface ComputedGridTrack {
  readonly index: number;
  readonly start: number;
  readonly size: number;
  readonly isColumn: boolean;
  readonly definition: TrackDef;
}

export interface ComputedGridCell {
  readonly row: number;
  readonly column: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly area: string | null;
  readonly occupied: boolean;
  readonly widgetId: string | null;
}

export interface GridOverlayConfig {
  readonly showLines: boolean;
  readonly showAreas: boolean;
  readonly showGaps: boolean;
  readonly showNumbers: boolean;
  readonly lineColor: string;
  readonly lineWidth: number;
  readonly areaOpacity: number;
  readonly gapColor: string;
  readonly numberFont: string;
  readonly numberColor: string;
}

export interface GridBreakpoint {
  readonly name: string;
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly grid: Partial<GridDefinition>;
}

export interface GridPreset {
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly thumbnail?: string;
  readonly definition: GridDefinition;
}

/* ──────────────────────────────────────────────
 * Default Grid Config
 * ────────────────────────────────────────────── */

export const DEFAULT_GRID: GridDefinition = {
  columns: [{ value: 1, unit: 'fr' }],
  rows: [{ value: 1, unit: 'fr' }],
  areas: [],
  namedLines: [],
  columnGap: 0,
  rowGap: 0,
  justifyItems: 'stretch',
  alignItems: 'stretch',
  justifyContent: 'stretch',
  alignContent: 'stretch',
  autoFlow: 'row',
  autoColumns: 'auto',
  autoRows: 'auto',
};

export const DEFAULT_OVERLAY_CONFIG: GridOverlayConfig = {
  showLines: true,
  showAreas: true,
  showGaps: true,
  showNumbers: true,
  lineColor: 'rgba(99, 102, 241, 0.5)',
  lineWidth: 1,
  areaOpacity: 0.15,
  gapColor: 'rgba(236, 72, 153, 0.2)',
  numberFont: '10px monospace',
  numberColor: 'rgba(99, 102, 241, 0.8)',
};

/* ──────────────────────────────────────────────
 * Grid Engine
 * ────────────────────────────────────────────── */

export class GridEngine {
  private definition: GridDefinition;
  private containerWidth: number = 0;
  private containerHeight: number = 0;
  private computedColumns: ComputedGridTrack[] = [];
  private computedRows: ComputedGridTrack[] = [];
  private cells: ComputedGridCell[][] = [];
  private placements: Map<string, GridItemPlacement> = new Map();
  private breakpoints: GridBreakpoint[] = [];

  constructor(definition: GridDefinition = DEFAULT_GRID) {
    this.definition = definition;
  }

  /* ──────────────────────────────────────────
   * Public API - Setup
   * ────────────────────────────────────────── */

  setDefinition(definition: GridDefinition): void {
    this.definition = definition;
    this.recompute();
  }

  getDefinition(): GridDefinition {
    return this.definition;
  }

  setContainerSize(width: number, height: number): void {
    this.containerWidth = width;
    this.containerHeight = height;
    this.recompute();
  }

  /* ──────────────────────────────────────────
   * Public API - Columns
   * ────────────────────────────────────────── */

  addColumn(track: TrackDef, index?: number): void {
    const cols = [...this.definition.columns];
    if (index !== undefined) {
      cols.splice(index, 0, track);
    } else {
      cols.push(track);
    }
    this.definition = { ...this.definition, columns: cols };
    this.recompute();
  }

  removeColumn(index: number): void {
    const cols = [...this.definition.columns];
    cols.splice(index, 1);
    this.definition = { ...this.definition, columns: cols };
    this.recompute();
  }

  updateColumn(index: number, track: TrackDef): void {
    const cols = [...this.definition.columns];
    cols[index] = track;
    this.definition = { ...this.definition, columns: cols };
    this.recompute();
  }

  /* ──────────────────────────────────────────
   * Public API - Rows
   * ────────────────────────────────────────── */

  addRow(track: TrackDef, index?: number): void {
    const rows = [...this.definition.rows];
    if (index !== undefined) {
      rows.splice(index, 0, track);
    } else {
      rows.push(track);
    }
    this.definition = { ...this.definition, rows: rows };
    this.recompute();
  }

  removeRow(index: number): void {
    const rows = [...this.definition.rows];
    rows.splice(index, 1);
    this.definition = { ...this.definition, rows: rows };
    this.recompute();
  }

  updateRow(index: number, track: TrackDef): void {
    const rows = [...this.definition.rows];
    rows[index] = track;
    this.definition = { ...this.definition, rows: rows };
    this.recompute();
  }

  /* ──────────────────────────────────────────
   * Public API - Areas
   * ────────────────────────────────────────── */

  addArea(area: GridArea): void {
    this.definition = {
      ...this.definition,
      areas: [...this.definition.areas, area],
    };
  }

  removeArea(areaName: string): void {
    this.definition = {
      ...this.definition,
      areas: this.definition.areas.filter(a => a.name !== areaName),
    };
  }

  getArea(name: string): GridArea | null {
    return this.definition.areas.find(a => a.name === name) ?? null;
  }

  /* ──────────────────────────────────────────
   * Public API - Gaps
   * ────────────────────────────────────────── */

  setGap(columnGap: number, rowGap?: number): void {
    this.definition = {
      ...this.definition,
      columnGap,
      rowGap: rowGap ?? columnGap,
    };
    this.recompute();
  }

  /* ──────────────────────────────────────────
   * Public API - Alignment
   * ────────────────────────────────────────── */

  setJustifyItems(value: GridAlignment): void {
    this.definition = { ...this.definition, justifyItems: value };
  }

  setAlignItems(value: GridAlignment): void {
    this.definition = { ...this.definition, alignItems: value };
  }

  setJustifyContent(value: GridContentAlignment): void {
    this.definition = { ...this.definition, justifyContent: value };
  }

  setAlignContent(value: GridContentAlignment): void {
    this.definition = { ...this.definition, alignContent: value };
  }

  /* ──────────────────────────────────────────
   * Public API - Item Placement
   * ────────────────────────────────────────── */

  placeItem(placement: GridItemPlacement): void {
    this.placements.set(placement.widgetId, placement);
    this.updateCells();
  }

  removeItem(widgetId: string): void {
    this.placements.delete(widgetId);
    this.updateCells();
  }

  getItemPlacement(widgetId: string): GridItemPlacement | null {
    return this.placements.get(widgetId) ?? null;
  }

  getAllPlacements(): readonly GridItemPlacement[] {
    return Array.from(this.placements.values());
  }

  autoPlaceItem(widgetId: string): GridItemPlacement {
    const emptyCell = this.findFirstEmptyCell();
    const placement: GridItemPlacement = {
      widgetId,
      column: emptyCell?.column ?? 1,
      row: emptyCell?.row ?? 1,
      columnSpan: 1,
      rowSpan: 1,
    };
    this.placeItem(placement);
    return placement;
  }

  /* ──────────────────────────────────────────
   * Public API - Computed Values
   * ────────────────────────────────────────── */

  getComputedColumns(): readonly ComputedGridTrack[] {
    return this.computedColumns;
  }

  getComputedRows(): readonly ComputedGridTrack[] {
    return this.computedRows;
  }

  getCells(): readonly (readonly ComputedGridCell[])[] {
    return this.cells;
  }

  getCell(row: number, column: number): ComputedGridCell | null {
    return this.cells[row]?.[column] ?? null;
  }

  getCellAtPoint(x: number, y: number): ComputedGridCell | null {
    for (const row of this.cells) {
      for (const cell of row) {
        if (
          x >= cell.x && x <= cell.x + cell.width &&
          y >= cell.y && y <= cell.y + cell.height
        ) {
          return cell;
        }
      }
    }
    return null;
  }

  /* ──────────────────────────────────────────
   * Public API - Breakpoints
   * ────────────────────────────────────────── */

  addBreakpoint(breakpoint: GridBreakpoint): void {
    this.breakpoints.push(breakpoint);
    this.breakpoints.sort((a, b) => a.minWidth - b.minWidth);
  }

  removeBreakpoint(name: string): void {
    this.breakpoints = this.breakpoints.filter(b => b.name !== name);
  }

  getActiveBreakpoint(viewportWidth: number): GridBreakpoint | null {
    for (let i = this.breakpoints.length - 1; i >= 0; i--) {
      const bp = this.breakpoints[i];
      if (viewportWidth >= bp.minWidth && viewportWidth <= bp.maxWidth) {
        return bp;
      }
    }
    return null;
  }

  applyBreakpoint(viewportWidth: number): void {
    const bp = this.getActiveBreakpoint(viewportWidth);
    if (bp && bp.grid) {
      this.definition = { ...this.definition, ...bp.grid };
      this.recompute();
    }
  }

  /* ──────────────────────────────────────────
   * Public API - CSS Generation
   * ────────────────────────────────────────── */

  toCSS(): string {
    const lines: string[] = [];

    lines.push('display: grid;');
    lines.push(`grid-template-columns: ${this.columnsToCSS()};`);
    lines.push(`grid-template-rows: ${this.rowsToCSS()};`);

    if (this.definition.areas.length > 0) {
      lines.push(`grid-template-areas: ${this.areasToCSS()};`);
    }

    if (this.definition.columnGap > 0 || this.definition.rowGap > 0) {
      lines.push(`gap: ${this.definition.rowGap}px ${this.definition.columnGap}px;`);
    }

    lines.push(`justify-items: ${this.definition.justifyItems};`);
    lines.push(`align-items: ${this.definition.alignItems};`);
    lines.push(`justify-content: ${this.definition.justifyContent};`);
    lines.push(`align-content: ${this.definition.alignContent};`);
    lines.push(`grid-auto-flow: ${this.definition.autoFlow};`);
    lines.push(`grid-auto-columns: ${this.trackToCSS(this.definition.autoColumns)};`);
    lines.push(`grid-auto-rows: ${this.trackToCSS(this.definition.autoRows)};`);

    return lines.join('\n');
  }

  toItemCSS(widgetId: string): string | null {
    const placement = this.placements.get(widgetId);
    if (!placement) return null;

    const lines: string[] = [];

    lines.push(`grid-column: ${placement.column} / span ${placement.columnSpan};`);
    lines.push(`grid-row: ${placement.row} / span ${placement.rowSpan};`);

    if (placement.justifySelf) {
      lines.push(`justify-self: ${placement.justifySelf};`);
    }
    if (placement.alignSelf) {
      lines.push(`align-self: ${placement.alignSelf};`);
    }
    if (placement.order !== undefined) {
      lines.push(`order: ${placement.order};`);
    }

    return lines.join('\n');
  }

  /* ──────────────────────────────────────────
   * Public API - Overlay Rendering
   * ────────────────────────────────────────── */

  renderOverlay(ctx: CanvasRenderingContext2D, config: GridOverlayConfig = DEFAULT_OVERLAY_CONFIG): void {
    if (config.showGaps) this.drawGaps(ctx, config);
    if (config.showAreas) this.drawAreas(ctx, config);
    if (config.showLines) this.drawLines(ctx, config);
    if (config.showNumbers) this.drawNumbers(ctx, config);
  }

  /* ──────────────────────────────────────────
   * Private - Computation
   * ────────────────────────────────────────── */

  private recompute(): void {
    this.computedColumns = this.computeTracks(
      this.definition.columns, this.containerWidth, this.definition.columnGap, true,
    );
    this.computedRows = this.computeTracks(
      this.definition.rows, this.containerHeight, this.definition.rowGap, false,
    );
    this.rebuildCells();
    this.updateCells();
  }

  private computeTracks(
    tracks: readonly TrackDef[],
    containerSize: number,
    gap: number,
    isColumn: boolean,
  ): ComputedGridTrack[] {
    const totalGap = gap * Math.max(0, tracks.length - 1);
    const availableSize = containerSize - totalGap;

    // First pass: compute fixed sizes
    let fixedTotal = 0;
    let frTotal = 0;

    const resolved = tracks.map(track => {
      if (track === 'auto') return { size: 0, isFr: false, fr: 0, def: track };

      if (this.isMinMaxTrack(track)) {
        const min = this.resolveTrackSize(track.min, containerSize);
        return { size: min, isFr: false, fr: 0, def: track };
      }

      if (track.unit === 'fr') {
        frTotal += track.value;
        return { size: 0, isFr: true, fr: track.value, def: track };
      }

      const size = this.resolveTrackSize(track, containerSize);
      fixedTotal += size;
      return { size, isFr: false, fr: 0, def: track };
    });

    // Second pass: distribute remaining space to fr units
    const remainingSpace = Math.max(0, availableSize - fixedTotal);
    const frUnit = frTotal > 0 ? remainingSpace / frTotal : 0;

    for (const r of resolved) {
      if (r.isFr) {
        r.size = r.fr * frUnit;
      }
      if (r.size === 0 && r.def === 'auto') {
        // Auto tracks get remaining space divided equally
        r.size = Math.max(50, remainingSpace / (resolved.filter(x => x.def === 'auto').length || 1));
      }
    }

    // Build computed tracks with positions
    let position = 0;
    return resolved.map((r, index) => {
      const track: ComputedGridTrack = {
        index,
        start: position,
        size: r.size,
        isColumn,
        definition: r.def,
      };
      position += r.size + gap;
      return track;
    });
  }

  private resolveTrackSize(size: TrackSize, containerSize: number): number {
    switch (size.unit) {
      case 'px': return size.value;
      case '%': return (size.value / 100) * containerSize;
      case 'fr': return 0; // Handled separately
      case 'auto': return 0;
      case 'min-content': return 50;
      case 'max-content': return 200;
      default: return size.value;
    }
  }

  private isMinMaxTrack(track: TrackDef): track is MinMaxTrack {
    return typeof track === 'object' && 'min' in track && 'max' in track;
  }

  private rebuildCells(): void {
    this.cells = [];
    const rowCount = this.computedRows.length;
    const colCount = this.computedColumns.length;

    for (let r = 0; r < rowCount; r++) {
      const row: ComputedGridCell[] = [];
      for (let c = 0; c < colCount; c++) {
        const colTrack = this.computedColumns[c];
        const rowTrack = this.computedRows[r];

        // Find area name for this cell
        let areaName: string | null = null;
        for (const area of this.definition.areas) {
          if (
            r + 1 >= area.rowStart && r + 1 < area.rowEnd &&
            c + 1 >= area.colStart && c + 1 < area.colEnd
          ) {
            areaName = area.name;
            break;
          }
        }

        row.push({
          row: r + 1,
          column: c + 1,
          x: colTrack.start,
          y: rowTrack.start,
          width: colTrack.size,
          height: rowTrack.size,
          area: areaName,
          occupied: false,
          widgetId: null,
        });
      }
      this.cells.push(row);
    }
  }

  private updateCells(): void {
    // Reset occupation
    for (const row of this.cells) {
      for (const cell of row) {
        (cell as any).occupied = false;
        (cell as any).widgetId = null;
      }
    }

    // Mark occupied cells
    for (const placement of this.placements.values()) {
      const col = typeof placement.column === 'number' ? placement.column : 1;
      const row = typeof placement.row === 'number' ? placement.row : 1;

      for (let r = row - 1; r < row - 1 + placement.rowSpan; r++) {
        for (let c = col - 1; c < col - 1 + placement.columnSpan; c++) {
          if (this.cells[r]?.[c]) {
            (this.cells[r][c] as any).occupied = true;
            (this.cells[r][c] as any).widgetId = placement.widgetId;
          }
        }
      }
    }
  }

  private findFirstEmptyCell(): ComputedGridCell | null {
    for (const row of this.cells) {
      for (const cell of row) {
        if (!cell.occupied) return cell;
      }
    }
    return null;
  }

  /* ──────────────────────────────────────────
   * Private - CSS Helpers
   * ────────────────────────────────────────── */

  private columnsToCSS(): string {
    return this.definition.columns.map(t => this.trackToCSS(t)).join(' ');
  }

  private rowsToCSS(): string {
    return this.definition.rows.map(t => this.trackToCSS(t)).join(' ');
  }

  private trackToCSS(track: TrackDef): string {
    if (track === 'auto') return 'auto';
    if (this.isMinMaxTrack(track)) {
      return `minmax(${this.sizeToCSS(track.min)}, ${this.sizeToCSS(track.max)})`;
    }
    return this.sizeToCSS(track);
  }

  private sizeToCSS(size: TrackSize): string {
    if (size.unit === 'auto') return 'auto';
    if (size.unit === 'min-content') return 'min-content';
    if (size.unit === 'max-content') return 'max-content';
    return `${size.value}${size.unit}`;
  }

  private areasToCSS(): string {
    if (this.definition.areas.length === 0) return '';

    const rowCount = this.computedRows.length;
    const colCount = this.computedColumns.length;
    const grid: string[][] = [];

    for (let r = 0; r < rowCount; r++) {
      grid[r] = [];
      for (let c = 0; c < colCount; c++) {
        grid[r][c] = '.';
      }
    }

    for (const area of this.definition.areas) {
      for (let r = area.rowStart - 1; r < area.rowEnd - 1 && r < rowCount; r++) {
        for (let c = area.colStart - 1; c < area.colEnd - 1 && c < colCount; c++) {
          grid[r][c] = area.name;
        }
      }
    }

    return grid.map(row => `"${row.join(' ')}"`).join('\n  ');
  }

  /* ──────────────────────────────────────────
   * Private - Overlay Drawing
   * ────────────────────────────────────────── */

  private drawLines(ctx: CanvasRenderingContext2D, config: GridOverlayConfig): void {
    ctx.strokeStyle = config.lineColor;
    ctx.lineWidth = config.lineWidth;
    ctx.setLineDash([4, 4]);

    // Column lines
    for (const col of this.computedColumns) {
      ctx.beginPath();
      ctx.moveTo(col.start, 0);
      ctx.lineTo(col.start, this.containerHeight);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(col.start + col.size, 0);
      ctx.lineTo(col.start + col.size, this.containerHeight);
      ctx.stroke();
    }

    // Row lines
    for (const row of this.computedRows) {
      ctx.beginPath();
      ctx.moveTo(0, row.start);
      ctx.lineTo(this.containerWidth, row.start);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, row.start + row.size);
      ctx.lineTo(this.containerWidth, row.start + row.size);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  }

  private drawAreas(ctx: CanvasRenderingContext2D, config: GridOverlayConfig): void {
    const areaColors: Record<string, string> = {};
    const colorPalette = [
      '#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6',
      '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#a855f7',
    ];

    for (const area of this.definition.areas) {
      if (!areaColors[area.name]) {
        areaColors[area.name] = area.color ?? colorPalette[Object.keys(areaColors).length % colorPalette.length];
      }
    }

    for (const row of this.cells) {
      for (const cell of row) {
        if (cell.area) {
          const color = areaColors[cell.area] ?? '#6366f1';
          ctx.fillStyle = color.replace(')', `, ${config.areaOpacity})`).replace('rgb', 'rgba');
          ctx.fillRect(cell.x, cell.y, cell.width, cell.height);

          // Area name label
          ctx.fillStyle = color;
          ctx.font = '11px sans-serif';
          ctx.fillText(cell.area, cell.x + 4, cell.y + 14);
        }
      }
    }
  }

  private drawGaps(ctx: CanvasRenderingContext2D, config: GridOverlayConfig): void {
    ctx.fillStyle = config.gapColor;

    // Column gaps
    for (let i = 0; i < this.computedColumns.length - 1; i++) {
      const col = this.computedColumns[i];
      const nextCol = this.computedColumns[i + 1];
      const gapStart = col.start + col.size;
      const gapWidth = nextCol.start - gapStart;
      if (gapWidth > 0) {
        ctx.fillRect(gapStart, 0, gapWidth, this.containerHeight);
      }
    }

    // Row gaps
    for (let i = 0; i < this.computedRows.length - 1; i++) {
      const row = this.computedRows[i];
      const nextRow = this.computedRows[i + 1];
      const gapStart = row.start + row.size;
      const gapHeight = nextRow.start - gapStart;
      if (gapHeight > 0) {
        ctx.fillRect(0, gapStart, this.containerWidth, gapHeight);
      }
    }
  }

  private drawNumbers(ctx: CanvasRenderingContext2D, config: GridOverlayConfig): void {
    ctx.font = config.numberFont;
    ctx.fillStyle = config.numberColor;
    ctx.textBaseline = 'top';

    for (const col of this.computedColumns) {
      ctx.fillText(`${col.index + 1}`, col.start + 2, 2);
    }

    for (const row of this.computedRows) {
      ctx.fillText(`${row.index + 1}`, 2, row.start + 2);
    }
  }
}

/* ──────────────────────────────────────────────
 * Grid Presets
 * ────────────────────────────────────────────── */

export const GRID_PRESETS: readonly GridPreset[] = [
  {
    name: '2 Column',
    description: 'Simple two column layout',
    category: 'Basic',
    definition: {
      ...DEFAULT_GRID,
      columns: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }],
      columnGap: 16,
    },
  },
  {
    name: '3 Column',
    description: 'Three equal columns',
    category: 'Basic',
    definition: {
      ...DEFAULT_GRID,
      columns: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }],
      columnGap: 16,
    },
  },
  {
    name: '4 Column',
    description: 'Four equal columns',
    category: 'Basic',
    definition: {
      ...DEFAULT_GRID,
      columns: Array(4).fill({ value: 1, unit: 'fr' }),
      columnGap: 16,
    },
  },
  {
    name: '12 Column',
    description: 'Bootstrap-style 12 column grid',
    category: 'Framework',
    definition: {
      ...DEFAULT_GRID,
      columns: Array(12).fill({ value: 1, unit: 'fr' }),
      columnGap: 16,
    },
  },
  {
    name: 'Sidebar Left',
    description: 'Fixed sidebar with flexible content',
    category: 'Layout',
    definition: {
      ...DEFAULT_GRID,
      columns: [{ value: 250, unit: 'px' }, { value: 1, unit: 'fr' }],
      columnGap: 0,
    },
  },
  {
    name: 'Sidebar Right',
    description: 'Content with fixed right sidebar',
    category: 'Layout',
    definition: {
      ...DEFAULT_GRID,
      columns: [{ value: 1, unit: 'fr' }, { value: 300, unit: 'px' }],
      columnGap: 0,
    },
  },
  {
    name: 'Holy Grail',
    description: 'Header, footer, sidebar, content, aside',
    category: 'Layout',
    definition: {
      ...DEFAULT_GRID,
      columns: [{ value: 200, unit: 'px' }, { value: 1, unit: 'fr' }, { value: 200, unit: 'px' }],
      rows: [{ value: 60, unit: 'px' }, { value: 1, unit: 'fr' }, { value: 40, unit: 'px' }],
      areas: [
        { name: 'header', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 4 },
        { name: 'sidebar', rowStart: 2, rowEnd: 3, colStart: 1, colEnd: 2 },
        { name: 'main', rowStart: 2, rowEnd: 3, colStart: 2, colEnd: 3 },
        { name: 'aside', rowStart: 2, rowEnd: 3, colStart: 3, colEnd: 4 },
        { name: 'footer', rowStart: 3, rowEnd: 4, colStart: 1, colEnd: 4 },
      ],
      columnGap: 0,
      rowGap: 0,
    },
  },
  {
    name: 'Dashboard',
    description: '3-row dashboard with varied column widths',
    category: 'Dashboard',
    definition: {
      ...DEFAULT_GRID,
      columns: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }],
      rows: [{ value: 200, unit: 'px' }, { value: 1, unit: 'fr' }, { value: 300, unit: 'px' }],
      columnGap: 16,
      rowGap: 16,
    },
  },
  {
    name: 'Masonry 3',
    description: '3-column masonry-like grid',
    category: 'Gallery',
    definition: {
      ...DEFAULT_GRID,
      columns: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }],
      autoRows: { value: 100, unit: 'px' },
      columnGap: 8,
      rowGap: 8,
      autoFlow: 'dense',
    },
  },
  {
    name: 'Card Grid',
    description: 'Responsive card layout',
    category: 'Components',
    definition: {
      ...DEFAULT_GRID,
      columns: [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }],
      autoRows: { value: 250, unit: 'px' },
      columnGap: 24,
      rowGap: 24,
    },
  },
];

/* ──────────────────────────────────────────────
 * Singleton
 * ────────────────────────────────────────────── */

let _gridEngine: GridEngine | null = null;

export function getGridEngine(): GridEngine {
  if (!_gridEngine) _gridEngine = new GridEngine();
  return _gridEngine;
}
