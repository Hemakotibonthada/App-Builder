// =============================================================================
// Flexbox Builder - Complete flexbox layout system with visual builder,
// CSS generation, responsive flex layouts, and common pattern templates
// =============================================================================

// =============================================================================
// Flexbox Types
// =============================================================================

export interface FlexContainerConfig {
  id: string;
  name: string;
  display: 'flex' | 'inline-flex';
  direction: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  wrap: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  alignContent: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'space-between' | 'space-around';
  gap: string;
  rowGap?: string;
  columnGap?: string;
  padding?: string;
  minHeight?: string;
  maxWidth?: string;
  items: FlexItemConfig[];
  responsive?: ResponsiveFlexConfig[];
}

export interface FlexItemConfig {
  id: string;
  label: string;
  order: number;
  flexGrow: number;
  flexShrink: number;
  flexBasis: string;
  alignSelf: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  width?: string;
  height?: string;
}

export interface ResponsiveFlexConfig {
  breakpoint: number;
  label: string;
  direction?: FlexContainerConfig['direction'];
  wrap?: FlexContainerConfig['wrap'];
  justifyContent?: FlexContainerConfig['justifyContent'];
  alignItems?: FlexContainerConfig['alignItems'];
  gap?: string;
  itemOverrides?: { itemId: string; overrides: Partial<FlexItemConfig> }[];
}

export interface FlexTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  config: FlexContainerConfig;
  tags: string[];
}

// =============================================================================
// Flex Item Builder
// =============================================================================

export function createFlexItem(label: string, options?: Partial<FlexItemConfig>): FlexItemConfig {
  return {
    id: `flex-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    label,
    order: 0,
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 'auto',
    alignSelf: 'auto',
    ...options,
  };
}

export function createFlexContainer(name: string, options?: Partial<FlexContainerConfig>): FlexContainerConfig {
  return {
    id: `flex-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    display: 'flex',
    direction: 'row',
    wrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    alignContent: 'stretch',
    gap: '0',
    items: [],
    ...options,
  };
}

// =============================================================================
// CSS Generation
// =============================================================================

export function generateFlexContainerCSS(config: FlexContainerConfig): string {
  const lines: string[] = [];

  lines.push(`display: ${config.display};`);
  lines.push(`flex-direction: ${config.direction};`);
  lines.push(`flex-wrap: ${config.wrap};`);
  lines.push(`justify-content: ${config.justifyContent};`);
  lines.push(`align-items: ${config.alignItems};`);

  if (config.alignContent !== 'stretch') {
    lines.push(`align-content: ${config.alignContent};`);
  }

  if (config.gap && config.gap !== '0') {
    if (config.rowGap && config.columnGap && config.rowGap !== config.columnGap) {
      lines.push(`row-gap: ${config.rowGap};`);
      lines.push(`column-gap: ${config.columnGap};`);
    } else {
      lines.push(`gap: ${config.gap};`);
    }
  }

  if (config.padding) lines.push(`padding: ${config.padding};`);
  if (config.minHeight) lines.push(`min-height: ${config.minHeight};`);
  if (config.maxWidth) lines.push(`max-width: ${config.maxWidth};`);

  return lines.join('\n');
}

export function generateFlexItemCSS(item: FlexItemConfig): string {
  const lines: string[] = [];

  // Use shorthand when possible
  const isDefaultShrink = item.flexShrink === 1;
  const isDefaultBasis = item.flexBasis === 'auto';

  if (item.flexGrow === 0 && isDefaultShrink && isDefaultBasis) {
    // Default flex value, skip shorthand
  } else if (item.flexGrow === 1 && isDefaultShrink && item.flexBasis === '0%') {
    lines.push('flex: 1;');
  } else if (isDefaultShrink && isDefaultBasis) {
    lines.push(`flex: ${item.flexGrow};`);
  } else {
    lines.push(`flex: ${item.flexGrow} ${item.flexShrink} ${item.flexBasis};`);
  }

  if (item.order !== 0) lines.push(`order: ${item.order};`);
  if (item.alignSelf !== 'auto') lines.push(`align-self: ${item.alignSelf};`);
  if (item.minWidth) lines.push(`min-width: ${item.minWidth};`);
  if (item.maxWidth) lines.push(`max-width: ${item.maxWidth};`);
  if (item.minHeight) lines.push(`min-height: ${item.minHeight};`);
  if (item.maxHeight) lines.push(`max-height: ${item.maxHeight};`);
  if (item.width) lines.push(`width: ${item.width};`);
  if (item.height) lines.push(`height: ${item.height};`);

  return lines.join('\n');
}

