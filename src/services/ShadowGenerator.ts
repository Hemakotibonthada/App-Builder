// =============================================================================
// Shadow Generator - Complete CSS box-shadow and text-shadow system with
// presets, layered shadows, neumorphism, elevation system, and generators
// =============================================================================

// =============================================================================
// Shadow Types
// =============================================================================

export interface BoxShadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

export interface TextShadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

export interface ShadowConfig {
  id: string;
  name: string;
  type: 'box' | 'text' | 'drop';
  boxShadows?: BoxShadow[];
  textShadows?: TextShadow[];
  variables?: Record<string, string>;
}

export interface ShadowPreset {
  id: string;
  name: string;
  category: ShadowCategory;
  description: string;
  config: ShadowConfig;
  tags: string[];
}

export type ShadowCategory =
  | 'elevation' | 'soft' | 'hard' | 'neumorphic' | 'glassmorphic'
  | 'colored' | 'layered' | 'inner' | 'text' | 'creative';

// =============================================================================
// Shadow CSS Generation
// =============================================================================

export function boxShadowToCSS(shadow: BoxShadow): string {
  const inset = shadow.inset ? 'inset ' : '';
  return `${inset}${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
}

export function textShadowToCSS(shadow: TextShadow): string {
  return `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.color}`;
}

export function shadowConfigToCSS(config: ShadowConfig): Record<string, string> {
  const styles: Record<string, string> = {};

  if (config.boxShadows && config.boxShadows.length > 0) {
    styles.boxShadow = config.boxShadows.map(boxShadowToCSS).join(', ');
  }

  if (config.textShadows && config.textShadows.length > 0) {
    styles.textShadow = config.textShadows.map(textShadowToCSS).join(', ');
  }

  return styles;
}

export function shadowConfigToCSSString(config: ShadowConfig): string {
  const styles = shadowConfigToCSS(config);
  return Object.entries(styles)
    .map(([prop, value]) => {
      const cssProperty = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssProperty}: ${value};`;
    })
    .join('\n');
}

// =============================================================================
// Elevation System (Material Design inspired)
// =============================================================================

export const ELEVATION_SHADOWS: Record<number, BoxShadow[]> = {
  0: [],
  1: [
    { offsetX: 0, offsetY: 1, blur: 3, spread: 0, color: 'rgba(0,0,0,0.12)', inset: false },
    { offsetX: 0, offsetY: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,0.24)', inset: false },
  ],
  2: [
    { offsetX: 0, offsetY: 3, blur: 6, spread: 0, color: 'rgba(0,0,0,0.15)', inset: false },
    { offsetX: 0, offsetY: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.12)', inset: false },
  ],
  3: [
    { offsetX: 0, offsetY: 3, blur: 6, spread: 0, color: 'rgba(0,0,0,0.10)', inset: false },
    { offsetX: 0, offsetY: 6, blur: 12, spread: 0, color: 'rgba(0,0,0,0.08)', inset: false },
    { offsetX: 0, offsetY: 1, blur: 18, spread: 0, color: 'rgba(0,0,0,0.06)', inset: false },
  ],
  4: [
    { offsetX: 0, offsetY: 6, blur: 12, spread: 0, color: 'rgba(0,0,0,0.10)', inset: false },
    { offsetX: 0, offsetY: 8, blur: 24, spread: 0, color: 'rgba(0,0,0,0.08)', inset: false },
  ],
  5: [
    { offsetX: 0, offsetY: 10, blur: 20, spread: 0, color: 'rgba(0,0,0,0.10)', inset: false },
    { offsetX: 0, offsetY: 14, blur: 40, spread: 0, color: 'rgba(0,0,0,0.08)', inset: false },
    { offsetX: 0, offsetY: 4, blur: 6, spread: 0, color: 'rgba(0,0,0,0.05)', inset: false },
  ],
  6: [
    { offsetX: 0, offsetY: 14, blur: 28, spread: 0, color: 'rgba(0,0,0,0.12)', inset: false },
    { offsetX: 0, offsetY: 20, blur: 48, spread: 0, color: 'rgba(0,0,0,0.08)', inset: false },
  ],
  8: [
    { offsetX: 0, offsetY: 20, blur: 40, spread: 0, color: 'rgba(0,0,0,0.12)', inset: false },
    { offsetX: 0, offsetY: 30, blur: 60, spread: 0, color: 'rgba(0,0,0,0.08)', inset: false },
  ],
  12: [
    { offsetX: 0, offsetY: 24, blur: 48, spread: 0, color: 'rgba(0,0,0,0.14)', inset: false },
    { offsetX: 0, offsetY: 40, blur: 80, spread: 0, color: 'rgba(0,0,0,0.10)', inset: false },
  ],
  16: [
    { offsetX: 0, offsetY: 32, blur: 64, spread: 0, color: 'rgba(0,0,0,0.16)', inset: false },
    { offsetX: 0, offsetY: 48, blur: 96, spread: 0, color: 'rgba(0,0,0,0.10)', inset: false },
  ],
  24: [
    { offsetX: 0, offsetY: 40, blur: 80, spread: 0, color: 'rgba(0,0,0,0.18)', inset: false },
    { offsetX: 0, offsetY: 64, blur: 128, spread: 0, color: 'rgba(0,0,0,0.12)', inset: false },
  ],
};

