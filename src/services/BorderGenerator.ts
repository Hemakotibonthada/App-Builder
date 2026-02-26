// =============================================================================
// Border Generator - Complete CSS border system with styles, radius,
// gradients, animated borders, outline effects, and border image support
// =============================================================================

// =============================================================================
// Border Types
// =============================================================================

export interface BorderConfig {
  top: BorderSide;
  right: BorderSide;
  bottom: BorderSide;
  left: BorderSide;
  radius: BorderRadius;
  outline?: OutlineConfig;
  image?: BorderImageConfig;
}

export interface BorderSide {
  width: number;
  style: BorderStyle;
  color: string;
}

export type BorderStyle =
  | 'none' | 'solid' | 'dashed' | 'dotted' | 'double'
  | 'groove' | 'ridge' | 'inset' | 'outset' | 'hidden';

export interface BorderRadius {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
  unit: 'px' | '%' | 'em' | 'rem';
  isUniform?: boolean;
}

export interface OutlineConfig {
  width: number;
  style: BorderStyle;
  color: string;
  offset: number;
}

export interface BorderImageConfig {
  source: string;
  slice: string;
  width: string;
  outset: string;
  repeat: 'stretch' | 'repeat' | 'round' | 'space';
}

export interface BorderPreset {
  id: string;
  name: string;
  category: BorderPresetCategory;
  description: string;
  config: Partial<BorderConfig>;
  tags: string[];
}

export type BorderPresetCategory =
  | 'basic' | 'decorative' | 'gradient' | 'animated' | 'outline'
  | 'radius' | 'creative' | 'utility';

// =============================================================================
// Default Border Config
// =============================================================================

export const DEFAULT_BORDER_SIDE: BorderSide = {
  width: 1,
  style: 'solid',
  color: '#d1d5db',
};

export const DEFAULT_BORDER_RADIUS: BorderRadius = {
  topLeft: 0,
  topRight: 0,
  bottomRight: 0,
  bottomLeft: 0,
  unit: 'px',
  isUniform: true,
};

export const DEFAULT_BORDER_CONFIG: BorderConfig = {
  top: { ...DEFAULT_BORDER_SIDE },
  right: { ...DEFAULT_BORDER_SIDE },
  bottom: { ...DEFAULT_BORDER_SIDE },
  left: { ...DEFAULT_BORDER_SIDE },
  radius: { ...DEFAULT_BORDER_RADIUS },
};

// =============================================================================
// CSS Generation
// =============================================================================

export function borderSideToCSS(side: BorderSide): string {
  if (side.style === 'none') return 'none';
  return `${side.width}px ${side.style} ${side.color}`;
}

export function borderRadiusToCSS(radius: BorderRadius): string {
  if (radius.isUniform) {
    return `${radius.topLeft}${radius.unit}`;
  }
  return `${radius.topLeft}${radius.unit} ${radius.topRight}${radius.unit} ${radius.bottomRight}${radius.unit} ${radius.bottomLeft}${radius.unit}`;
}

export function borderConfigToCSS(config: BorderConfig): Record<string, string> {
  const styles: Record<string, string> = {};

  // Check if all sides are the same
  const allSame = ['top', 'right', 'bottom', 'left'].every(side =>
    config[side as keyof BorderConfig] === config.top
  );

  if (allSame && config.top.style !== 'none') {
    styles.border = borderSideToCSS(config.top);
  } else {
    if (config.top.style !== 'none') styles.borderTop = borderSideToCSS(config.top);
    if (config.right.style !== 'none') styles.borderRight = borderSideToCSS(config.right);
    if (config.bottom.style !== 'none') styles.borderBottom = borderSideToCSS(config.bottom);
    if (config.left.style !== 'none') styles.borderLeft = borderSideToCSS(config.left);
  }

  const radiusCSS = borderRadiusToCSS(config.radius);
  if (radiusCSS !== '0px' && radiusCSS !== '0%') {
    styles.borderRadius = radiusCSS;
  }

  if (config.outline) {
    styles.outline = `${config.outline.width}px ${config.outline.style} ${config.outline.color}`;
    if (config.outline.offset) {
      styles.outlineOffset = `${config.outline.offset}px`;
    }
  }

  if (config.image) {
    styles.borderImageSource = config.image.source;
    styles.borderImageSlice = config.image.slice;
    styles.borderImageWidth = config.image.width;
    styles.borderImageOutset = config.image.outset;
    styles.borderImageRepeat = config.image.repeat;
  }

  return styles;
}