export function generateFullFlexCSS(config: FlexContainerConfig): string {
  let css = `.${config.name || 'flex-container'} {\n`;
  css += generateFlexContainerCSS(config).split('\n').map(l => `  ${l}`).join('\n');
  css += '\n}\n';

  for (let i = 0; i < config.items.length; i++) {
    const item = config.items[i];
    const itemCSS = generateFlexItemCSS(item);
    if (itemCSS) {
      css += `\n.${config.name || 'flex-container'} > .${item.label || `item-${i + 1}`} {\n`;
      css += itemCSS.split('\n').map(l => `  ${l}`).join('\n');
      css += '\n}\n';
    }
  }

  if (config.responsive) {
    for (const bp of config.responsive) {
      css += `\n@media (max-width: ${bp.breakpoint}px) {\n`;
      css += `  .${config.name || 'flex-container'} {\n`;
      if (bp.direction) css += `    flex-direction: ${bp.direction};\n`;
      if (bp.wrap) css += `    flex-wrap: ${bp.wrap};\n`;
      if (bp.justifyContent) css += `    justify-content: ${bp.justifyContent};\n`;
      if (bp.alignItems) css += `    align-items: ${bp.alignItems};\n`;
      if (bp.gap) css += `    gap: ${bp.gap};\n`;
      css += `  }\n`;

      if (bp.itemOverrides) {
        for (const override of bp.itemOverrides) {
          const item = config.items.find(i => i.id === override.itemId);
          if (item) {
            css += `  .${config.name || 'flex-container'} > .${item.label} {\n`;
            if (override.overrides.order !== undefined) css += `    order: ${override.overrides.order};\n`;
            if (override.overrides.flexGrow !== undefined) css += `    flex-grow: ${override.overrides.flexGrow};\n`;
            if (override.overrides.flexBasis) css += `    flex-basis: ${override.overrides.flexBasis};\n`;
            if (override.overrides.width) css += `    width: ${override.overrides.width};\n`;
            css += `  }\n`;
          }
        }
      }

      css += `}\n`;
    }
  }

  return css;
}

// =============================================================================
// Tailwind CSS Generation
// =============================================================================

export function generateFlexTailwind(config: FlexContainerConfig): string {
  const classes: string[] = [];

  classes.push(config.display === 'inline-flex' ? 'inline-flex' : 'flex');

  const dirMap: Record<string, string> = {
    'row': '', 'row-reverse': 'flex-row-reverse',
    'column': 'flex-col', 'column-reverse': 'flex-col-reverse',
  };
  if (dirMap[config.direction]) classes.push(dirMap[config.direction]);

  const wrapMap: Record<string, string> = {
    'nowrap': '', 'wrap': 'flex-wrap', 'wrap-reverse': 'flex-wrap-reverse',
  };
  if (wrapMap[config.wrap]) classes.push(wrapMap[config.wrap]);

  const justifyMap: Record<string, string> = {
    'flex-start': 'justify-start', 'flex-end': 'justify-end',
    'center': 'justify-center', 'space-between': 'justify-between',
    'space-around': 'justify-around', 'space-evenly': 'justify-evenly',
  };
  classes.push(justifyMap[config.justifyContent]);

  const alignMap: Record<string, string> = {
    'flex-start': 'items-start', 'flex-end': 'items-end',
    'center': 'items-center', 'stretch': 'items-stretch',
    'baseline': 'items-baseline',
  };
  classes.push(alignMap[config.alignItems]);

  const gapMap: Record<string, string> = {
    '0': '', '0.25rem': 'gap-1', '0.5rem': 'gap-2', '0.75rem': 'gap-3',
    '1rem': 'gap-4', '1.25rem': 'gap-5', '1.5rem': 'gap-6', '2rem': 'gap-8',
    '2.5rem': 'gap-10', '3rem': 'gap-12',
  };
  if (config.gap && gapMap[config.gap] !== undefined) {
    if (gapMap[config.gap]) classes.push(gapMap[config.gap]);
  } else if (config.gap && config.gap !== '0') {
    classes.push(`gap-[${config.gap}]`);
  }

  return classes.filter(Boolean).join(' ');
}

