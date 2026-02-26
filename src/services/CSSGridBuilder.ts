// =============================================================================
// CSS Grid Builder - Complete CSS Grid layout system with template generation,
// named areas, auto-placement, responsive grid, and visual grid builder
// =============================================================================

// =============================================================================
// Grid Types
// =============================================================================

export interface GridTrack {
  id: string;
  type: 'fixed' | 'fraction' | 'auto' | 'minmax' | 'fitContent' | 'repeat';
  value: string;
  minValue?: string;
  maxValue?: string;
  repeatCount?: number | 'auto-fill' | 'auto-fit';
  repeatValue?: string;
  label?: string;
}

export interface GridArea {
  id: string;
  name: string;
  rowStart: number;
  rowEnd: number;
  colStart: number;
  colEnd: number;
  color: string;
  content?: string;
  className?: string;
}

export interface GridGap {
  row: string;
  column: string;
}

export interface GridAlignment {
  justifyItems: 'start' | 'end' | 'center' | 'stretch';
  alignItems: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  justifyContent: 'start' | 'end' | 'center' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly';
  alignContent: 'start' | 'end' | 'center' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly';
}

export interface GridItemPlacement {
  gridColumn?: string;
  gridRow?: string;
  gridArea?: string;
  justifySelf?: 'start' | 'end' | 'center' | 'stretch';
  alignSelf?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  order?: number;
}

export interface GridConfig {
  id: string;
  name: string;
  columns: GridTrack[];
  rows: GridTrack[];
  gap: GridGap;
  alignment: GridAlignment;
  areas: GridArea[];
  autoFlow: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  autoRows: string;
  autoColumns: string;
  minHeight?: string;
  maxWidth?: string;
  padding?: string;
  responsive?: ResponsiveGridConfig[];
}

export interface ResponsiveGridConfig {
  breakpoint: number;
  label: string;
  columns: GridTrack[];
  rows: GridTrack[];
  gap: GridGap;
  areas: GridArea[];
  autoFlow?: string;
}

export interface GridTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  config: GridConfig;
  tags: string[];
}

// =============================================================================
// Grid Track Builder
// =============================================================================

export function createTrack(type: GridTrack['type'], value: string, options?: Partial<GridTrack>): GridTrack {
  return {
    id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    value,
    ...options,
  };
}

export function trackToCSS(track: GridTrack): string {
  switch (track.type) {
    case 'fixed':
      return track.value;
    case 'fraction':
      return `${track.value}fr`;
    case 'auto':
      return 'auto';
    case 'minmax':
      return `minmax(${track.minValue || '0'}, ${track.maxValue || '1fr'})`;
    case 'fitContent':
      return `fit-content(${track.value})`;
    case 'repeat':
      return `repeat(${track.repeatCount || 'auto-fill'}, ${track.repeatValue || track.value})`;
    default:
      return track.value;
  }
}

export function tracksToCSS(tracks: GridTrack[]): string {
  if (tracks.length === 0) return 'none';
  return tracks.map(trackToCSS).join(' ');
}

export function parseTrackValue(value: string): GridTrack {
  const id = `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  if (value === 'auto') {
    return { id, type: 'auto', value: 'auto' };
  }

  if (value.endsWith('fr')) {
    return { id, type: 'fraction', value: value.replace('fr', '') };
  }

  const minmaxMatch = value.match(/minmax\((.+),\s*(.+)\)/);
  if (minmaxMatch) {
    return { id, type: 'minmax', value, minValue: minmaxMatch[1], maxValue: minmaxMatch[2] };
  }

  const fitMatch = value.match(/fit-content\((.+)\)/);
  if (fitMatch) {
    return { id, type: 'fitContent', value: fitMatch[1] };
  }

  const repeatMatch = value.match(/repeat\((.+),\s*(.+)\)/);
  if (repeatMatch) {
    const count = repeatMatch[1];
    const repeatCount = count === 'auto-fill' || count === 'auto-fit' ? count : parseInt(count, 10);
    return { id, type: 'repeat', value, repeatCount, repeatValue: repeatMatch[2] };
  }

  return { id, type: 'fixed', value };
}

// =============================================================================
// Grid Area Builder
// =============================================================================

export function createArea(
  name: string,
  rowStart: number,
  colStart: number,
  rowEnd: number,
  colEnd: number
): GridArea {
  const AREA_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F1948A', '#82E0AA', '#F8C471', '#AED6F1', '#D7BDE2',
  ];

  return {
    id: `area-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    rowStart,
    rowEnd,
    colStart,
    colEnd,
    color: AREA_COLORS[Math.floor(Math.random() * AREA_COLORS.length)],
  };
}