export function getElevationShadow(level: number): BoxShadow[] {
  const available = Object.keys(ELEVATION_SHADOWS).map(Number).sort((a, b) => a - b);
  const closest = available.reduce((prev, curr) =>
    Math.abs(curr - level) < Math.abs(prev - level) ? curr : prev
  );
  return ELEVATION_SHADOWS[closest] || [];
}

export function elevationToCSS(level: number): string {
  const shadows = getElevationShadow(level);
  if (shadows.length === 0) return 'none';
  return shadows.map(boxShadowToCSS).join(', ');
}

// =============================================================================
// Tailwind Shadow Mapping
// =============================================================================

export const TAILWIND_SHADOWS: Record<string, string> = {
  'shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'shadow': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  'shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  'shadow-2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  'shadow-inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  'shadow-none': 'none',
};

export function shadowToTailwind(shadows: BoxShadow[]): string {
  if (shadows.length === 0) return 'shadow-none';

  const css = shadows.map(boxShadowToCSS).join(', ');

  // Try exact match
  for (const [className, value] of Object.entries(TAILWIND_SHADOWS)) {
    if (value === css) return className;
  }

  // Approximate by total blur
  const totalBlur = shadows.reduce((sum, s) => sum + s.blur, 0);
  if (totalBlur <= 2) return 'shadow-sm';
  if (totalBlur <= 5) return 'shadow';
  if (totalBlur <= 10) return 'shadow-md';
  if (totalBlur <= 20) return 'shadow-lg';
  if (totalBlur <= 35) return 'shadow-xl';
  return 'shadow-2xl';
}

// =============================================================================
// Shadow Presets
// =============================================================================