export function generateFlexItemTailwind(item: FlexItemConfig): string {
  const classes: string[] = [];

  if (item.flexGrow === 1 && item.flexShrink === 1 && item.flexBasis === '0%') {
    classes.push('flex-1');
  } else if (item.flexGrow === 1 && item.flexShrink === 0 && item.flexBasis === 'auto') {
    classes.push('flex-auto');
  } else if (item.flexGrow === 0 && item.flexShrink === 0 && item.flexBasis === 'auto') {
    classes.push('flex-none');
  } else {
    if (item.flexGrow === 1) classes.push('grow');
    if (item.flexGrow === 0) classes.push('grow-0');
    if (item.flexShrink === 0) classes.push('shrink-0');
  }

  const orderMap: Record<number, string> = {
    [-1]: '-order-1', 0: '', 1: 'order-1', 2: 'order-2', 3: 'order-3',
    4: 'order-4', 5: 'order-5', 6: 'order-6', 7: 'order-7', 8: 'order-8',
    9: 'order-9', 10: 'order-10', 11: 'order-11', 12: 'order-12',
    9999: 'order-last', [-9999]: 'order-first',
  };
  if (item.order !== 0 && orderMap[item.order]) {
    classes.push(orderMap[item.order]);
  }

  const selfMap: Record<string, string> = {
    'auto': '', 'flex-start': 'self-start', 'flex-end': 'self-end',
    'center': 'self-center', 'stretch': 'self-stretch', 'baseline': 'self-baseline',
  };
  if (selfMap[item.alignSelf]) classes.push(selfMap[item.alignSelf]);

  return classes.filter(Boolean).join(' ');
}

// =============================================================================
// React JSX Generation
// =============================================================================

export function generateFlexReactJSX(config: FlexContainerConfig): string {
  const containerStyle: Record<string, string | number> = {
    display: config.display,
    flexDirection: config.direction,
    flexWrap: config.wrap,
    justifyContent: config.justifyContent,
    alignItems: config.alignItems,
  };
  if (config.alignContent !== 'stretch') containerStyle.alignContent = config.alignContent;
  if (config.gap && config.gap !== '0') containerStyle.gap = config.gap;
  if (config.padding) containerStyle.padding = config.padding;
  if (config.minHeight) containerStyle.minHeight = config.minHeight;
  if (config.maxWidth) containerStyle.maxWidth = config.maxWidth;

  const styleStr = Object.entries(containerStyle)
    .map(([k, v]) => `    ${k}: '${v}'`)
    .join(',\n');

  let jsx = `<div\n  style={{\n${styleStr}\n  }}\n>\n`;

  for (const item of config.items) {
    const itemStyle: Record<string, string | number> = {};
    if (item.flexGrow === 1 && item.flexShrink === 1 && item.flexBasis === '0%') {
      itemStyle.flex = '1';
    } else if (!(item.flexGrow === 0 && item.flexShrink === 1 && item.flexBasis === 'auto')) {
      itemStyle.flex = `${item.flexGrow} ${item.flexShrink} ${item.flexBasis}`;
    }
    if (item.order !== 0) itemStyle.order = item.order;
    if (item.alignSelf !== 'auto') itemStyle.alignSelf = item.alignSelf;
    if (item.minWidth) itemStyle.minWidth = item.minWidth;
    if (item.maxWidth) itemStyle.maxWidth = item.maxWidth;

    const itemStyleStr = Object.entries(itemStyle)
      .map(([k, v]) => typeof v === 'number' ? `${k}: ${v}` : `${k}: '${v}'`)
      .join(', ');

    if (itemStyleStr) {
      jsx += `  <div style={{ ${itemStyleStr} }}>\n    {/* ${item.label} */}\n  </div>\n`;
    } else {
      jsx += `  <div>{/* ${item.label} */}</div>\n`;
    }
  }

  jsx += `</div>`;
  return jsx;
}