export function borderConfigToCSSString(config: BorderConfig): string {
  const styles = borderConfigToCSS(config);
  return Object.entries(styles)
    .map(([prop, value]) => {
      const cssProperty = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssProperty}: ${value};`;
    })
    .join('\n');
}

// =============================================================================
// Gradient Border CSS
// =============================================================================

export function generateGradientBorderCSS(
  gradient: string,
  width: number = 2,
  radius: number = 8
): string {
  return `border: ${width}px solid transparent;
background-clip: padding-box, border-box;
background-origin: padding-box, border-box;
background-image: linear-gradient(var(--bg-color, white), var(--bg-color, white)), ${gradient};
border-radius: ${radius}px;`;
}

export function generateGradientBorderWithPseudo(
  gradient: string,
  width: number = 2,
  radius: number = 8,
  className: string = 'gradient-border'
): string {
  return `.${className} {
  position: relative;
  border-radius: ${radius}px;
  overflow: hidden;
}

.${className}::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: ${radius}px;
  padding: ${width}px;
  background: ${gradient};
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: xor;
  -webkit-mask-composite: xor;
  pointer-events: none;
}`;
}

// =============================================================================
// Animated Border CSS
// =============================================================================

export function generateAnimatedBorderCSS(
  className: string,
  colors: string[] = ['#6366f1', '#ec4899', '#f59e0b', '#10b981'],
  width: number = 2,
  radius: number = 8,
  duration: number = 4000,
  type: 'rotating' | 'flowing' | 'pulsing' | 'dashed-march' = 'rotating'
): string {
  switch (type) {
    case 'rotating':
      return `.${className} {
  position: relative;
  border-radius: ${radius}px;
  overflow: hidden;
}

.${className}::before {
  content: '';
  position: absolute;
  inset: -${width * 2}px;
  background: conic-gradient(from 0deg, ${colors.join(', ')}, ${colors[0]});
  animation: ${className}-rotate ${duration}ms linear infinite;
  border-radius: ${radius}px;
  z-index: -1;
}

.${className}::after {
  content: '';
  position: absolute;
  inset: ${width}px;
  background: inherit;
  border-radius: ${Math.max(0, radius - width)}px;
  z-index: -1;
}

@keyframes ${className}-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`;

    case 'flowing':
      return `.${className} {
  position: relative;
  border: ${width}px solid transparent;
  border-radius: ${radius}px;
  background-clip: padding-box, border-box;
  background-origin: padding-box, border-box;
  background-image: 
    linear-gradient(var(--bg-color, #1a1a2e), var(--bg-color, #1a1a2e)),
    linear-gradient(var(--border-angle, 0deg), ${colors.join(', ')});
  animation: ${className}-flow ${duration}ms linear infinite;
}

@property --border-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@keyframes ${className}-flow {
  from { --border-angle: 0deg; }
  to { --border-angle: 360deg; }
}`;

    case 'pulsing':
      return `.${className} {
  border: ${width}px solid ${colors[0]};
  border-radius: ${radius}px;
  animation: ${className}-pulse ${duration}ms ease-in-out infinite;
}

@keyframes ${className}-pulse {
  0%, 100% { border-color: ${colors[0]}; box-shadow: 0 0 0 0 ${colors[0]}40; }
  25% { border-color: ${colors[1] || colors[0]}; box-shadow: 0 0 8px 2px ${colors[1] || colors[0]}40; }
  50% { border-color: ${colors[2] || colors[0]}; box-shadow: 0 0 0 0 ${colors[2] || colors[0]}40; }
  75% { border-color: ${colors[3] || colors[0]}; box-shadow: 0 0 8px 2px ${colors[3] || colors[0]}40; }
}`;

    case 'dashed-march':
      return `.${className} {
  border: ${width}px dashed ${colors[0]};
  border-radius: ${radius}px;
  background: linear-gradient(90deg, ${colors[0]} 50%, transparent 50%) top,
              linear-gradient(90deg, ${colors[0]} 50%, transparent 50%) bottom,
              linear-gradient(0deg, ${colors[0]} 50%, transparent 50%) left,
              linear-gradient(0deg, ${colors[0]} 50%, transparent 50%) right;
  background-size: 12px ${width}px, 12px ${width}px, ${width}px 12px, ${width}px 12px;
  background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
  animation: ${className}-march ${duration}ms linear infinite;
  border: none;
}

@keyframes ${className}-march {
  to {
    background-position: 24px 0, -24px 100%, 0 -24px, 100% 24px;
  }
}`;
  }
}

// =============================================================================
// Border Presets
// =============================================================================

export const BORDER_PRESETS: BorderPreset[] = [
  // Basic
  { id: 'thin-solid', name: 'Thin Solid', category: 'basic', description: '1px solid border', tags: ['thin', 'solid', 'basic'], config: { top: { width: 1, style: 'solid', color: '#d1d5db' }, right: { width: 1, style: 'solid', color: '#d1d5db' }, bottom: { width: 1, style: 'solid', color: '#d1d5db' }, left: { width: 1, style: 'solid', color: '#d1d5db' } } },
  { id: 'medium-solid', name: 'Medium Solid', category: 'basic', description: '2px solid border', tags: ['medium', 'solid'], config: { top: { width: 2, style: 'solid', color: '#9ca3af' }, right: { width: 2, style: 'solid', color: '#9ca3af' }, bottom: { width: 2, style: 'solid', color: '#9ca3af' }, left: { width: 2, style: 'solid', color: '#9ca3af' } } },
  { id: 'thick-solid', name: 'Thick Solid', category: 'basic', description: '4px solid border', tags: ['thick', 'solid', 'bold'], config: { top: { width: 4, style: 'solid', color: '#6b7280' }, right: { width: 4, style: 'solid', color: '#6b7280' }, bottom: { width: 4, style: 'solid', color: '#6b7280' }, left: { width: 4, style: 'solid', color: '#6b7280' } } },
  { id: 'dashed', name: 'Dashed', category: 'basic', description: 'Dashed border', tags: ['dashed', 'basic'], config: { top: { width: 1, style: 'dashed', color: '#9ca3af' }, right: { width: 1, style: 'dashed', color: '#9ca3af' }, bottom: { width: 1, style: 'dashed', color: '#9ca3af' }, left: { width: 1, style: 'dashed', color: '#9ca3af' } } },
  { id: 'dotted', name: 'Dotted', category: 'basic', description: 'Dotted border', tags: ['dotted', 'basic'], config: { top: { width: 2, style: 'dotted', color: '#9ca3af' }, right: { width: 2, style: 'dotted', color: '#9ca3af' }, bottom: { width: 2, style: 'dotted', color: '#9ca3af' }, left: { width: 2, style: 'dotted', color: '#9ca3af' } } },
  { id: 'double-border', name: 'Double', category: 'basic', description: 'Double line border', tags: ['double', 'classic'], config: { top: { width: 4, style: 'double', color: '#6b7280' }, right: { width: 4, style: 'double', color: '#6b7280' }, bottom: { width: 4, style: 'double', color: '#6b7280' }, left: { width: 4, style: 'double', color: '#6b7280' } } },

  // Decorative
  { id: 'bottom-accent', name: 'Bottom Accent', category: 'decorative', description: 'Colored bottom border accent', tags: ['accent', 'bottom', 'colored'], config: { top: { width: 0, style: 'none', color: '' }, right: { width: 0, style: 'none', color: '' }, bottom: { width: 3, style: 'solid', color: '#6366f1' }, left: { width: 0, style: 'none', color: '' } } },
  { id: 'left-accent', name: 'Left Accent', category: 'decorative', description: 'Colored left border accent', tags: ['accent', 'left', 'sidebar'], config: { top: { width: 0, style: 'none', color: '' }, right: { width: 0, style: 'none', color: '' }, bottom: { width: 0, style: 'none', color: '' }, left: { width: 4, style: 'solid', color: '#6366f1' } } },
  { id: 'top-accent', name: 'Top Accent', category: 'decorative', description: 'Colored top border accent', tags: ['accent', 'top', 'header'], config: { top: { width: 3, style: 'solid', color: '#6366f1' }, right: { width: 0, style: 'none', color: '' }, bottom: { width: 0, style: 'none', color: '' }, left: { width: 0, style: 'none', color: '' } } },
  { id: 'groove', name: 'Groove', category: 'decorative', description: 'Grooved 3D border', tags: ['groove', '3d', 'classic'], config: { top: { width: 4, style: 'groove', color: '#9ca3af' }, right: { width: 4, style: 'groove', color: '#9ca3af' }, bottom: { width: 4, style: 'groove', color: '#9ca3af' }, left: { width: 4, style: 'groove', color: '#9ca3af' } } },
  { id: 'ridge', name: 'Ridge', category: 'decorative', description: 'Ridged 3D border', tags: ['ridge', '3d', 'classic'], config: { top: { width: 4, style: 'ridge', color: '#9ca3af' }, right: { width: 4, style: 'ridge', color: '#9ca3af' }, bottom: { width: 4, style: 'ridge', color: '#9ca3af' }, left: { width: 4, style: 'ridge', color: '#9ca3af' } } },

  // Border Radius presets
  { id: 'rounded-sm', name: 'Rounded Small', category: 'radius', description: 'Small border radius', tags: ['rounded', 'small'], config: { radius: { topLeft: 4, topRight: 4, bottomRight: 4, bottomLeft: 4, unit: 'px', isUniform: true } } },
  { id: 'rounded-md', name: 'Rounded Medium', category: 'radius', description: 'Medium border radius', tags: ['rounded', 'medium'], config: { radius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8, unit: 'px', isUniform: true } } },
  { id: 'rounded-lg', name: 'Rounded Large', category: 'radius', description: 'Large border radius', tags: ['rounded', 'large'], config: { radius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16, unit: 'px', isUniform: true } } },
  { id: 'rounded-xl', name: 'Rounded XL', category: 'radius', description: 'Extra large border radius', tags: ['rounded', 'xl'], config: { radius: { topLeft: 24, topRight: 24, bottomRight: 24, bottomLeft: 24, unit: 'px', isUniform: true } } },
  { id: 'rounded-full', name: 'Full Circle', category: 'radius', description: 'Full circular border radius', tags: ['circle', 'pill', 'full'], config: { radius: { topLeft: 50, topRight: 50, bottomRight: 50, bottomLeft: 50, unit: '%', isUniform: true } } },
  { id: 'rounded-top', name: 'Rounded Top', category: 'radius', description: 'Rounded top corners only', tags: ['top', 'tab', 'card'], config: { radius: { topLeft: 12, topRight: 12, bottomRight: 0, bottomLeft: 0, unit: 'px', isUniform: false } } },
  { id: 'rounded-bottom', name: 'Rounded Bottom', category: 'radius', description: 'Rounded bottom corners only', tags: ['bottom', 'card'], config: { radius: { topLeft: 0, topRight: 0, bottomRight: 12, bottomLeft: 12, unit: 'px', isUniform: false } } },
  { id: 'rounded-left', name: 'Rounded Left', category: 'radius', description: 'Rounded left corners only', tags: ['left', 'button'], config: { radius: { topLeft: 12, topRight: 0, bottomRight: 0, bottomLeft: 12, unit: 'px', isUniform: false } } },
  { id: 'rounded-right', name: 'Rounded Right', category: 'radius', description: 'Rounded right corners only', tags: ['right', 'button'], config: { radius: { topLeft: 0, topRight: 12, bottomRight: 12, bottomLeft: 0, unit: 'px', isUniform: false } } },
  { id: 'blob', name: 'Blob Shape', category: 'radius', description: 'Organic blob-like border radius', tags: ['blob', 'organic', 'creative'], config: { radius: { topLeft: 30, topRight: 70, bottomRight: 40, bottomLeft: 60, unit: '%', isUniform: false } } },
  { id: 'diagonal', name: 'Diagonal Corners', category: 'radius', description: 'Opposite diagonal corners rounded', tags: ['diagonal', 'creative'], config: { radius: { topLeft: 20, topRight: 0, bottomRight: 20, bottomLeft: 0, unit: 'px', isUniform: false } } },
  { id: 'squircle', name: 'Squircle', category: 'radius', description: 'Squircle-like shape', tags: ['squircle', 'ios', 'apple'], config: { radius: { topLeft: 22, topRight: 22, bottomRight: 22, bottomLeft: 22, unit: '%', isUniform: true } } },
];

// =============================================================================
// Tailwind Border Mapping
// =============================================================================

export function borderToTailwind(config: Partial<BorderConfig>): string[] {
  const classes: string[] = [];

  // Border width
  if (config.top && config.top.style !== 'none') {
    const w = config.top.width;
    if (w === 0) classes.push('border-0');
    else if (w === 1) classes.push('border');
    else if (w === 2) classes.push('border-2');
    else if (w === 4) classes.push('border-4');
    else if (w === 8) classes.push('border-8');
    else classes.push(`border-[${w}px]`);
  }

  // Border style
  if (config.top) {
    if (config.top.style === 'dashed') classes.push('border-dashed');
    else if (config.top.style === 'dotted') classes.push('border-dotted');
    else if (config.top.style === 'double') classes.push('border-double');
    else if (config.top.style === 'none') classes.push('border-none');
  }

  // Border radius
  if (config.radius) {
    const r = config.radius;
    if (r.isUniform) {
      const v = r.topLeft;
      if (v === 0) classes.push('rounded-none');
      else if (v === 2) classes.push('rounded-sm');
      else if (v === 4) classes.push('rounded');
      else if (v === 6) classes.push('rounded-md');
      else if (v === 8) classes.push('rounded-lg');
      else if (v === 12) classes.push('rounded-xl');
      else if (v === 16) classes.push('rounded-2xl');
      else if (v === 24) classes.push('rounded-3xl');
      else if (r.unit === '%' && v >= 50) classes.push('rounded-full');
      else classes.push(`rounded-[${v}${r.unit}]`);
    } else {
      // Individual corners
      if (r.topLeft > 0) classes.push(`rounded-tl-[${r.topLeft}${r.unit}]`);
      if (r.topRight > 0) classes.push(`rounded-tr-[${r.topRight}${r.unit}]`);
      if (r.bottomRight > 0) classes.push(`rounded-br-[${r.bottomRight}${r.unit}]`);
      if (r.bottomLeft > 0) classes.push(`rounded-bl-[${r.bottomLeft}${r.unit}]`);
    }
  }

  return classes;
}

// =============================================================================
// Utility Functions
// =============================================================================

export function getPresetsByCategory(category: BorderPresetCategory): BorderPreset[] {
  return BORDER_PRESETS.filter(p => p.category === category);
}

export function searchBorderPresets(query: string): BorderPreset[] {
  const lower = query.toLowerCase();
  return BORDER_PRESETS.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    p.description.toLowerCase().includes(lower) ||
    p.tags.some(t => t.includes(lower))
  );
}

export function uniformBorder(width: number, style: BorderStyle, color: string): Pick<BorderConfig, 'top' | 'right' | 'bottom' | 'left'> {
  const side = { width, style, color };
  return { top: side, right: { ...side }, bottom: { ...side }, left: { ...side } };
}

export function uniformRadius(value: number, unit: BorderRadius['unit'] = 'px'): BorderRadius {
  return { topLeft: value, topRight: value, bottomRight: value, bottomLeft: value, unit, isUniform: true };
}

export function interpolateRadius(from: BorderRadius, to: BorderRadius, progress: number): BorderRadius {
  return {
    topLeft: from.topLeft + (to.topLeft - from.topLeft) * progress,
    topRight: from.topRight + (to.topRight - from.topRight) * progress,
    bottomRight: from.bottomRight + (to.bottomRight - from.bottomRight) * progress,
    bottomLeft: from.bottomLeft + (to.bottomLeft - from.bottomLeft) * progress,
    unit: from.unit,
    isUniform: false,
  };
}