export const SHADOW_PRESETS: ShadowPreset[] = [
  // Elevation presets
  { id: 'elevation-1', name: 'Elevation 1', category: 'elevation', description: 'Subtle raised surface', tags: ['subtle', 'material'], config: { id: 'el-1', name: 'Elevation 1', type: 'box', boxShadows: ELEVATION_SHADOWS[1] } },
  { id: 'elevation-2', name: 'Elevation 2', category: 'elevation', description: 'Card-level elevation', tags: ['card', 'material'], config: { id: 'el-2', name: 'Elevation 2', type: 'box', boxShadows: ELEVATION_SHADOWS[2] } },
  { id: 'elevation-3', name: 'Elevation 3', category: 'elevation', description: 'Floating toolbar elevation', tags: ['toolbar', 'material'], config: { id: 'el-3', name: 'Elevation 3', type: 'box', boxShadows: ELEVATION_SHADOWS[3] } },
  { id: 'elevation-4', name: 'Elevation 4', category: 'elevation', description: 'App bar elevation', tags: ['appbar', 'material'], config: { id: 'el-4', name: 'Elevation 4', type: 'box', boxShadows: ELEVATION_SHADOWS[4] } },
  { id: 'elevation-5', name: 'Elevation 5', category: 'elevation', description: 'FAB elevation', tags: ['fab', 'material'], config: { id: 'el-5', name: 'Elevation 5', type: 'box', boxShadows: ELEVATION_SHADOWS[5] } },
  { id: 'elevation-8', name: 'Elevation 8', category: 'elevation', description: 'Dialog elevation', tags: ['dialog', 'modal'], config: { id: 'el-8', name: 'Elevation 8', type: 'box', boxShadows: ELEVATION_SHADOWS[8] } },
  { id: 'elevation-16', name: 'Elevation 16', category: 'elevation', description: 'Navigation drawer', tags: ['drawer', 'navigation'], config: { id: 'el-16', name: 'Elevation 16', type: 'box', boxShadows: ELEVATION_SHADOWS[16] } },
  { id: 'elevation-24', name: 'Elevation 24', category: 'elevation', description: 'Maximum elevation', tags: ['max', 'dialog'], config: { id: 'el-24', name: 'Elevation 24', type: 'box', boxShadows: ELEVATION_SHADOWS[24] } },

  // Soft shadows
  {
    id: 'soft-small',
    name: 'Soft Small',
    category: 'soft',
    description: 'Soft small shadow',
    tags: ['soft', 'subtle', 'small'],
    config: {
      id: 'soft-sm', name: 'Soft Small', type: 'box',
      boxShadows: [
        { offsetX: 0, offsetY: 2, blur: 8, spread: -2, color: 'rgba(0,0,0,0.1)', inset: false },
      ],
    },
  },
  {
    id: 'soft-medium',
    name: 'Soft Medium',
    category: 'soft',
    description: 'Soft medium shadow for cards',
    tags: ['soft', 'card', 'medium'],
    config: {
      id: 'soft-md', name: 'Soft Medium', type: 'box',
      boxShadows: [
        { offsetX: 0, offsetY: 4, blur: 16, spread: -4, color: 'rgba(0,0,0,0.08)', inset: false },
        { offsetX: 0, offsetY: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.04)', inset: false },
      ],
    },
  },
  {
    id: 'soft-large',
    name: 'Soft Large',
    category: 'soft',
    description: 'Soft large shadow for modals',
    tags: ['soft', 'large', 'modal'],
    config: {
      id: 'soft-lg', name: 'Soft Large', type: 'box',
      boxShadows: [
        { offsetX: 0, offsetY: 12, blur: 40, spread: -8, color: 'rgba(0,0,0,0.1)', inset: false },
        { offsetX: 0, offsetY: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.05)', inset: false },
      ],
    },
  },
  {
    id: 'soft-xl',
    name: 'Soft Extra Large',
    category: 'soft',
    description: 'Soft extra large diffused shadow',
    tags: ['soft', 'xl', 'dreamy'],
    config: {
      id: 'soft-xl', name: 'Soft XL', type: 'box',
      boxShadows: [
        { offsetX: 0, offsetY: 20, blur: 60, spread: -15, color: 'rgba(0,0,0,0.1)', inset: false },
      ],
    },
  },

  // Hard shadows
  {
    id: 'hard-bottom',
    name: 'Hard Bottom',
    category: 'hard',
    description: 'Sharp bottom shadow',
    tags: ['hard', 'sharp', 'retro'],
    config: {
      id: 'hard-bottom', name: 'Hard Bottom', type: 'box',
      boxShadows: [
        { offsetX: 4, offsetY: 4, blur: 0, spread: 0, color: 'rgba(0,0,0,0.2)', inset: false },
      ],
    },
  },
  {
    id: 'hard-black',
    name: 'Hard Black',
    category: 'hard',
    description: 'Solid black offset shadow',
    tags: ['hard', 'black', 'brutalist'],
    config: {
      id: 'hard-black', name: 'Hard Black', type: 'box',
      boxShadows: [
        { offsetX: 6, offsetY: 6, blur: 0, spread: 0, color: '#000000', inset: false },
      ],
    },
  },
  {
    id: 'hard-colored',
    name: 'Hard Colored',
    category: 'hard',
    description: 'Colored offset shadow',
    tags: ['hard', 'colored', 'fun'],
    config: {
      id: 'hard-color', name: 'Hard Colored', type: 'box',
      boxShadows: [
        { offsetX: 5, offsetY: 5, blur: 0, spread: 0, color: '#6366f1', inset: false },
      ],
    },
  },
  {
    id: 'hard-multi',
    name: 'Multi Layer Hard',
    category: 'hard',
    description: 'Multiple layered hard shadows',
    tags: ['hard', 'multi', 'creative'],
    config: {
      id: 'hard-multi', name: 'Multi Layer Hard', type: 'box',
      boxShadows: [
        { offsetX: 3, offsetY: 3, blur: 0, spread: 0, color: '#6366f1', inset: false },
        { offsetX: 6, offsetY: 6, blur: 0, spread: 0, color: '#818cf8', inset: false },
        { offsetX: 9, offsetY: 9, blur: 0, spread: 0, color: '#a5b4fc', inset: false },
      ],
    },
  },

  // Neumorphic shadows
  {
    id: 'neumorphic-flat',
    name: 'Neumorphic Flat',
    category: 'neumorphic',
    description: 'Flat neumorphic surface',
    tags: ['neumorphic', 'flat', 'modern'],
    config: {
      id: 'neu-flat', name: 'Neumorphic Flat', type: 'box',
      boxShadows: [
        { offsetX: 6, offsetY: 6, blur: 12, spread: 0, color: 'rgba(0,0,0,0.15)', inset: false },
        { offsetX: -6, offsetY: -6, blur: 12, spread: 0, color: 'rgba(255,255,255,0.8)', inset: false },
      ],
    },
  },
  {
    id: 'neumorphic-concave',
    name: 'Neumorphic Concave',
    category: 'neumorphic',
    description: 'Pressed-in neumorphic surface',
    tags: ['neumorphic', 'concave', 'pressed'],
    config: {
      id: 'neu-concave', name: 'Neumorphic Concave', type: 'box',
      boxShadows: [
        { offsetX: 6, offsetY: 6, blur: 12, spread: 0, color: 'rgba(0,0,0,0.15)', inset: true },
        { offsetX: -6, offsetY: -6, blur: 12, spread: 0, color: 'rgba(255,255,255,0.8)', inset: true },
      ],
    },
  },
  {
    id: 'neumorphic-convex',
    name: 'Neumorphic Convex',
    category: 'neumorphic',
    description: 'Raised neumorphic button',
    tags: ['neumorphic', 'convex', 'button'],
    config: {
      id: 'neu-convex', name: 'Neumorphic Convex', type: 'box',
      boxShadows: [
        { offsetX: 6, offsetY: 6, blur: 12, spread: 0, color: 'rgba(0,0,0,0.15)', inset: false },
        { offsetX: -6, offsetY: -6, blur: 12, spread: 0, color: 'rgba(255,255,255,0.8)', inset: false },
        { offsetX: 2, offsetY: 2, blur: 4, spread: 0, color: 'rgba(255,255,255,0.5)', inset: true },
        { offsetX: -2, offsetY: -2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.05)', inset: true },
      ],
    },
  },
  {
    id: 'neumorphic-intense',
    name: 'Neumorphic Intense',
    category: 'neumorphic',
    description: 'Strong neumorphic effect',
    tags: ['neumorphic', 'intense', 'deep'],
    config: {
      id: 'neu-intense', name: 'Neumorphic Intense', type: 'box',
      boxShadows: [
        { offsetX: 10, offsetY: 10, blur: 20, spread: 0, color: 'rgba(0,0,0,0.2)', inset: false },
        { offsetX: -10, offsetY: -10, blur: 20, spread: 0, color: 'rgba(255,255,255,0.9)', inset: false },
      ],
    },
  },

  // Colored shadows
  {
    id: 'glow-blue',
    name: 'Blue Glow',
    category: 'colored',
    description: 'Blue glow effect',
    tags: ['glow', 'blue', 'neon'],
    config: {
      id: 'glow-blue', name: 'Blue Glow', type: 'box',
      boxShadows: [
        { offsetX: 0, offsetY: 0, blur: 15, spread: 0, color: 'rgba(59,130,246,0.5)', inset: false },
        { offsetX: 0, offsetY: 0, blur: 30, spread: 0, color: 'rgba(59,130,246,0.3)', inset: false },
      ],
    },
  },
  {
    id: 'glow-purple',
    name: 'Purple Glow',
    category: 'colored',
    description: 'Purple glow effect',
    tags: ['glow', 'purple', 'neon'],
    config: {
      id: 'glow-purple', name: 'Purple Glow', type: 'box',
      boxShadows: [
        { offsetX: 0, offsetY: 0, blur: 15, spread: 0, color: 'rgba(139,92,246,0.5)', inset: false },
        { offsetX: 0, offsetY: 0, blur: 30, spread: 0, color: 'rgba(139,92,246,0.3)', inset: false },
      ],
    },
  },
  {
    id: 'glow-green',
    name: 'Green Glow',
    category: 'colored',
    description: 'Green glow effect',
    tags: ['glow', 'green', 'neon'],
    config: {
      id: 'glow-green', name: 'Green Glow', type: 'box',
      boxShadows: [
        { offsetX: 0, offsetY: 0, blur: 15, spread: 0, color: 'rgba(34,197,94,0.5)', inset: false },
        { offsetX: 0, offsetY: 0, blur: 30, spread: 0, color: 'rgba(34,197,94,0.3)', inset: false },
      ],
    },
  },
  {
    id: 'glow-red',
    name: 'Red Glow',
    category: 'colored',
    description: 'Red glow effect',
    tags: ['glow', 'red', 'danger'],
    config: {
      id: 'glow-red', name: 'Red Glow', type: 'box',
      boxShadows: [
        { offsetX: 0, offsetY: 0, blur: 15, spread: 0, color: 'rgba(239,68,68,0.5)', inset: false },
        { offsetX: 0, offsetY: 0, blur: 30, spread: 0, color: 'rgba(239,68,68,0.3)', inset: false },
      ],
    },
  },
  {
    id: 'glow-rainbow',
    name: 'Rainbow Glow',
    category: 'colored',
    description: 'Multi-color rainbow glow',
    tags: ['rainbow', 'creative', 'glow'],
    config: {
      id: 'glow-rainbow', name: 'Rainbow Glow', type: 'box',
      boxShadows: [
        { offsetX: 0, offsetY: 0, blur: 10, spread: 0, color: 'rgba(239,68,68,0.4)', inset: false },
        { offsetX: 0, offsetY: 0, blur: 20, spread: 0, color: 'rgba(245,158,11,0.3)', inset: false },
        { offsetX: 0, offsetY: 0, blur: 30, spread: 0, color: 'rgba(34,197,94,0.3)', inset: false },
        { offsetX: 0, offsetY: 0, blur: 40, spread: 0, color: 'rgba(59,130,246,0.3)', inset: false },
        { offsetX: 0, offsetY: 0, blur: 50, spread: 0, color: 'rgba(139,92,246,0.2)', inset: false },
      ],
    },
  },

  // Inner shadows
  {
    id: 'inner-subtle',
    name: 'Inner Subtle',
    category: 'inner',
    description: 'Subtle inner shadow for inputs',
    tags: ['inner', 'input', 'subtle'],
    config: {
      id: 'inner-subtle', name: 'Inner Subtle', type: 'box',
      boxShadows: [
        { offsetX: 0, offsetY: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.06)', inset: true },
      ],
    },
  },
  {
    id: 'inner-deep',
    name: 'Inner Deep',
    category: 'inner',
    description: 'Deep inner shadow for pressed state',
    tags: ['inner', 'pressed', 'deep'],
    config: {
      id: 'inner-deep', name: 'Inner Deep', type: 'box',
      boxShadows: [
        { offsetX: 0, offsetY: 4, blur: 8, spread: 0, color: 'rgba(0,0,0,0.12)', inset: true },
        { offsetX: 0, offsetY: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,0.08)', inset: true },
      ],
    },
  },

  // Text shadows
  {
    id: 'text-subtle',
    name: 'Text Subtle',
    category: 'text',
    description: 'Subtle text shadow for readability',
    tags: ['text', 'subtle', 'readability'],
    config: {
      id: 'text-subtle', name: 'Text Subtle', type: 'text',
      textShadows: [
        { offsetX: 0, offsetY: 1, blur: 2, color: 'rgba(0,0,0,0.3)' },
      ],
    },
  },
  {
    id: 'text-strong',
    name: 'Text Strong',
    category: 'text',
    description: 'Strong text shadow for headings',
    tags: ['text', 'heading', 'strong'],
    config: {
      id: 'text-strong', name: 'Text Strong', type: 'text',
      textShadows: [
        { offsetX: 2, offsetY: 2, blur: 4, color: 'rgba(0,0,0,0.5)' },
      ],
    },
  },
  {
    id: 'text-neon-blue',
    name: 'Neon Blue Text',
    category: 'text',
    description: 'Blue neon text effect',
    tags: ['text', 'neon', 'glow'],
    config: {
      id: 'text-neon', name: 'Neon Blue Text', type: 'text',
      textShadows: [
        { offsetX: 0, offsetY: 0, blur: 7, color: '#fff' },
        { offsetX: 0, offsetY: 0, blur: 10, color: '#fff' },
        { offsetX: 0, offsetY: 0, blur: 21, color: '#fff' },
        { offsetX: 0, offsetY: 0, blur: 42, color: '#0fa' },
        { offsetX: 0, offsetY: 0, blur: 82, color: '#0fa' },
      ],
    },
  },
  {
    id: 'text-emboss',
    name: 'Text Emboss',
    category: 'text',
    description: 'Embossed/letterpress text effect',
    tags: ['text', 'emboss', 'letterpress'],
    config: {
      id: 'text-emboss', name: 'Text Emboss', type: 'text',
      textShadows: [
        { offsetX: 0, offsetY: 1, blur: 0, color: 'rgba(255,255,255,0.6)' },
        { offsetX: 0, offsetY: -1, blur: 0, color: 'rgba(0,0,0,0.2)' },
      ],
    },
  },
  {
    id: 'text-3d',
    name: 'Text 3D',
    category: 'text',
    description: '3D text effect with multiple layers',
    tags: ['text', '3d', 'depth'],
    config: {
      id: 'text-3d', name: 'Text 3D', type: 'text',
      textShadows: [
        { offsetX: 1, offsetY: 1, blur: 0, color: '#bbb' },
        { offsetX: 2, offsetY: 2, blur: 0, color: '#aaa' },
        { offsetX: 3, offsetY: 3, blur: 0, color: '#999' },
        { offsetX: 4, offsetY: 4, blur: 0, color: '#888' },
        { offsetX: 5, offsetY: 5, blur: 0, color: '#777' },
        { offsetX: 6, offsetY: 6, blur: 1, color: 'rgba(0,0,0,0.1)' },
      ],
    },
  },
  {
    id: 'text-fire',
    name: 'Text Fire',
    category: 'text',
    description: 'Fire/flame text effect',
    tags: ['text', 'fire', 'flame'],
    config: {
      id: 'text-fire', name: 'Text Fire', type: 'text',
      textShadows: [
        { offsetX: 0, offsetY: 0, blur: 4, color: '#fefcc9' },
        { offsetX: 2, offsetY: -2, blur: 6, color: '#feec85' },
        { offsetX: -2, offsetY: -4, blur: 8, color: '#ffae34' },
        { offsetX: 2, offsetY: -6, blur: 10, color: '#ec760c' },
        { offsetX: -2, offsetY: -8, blur: 12, color: '#cd4606' },
        { offsetX: 0, offsetY: -10, blur: 14, color: '#973716' },
      ],
    },
  },

  // Creative
  {
    id: 'floating',
    name: 'Floating',
    category: 'creative',
    description: 'Floating card with large offset shadow',
    tags: ['floating', 'card', 'hover'],
    config: {
      id: 'floating', name: 'Floating', type: 'box',
      boxShadows: [
        { offsetX: 0, offsetY: 20, blur: 40, spread: -10, color: 'rgba(0,0,0,0.15)', inset: false },
      ],
    },
  },
  {
    id: 'dreamy',
    name: 'Dreamy',
    category: 'creative',
    description: 'Dreamy multi-layer colored shadow',
    tags: ['dreamy', 'creative', 'colorful'],
    config: {
      id: 'dreamy', name: 'Dreamy', type: 'box',
      boxShadows: [
        { offsetX: 0, offsetY: 4, blur: 15, spread: 0, color: 'rgba(99,102,241,0.15)', inset: false },
        { offsetX: 0, offsetY: 8, blur: 30, spread: 0, color: 'rgba(168,85,247,0.1)', inset: false },
        { offsetX: 0, offsetY: 12, blur: 45, spread: 0, color: 'rgba(236,72,153,0.05)', inset: false },
      ],
    },
  },
];

