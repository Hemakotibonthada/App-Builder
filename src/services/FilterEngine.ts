// =============================================================================
// CSS Filter Engine - Complete CSS filter system with presets, chains,
// animations, SVG filters, and real-time preview generation
// =============================================================================

// =============================================================================
// Filter Types
// =============================================================================

export interface CSSFilter {
  type: CSSFilterType;
  value: number;
  unit: string;
}

export type CSSFilterType =
  | 'blur' | 'brightness' | 'contrast' | 'grayscale' | 'hue-rotate'
  | 'invert' | 'opacity' | 'saturate' | 'sepia' | 'drop-shadow';

export interface DropShadowFilter {
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

export interface FilterChain {
  id: string;
  name: string;
  filters: CSSFilter[];
  dropShadow?: DropShadowFilter;
  backdropFilters?: CSSFilter[];
  svgFilter?: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  category: FilterPresetCategory;
  description: string;
  chain: FilterChain;
  thumbnail?: string;
  tags: string[];
}

export type FilterPresetCategory =
  | 'photo' | 'vintage' | 'artistic' | 'color' | 'blur'
  | 'dramatic' | 'subtle' | 'social-media' | 'utility';

export interface FilterAnimationKeyframe {
  offset: number; // 0-1
  filters: CSSFilter[];
}

export interface FilterAnimation {
  id: string;
  name: string;
  keyframes: FilterAnimationKeyframe[];
  duration: number;
  easing: string;
  iterations: number | 'infinite';
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

export interface SVGFilterElement {
  type: string;
  attributes: Record<string, string | number>;
  children?: SVGFilterElement[];
}

// =============================================================================
// Filter Defaults & Ranges
// =============================================================================

export const FILTER_DEFAULTS: Record<CSSFilterType, { default: number; min: number; max: number; step: number; unit: string }> = {
  blur: { default: 0, min: 0, max: 100, step: 0.5, unit: 'px' },
  brightness: { default: 100, min: 0, max: 300, step: 1, unit: '%' },
  contrast: { default: 100, min: 0, max: 300, step: 1, unit: '%' },
  grayscale: { default: 0, min: 0, max: 100, step: 1, unit: '%' },
  'hue-rotate': { default: 0, min: 0, max: 360, step: 1, unit: 'deg' },
  invert: { default: 0, min: 0, max: 100, step: 1, unit: '%' },
  opacity: { default: 100, min: 0, max: 100, step: 1, unit: '%' },
  saturate: { default: 100, min: 0, max: 300, step: 1, unit: '%' },
  sepia: { default: 0, min: 0, max: 100, step: 1, unit: '%' },
  'drop-shadow': { default: 0, min: 0, max: 100, step: 1, unit: 'px' },
};

// =============================================================================
// Filter CSS Generation
// =============================================================================

export function filterToCSS(filter: CSSFilter): string {
  if (filter.type === 'drop-shadow') {
    return ''; // Drop shadows need special handling
  }
  return `${filter.type}(${filter.value}${filter.unit})`;
}

export function dropShadowToCSS(shadow: DropShadowFilter): string {
  return `drop-shadow(${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.color})`;
}

export function chainToCSS(chain: FilterChain): string {
  const parts: string[] = [];

  for (const filter of chain.filters) {
    const css = filterToCSS(filter);
    if (css) parts.push(css);
  }

  if (chain.dropShadow) {
    parts.push(dropShadowToCSS(chain.dropShadow));
  }

  return parts.join(' ');
}

export function chainToBackdropCSS(chain: FilterChain): string {
  if (!chain.backdropFilters || chain.backdropFilters.length === 0) return '';
  return chain.backdropFilters.map(filterToCSS).filter(Boolean).join(' ');
}

export function chainToStyleObject(chain: FilterChain): Record<string, string> {
  const style: Record<string, string> = {};

  const filterCSS = chainToCSS(chain);
  if (filterCSS) {
    style.filter = filterCSS;
  }

  const backdropCSS = chainToBackdropCSS(chain);
  if (backdropCSS) {
    style.backdropFilter = backdropCSS;
    style.WebkitBackdropFilter = backdropCSS;
  }

  return style;
}

// =============================================================================
// Filter Presets
// =============================================================================

export const FILTER_PRESETS: FilterPreset[] = [
  // Photo presets
  {
    id: 'clarendon',
    name: 'Clarendon',
    category: 'photo',
    description: 'Bright, vivid colors with strong contrast',
    tags: ['bright', 'vivid', 'popular'],
    chain: {
      id: 'clarendon',
      name: 'Clarendon',
      filters: [
        { type: 'contrast', value: 120, unit: '%' },
        { type: 'saturate', value: 125, unit: '%' },
      ],
    },
  },
  {
    id: 'gingham',
    name: 'Gingham',
    category: 'photo',
    description: 'Slightly washed out, vintage feel',
    tags: ['soft', 'vintage', 'warm'],
    chain: {
      id: 'gingham',
      name: 'Gingham',
      filters: [
        { type: 'brightness', value: 105, unit: '%' },
        { type: 'hue-rotate', value: 350, unit: 'deg' },
      ],
    },
  },
  {
    id: 'moon',
    name: 'Moon',
    category: 'photo',
    description: 'Black and white with soft contrast',
    tags: ['black-and-white', 'soft', 'moody'],
    chain: {
      id: 'moon',
      name: 'Moon',
      filters: [
        { type: 'grayscale', value: 100, unit: '%' },
        { type: 'contrast', value: 110, unit: '%' },
        { type: 'brightness', value: 110, unit: '%' },
      ],
    },
  },
  {
    id: 'lark',
    name: 'Lark',
    category: 'photo',
    description: 'Bright, airy, slightly desaturated',
    tags: ['light', 'airy', 'clean'],
    chain: {
      id: 'lark',
      name: 'Lark',
      filters: [
        { type: 'contrast', value: 90, unit: '%' },
        { type: 'brightness', value: 115, unit: '%' },
        { type: 'saturate', value: 90, unit: '%' },
      ],
    },
  },

  // Vintage presets
  {
    id: 'nashville',
    name: 'Nashville',
    category: 'vintage',
    description: 'Warm, golden vintage tones',
    tags: ['warm', 'golden', 'retro'],
    chain: {
      id: 'nashville',
      name: 'Nashville',
      filters: [
        { type: 'sepia', value: 20, unit: '%' },
        { type: 'contrast', value: 115, unit: '%' },
        { type: 'brightness', value: 105, unit: '%' },
        { type: 'saturate', value: 120, unit: '%' },
      ],
    },
  },
  {
    id: 'toaster',
    name: 'Toaster',
    category: 'vintage',
    description: 'Strong vignette, warm center',
    tags: ['warm', 'vintage', 'bold'],
    chain: {
      id: 'toaster',
      name: 'Toaster',
      filters: [
        { type: 'contrast', value: 130, unit: '%' },
        { type: 'brightness', value: 90, unit: '%' },
        { type: 'sepia', value: 15, unit: '%' },
      ],
    },
  },
  {
    id: 'walden',
    name: 'Walden',
    category: 'vintage',
    description: 'Slight yellow tint, warm and bright',
    tags: ['yellow', 'warm', 'light'],
    chain: {
      id: 'walden',
      name: 'Walden',
      filters: [
        { type: 'brightness', value: 110, unit: '%' },
        { type: 'hue-rotate', value: 350, unit: 'deg' },
        { type: 'saturate', value: 160, unit: '%' },
        { type: 'sepia', value: 30, unit: '%' },
      ],
    },
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
    category: 'vintage',
    description: 'Classic polaroid look with warm tones',
    tags: ['classic', 'warm', 'faded'],
    chain: {
      id: 'polaroid',
      name: 'Polaroid',
      filters: [
        { type: 'sepia', value: 25, unit: '%' },
        { type: 'brightness', value: 108, unit: '%' },
        { type: 'contrast', value: 95, unit: '%' },
        { type: 'saturate', value: 85, unit: '%' },
      ],
    },
  },

  // Artistic presets
  {
    id: 'noir',
    name: 'Film Noir',
    category: 'artistic',
    description: 'High contrast black and white',
    tags: ['black-and-white', 'dramatic', 'classic'],
    chain: {
      id: 'noir',
      name: 'Film Noir',
      filters: [
        { type: 'grayscale', value: 100, unit: '%' },
        { type: 'contrast', value: 150, unit: '%' },
        { type: 'brightness', value: 95, unit: '%' },
      ],
    },
  },
  {
    id: 'infrared',
    name: 'Infrared',
    category: 'artistic',
    description: 'Simulated infrared photography',
    tags: ['unusual', 'creative', 'surreal'],
    chain: {
      id: 'infrared',
      name: 'Infrared',
      filters: [
        { type: 'hue-rotate', value: 180, unit: 'deg' },
        { type: 'saturate', value: 200, unit: '%' },
        { type: 'contrast', value: 120, unit: '%' },
      ],
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    category: 'artistic',
    description: 'Neon-inspired high saturation look',
    tags: ['neon', 'futuristic', 'bold'],
    chain: {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      filters: [
        { type: 'saturate', value: 250, unit: '%' },
        { type: 'contrast', value: 130, unit: '%' },
        { type: 'hue-rotate', value: 300, unit: 'deg' },
        { type: 'brightness', value: 85, unit: '%' },
      ],
    },
  },
  {
    id: 'psychedelic',
    name: 'Psychedelic',
    category: 'artistic',
    description: 'Vivid color shifts and high saturation',
    tags: ['colorful', 'wild', 'creative'],
    chain: {
      id: 'psychedelic',
      name: 'Psychedelic',
      filters: [
        { type: 'hue-rotate', value: 120, unit: 'deg' },
        { type: 'saturate', value: 300, unit: '%' },
        { type: 'contrast', value: 110, unit: '%' },
        { type: 'invert', value: 20, unit: '%' },
      ],
    },
  },

  // Color presets
  {
    id: 'warm-tone',
    name: 'Warm Tone',
    category: 'color',
    description: 'Warm, sunset-like tones',
    tags: ['warm', 'sunset', 'golden'],
    chain: {
      id: 'warm-tone',
      name: 'Warm Tone',
      filters: [
        { type: 'sepia', value: 35, unit: '%' },
        { type: 'saturate', value: 140, unit: '%' },
        { type: 'brightness', value: 105, unit: '%' },
      ],
    },
  },
  {
    id: 'cool-tone',
    name: 'Cool Tone',
    category: 'color',
    description: 'Cool, blue-shifted tones',
    tags: ['cool', 'blue', 'calm'],
    chain: {
      id: 'cool-tone',
      name: 'Cool Tone',
      filters: [
        { type: 'hue-rotate', value: 200, unit: 'deg' },
        { type: 'saturate', value: 80, unit: '%' },
        { type: 'brightness', value: 105, unit: '%' },
      ],
    },
  },
  {
    id: 'duotone-purple',
    name: 'Duotone Purple',
    category: 'color',
    description: 'Purple duotone effect',
    tags: ['duotone', 'purple', 'modern'],
    chain: {
      id: 'duotone-purple',
      name: 'Duotone Purple',
      filters: [
        { type: 'grayscale', value: 100, unit: '%' },
        { type: 'sepia', value: 100, unit: '%' },
        { type: 'hue-rotate', value: 280, unit: 'deg' },
        { type: 'saturate', value: 200, unit: '%' },
      ],
    },
  },
  {
    id: 'duotone-blue',
    name: 'Duotone Blue',
    category: 'color',
    description: 'Blue duotone effect',
    tags: ['duotone', 'blue', 'modern'],
    chain: {
      id: 'duotone-blue',
      name: 'Duotone Blue',
      filters: [
        { type: 'grayscale', value: 100, unit: '%' },
        { type: 'sepia', value: 100, unit: '%' },
        { type: 'hue-rotate', value: 190, unit: 'deg' },
        { type: 'saturate', value: 180, unit: '%' },
      ],
    },
  },

  // Blur presets
  {
    id: 'soft-blur',
    name: 'Soft Blur',
    category: 'blur',
    description: 'Gentle background blur',
    tags: ['blur', 'soft', 'background'],
    chain: {
      id: 'soft-blur',
      name: 'Soft Blur',
      filters: [
        { type: 'blur', value: 4, unit: 'px' },
      ],
    },
  },
  {
    id: 'heavy-blur',
    name: 'Heavy Blur',
    category: 'blur',
    description: 'Strong blur for overlays',
    tags: ['blur', 'overlay', 'strong'],
    chain: {
      id: 'heavy-blur',
      name: 'Heavy Blur',
      filters: [
        { type: 'blur', value: 20, unit: 'px' },
      ],
    },
  },
  {
    id: 'glass-blur',
    name: 'Frosted Glass',
    category: 'blur',
    description: 'Frosted glass effect with backdrop blur',
    tags: ['glass', 'blur', 'modern'],
    chain: {
      id: 'glass-blur',
      name: 'Frosted Glass',
      filters: [],
      backdropFilters: [
        { type: 'blur', value: 12, unit: 'px' },
        { type: 'saturate', value: 180, unit: '%' },
      ],
    },
  },

  // Dramatic presets
  {
    id: 'high-drama',
    name: 'High Drama',
    category: 'dramatic',
    description: 'Extremely high contrast and saturation',
    tags: ['dramatic', 'bold', 'intense'],
    chain: {
      id: 'high-drama',
      name: 'High Drama',
      filters: [
        { type: 'contrast', value: 180, unit: '%' },
        { type: 'saturate', value: 160, unit: '%' },
        { type: 'brightness', value: 90, unit: '%' },
      ],
    },
  },
  {
    id: 'dark-moody',
    name: 'Dark & Moody',
    category: 'dramatic',
    description: 'Dark, desaturated, moody atmosphere',
    tags: ['dark', 'moody', 'atmospheric'],
    chain: {
      id: 'dark-moody',
      name: 'Dark & Moody',
      filters: [
        { type: 'brightness', value: 70, unit: '%' },
        { type: 'contrast', value: 130, unit: '%' },
        { type: 'saturate', value: 70, unit: '%' },
      ],
    },
  },

  // Subtle presets
  {
    id: 'sharpen',
    name: 'Sharpen',
    category: 'subtle',
    description: 'Slight contrast and clarity boost',
    tags: ['sharp', 'clear', 'enhance'],
    chain: {
      id: 'sharpen',
      name: 'Sharpen',
      filters: [
        { type: 'contrast', value: 108, unit: '%' },
        { type: 'brightness', value: 102, unit: '%' },
      ],
    },
  },
  {
    id: 'slight-warm',
    name: 'Slight Warmth',
    category: 'subtle',
    description: 'Very subtle warm shift',
    tags: ['warm', 'subtle', 'natural'],
    chain: {
      id: 'slight-warm',
      name: 'Slight Warmth',
      filters: [
        { type: 'sepia', value: 8, unit: '%' },
        { type: 'brightness', value: 103, unit: '%' },
      ],
    },
  },
  {
    id: 'fade',
    name: 'Fade',
    category: 'subtle',
    description: 'Subtle faded look',
    tags: ['faded', 'soft', 'muted'],
    chain: {
      id: 'fade',
      name: 'Fade',
      filters: [
        { type: 'saturate', value: 85, unit: '%' },
        { type: 'contrast', value: 90, unit: '%' },
        { type: 'brightness', value: 108, unit: '%' },
      ],
    },
  },

  // Utility presets
  {
    id: 'grayscale-full',
    name: 'Grayscale',
    category: 'utility',
    description: 'Full grayscale conversion',
    tags: ['grayscale', 'black-and-white'],
    chain: {
      id: 'grayscale-full',
      name: 'Grayscale',
      filters: [
        { type: 'grayscale', value: 100, unit: '%' },
      ],
    },
  },
  {
    id: 'invert-full',
    name: 'Invert Colors',
    category: 'utility',
    description: 'Full color inversion',
    tags: ['invert', 'negative'],
    chain: {
      id: 'invert-full',
      name: 'Invert Colors',
      filters: [
        { type: 'invert', value: 100, unit: '%' },
      ],
    },
  },
  {
    id: 'dark-mode-invert',
    name: 'Dark Mode Invert',
    category: 'utility',
    description: 'Invert + hue-rotate for dark mode',
    tags: ['dark', 'invert', 'accessibility'],
    chain: {
      id: 'dark-mode-invert',
      name: 'Dark Mode Invert',
      filters: [
        { type: 'invert', value: 100, unit: '%' },
        { type: 'hue-rotate', value: 180, unit: 'deg' },
      ],
    },
  },
  {
    id: 'disabled',
    name: 'Disabled State',
    category: 'utility',
    description: 'Grayed out, low opacity state',
    tags: ['disabled', 'inactive', 'ui'],
    chain: {
      id: 'disabled',
      name: 'Disabled State',
      filters: [
        { type: 'grayscale', value: 100, unit: '%' },
        { type: 'opacity', value: 50, unit: '%' },
      ],
    },
  },
];

// =============================================================================
// SVG Filter Generation
// =============================================================================

export function generateSVGFilter(
  id: string,
  elements: SVGFilterElement[]
): string {
  const inner = elements.map(renderSVGElement).join('\n    ');
  return `<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0">
  <filter id="${id}">
    ${inner}
  </filter>
</svg>`;
}

function renderSVGElement(element: SVGFilterElement): string {
  const attrs = Object.entries(element.attributes)
    .map(([key, val]) => `${key}="${val}"`)
    .join(' ');

  if (element.children && element.children.length > 0) {
    const children = element.children.map(renderSVGElement).join('\n      ');
    return `<${element.type} ${attrs}>
      ${children}
    </${element.type}>`;
  }

  return `<${element.type} ${attrs} />`;
}

export const SVG_FILTER_PRESETS: Record<string, SVGFilterElement[]> = {
  // Gaussian blur
  gaussianBlur: [
    { type: 'feGaussianBlur', attributes: { in: 'SourceGraphic', stdDeviation: 5 } },
  ],

  // Sharpen
  sharpen: [
    {
      type: 'feConvolveMatrix',
      attributes: {
        order: 3,
        kernelMatrix: '0 -1 0 -1 5 -1 0 -1 0',
        preserveAlpha: 'true',
      },
    },
  ],

  // Emboss
  emboss: [
    {
      type: 'feConvolveMatrix',
      attributes: {
        order: 3,
        kernelMatrix: '-2 -1 0 -1 1 1 0 1 2',
      },
    },
  ],

  // Edge detect
  edgeDetect: [
    {
      type: 'feConvolveMatrix',
      attributes: {
        order: 3,
        kernelMatrix: '-1 -1 -1 -1 8 -1 -1 -1 -1',
      },
    },
  ],

  // Noise / grain
  noise: [
    { type: 'feTurbulence', attributes: { type: 'fractalNoise', baseFrequency: 0.65, numOctaves: 3, stitchTiles: 'stitch', result: 'noise' } },
    { type: 'feBlend', attributes: { in: 'SourceGraphic', in2: 'noise', mode: 'overlay' } },
  ],

  // Glow
  glow: [
    { type: 'feGaussianBlur', attributes: { in: 'SourceAlpha', stdDeviation: 4, result: 'blur' } },
    { type: 'feFlood', attributes: { 'flood-color': '#00aaff', 'flood-opacity': 0.8, result: 'color' } },
    { type: 'feComposite', attributes: { in: 'color', in2: 'blur', operator: 'in', result: 'glow' } },
    { type: 'feMerge', attributes: {}, children: [
      { type: 'feMergeNode', attributes: { in: 'glow' } },
      { type: 'feMergeNode', attributes: { in: 'SourceGraphic' } },
    ]},
  ],

  // Turbulence distort
  turbulenceDistort: [
    { type: 'feTurbulence', attributes: { type: 'turbulence', baseFrequency: 0.02, numOctaves: 3, result: 'turbulence' } },
    { type: 'feDisplacementMap', attributes: { in: 'SourceGraphic', in2: 'turbulence', scale: 20, xChannelSelector: 'R', yChannelSelector: 'G' } },
  ],

  // Morphology (dilate/erode for text)
  dilate: [
    { type: 'feMorphology', attributes: { operator: 'dilate', radius: 2 } },
  ],

  erode: [
    { type: 'feMorphology', attributes: { operator: 'erode', radius: 1 } },
  ],

  // Color matrix
  warmFilter: [
    {
      type: 'feColorMatrix',
      attributes: {
        type: 'matrix',
        values: '1.2 0 0 0 0 0 1.0 0 0 0 0 0 0.8 0 0 0 0 0 1 0',
      },
    },
  ],

  coolFilter: [
    {
      type: 'feColorMatrix',
      attributes: {
        type: 'matrix',
        values: '0.8 0 0 0 0 0 1.0 0 0 0 0 0 1.2 0 0 0 0 0 1 0',
      },
    },
  ],

  // Outline / Stroke
  outline: [
    { type: 'feMorphology', attributes: { in: 'SourceAlpha', operator: 'dilate', radius: 3, result: 'dilated' } },
    { type: 'feFlood', attributes: { 'flood-color': '#000000', result: 'color' } },
    { type: 'feComposite', attributes: { in: 'color', in2: 'dilated', operator: 'in', result: 'outline' } },
    { type: 'feMerge', attributes: {}, children: [
      { type: 'feMergeNode', attributes: { in: 'outline' } },
      { type: 'feMergeNode', attributes: { in: 'SourceGraphic' } },
    ]},
  ],
};

// =============================================================================
// Filter Animation Generation
// =============================================================================

export function generateFilterAnimation(animation: FilterAnimation): string {
  const keyframeStrings = animation.keyframes.map(kf => {
    const percent = Math.round(kf.offset * 100);
    const filterCSS = kf.filters.map(filterToCSS).filter(Boolean).join(' ');
    return `  ${percent}% { filter: ${filterCSS || 'none'}; }`;
  });

  return `@keyframes ${animation.name} {
${keyframeStrings.join('\n')}
}

.${animation.name} {
  animation: ${animation.name} ${animation.duration}ms ${animation.easing} ${
    animation.iterations === 'infinite' ? 'infinite' : animation.iterations
  } ${animation.direction};
}`;
}

export const FILTER_ANIMATIONS: FilterAnimation[] = [
  {
    id: 'pulse-glow',
    name: 'filter-pulse-glow',
    keyframes: [
      { offset: 0, filters: [{ type: 'brightness', value: 100, unit: '%' }, { type: 'blur', value: 0, unit: 'px' }] },
      { offset: 0.5, filters: [{ type: 'brightness', value: 150, unit: '%' }, { type: 'blur', value: 2, unit: 'px' }] },
      { offset: 1, filters: [{ type: 'brightness', value: 100, unit: '%' }, { type: 'blur', value: 0, unit: 'px' }] },
    ],
    duration: 2000,
    easing: 'ease-in-out',
    iterations: 'infinite',
    direction: 'normal',
  },
  {
    id: 'color-cycle',
    name: 'filter-color-cycle',
    keyframes: [
      { offset: 0, filters: [{ type: 'hue-rotate', value: 0, unit: 'deg' }] },
      { offset: 0.25, filters: [{ type: 'hue-rotate', value: 90, unit: 'deg' }] },
      { offset: 0.5, filters: [{ type: 'hue-rotate', value: 180, unit: 'deg' }] },
      { offset: 0.75, filters: [{ type: 'hue-rotate', value: 270, unit: 'deg' }] },
      { offset: 1, filters: [{ type: 'hue-rotate', value: 360, unit: 'deg' }] },
    ],
    duration: 5000,
    easing: 'linear',
    iterations: 'infinite',
    direction: 'normal',
  },
  {
    id: 'fade-in-blur',
    name: 'filter-fade-in-blur',
    keyframes: [
      { offset: 0, filters: [{ type: 'blur', value: 20, unit: 'px' }, { type: 'opacity', value: 0, unit: '%' }] },
      { offset: 1, filters: [{ type: 'blur', value: 0, unit: 'px' }, { type: 'opacity', value: 100, unit: '%' }] },
    ],
    duration: 600,
    easing: 'ease-out',
    iterations: 1,
    direction: 'normal',
  },
  {
    id: 'desaturate-in',
    name: 'filter-desaturate-in',
    keyframes: [
      { offset: 0, filters: [{ type: 'grayscale', value: 100, unit: '%' }] },
      { offset: 1, filters: [{ type: 'grayscale', value: 0, unit: '%' }] },
    ],
    duration: 1000,
    easing: 'ease-in-out',
    iterations: 1,
    direction: 'normal',
  },
  {
    id: 'sepia-pulse',
    name: 'filter-sepia-pulse',
    keyframes: [
      { offset: 0, filters: [{ type: 'sepia', value: 0, unit: '%' }] },
      { offset: 0.5, filters: [{ type: 'sepia', value: 80, unit: '%' }] },
      { offset: 1, filters: [{ type: 'sepia', value: 0, unit: '%' }] },
    ],
    duration: 3000,
    easing: 'ease-in-out',
    iterations: 'infinite',
    direction: 'normal',
  },
  {
    id: 'glitch',
    name: 'filter-glitch',
    keyframes: [
      { offset: 0, filters: [{ type: 'hue-rotate', value: 0, unit: 'deg' }, { type: 'saturate', value: 100, unit: '%' }] },
      { offset: 0.1, filters: [{ type: 'hue-rotate', value: 90, unit: 'deg' }, { type: 'saturate', value: 200, unit: '%' }] },
      { offset: 0.15, filters: [{ type: 'hue-rotate', value: 0, unit: 'deg' }, { type: 'saturate', value: 100, unit: '%' }] },
      { offset: 0.5, filters: [{ type: 'hue-rotate', value: 0, unit: 'deg' }, { type: 'saturate', value: 100, unit: '%' }] },
      { offset: 0.55, filters: [{ type: 'hue-rotate', value: 270, unit: 'deg' }, { type: 'saturate', value: 300, unit: '%' }] },
      { offset: 0.6, filters: [{ type: 'hue-rotate', value: 0, unit: 'deg' }, { type: 'saturate', value: 100, unit: '%' }] },
      { offset: 1, filters: [{ type: 'hue-rotate', value: 0, unit: 'deg' }, { type: 'saturate', value: 100, unit: '%' }] },
    ],
    duration: 2000,
    easing: 'linear',
    iterations: 'infinite',
    direction: 'normal',
  },
];

// =============================================================================
// Filter Utilities
// =============================================================================

export function interpolateFilters(from: CSSFilter[], to: CSSFilter[], progress: number): CSSFilter[] {
  const result: CSSFilter[] = [];

  const maxLen = Math.max(from.length, to.length);
  for (let i = 0; i < maxLen; i++) {
    const fromFilter = from[i];
    const toFilter = to[i];

    if (fromFilter && toFilter && fromFilter.type === toFilter.type) {
      result.push({
        type: fromFilter.type,
        value: fromFilter.value + (toFilter.value - fromFilter.value) * progress,
        unit: fromFilter.unit,
      });
    } else if (toFilter) {
      const defaults = FILTER_DEFAULTS[toFilter.type];
      result.push({
        type: toFilter.type,
        value: defaults.default + (toFilter.value - defaults.default) * progress,
        unit: toFilter.unit,
      });
    }
  }

  return result;
}

export function resetFilter(type: CSSFilterType): CSSFilter {
  const defaults = FILTER_DEFAULTS[type];
  return { type, value: defaults.default, unit: defaults.unit };
}

export function isDefaultFilter(filter: CSSFilter): boolean {
  const defaults = FILTER_DEFAULTS[filter.type];
  return filter.value === defaults.default;
}

export function removeDefaultFilters(filters: CSSFilter[]): CSSFilter[] {
  return filters.filter(f => !isDefaultFilter(f));
}

export function getPresetsByCategory(category: FilterPresetCategory): FilterPreset[] {
  return FILTER_PRESETS.filter(p => p.category === category);
}

export function searchPresets(query: string): FilterPreset[] {
  const lower = query.toLowerCase();
  return FILTER_PRESETS.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    p.description.toLowerCase().includes(lower) ||
    p.tags.some(t => t.includes(lower))
  );
}

export function generateFilterTailwind(chain: FilterChain): string {
  const classes: string[] = [];

  for (const filter of chain.filters) {
    switch (filter.type) {
      case 'blur':
        if (filter.value === 0) classes.push('blur-none');
        else if (filter.value <= 4) classes.push('blur-sm');
        else if (filter.value <= 8) classes.push('blur');
        else if (filter.value <= 12) classes.push('blur-md');
        else if (filter.value <= 16) classes.push('blur-lg');
        else if (filter.value <= 24) classes.push('blur-xl');
        else if (filter.value <= 40) classes.push('blur-2xl');
        else classes.push('blur-3xl');
        break;
      case 'brightness':
        classes.push(`brightness-${Math.round(filter.value)}`);
        break;
      case 'contrast':
        classes.push(`contrast-${Math.round(filter.value)}`);
        break;
      case 'grayscale':
        if (filter.value >= 100) classes.push('grayscale');
        else if (filter.value > 0) classes.push(`grayscale-[${filter.value}%]`);
        break;
      case 'hue-rotate':
        classes.push(`hue-rotate-${Math.round(filter.value)}`);
        break;
      case 'invert':
        if (filter.value >= 100) classes.push('invert');
        else if (filter.value > 0) classes.push(`invert-[${filter.value}%]`);
        break;
      case 'saturate':
        classes.push(`saturate-${Math.round(filter.value)}`);
        break;
      case 'sepia':
        if (filter.value >= 100) classes.push('sepia');
        else if (filter.value > 0) classes.push(`sepia-[${filter.value}%]`);
        break;
    }
  }

  if (chain.dropShadow) {
    classes.push('drop-shadow-lg');
  }

  if (chain.backdropFilters && chain.backdropFilters.length > 0) {
    for (const filter of chain.backdropFilters) {
      if (filter.type === 'blur') {
        classes.push(`backdrop-blur-${filter.value <= 8 ? 'sm' : filter.value <= 16 ? 'md' : 'lg'}`);
      } else {
        classes.push(`backdrop-${filter.type}-${Math.round(filter.value)}`);
      }
    }
  }

  return classes.join(' ');
}