// =============================================================================
// Flex Inline Style (for React)
// =============================================================================

export function flexConfigToStyle(config: FlexContainerConfig): React.CSSProperties {
  const style: Record<string, string | number> = {
    display: config.display,
    flexDirection: config.direction,
    flexWrap: config.wrap,
    justifyContent: config.justifyContent,
    alignItems: config.alignItems,
  };

  if (config.alignContent !== 'stretch') style.alignContent = config.alignContent;
  if (config.gap && config.gap !== '0') {
    if (config.rowGap && config.columnGap && config.rowGap !== config.columnGap) {
      style.rowGap = config.rowGap;
      style.columnGap = config.columnGap;
    } else {
      style.gap = config.gap;
    }
  }
  if (config.padding) style.padding = config.padding;
  if (config.minHeight) style.minHeight = config.minHeight;
  if (config.maxWidth) style.maxWidth = config.maxWidth;

  return style as unknown as React.CSSProperties;
}

export function flexItemToStyle(item: FlexItemConfig): React.CSSProperties {
  const style: Record<string, string | number> = {};

  if (item.flexGrow === 1 && item.flexShrink === 1 && item.flexBasis === '0%') {
    style.flex = '1';
  } else if (!(item.flexGrow === 0 && item.flexShrink === 1 && item.flexBasis === 'auto')) {
    style.flex = `${item.flexGrow} ${item.flexShrink} ${item.flexBasis}`;
  }

  if (item.order !== 0) style.order = item.order;
  if (item.alignSelf !== 'auto') style.alignSelf = item.alignSelf;
  if (item.minWidth) style.minWidth = item.minWidth;
  if (item.maxWidth) style.maxWidth = item.maxWidth;
  if (item.minHeight) style.minHeight = item.minHeight;
  if (item.maxHeight) style.maxHeight = item.maxHeight;
  if (item.width) style.width = item.width;
  if (item.height) style.height = item.height;

  return style as unknown as React.CSSProperties;
}

// =============================================================================
// Flexbox Templates Library
// =============================================================================