// =============================================================================
// Neumorphism Generator
// =============================================================================

export function generateNeumorphicShadow(
  backgroundColor: string,
  intensity: number = 0.15,
  distance: number = 6,
  blur: number = 12,
  type: 'flat' | 'concave' | 'convex' | 'pressed' = 'flat'
): BoxShadow[] {
  const darkColor = adjustNeumorphicColor(backgroundColor, -intensity);
  const lightColor = adjustNeumorphicColor(backgroundColor, intensity);

  switch (type) {
    case 'flat':
      return [
        { offsetX: distance, offsetY: distance, blur, spread: 0, color: darkColor, inset: false },
        { offsetX: -distance, offsetY: -distance, blur, spread: 0, color: lightColor, inset: false },
      ];
    case 'concave':
      return [
        { offsetX: distance, offsetY: distance, blur, spread: 0, color: darkColor, inset: true },
        { offsetX: -distance, offsetY: -distance, blur, spread: 0, color: lightColor, inset: true },
      ];
    case 'convex':
      return [
        { offsetX: distance, offsetY: distance, blur, spread: 0, color: darkColor, inset: false },
        { offsetX: -distance, offsetY: -distance, blur, spread: 0, color: lightColor, inset: false },
        { offsetX: 2, offsetY: 2, blur: 4, spread: 0, color: lightColor, inset: true },
        { offsetX: -2, offsetY: -2, blur: 4, spread: 0, color: darkColor, inset: true },
      ];
    case 'pressed':
      return [
        { offsetX: distance, offsetY: distance, blur, spread: 0, color: darkColor, inset: true },
        { offsetX: -distance, offsetY: -distance, blur, spread: 0, color: lightColor, inset: true },
      ];
  }
}