export function generateAreaTemplate(areas: GridArea[], rows: number, cols: number): string {
  if (areas.length === 0) return '';

  const grid: string[][] = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      grid[r][c] = '.';
    }
  }

  for (const area of areas) {
    for (let r = area.rowStart - 1; r < area.rowEnd - 1; r++) {
      for (let c = area.colStart - 1; c < area.colEnd - 1; c++) {
        if (r >= 0 && r < rows && c >= 0 && c < cols) {
          grid[r][c] = area.name;
        }
      }
    }
  }

  return grid.map(row => `"${row.join(' ')}"`).join('\n    ');
}

export function parseAreaTemplate(template: string): { areas: GridArea[]; rows: number; cols: number } {
  const lines = template.split('\n').map(l => l.trim().replace(/"/g, ''));
  const rows = lines.length;
  const cols = lines[0]?.split(/\s+/).length || 0;
  const areaNames = new Set<string>();
  const areas: GridArea[] = [];

  for (const line of lines) {
    for (const name of line.split(/\s+/)) {
      if (name !== '.' && !areaNames.has(name)) {
        areaNames.add(name);
      }
    }
  }

  for (const name of areaNames) {
    let rowStart = Infinity, rowEnd = -Infinity, colStart = Infinity, colEnd = -Infinity;
    for (let r = 0; r < rows; r++) {
      const cells = lines[r].split(/\s+/);
      for (let c = 0; c < cells.length; c++) {
        if (cells[c] === name) {
          rowStart = Math.min(rowStart, r + 1);
          rowEnd = Math.max(rowEnd, r + 2);
          colStart = Math.min(colStart, c + 1);
          colEnd = Math.max(colEnd, c + 2);
        }
      }
    }
    areas.push(createArea(name, rowStart, colStart, rowEnd, colEnd));
  }

  return { areas, rows, cols };
}

// =============================================================================
// CSS Generation
// =============================================================================

export function generateGridCSS(config: GridConfig): string {
  const lines: string[] = [];

  lines.push('display: grid;');
  lines.push(`grid-template-columns: ${tracksToCSS(config.columns)};`);
  lines.push(`grid-template-rows: ${tracksToCSS(config.rows)};`);

  if (config.gap.row || config.gap.column) {
    if (config.gap.row === config.gap.column) {
      lines.push(`gap: ${config.gap.row};`);
    } else {
      lines.push(`row-gap: ${config.gap.row};`);
      lines.push(`column-gap: ${config.gap.column};`);
    }
  }

  if (config.areas.length > 0) {
    const rowCount = config.rows.length || Math.max(...config.areas.map(a => a.rowEnd - 1));
    const colCount = config.columns.length || Math.max(...config.areas.map(a => a.colEnd - 1));
    const template = generateAreaTemplate(config.areas, rowCount, colCount);
    lines.push(`grid-template-areas:\n    ${template};`);
  }

  if (config.autoFlow && config.autoFlow !== 'row') {
    lines.push(`grid-auto-flow: ${config.autoFlow};`);
  }

  if (config.autoRows && config.autoRows !== 'auto') {
    lines.push(`grid-auto-rows: ${config.autoRows};`);
  }

  if (config.autoColumns && config.autoColumns !== 'auto') {
    lines.push(`grid-auto-columns: ${config.autoColumns};`);
  }

  if (config.alignment.justifyItems !== 'stretch') {
    lines.push(`justify-items: ${config.alignment.justifyItems};`);
  }
  if (config.alignment.alignItems !== 'stretch') {
    lines.push(`align-items: ${config.alignment.alignItems};`);
  }
  if (config.alignment.justifyContent !== 'stretch') {
    lines.push(`justify-content: ${config.alignment.justifyContent};`);
  }
  if (config.alignment.alignContent !== 'stretch') {
    lines.push(`align-content: ${config.alignment.alignContent};`);
  }

  if (config.minHeight) lines.push(`min-height: ${config.minHeight};`);
  if (config.maxWidth) lines.push(`max-width: ${config.maxWidth};`);
  if (config.padding) lines.push(`padding: ${config.padding};`);

  return lines.join('\n');
}

export function generateGridItemCSS(placement: GridItemPlacement): string {
  const lines: string[] = [];

  if (placement.gridArea) {
    lines.push(`grid-area: ${placement.gridArea};`);
  } else {
    if (placement.gridColumn) lines.push(`grid-column: ${placement.gridColumn};`);
    if (placement.gridRow) lines.push(`grid-row: ${placement.gridRow};`);
  }
  if (placement.justifySelf) lines.push(`justify-self: ${placement.justifySelf};`);
  if (placement.alignSelf) lines.push(`align-self: ${placement.alignSelf};`);
  if (placement.order !== undefined) lines.push(`order: ${placement.order};`);

  return lines.join('\n');
}

export function generateResponsiveGridCSS(config: GridConfig): string {
  let css = `.${config.name || 'grid-container'} {\n`;
  css += generateGridCSS(config).split('\n').map(l => `  ${l}`).join('\n');
  css += '\n}\n';

  if (config.responsive) {
    for (const bp of config.responsive) {
      css += `\n@media (max-width: ${bp.breakpoint}px) {\n`;
      css += `  .${config.name || 'grid-container'} {\n`;
      css += `    grid-template-columns: ${tracksToCSS(bp.columns)};\n`;
      css += `    grid-template-rows: ${tracksToCSS(bp.rows)};\n`;
      if (bp.gap.row === bp.gap.column) {
        css += `    gap: ${bp.gap.row};\n`;
      } else {
        css += `    row-gap: ${bp.gap.row};\n`;
        css += `    column-gap: ${bp.gap.column};\n`;
      }
      if (bp.areas.length > 0) {
        const rowCount = bp.rows.length || Math.max(...bp.areas.map(a => a.rowEnd - 1));
        const colCount = bp.columns.length || Math.max(...bp.areas.map(a => a.colEnd - 1));
        const template = generateAreaTemplate(bp.areas, rowCount, colCount);
        css += `    grid-template-areas:\n      ${template};\n`;
      }
      if (bp.autoFlow) {
        css += `    grid-auto-flow: ${bp.autoFlow};\n`;
      }
      css += `  }\n}\n`;
    }
  }

  return css;
}

// =============================================================================
// Grid HTML Generation
// =============================================================================

export function generateGridHTML(config: GridConfig, itemCount?: number): string {
  const items = itemCount || config.areas.length || 6;
  let html = `<div class="${config.name || 'grid-container'}">\n`;

  if (config.areas.length > 0) {
    for (const area of config.areas) {
      html += `  <div class="grid-item" style="grid-area: ${area.name};">\n`;
      html += `    ${area.content || area.name}\n`;
      html += `  </div>\n`;
    }
  } else {
    for (let i = 1; i <= items; i++) {
      html += `  <div class="grid-item">Item ${i}</div>\n`;
    }
  }

  html += `</div>`;
  return html;
}

export function generateGridReactJSX(config: GridConfig): string {
  const style: Record<string, string> = {
    display: 'grid',
    gridTemplateColumns: tracksToCSS(config.columns),
    gridTemplateRows: tracksToCSS(config.rows),
  };

  if (config.gap.row === config.gap.column) {
    style.gap = config.gap.row;
  } else {
    style.rowGap = config.gap.row;
    style.columnGap = config.gap.column;
  }

  if (config.autoFlow !== 'row') style.gridAutoFlow = config.autoFlow;
  if (config.autoRows !== 'auto') style.gridAutoRows = config.autoRows;
  if (config.autoColumns !== 'auto') style.gridAutoColumns = config.autoColumns;

  const styleStr = Object.entries(style)
    .map(([k, v]) => `    ${k}: '${v}'`)
    .join(',\n');

  let jsx = `<div\n  style={{\n${styleStr}\n  }}\n>\n`;

  if (config.areas.length > 0) {
    for (const area of config.areas) {
      jsx += `  <div style={{ gridArea: '${area.name}' }}>\n    {/* ${area.name} */}\n  </div>\n`;
    }
  } else {
    for (let i = 1; i <= (config.columns.length || 6); i++) {
      jsx += `  <div>Item ${i}</div>\n`;
    }
  }

  jsx += `</div>`;
  return jsx;
}

// =============================================================================
// Grid Tailwind Generation
// =============================================================================

export function generateGridTailwind(config: GridConfig): string {
  const classes: string[] = ['grid'];

  const colCount = config.columns.length;
  if (colCount >= 1 && colCount <= 12) {
    const allFr = config.columns.every(t => t.type === 'fraction' && t.value === '1');
    if (allFr) {
      classes.push(`grid-cols-${colCount}`);
    }
  }

  const rowCount = config.rows.length;
  if (rowCount >= 1 && rowCount <= 6) {
    const allFr = config.rows.every(t => t.type === 'fraction' && t.value === '1');
    if (allFr) {
      classes.push(`grid-rows-${rowCount}`);
    }
  }

  const gapMap: Record<string, string> = {
    '0': 'gap-0', '0.25rem': 'gap-1', '0.5rem': 'gap-2', '0.75rem': 'gap-3',
    '1rem': 'gap-4', '1.25rem': 'gap-5', '1.5rem': 'gap-6', '2rem': 'gap-8',
    '2.5rem': 'gap-10', '3rem': 'gap-12', '4rem': 'gap-16', '5rem': 'gap-20',
  };

  if (config.gap.row === config.gap.column) {
    classes.push(gapMap[config.gap.row] || `gap-[${config.gap.row}]`);
  } else {
    classes.push(gapMap[config.gap.row] ? `gap-y-${gapMap[config.gap.row].split('-')[1]}` : `gap-y-[${config.gap.row}]`);
    classes.push(gapMap[config.gap.column] ? `gap-x-${gapMap[config.gap.column].split('-')[1]}` : `gap-x-[${config.gap.column}]`);
  }

  if (config.autoFlow === 'column') classes.push('grid-flow-col');
  if (config.autoFlow === 'dense') classes.push('grid-flow-dense');
  if (config.autoFlow === 'row dense') classes.push('grid-flow-row-dense');
  if (config.autoFlow === 'column dense') classes.push('grid-flow-col-dense');

  const justifyItemsMap: Record<string, string> = {
    start: 'justify-items-start', end: 'justify-items-end',
    center: 'justify-items-center', stretch: 'justify-items-stretch',
  };
  if (config.alignment.justifyItems !== 'stretch') {
    classes.push(justifyItemsMap[config.alignment.justifyItems]);
  }

  const alignItemsMap: Record<string, string> = {
    start: 'items-start', end: 'items-end', center: 'items-center',
    stretch: 'items-stretch', baseline: 'items-baseline',
  };
  if (config.alignment.alignItems !== 'stretch') {
    classes.push(alignItemsMap[config.alignment.alignItems]);
  }

  return classes.join(' ');
}

// =============================================================================
// Grid Templates Library
// =============================================================================

export const GRID_TEMPLATES: GridTemplate[] = [
  {
    id: 'holy-grail',
    name: 'Holy Grail Layout',
    description: 'Classic header, sidebar, content, sidebar, footer layout',
    category: 'page-layouts',
    tags: ['classic', 'full-page', 'three-column'],
    config: {
      id: 'holy-grail-config',
      name: 'holy-grail',
      columns: [
        createTrack('fixed', '200px'),
        createTrack('fraction', '1'),
        createTrack('fixed', '200px'),
      ],
      rows: [
        createTrack('auto', 'auto'),
        createTrack('fraction', '1'),
        createTrack('auto', 'auto'),
      ],
      gap: { row: '0', column: '0' },
      alignment: { justifyItems: 'stretch', alignItems: 'stretch', justifyContent: 'stretch', alignContent: 'stretch' },
      areas: [
        createArea('header', 1, 1, 2, 4),
        createArea('sidebar-left', 2, 1, 3, 2),
        createArea('main', 2, 2, 3, 3),
        createArea('sidebar-right', 2, 3, 3, 4),
        createArea('footer', 3, 1, 4, 4),
      ],
      autoFlow: 'row',
      autoRows: 'auto',
      autoColumns: 'auto',
      minHeight: '100vh',
    },
  },
  {
    id: 'dashboard',
    name: 'Dashboard Layout',
    description: 'Admin dashboard with sidebar and content area',
    category: 'page-layouts',
    tags: ['admin', 'dashboard', 'sidebar'],
    config: {
      id: 'dashboard-config',
      name: 'dashboard',
      columns: [
        createTrack('fixed', '250px'),
        createTrack('fraction', '1'),
      ],
      rows: [
        createTrack('fixed', '60px'),
        createTrack('fraction', '1'),
      ],
      gap: { row: '0', column: '0' },
      alignment: { justifyItems: 'stretch', alignItems: 'stretch', justifyContent: 'stretch', alignContent: 'stretch' },
      areas: [
        createArea('nav', 1, 1, 2, 3),
        createArea('sidebar', 2, 1, 3, 2),
        createArea('content', 2, 2, 3, 3),
      ],
      autoFlow: 'row',
      autoRows: 'auto',
      autoColumns: 'auto',
      minHeight: '100vh',
    },
  },
  {
    id: 'card-grid',
    name: 'Card Grid',
    description: 'Responsive auto-fit card grid',
    category: 'card-layouts',
    tags: ['cards', 'responsive', 'auto-fit'],
    config: {
      id: 'card-grid-config',
      name: 'card-grid',
      columns: [
        createTrack('repeat', '', { repeatCount: 'auto-fit', repeatValue: 'minmax(300px, 1fr)' }),
      ],
      rows: [],
      gap: { row: '1.5rem', column: '1.5rem' },
      alignment: { justifyItems: 'stretch', alignItems: 'start', justifyContent: 'stretch', alignContent: 'start' },
      areas: [],
      autoFlow: 'row',
      autoRows: 'auto',
      autoColumns: 'auto',
      padding: '1.5rem',
    },
  },
  {
    id: 'masonry-like',
    name: 'Masonry-like Grid',
    description: 'Pinterest-style masonry layout simulation',
    category: 'card-layouts',
    tags: ['masonry', 'pinterest', 'columns'],
    config: {
      id: 'masonry-config',
      name: 'masonry-grid',
      columns: [
        createTrack('repeat', '', { repeatCount: 'auto-fill', repeatValue: 'minmax(250px, 1fr)' }),
      ],
      rows: [],
      gap: { row: '1rem', column: '1rem' },
      alignment: { justifyItems: 'stretch', alignItems: 'start', justifyContent: 'stretch', alignContent: 'start' },
      areas: [],
      autoFlow: 'dense',
      autoRows: 'minmax(100px, auto)',
      autoColumns: 'auto',
    },
  },
  {
    id: 'magazine',
    name: 'Magazine Layout',
    description: 'Editorial-style layout with featured content',
    category: 'content-layouts',
    tags: ['magazine', 'editorial', 'featured'],
    config: {
      id: 'magazine-config',
      name: 'magazine',
      columns: [
        createTrack('fraction', '2'),
        createTrack('fraction', '1'),
        createTrack('fraction', '1'),
      ],
      rows: [
        createTrack('fixed', '300px'),
        createTrack('fixed', '200px'),
        createTrack('fixed', '200px'),
      ],
      gap: { row: '1rem', column: '1rem' },
      alignment: { justifyItems: 'stretch', alignItems: 'stretch', justifyContent: 'stretch', alignContent: 'stretch' },
      areas: [
        createArea('featured', 1, 1, 3, 2),
        createArea('article1', 1, 2, 2, 3),
        createArea('article2', 1, 3, 2, 4),
        createArea('article3', 2, 2, 3, 4),
        createArea('article4', 3, 1, 4, 2),
        createArea('article5', 3, 2, 4, 4),
      ],
      autoFlow: 'row',
      autoRows: 'auto',
      autoColumns: 'auto',
    },
  },
  {
    id: 'pricing-table',
    name: 'Pricing Table',
    description: 'Three-column pricing comparison layout',
    category: 'marketing',
    tags: ['pricing', 'comparison', 'columns'],
    config: {
      id: 'pricing-config',
      name: 'pricing-table',
      columns: [
        createTrack('fraction', '1'),
        createTrack('fraction', '1'),
        createTrack('fraction', '1'),
      ],
      rows: [
        createTrack('auto', 'auto'),
      ],
      gap: { row: '2rem', column: '2rem' },
      alignment: { justifyItems: 'stretch', alignItems: 'start', justifyContent: 'center', alignContent: 'start' },
      areas: [],
      autoFlow: 'row',
      autoRows: 'auto',
      autoColumns: 'auto',
      maxWidth: '1200px',
      padding: '2rem',
    },
  },
  {
    id: 'photo-gallery',
    name: 'Photo Gallery',
    description: 'Asymmetric photo gallery with featured images',
    category: 'media',
    tags: ['gallery', 'photos', 'asymmetric'],
    config: {
      id: 'gallery-config',
      name: 'photo-gallery',
      columns: [
        createTrack('fraction', '1'),
        createTrack('fraction', '1'),
        createTrack('fraction', '1'),
        createTrack('fraction', '1'),
      ],
      rows: [
        createTrack('fixed', '200px'),
        createTrack('fixed', '200px'),
        createTrack('fixed', '200px'),
      ],
      gap: { row: '0.5rem', column: '0.5rem' },
      alignment: { justifyItems: 'stretch', alignItems: 'stretch', justifyContent: 'stretch', alignContent: 'stretch' },
      areas: [
        createArea('large', 1, 1, 3, 3),
        createArea('small1', 1, 3, 2, 4),
        createArea('small2', 1, 4, 2, 5),
        createArea('small3', 2, 3, 3, 5),
        createArea('wide', 3, 1, 4, 5),
      ],
      autoFlow: 'dense',
      autoRows: '200px',
      autoColumns: 'auto',
    },
  },
  {
    id: 'blog-layout',
    name: 'Blog Layout',
    description: 'Blog with main content and sidebar',
    category: 'content-layouts',
    tags: ['blog', 'content', 'sidebar'],
    config: {
      id: 'blog-config',
      name: 'blog-layout',
      columns: [
        createTrack('minmax', '', { minValue: '0', maxValue: '1fr' }),
        createTrack('minmax', '', { minValue: '300px', maxValue: '800px' }),
        createTrack('fixed', '300px'),
        createTrack('minmax', '', { minValue: '0', maxValue: '1fr' }),
      ],
      rows: [
        createTrack('auto', 'auto'),
        createTrack('fraction', '1'),
        createTrack('auto', 'auto'),
      ],
      gap: { row: '2rem', column: '2rem' },
      alignment: { justifyItems: 'stretch', alignItems: 'start', justifyContent: 'stretch', alignContent: 'stretch' },
      areas: [
        createArea('header', 1, 1, 2, 5),
        createArea('spacer-l', 2, 1, 3, 2),
        createArea('content', 2, 2, 3, 3),
        createArea('sidebar', 2, 3, 3, 4),
        createArea('spacer-r', 2, 4, 3, 5),
        createArea('footer', 3, 1, 4, 5),
      ],
      autoFlow: 'row',
      autoRows: 'auto',
      autoColumns: 'auto',
    },
  },
  {
    id: 'portfolio-grid',
    name: 'Portfolio Grid',
    description: 'Showcase portfolio with varied item sizes',
    category: 'media',
    tags: ['portfolio', 'showcase', 'varied'],
    config: {
      id: 'portfolio-config',
      name: 'portfolio-grid',
      columns: [
        createTrack('fraction', '1'),
        createTrack('fraction', '1'),
        createTrack('fraction', '1'),
      ],
      rows: [
        createTrack('fixed', '250px'),
        createTrack('fixed', '250px'),
        createTrack('fixed', '250px'),
      ],
      gap: { row: '1rem', column: '1rem' },
      alignment: { justifyItems: 'stretch', alignItems: 'stretch', justifyContent: 'stretch', alignContent: 'stretch' },
      areas: [
        createArea('project1', 1, 1, 2, 3),
        createArea('project2', 1, 3, 3, 4),
        createArea('project3', 2, 1, 3, 2),
        createArea('project4', 2, 2, 3, 3),
        createArea('project5', 3, 1, 4, 4),
      ],
      autoFlow: 'dense',
      autoRows: '250px',
      autoColumns: 'auto',
    },
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Layout',
    description: 'Product listing with filters sidebar',
    category: 'page-layouts',
    tags: ['ecommerce', 'products', 'filters'],
    config: {
      id: 'ecommerce-config',
      name: 'ecommerce',
      columns: [
        createTrack('fixed', '280px'),
        createTrack('fraction', '1'),
      ],
      rows: [
        createTrack('auto', 'auto'),
        createTrack('auto', 'auto'),
        createTrack('fraction', '1'),
        createTrack('auto', 'auto'),
      ],
      gap: { row: '1rem', column: '2rem' },
      alignment: { justifyItems: 'stretch', alignItems: 'start', justifyContent: 'stretch', alignContent: 'start' },
      areas: [
        createArea('header', 1, 1, 2, 3),
        createArea('breadcrumbs', 2, 1, 3, 3),
        createArea('filters', 3, 1, 4, 2),
        createArea('products', 3, 2, 4, 3),
        createArea('footer', 4, 1, 5, 3),
      ],
      autoFlow: 'row',
      autoRows: 'auto',
      autoColumns: 'auto',
    },
  },
];

// =============================================================================
// Grid Utilities
// =============================================================================

export function getTemplatesByCategory(category: string): GridTemplate[] {
  return GRID_TEMPLATES.filter(t => t.category === category);
}

export function searchGridTemplates(query: string): GridTemplate[] {
  const lowerQuery = query.toLowerCase();
  return GRID_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getGridCategories(): { id: string; name: string; count: number }[] {
  const cats = new Map<string, number>();
  for (const t of GRID_TEMPLATES) {
    cats.set(t.category, (cats.get(t.category) || 0) + 1);
  }

  const nameMap: Record<string, string> = {
    'page-layouts': 'Page Layouts',
    'card-layouts': 'Card Layouts',
    'content-layouts': 'Content Layouts',
    'marketing': 'Marketing',
    'media': 'Media & Gallery',
  };

  return Array.from(cats.entries()).map(([id, count]) => ({
    id,
    name: nameMap[id] || id,
    count,
  }));
}

export function cloneGridConfig(config: GridConfig, newName?: string): GridConfig {
  const cloned = JSON.parse(JSON.stringify(config)) as GridConfig;
  cloned.id = `grid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  if (newName) cloned.name = newName;

  cloned.columns.forEach(t => { t.id = `track-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`; });
  cloned.rows.forEach(t => { t.id = `track-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`; });
  cloned.areas.forEach(a => { a.id = `area-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`; });

  return cloned;
}

export function createDefaultGridConfig(): GridConfig {
  return {
    id: `grid-${Date.now()}`,
    name: 'grid-container',
    columns: [
      createTrack('fraction', '1'),
      createTrack('fraction', '1'),
      createTrack('fraction', '1'),
    ],
    rows: [
      createTrack('auto', 'auto'),
    ],
    gap: { row: '1rem', column: '1rem' },
    alignment: {
      justifyItems: 'stretch',
      alignItems: 'stretch',
      justifyContent: 'stretch',
      alignContent: 'stretch',
    },
    areas: [],
    autoFlow: 'row',
    autoRows: 'auto',
    autoColumns: 'auto',
  };
}

// =============================================================================
// Grid Analysis & Validation
// =============================================================================

export interface GridAnalysis {
  totalCells: number;
  usedCells: number;
  emptyCells: number;
  overlappingAreas: string[];
  warnings: string[];
  responsiveScore: number;
}

export function analyzeGrid(config: GridConfig): GridAnalysis {
  const rowCount = config.rows.length || 1;
  const colCount = config.columns.length || 1;
  const totalCells = rowCount * colCount;
  const warnings: string[] = [];
  const overlapping: string[] = [];

  // Check for area overlaps
  const cellMap = new Map<string, string>();
  for (const area of config.areas) {
    for (let r = area.rowStart; r < area.rowEnd; r++) {
      for (let c = area.colStart; c < area.colEnd; c++) {
        const key = `${r}-${c}`;
        if (cellMap.has(key)) {
          overlapping.push(`${area.name} overlaps with ${cellMap.get(key)} at row ${r}, col ${c}`);
        }
        cellMap.set(key, area.name);
      }
    }
  }

  const usedCells = cellMap.size;
  const emptyCells = Math.max(0, totalCells - usedCells);

  // Check responsive
  let responsiveScore = 50;
  if (config.responsive && config.responsive.length > 0) {
    responsiveScore += config.responsive.length * 15;
  }

  const hasFlexibleColumns = config.columns.some(c => c.type === 'fraction' || c.type === 'repeat');
  if (hasFlexibleColumns) responsiveScore += 10;

  const hasMinmax = config.columns.some(c => c.type === 'minmax');
  if (hasMinmax) responsiveScore += 15;

  responsiveScore = Math.min(100, responsiveScore);

  // Warnings
  if (colCount > 12) warnings.push('More than 12 columns may cause layout issues on smaller screens');
  if (!config.gap.row && !config.gap.column) warnings.push('No gap defined - items may appear cramped');
  if (config.areas.length > 0 && overlapping.length > 0) warnings.push('Grid areas overlap detected');
  if (!config.responsive || config.responsive.length === 0) {
    warnings.push('No responsive breakpoints defined');
  }

  return {
    totalCells,
    usedCells,
    emptyCells,
    overlappingAreas: overlapping,
    warnings,
    responsiveScore,
  };
}

// =============================================================================
// Grid SCSS Generation
// =============================================================================

export function generateGridSCSS(config: GridConfig): string {
  let scss = `// Generated CSS Grid Layout - ${config.name}\n`;
  scss += `// Auto-generated by AppBuilder Grid System\n\n`;
  scss += `$grid-gap-row: ${config.gap.row};\n`;
  scss += `$grid-gap-col: ${config.gap.column};\n\n`;

  scss += `.${config.name || 'grid-container'} {\n`;
  scss += `  display: grid;\n`;
  scss += `  grid-template-columns: ${tracksToCSS(config.columns)};\n`;
  scss += `  grid-template-rows: ${tracksToCSS(config.rows)};\n`;
  scss += `  gap: $grid-gap-row $grid-gap-col;\n`;

  if (config.areas.length > 0) {
    const rowCount = config.rows.length || Math.max(...config.areas.map(a => a.rowEnd - 1));
    const colCount = config.columns.length || Math.max(...config.areas.map(a => a.colEnd - 1));
    const template = generateAreaTemplate(config.areas, rowCount, colCount);
    scss += `  grid-template-areas:\n    ${template};\n`;
  }

  scss += `\n  // Grid items\n`;
  for (const area of config.areas) {
    scss += `  &__${area.name} {\n`;
    scss += `    grid-area: ${area.name};\n`;
    scss += `  }\n\n`;
  }

  if (config.responsive) {
    for (const bp of config.responsive) {
      scss += `\n  @media (max-width: ${bp.breakpoint}px) {\n`;
      scss += `    grid-template-columns: ${tracksToCSS(bp.columns)};\n`;
      scss += `    grid-template-rows: ${tracksToCSS(bp.rows)};\n`;
      scss += `    gap: ${bp.gap.row} ${bp.gap.column};\n`;
      if (bp.areas.length > 0) {
        const rCount = bp.rows.length || Math.max(...bp.areas.map(a => a.rowEnd - 1));
        const cCount = bp.columns.length || Math.max(...bp.areas.map(a => a.colEnd - 1));
        const tmpl = generateAreaTemplate(bp.areas, rCount, cCount);
        scss += `    grid-template-areas:\n      ${tmpl};\n`;
      }
      scss += `  }\n`;
    }
  }

  scss += `}\n`;
  return scss;
}

// =============================================================================
// Grid Inline Style Generator (for React)
// =============================================================================

export function gridConfigToStyle(config: GridConfig): React.CSSProperties {
  const style: Record<string, string | number> = {
    display: 'grid',
    gridTemplateColumns: tracksToCSS(config.columns),
    gridTemplateRows: tracksToCSS(config.rows),
  };

  if (config.gap.row === config.gap.column) {
    style.gap = config.gap.row;
  } else {
    style.rowGap = config.gap.row;
    style.columnGap = config.gap.column;
  }

  if (config.areas.length > 0) {
    const rowCount = config.rows.length || Math.max(...config.areas.map(a => a.rowEnd - 1));
    const colCount = config.columns.length || Math.max(...config.areas.map(a => a.colEnd - 1));
    const grid: string[][] = [];
    for (let r = 0; r < rowCount; r++) {
      grid[r] = [];
      for (let c = 0; c < colCount; c++) {
        grid[r][c] = '.';
      }
    }
    for (const area of config.areas) {
      for (let r = area.rowStart - 1; r < area.rowEnd - 1; r++) {
        for (let c = area.colStart - 1; c < area.colEnd - 1; c++) {
          if (r >= 0 && r < rowCount && c >= 0 && c < colCount) {
            grid[r][c] = area.name;
          }
        }
      }
    }
    style.gridTemplateAreas = grid.map(row => `"${row.join(' ')}"`).join(' ');
  }

  if (config.autoFlow !== 'row') style.gridAutoFlow = config.autoFlow;
  if (config.autoRows !== 'auto') style.gridAutoRows = config.autoRows;
  if (config.autoColumns !== 'auto') style.gridAutoColumns = config.autoColumns;
  if (config.alignment.justifyItems !== 'stretch') style.justifyItems = config.alignment.justifyItems;
  if (config.alignment.alignItems !== 'stretch') style.alignItems = config.alignment.alignItems;
  if (config.alignment.justifyContent !== 'stretch') style.justifyContent = config.alignment.justifyContent;
  if (config.alignment.alignContent !== 'stretch') style.alignContent = config.alignment.alignContent;
  if (config.minHeight) style.minHeight = config.minHeight;
  if (config.maxWidth) style.maxWidth = config.maxWidth;
  if (config.padding) style.padding = config.padding;

  return style as unknown as React.CSSProperties;
}

// =============================================================================
// Subgrid Support
// =============================================================================

export interface SubgridConfig {
  parentGridId: string;
  inheritColumns: boolean;
  inheritRows: boolean;
  ownColumns?: GridTrack[];
  ownRows?: GridTrack[];
  gap: GridGap;
  placement: GridItemPlacement;
}

export function generateSubgridCSS(subgrid: SubgridConfig): string {
  const lines: string[] = ['display: grid;'];

  if (subgrid.inheritColumns) {
    lines.push('grid-template-columns: subgrid;');
  } else if (subgrid.ownColumns) {
    lines.push(`grid-template-columns: ${tracksToCSS(subgrid.ownColumns)};`);
  }

  if (subgrid.inheritRows) {
    lines.push('grid-template-rows: subgrid;');
  } else if (subgrid.ownRows) {
    lines.push(`grid-template-rows: ${tracksToCSS(subgrid.ownRows)};`);
  }

  if (subgrid.gap.row === subgrid.gap.column) {
    lines.push(`gap: ${subgrid.gap.row};`);
  } else {
    lines.push(`row-gap: ${subgrid.gap.row};`);
    lines.push(`column-gap: ${subgrid.gap.column};`);
  }

  const placementCSS = generateGridItemCSS(subgrid.placement);
  if (placementCSS) {
    lines.push(placementCSS);
  }

  return lines.join('\n');
}