export const FLEX_TEMPLATES: FlexTemplate[] = [
  {
    id: 'navbar',
    name: 'Navigation Bar',
    description: 'Horizontal navigation with logo, links, and actions',
    category: 'navigation',
    tags: ['nav', 'header', 'horizontal'],
    config: createFlexContainer('navbar', {
      direction: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.5rem 1.5rem',
      items: [
        createFlexItem('logo', { flexShrink: 0 }),
        createFlexItem('nav-links', { flexGrow: 1, flexBasis: '0%' }),
        createFlexItem('actions', { flexShrink: 0 }),
      ],
      responsive: [
        { breakpoint: 768, label: 'Mobile', direction: 'column', gap: '0.5rem' },
      ],
    }),
  },
  {
    id: 'centered-content',
    name: 'Centered Content',
    description: 'Perfectly centered content both horizontally and vertically',
    category: 'centering',
    tags: ['center', 'vertical', 'horizontal'],
    config: createFlexContainer('centered', {
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      items: [
        createFlexItem('content', { maxWidth: '600px' }),
      ],
    }),
  },
  {
    id: 'sidebar-layout',
    name: 'Sidebar Layout',
    description: 'Fixed sidebar with flexible main content',
    category: 'layouts',
    tags: ['sidebar', 'main', 'fixed'],
    config: createFlexContainer('sidebar-layout', {
      direction: 'row',
      alignItems: 'stretch',
      minHeight: '100vh',
      items: [
        createFlexItem('sidebar', { flexShrink: 0, width: '250px' }),
        createFlexItem('main', { flexGrow: 1, flexBasis: '0%' }),
      ],
      responsive: [
        { breakpoint: 768, label: 'Mobile', direction: 'column' },
      ],
    }),
  },
  {
    id: 'card-row',
    name: 'Card Row',
    description: 'Row of equally sized cards with wrapping',
    category: 'cards',
    tags: ['cards', 'equal', 'wrap'],
    config: createFlexContainer('card-row', {
      direction: 'row',
      wrap: 'wrap',
      justifyContent: 'flex-start',
      gap: '1.5rem',
      items: [
        createFlexItem('card-1', { flexGrow: 1, flexBasis: '300px', maxWidth: '400px' }),
        createFlexItem('card-2', { flexGrow: 1, flexBasis: '300px', maxWidth: '400px' }),
        createFlexItem('card-3', { flexGrow: 1, flexBasis: '300px', maxWidth: '400px' }),
      ],
    }),
  },
  {
    id: 'sticky-footer',
    name: 'Sticky Footer',
    description: 'Page layout with footer stuck to bottom',
    category: 'layouts',
    tags: ['footer', 'sticky', 'full-page'],
    config: createFlexContainer('sticky-footer', {
      direction: 'column',
      minHeight: '100vh',
      items: [
        createFlexItem('header', { flexShrink: 0 }),
        createFlexItem('main', { flexGrow: 1 }),
        createFlexItem('footer', { flexShrink: 0 }),
      ],
    }),
  },
  {
    id: 'holy-grail-flex',
    name: 'Holy Grail (Flex)',
    description: 'Classic three-column layout with flexbox',
    category: 'layouts',
    tags: ['holy-grail', 'three-column', 'classic'],
    config: createFlexContainer('holy-grail', {
      direction: 'column',
      minHeight: '100vh',
      items: [
        createFlexItem('header', { flexShrink: 0 }),
        createFlexItem('body', { flexGrow: 1, flexBasis: '0%' }),
        createFlexItem('footer', { flexShrink: 0 }),
      ],
    }),
  },
  {
    id: 'input-group',
    name: 'Input Group',
    description: 'Input with prepended/appended elements',
    category: 'forms',
    tags: ['input', 'group', 'addon'],
    config: createFlexContainer('input-group', {
      direction: 'row',
      alignItems: 'stretch',
      items: [
        createFlexItem('prepend', { flexShrink: 0 }),
        createFlexItem('input', { flexGrow: 1, flexBasis: '0%' }),
        createFlexItem('append', { flexShrink: 0 }),
      ],
    }),
  },
  {
    id: 'media-object',
    name: 'Media Object',
    description: 'Image/icon alongside text content',
    category: 'content',
    tags: ['media', 'image', 'text'],
    config: createFlexContainer('media-object', {
      direction: 'row',
      alignItems: 'flex-start',
      gap: '1rem',
      items: [
        createFlexItem('media', { flexShrink: 0, width: '64px', height: '64px' }),
        createFlexItem('body', { flexGrow: 1, flexBasis: '0%' }),
      ],
    }),
  },
  {
    id: 'split-screen',
    name: 'Split Screen',
    description: 'Two equal halves side by side',
    category: 'layouts',
    tags: ['split', 'half', 'two-column'],
    config: createFlexContainer('split-screen', {
      direction: 'row',
      minHeight: '100vh',
      items: [
        createFlexItem('left', { flexGrow: 1, flexBasis: '0%' }),
        createFlexItem('right', { flexGrow: 1, flexBasis: '0%' }),
      ],
      responsive: [
        { breakpoint: 768, label: 'Mobile', direction: 'column' },
      ],
    }),
  },
  {
    id: 'masonry-flex',
    name: 'Masonry (Flex)',
    description: 'Simulated masonry layout with flex columns',
    category: 'galleries',
    tags: ['masonry', 'columns', 'gallery'],
    config: createFlexContainer('masonry', {
      direction: 'row',
      wrap: 'wrap',
      alignItems: 'flex-start',
      gap: '1rem',
      items: [
        createFlexItem('column-1', { flexGrow: 1, flexBasis: '250px' }),
        createFlexItem('column-2', { flexGrow: 1, flexBasis: '250px' }),
        createFlexItem('column-3', { flexGrow: 1, flexBasis: '250px' }),
      ],
    }),
  },
  {
    id: 'toolbar',
    name: 'Toolbar',
    description: 'Horizontal toolbar with grouped actions',
    category: 'navigation',
    tags: ['toolbar', 'actions', 'horizontal'],
    config: createFlexContainer('toolbar', {
      direction: 'row',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.25rem 0.5rem',
      items: [
        createFlexItem('group-1', { flexShrink: 0 }),
        createFlexItem('separator', { flexShrink: 0, width: '1px', height: '24px' }),
        createFlexItem('group-2', { flexShrink: 0 }),
        createFlexItem('spacer', { flexGrow: 1 }),
        createFlexItem('group-right', { flexShrink: 0 }),
      ],
    }),
  },
  {
    id: 'breadcrumbs',
    name: 'Breadcrumbs',
    description: 'Breadcrumb navigation with separators',
    category: 'navigation',
    tags: ['breadcrumbs', 'navigation', 'trail'],
    config: createFlexContainer('breadcrumbs', {
      direction: 'row',
      alignItems: 'center',
      wrap: 'wrap',
      gap: '0.5rem',
      items: [
        createFlexItem('home'),
        createFlexItem('separator'),
        createFlexItem('category'),
        createFlexItem('separator-2'),
        createFlexItem('current'),
      ],
    }),
  },
  {
    id: 'tag-list',
    name: 'Tag List',
    description: 'Wrapping list of tags/chips',
    category: 'content',
    tags: ['tags', 'chips', 'wrap'],
    config: createFlexContainer('tag-list', {
      direction: 'row',
      wrap: 'wrap',
      gap: '0.5rem',
      items: Array.from({ length: 8 }, (_, i) =>
        createFlexItem(`tag-${i + 1}`, { flexShrink: 0 })
      ),
    }),
  },
  {
    id: 'avatar-stack',
    name: 'Avatar Stack',
    description: 'Overlapping avatar images',
    category: 'content',
    tags: ['avatars', 'overlap', 'stack'],
    config: createFlexContainer('avatar-stack', {
      direction: 'row-reverse',
      alignItems: 'center',
      items: Array.from({ length: 5 }, (_, i) =>
        createFlexItem(`avatar-${i + 1}`, { flexShrink: 0, width: '40px', height: '40px' })
      ),
    }),
  },
  {
    id: 'pricing-cards',
    name: 'Pricing Cards',
    description: 'Three pricing tiers with equal heights',
    category: 'marketing',
    tags: ['pricing', 'cards', 'equal-height'],
    config: createFlexContainer('pricing', {
      direction: 'row',
      wrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'stretch',
      gap: '2rem',
      maxWidth: '1200px',
      padding: '2rem',
      items: [
        createFlexItem('basic', { flexGrow: 1, flexBasis: '280px', maxWidth: '380px' }),
        createFlexItem('pro', { flexGrow: 1, flexBasis: '280px', maxWidth: '380px' }),
        createFlexItem('enterprise', { flexGrow: 1, flexBasis: '280px', maxWidth: '380px' }),
      ],
      responsive: [
        { breakpoint: 768, label: 'Mobile', direction: 'column', alignItems: 'center' },
      ],
    }),
  },
];