function adjustNeumorphicColor(hexColor: string, amount: number): string {
  const hex = hexColor.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + Math.round(255 * amount)));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + Math.round(255 * amount)));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + Math.round(255 * amount)));
  return `rgba(${r},${g},${b},${Math.abs(amount) < 0 ? 0.8 : 1})`;
}

// =============================================================================
// Shadow Utilities
// =============================================================================

export function interpolateShadow(from: BoxShadow, to: BoxShadow, progress: number): BoxShadow {
  return {
    offsetX: from.offsetX + (to.offsetX - from.offsetX) * progress,
    offsetY: from.offsetY + (to.offsetY - from.offsetY) * progress,
    blur: from.blur + (to.blur - from.blur) * progress,
    spread: from.spread + (to.spread - from.spread) * progress,
    color: from.color, // Color interpolation requires parsing
    inset: progress < 0.5 ? from.inset : to.inset,
  };
}

export function getPresetsByCategory(category: ShadowCategory): ShadowPreset[] {
  return SHADOW_PRESETS.filter(p => p.category === category);
}

export function searchShadowPresets(query: string): ShadowPreset[] {
  const lower = query.toLowerCase();
  return SHADOW_PRESETS.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    p.description.toLowerCase().includes(lower) ||
    p.tags.some(t => t.includes(lower))
  );
}

export function generateShadowCSS(className: string, shadows: BoxShadow[]): string {
  return `.${className} {
  box-shadow: ${shadows.map(boxShadowToCSS).join(', ')};
}`;
}

export function generateShadowTransitionCSS(className: string, normalShadows: BoxShadow[], hoverShadows: BoxShadow[], duration: number = 200): string {
  return `.${className} {
  box-shadow: ${normalShadows.map(boxShadowToCSS).join(', ')};
  transition: box-shadow ${duration}ms ease;
}

.${className}:hover {
  box-shadow: ${hoverShadows.map(boxShadowToCSS).join(', ')};
}`;
}

export function generateCSSVariableShadows(): string {
  let css = ':root {\n';
  for (const [level, shadows] of Object.entries(ELEVATION_SHADOWS)) {
    if (shadows.length > 0) {
      css += `  --shadow-${level}: ${shadows.map(boxShadowToCSS).join(', ')};\n`;
    }
  }
  css += '}\n';
  return css;
}