// =============================================================================
// Template Utilities
// =============================================================================

export function getFlexTemplatesByCategory(category: string): FlexTemplate[] {
  return FLEX_TEMPLATES.filter(t => t.category === category);
}

export function searchFlexTemplates(query: string): FlexTemplate[] {
  const lowerQuery = query.toLowerCase();
  return FLEX_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getFlexCategories(): { id: string; name: string; count: number }[] {
  const cats = new Map<string, number>();
  for (const t of FLEX_TEMPLATES) {
    cats.set(t.category, (cats.get(t.category) || 0) + 1);
  }

  const nameMap: Record<string, string> = {
    'navigation': 'Navigation', 'centering': 'Centering', 'layouts': 'Page Layouts',
    'cards': 'Cards', 'forms': 'Forms', 'content': 'Content', 'galleries': 'Galleries',
    'marketing': 'Marketing',
  };

  return Array.from(cats.entries()).map(([id, count]) => ({
    id, name: nameMap[id] || id, count,
  }));
}

// =============================================================================
// Flexbox Cheatsheet Data
// =============================================================================

export interface FlexProperty {
  property: string;
  appliesTo: 'container' | 'item';
  values: { value: string; description: string }[];
  defaultValue: string;
  description: string;
}

export const FLEX_PROPERTIES: FlexProperty[] = [
  {
    property: 'flex-direction',
    appliesTo: 'container',
    description: 'Establishes the main axis direction',
    defaultValue: 'row',
    values: [
      { value: 'row', description: 'Left to right in LTR; right to left in RTL' },
      { value: 'row-reverse', description: 'Right to left in LTR; left to right in RTL' },
      { value: 'column', description: 'Top to bottom' },
      { value: 'column-reverse', description: 'Bottom to top' },
    ],
  },
  {
    property: 'flex-wrap',
    appliesTo: 'container',
    description: 'Controls whether items wrap to new lines',
    defaultValue: 'nowrap',
    values: [
      { value: 'nowrap', description: 'All items on one line' },
      { value: 'wrap', description: 'Items wrap to next line' },
      { value: 'wrap-reverse', description: 'Items wrap to line above' },
    ],
  },
  {
    property: 'justify-content',
    appliesTo: 'container',
    description: 'Alignment along the main axis',
    defaultValue: 'flex-start',
    values: [
      { value: 'flex-start', description: 'Items packed to start of main axis' },
      { value: 'flex-end', description: 'Items packed to end of main axis' },
      { value: 'center', description: 'Items centered along main axis' },
      { value: 'space-between', description: 'Equal space between items' },
      { value: 'space-around', description: 'Equal space around items' },
      { value: 'space-evenly', description: 'Equal space between and around items' },
    ],
  },
  {
    property: 'align-items',
    appliesTo: 'container',
    description: 'Alignment along the cross axis',
    defaultValue: 'stretch',
    values: [
      { value: 'stretch', description: 'Items stretch to fill container' },
      { value: 'flex-start', description: 'Items aligned to start of cross axis' },
      { value: 'flex-end', description: 'Items aligned to end of cross axis' },
      { value: 'center', description: 'Items centered on cross axis' },
      { value: 'baseline', description: 'Items aligned by text baseline' },
    ],
  },
  {
    property: 'align-content',
    appliesTo: 'container',
    description: 'Multi-line cross axis alignment (only with wrap)',
    defaultValue: 'stretch',
    values: [
      { value: 'stretch', description: 'Lines stretch to fill container' },
      { value: 'flex-start', description: 'Lines packed to start' },
      { value: 'flex-end', description: 'Lines packed to end' },
      { value: 'center', description: 'Lines centered' },
      { value: 'space-between', description: 'Equal space between lines' },
      { value: 'space-around', description: 'Equal space around lines' },
    ],
  },
  {
    property: 'flex-grow',
    appliesTo: 'item',
    description: 'How much an item should grow relative to siblings',
    defaultValue: '0',
    values: [
      { value: '0', description: 'Item does not grow' },
      { value: '1', description: 'Item grows to fill available space' },
      { value: '2+', description: 'Item grows proportionally more than flex-grow: 1 items' },
    ],
  },
  {
    property: 'flex-shrink',
    appliesTo: 'item',
    description: 'How much an item should shrink relative to siblings',
    defaultValue: '1',
    values: [
      { value: '0', description: 'Item does not shrink' },
      { value: '1', description: 'Item shrinks if needed' },
      { value: '2+', description: 'Item shrinks proportionally more' },
    ],
  },
  {
    property: 'flex-basis',
    appliesTo: 'item',
    description: 'Initial main size of the item before growing/shrinking',
    defaultValue: 'auto',
    values: [
      { value: 'auto', description: 'Uses width/height property or content size' },
      { value: '0', description: 'Item starts from zero size (grows to fill)' },
      { value: '<length>', description: 'Specific fixed size (px, rem, %)' },
      { value: 'content', description: 'Based on content' },
    ],
  },
  {
    property: 'order',
    appliesTo: 'item',
    description: 'Visual order of the item',
    defaultValue: '0',
    values: [
      { value: '<integer>', description: 'Lower values appear first' },
    ],
  },
  {
    property: 'align-self',
    appliesTo: 'item',
    description: 'Override align-items for individual item',
    defaultValue: 'auto',
    values: [
      { value: 'auto', description: 'Uses parent align-items value' },
      { value: 'flex-start', description: 'Item aligned to start of cross axis' },
      { value: 'flex-end', description: 'Item aligned to end of cross axis' },
      { value: 'center', description: 'Item centered on cross axis' },
      { value: 'stretch', description: 'Item stretches to fill' },
      { value: 'baseline', description: 'Item aligned by text baseline' },
    ],
  },
];

// =============================================================================
// Flex Analysis
// =============================================================================

export interface FlexAnalysis {
  itemCount: number;
  hasWrap: boolean;
  isResponsive: boolean;
  breakpointCount: number;
  usesGrow: boolean;
  usesOrder: boolean;
  warnings: string[];
  suggestions: string[];
}

export function analyzeFlexLayout(config: FlexContainerConfig): FlexAnalysis {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const usesGrow = config.items.some(i => i.flexGrow > 0);
  const usesOrder = config.items.some(i => i.order !== 0);
  const hasFixedItems = config.items.some(i => i.width || (i.flexBasis !== 'auto' && i.flexBasis !== '0%'));

  if (config.wrap === 'nowrap' && config.items.length > 5) {
    warnings.push('Many items without wrapping may cause overflow on small screens');
    suggestions.push('Consider adding flex-wrap: wrap for better responsiveness');
  }

  if (!config.responsive || config.responsive.length === 0) {
    suggestions.push('Add responsive breakpoints for mobile-friendly layouts');
  }

  if (config.direction === 'row' && !usesGrow && !hasFixedItems) {
    suggestions.push('Consider using flex-grow on main content items to fill available space');
  }

  if (config.gap === '0' || !config.gap) {
    suggestions.push('Adding gap can improve visual spacing between items');
  }

  if (usesOrder) {
    warnings.push('Custom order can cause accessibility issues - ensure tab order matches visual order');
  }

  if (config.items.length === 0) {
    warnings.push('No flex items defined');
  }

  return {
    itemCount: config.items.length,
    hasWrap: config.wrap !== 'nowrap',
    isResponsive: (config.responsive?.length || 0) > 0,
    breakpointCount: config.responsive?.length || 0,
    usesGrow,
    usesOrder,
    warnings,
    suggestions,
  };
}

// =============================================================================
// Flex SCSS Generation
// =============================================================================

export function generateFlexSCSS(config: FlexContainerConfig): string {
  let scss = `// Generated Flexbox Layout - ${config.name}\n`;
  scss += `// Auto-generated by AppBuilder Flexbox System\n\n`;

  scss += `.${config.name || 'flex-container'} {\n`;
  scss += `  display: ${config.display};\n`;
  scss += `  flex-direction: ${config.direction};\n`;
  scss += `  flex-wrap: ${config.wrap};\n`;
  scss += `  justify-content: ${config.justifyContent};\n`;
  scss += `  align-items: ${config.alignItems};\n`;
  if (config.alignContent !== 'stretch') scss += `  align-content: ${config.alignContent};\n`;
  if (config.gap && config.gap !== '0') scss += `  gap: ${config.gap};\n`;
  if (config.padding) scss += `  padding: ${config.padding};\n`;
  if (config.minHeight) scss += `  min-height: ${config.minHeight};\n`;
  if (config.maxWidth) scss += `  max-width: ${config.maxWidth};\n`;

  scss += `\n`;
  for (const item of config.items) {
    scss += `  &__${item.label} {\n`;
    const itemCSS = generateFlexItemCSS(item);
    if (itemCSS) {
      scss += itemCSS.split('\n').map(l => `    ${l}`).join('\n') + '\n';
    }
    scss += `  }\n\n`;
  }

  if (config.responsive) {
    for (const bp of config.responsive) {
      scss += `  @media (max-width: ${bp.breakpoint}px) {\n`;
      if (bp.direction) scss += `    flex-direction: ${bp.direction};\n`;
      if (bp.wrap) scss += `    flex-wrap: ${bp.wrap};\n`;
      if (bp.justifyContent) scss += `    justify-content: ${bp.justifyContent};\n`;
      if (bp.alignItems) scss += `    align-items: ${bp.alignItems};\n`;
      if (bp.gap) scss += `    gap: ${bp.gap};\n`;
      scss += `  }\n`;
    }
  }

  scss += `}\n`;
  return scss;
}
