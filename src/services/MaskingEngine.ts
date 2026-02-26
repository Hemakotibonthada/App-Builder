// =============================================================================
// CSS Masking Engine - Complete masking and clipping system with clip-path,
// CSS masks, SVG masks, shape builders, and animation support
// =============================================================================

// =============================================================================
// Masking Types
// =============================================================================

export interface MaskConfig {
  type: MaskType;
  clipPath?: ClipPathConfig;
  cssMask?: CSSMaskConfig;
  svgMask?: SVGMaskConfig;
  animation?: MaskAnimation;
}

export type MaskType = 'clip-path' | 'css-mask' | 'svg-mask';

export interface ClipPathConfig {
  shape: ClipPathShape;
  values: Record<string, number | string>;
  coordinates?: { x: number; y: number }[];
  svgPath?: string;
}

export type ClipPathShape =
  | 'circle' | 'ellipse' | 'polygon' | 'inset' | 'path'
  | 'triangle' | 'pentagon' | 'hexagon' | 'octagon' | 'star'
  | 'arrow-left' | 'arrow-right' | 'arrow-up' | 'arrow-down'
  | 'chevron' | 'cross' | 'heart' | 'diamond' | 'shield'
  | 'message' | 'bookmark' | 'rhombus' | 'parallelogram'
  | 'trapezoid' | 'frame' | 'custom';

export interface CSSMaskConfig {
  image?: string;
  mode: 'alpha' | 'luminance';
  repeat: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' | 'space' | 'round';
  position: string;
  size: string;
  composite: 'add' | 'subtract' | 'intersect' | 'exclude';
  origin: 'border-box' | 'content-box' | 'padding-box' | 'fill-box' | 'stroke-box' | 'view-box';
  clip: 'border-box' | 'content-box' | 'padding-box' | 'fill-box' | 'stroke-box' | 'view-box' | 'no-clip';
}

export interface SVGMaskConfig {
  id: string;
  elements: SVGMaskElement[];
  maskUnits: 'userSpaceOnUse' | 'objectBoundingBox';
}

export interface SVGMaskElement {
  type: 'rect' | 'circle' | 'ellipse' | 'polygon' | 'path' | 'text' | 'use';
  attributes: Record<string, string | number>;
  fill?: string;
  opacity?: number;
}

export interface MaskAnimation {
  type: 'reveal' | 'wipe' | 'morph' | 'rotate' | 'scale' | 'custom';
  duration: number;
  easing: string;
  delay?: number;
  keyframes?: MaskKeyframe[];
}

export interface MaskKeyframe {
  offset: number;
  clipPath?: string;
  maskPosition?: string;
  maskSize?: string;
  transform?: string;
}

export interface MaskPreset {
  id: string;
  name: string;
  category: MaskPresetCategory;
  description: string;
  config: MaskConfig;
  preview?: string;
  tags: string[];
}

export type MaskPresetCategory =
  | 'basic' | 'geometric' | 'organic' | 'decorative' | 'animated'
  | 'gradient' | 'pattern' | 'text' | 'custom';

// =============================================================================
// Clip-Path Generators
// =============================================================================

export function generateCircleClipPath(
  radius: number = 50,
  centerX: number = 50,
  centerY: number = 50
): string {
  return `circle(${radius}% at ${centerX}% ${centerY}%)`;
}

export function generateEllipseClipPath(
  radiusX: number = 50,
  radiusY: number = 40,
  centerX: number = 50,
  centerY: number = 50
): string {
  return `ellipse(${radiusX}% ${radiusY}% at ${centerX}% ${centerY}%)`;
}

export function generateInsetClipPath(
  top: number = 0,
  right: number = 0,
  bottom: number = 0,
  left: number = 0,
  borderRadius: number = 0
): string {
  const roundPart = borderRadius > 0 ? ` round ${borderRadius}px` : '';
  return `inset(${top}% ${right}% ${bottom}% ${left}%${roundPart})`;
}

export function generatePolygonClipPath(points: { x: number; y: number }[]): string {
  const pointStr = points.map(p => `${p.x}% ${p.y}%`).join(', ');
  return `polygon(${pointStr})`;
}

export function generatePathClipPath(svgPath: string): string {
  return `path('${svgPath}')`;
}

// =============================================================================
// Shape Generators
// =============================================================================

export function generateRegularPolygon(sides: number, rotation: number = 0): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const angleStep = (2 * Math.PI) / sides;
  const startAngle = (-Math.PI / 2) + (rotation * Math.PI / 180);

  for (let i = 0; i < sides; i++) {
    const angle = startAngle + i * angleStep;
    points.push({
      x: Math.round((50 + 50 * Math.cos(angle)) * 100) / 100,
      y: Math.round((50 + 50 * Math.sin(angle)) * 100) / 100,
    });
  }

  return points;
}

export function generateStarShape(
  points: number = 5,
  outerRadius: number = 50,
  innerRadius: number = 20,
  rotation: number = 0
): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = [];
  const totalPoints = points * 2;
  const angleStep = (2 * Math.PI) / totalPoints;
  const startAngle = (-Math.PI / 2) + (rotation * Math.PI / 180);

  for (let i = 0; i < totalPoints; i++) {
    const angle = startAngle + i * angleStep;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    result.push({
      x: Math.round((50 + radius * Math.cos(angle)) * 100) / 100,
      y: Math.round((50 + radius * Math.sin(angle)) * 100) / 100,
    });
  }

  return result;
}

export function generateArrowShape(direction: 'left' | 'right' | 'up' | 'down', headSize: number = 30): { x: number; y: number }[] {
  const s = headSize;
  const b = 100 - s;

  switch (direction) {
    case 'right':
      return [
        { x: 0, y: 30 }, { x: b, y: 30 }, { x: b, y: 0 },
        { x: 100, y: 50 }, { x: b, y: 100 }, { x: b, y: 70 }, { x: 0, y: 70 },
      ];
    case 'left':
      return [
        { x: 100, y: 30 }, { x: s, y: 30 }, { x: s, y: 0 },
        { x: 0, y: 50 }, { x: s, y: 100 }, { x: s, y: 70 }, { x: 100, y: 70 },
      ];
    case 'up':
      return [
        { x: 30, y: 100 }, { x: 30, y: s }, { x: 0, y: s },
        { x: 50, y: 0 }, { x: 100, y: s }, { x: 70, y: s }, { x: 70, y: 100 },
      ];
    case 'down':
      return [
        { x: 30, y: 0 }, { x: 30, y: b }, { x: 0, y: b },
        { x: 50, y: 100 }, { x: 100, y: b }, { x: 70, y: b }, { x: 70, y: 0 },
      ];
  }
}

export function generateChevronShape(direction: 'left' | 'right', thickness: number = 20): { x: number; y: number }[] {
  const d = thickness;
  if (direction === 'right') {
    return [
      { x: 0, y: 0 }, { x: 100 - d, y: 50 }, { x: 0, y: 100 },
      { x: d, y: 100 }, { x: 100, y: 50 }, { x: d, y: 0 },
    ];
  }
  return [
    { x: 100, y: 0 }, { x: d, y: 50 }, { x: 100, y: 100 },
    { x: 100 - d, y: 100 }, { x: 0, y: 50 }, { x: 100 - d, y: 0 },
  ];
}

export function generateCrossShape(thickness: number = 30): { x: number; y: number }[] {
  const t = thickness / 2;
  const c = 50;
  return [
    { x: c - t, y: 0 }, { x: c + t, y: 0 },
    { x: c + t, y: c - t }, { x: 100, y: c - t },
    { x: 100, y: c + t }, { x: c + t, y: c + t },
    { x: c + t, y: 100 }, { x: c - t, y: 100 },
    { x: c - t, y: c + t }, { x: 0, y: c + t },
    { x: 0, y: c - t }, { x: c - t, y: c - t },
  ];
}

export function generateHeartPath(): string {
  return 'M50 90 C25 70 0 50 0 30 C0 10 20 0 35 0 C40 0 45 5 50 15 C55 5 60 0 65 0 C80 0 100 10 100 30 C100 50 75 70 50 90Z';
}

export function generateDiamondShape(): { x: number; y: number }[] {
  return [
    { x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 },
  ];
}

export function generateShieldPath(): string {
  return 'M50 0 L100 20 L100 60 C100 80 75 95 50 100 C25 95 0 80 0 60 L0 20 Z';
}

export function generateMessageShape(): { x: number; y: number }[] {
  return [
    { x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 75 },
    { x: 30, y: 75 }, { x: 15, y: 100 }, { x: 15, y: 75 }, { x: 0, y: 75 },
  ];
}

export function generateBookmarkShape(): { x: number; y: number }[] {
  return [
    { x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 },
    { x: 50, y: 75 }, { x: 0, y: 100 },
  ];
}

export function generateParallelogramShape(skew: number = 20): { x: number; y: number }[] {
  return [
    { x: skew, y: 0 }, { x: 100, y: 0 }, { x: 100 - skew, y: 100 }, { x: 0, y: 100 },
  ];
}

export function generateTrapezoidShape(topWidth: number = 30): { x: number; y: number }[] {
  const offset = (100 - topWidth) / 2;
  return [
    { x: offset, y: 0 }, { x: offset + topWidth, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 },
  ];
}

export function generateFrameClipPath(borderWidth: number = 10): string {
  const b = borderWidth;
  return `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${b}% ${b}%, ${b}% ${100-b}%, ${100-b}% ${100-b}%, ${100-b}% ${b}%, ${b}% ${b}%)`;
}

// =============================================================================
// Shape-to-ClipPath Resolver
// =============================================================================

export function shapeToClipPath(shape: ClipPathShape, config?: ClipPathConfig): string {
  switch (shape) {
    case 'circle':
      return generateCircleClipPath(
        (config?.values?.radius as number) || 50,
        (config?.values?.centerX as number) || 50,
        (config?.values?.centerY as number) || 50
      );
    case 'ellipse':
      return generateEllipseClipPath(
        (config?.values?.radiusX as number) || 50,
        (config?.values?.radiusY as number) || 40,
        (config?.values?.centerX as number) || 50,
        (config?.values?.centerY as number) || 50
      );
    case 'inset':
      return generateInsetClipPath(
        (config?.values?.top as number) || 0,
        (config?.values?.right as number) || 0,
        (config?.values?.bottom as number) || 0,
        (config?.values?.left as number) || 0,
        (config?.values?.borderRadius as number) || 0
      );
    case 'polygon':
      return generatePolygonClipPath(config?.coordinates || []);
    case 'path':
      return generatePathClipPath(config?.svgPath || '');
    case 'triangle':
      return generatePolygonClipPath(generateRegularPolygon(3));
    case 'pentagon':
      return generatePolygonClipPath(generateRegularPolygon(5));
    case 'hexagon':
      return generatePolygonClipPath(generateRegularPolygon(6));
    case 'octagon':
      return generatePolygonClipPath(generateRegularPolygon(8));
    case 'star':
      return generatePolygonClipPath(generateStarShape());
    case 'arrow-left':
      return generatePolygonClipPath(generateArrowShape('left'));
    case 'arrow-right':
      return generatePolygonClipPath(generateArrowShape('right'));
    case 'arrow-up':
      return generatePolygonClipPath(generateArrowShape('up'));
    case 'arrow-down':
      return generatePolygonClipPath(generateArrowShape('down'));
    case 'chevron':
      return generatePolygonClipPath(generateChevronShape('right'));
    case 'cross':
      return generatePolygonClipPath(generateCrossShape());
    case 'heart':
      return generatePathClipPath(generateHeartPath());
    case 'diamond':
      return generatePolygonClipPath(generateDiamondShape());
    case 'shield':
      return generatePathClipPath(generateShieldPath());
    case 'message':
      return generatePolygonClipPath(generateMessageShape());
    case 'bookmark':
      return generatePolygonClipPath(generateBookmarkShape());
    case 'rhombus':
      return generatePolygonClipPath(generateDiamondShape());
    case 'parallelogram':
      return generatePolygonClipPath(generateParallelogramShape());
    case 'trapezoid':
      return generatePolygonClipPath(generateTrapezoidShape());
    case 'frame':
      return generateFrameClipPath();
    case 'custom':
      if (config?.svgPath) return generatePathClipPath(config.svgPath);
      if (config?.coordinates) return generatePolygonClipPath(config.coordinates);
      return 'none';
    default:
      return 'none';
  }
}

// =============================================================================
// CSS Generation
// =============================================================================

export function maskToCSS(config: MaskConfig): Record<string, string> {
  const styles: Record<string, string> = {};

  if (config.type === 'clip-path' && config.clipPath) {
    styles.clipPath = shapeToClipPath(config.clipPath.shape, config.clipPath);
    styles.WebkitClipPath = styles.clipPath;
  }

  if (config.type === 'css-mask' && config.cssMask) {
    const m = config.cssMask;
    if (m.image) {
      styles.maskImage = m.image;
      styles.WebkitMaskImage = m.image;
    }
    styles.maskMode = m.mode;
    styles.WebkitMaskMode = m.mode;
    styles.maskRepeat = m.repeat;
    styles.WebkitMaskRepeat = m.repeat;
    styles.maskPosition = m.position;
    styles.WebkitMaskPosition = m.position;
    styles.maskSize = m.size;
    styles.WebkitMaskSize = m.size;
    styles.maskComposite = m.composite;
    styles.WebkitMaskComposite = m.composite === 'subtract' ? 'xor' : m.composite;
    styles.maskOrigin = m.origin;
    styles.maskClip = m.clip;
  }

  if (config.type === 'svg-mask' && config.svgMask) {
    styles.mask = `url(#${config.svgMask.id})`;
    styles.WebkitMask = `url(#${config.svgMask.id})`;
  }

  return styles;
}

export function maskToCSSString(config: MaskConfig): string {
  const styles = maskToCSS(config);
  return Object.entries(styles)
    .map(([prop, val]) => {
      const cssProperty = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssProperty}: ${val};`;
    })
    .join('\n');
}

// =============================================================================
// Mask Animation Generation
// =============================================================================

export function generateMaskAnimationCSS(animation: MaskAnimation, className: string): string {
  if (!animation.keyframes || animation.keyframes.length === 0) return '';

  const keyframeStrings = animation.keyframes.map(kf => {
    const percent = Math.round(kf.offset * 100);
    const props: string[] = [];
    if (kf.clipPath) props.push(`clip-path: ${kf.clipPath};`, `-webkit-clip-path: ${kf.clipPath};`);
    if (kf.maskPosition) props.push(`mask-position: ${kf.maskPosition};`, `-webkit-mask-position: ${kf.maskPosition};`);
    if (kf.maskSize) props.push(`mask-size: ${kf.maskSize};`, `-webkit-mask-size: ${kf.maskSize};`);
    if (kf.transform) props.push(`transform: ${kf.transform};`);
    return `  ${percent}% {\n    ${props.join('\n    ')}\n  }`;
  });

  const animName = `mask-${animation.type}-${Date.now().toString(36)}`;

  return `@keyframes ${animName} {
${keyframeStrings.join('\n')}
}

.${className} {
  animation: ${animName} ${animation.duration}ms ${animation.easing} ${animation.delay || 0}ms both;
}`;
}

// =============================================================================
// Mask Animation Presets
// =============================================================================

export const MASK_ANIMATION_PRESETS: Record<string, MaskAnimation> = {
  circleReveal: {
    type: 'reveal',
    duration: 800,
    easing: 'ease-out',
    keyframes: [
      { offset: 0, clipPath: 'circle(0% at 50% 50%)' },
      { offset: 1, clipPath: 'circle(150% at 50% 50%)' },
    ],
  },

  wipeLeft: {
    type: 'wipe',
    duration: 600,
    easing: 'ease-in-out',
    keyframes: [
      { offset: 0, clipPath: 'inset(0 100% 0 0)' },
      { offset: 1, clipPath: 'inset(0 0 0 0)' },
    ],
  },

  wipeRight: {
    type: 'wipe',
    duration: 600,
    easing: 'ease-in-out',
    keyframes: [
      { offset: 0, clipPath: 'inset(0 0 0 100%)' },
      { offset: 1, clipPath: 'inset(0 0 0 0)' },
    ],
  },

  wipeDown: {
    type: 'wipe',
    duration: 600,
    easing: 'ease-in-out',
    keyframes: [
      { offset: 0, clipPath: 'inset(0 0 100% 0)' },
      { offset: 1, clipPath: 'inset(0 0 0 0)' },
    ],
  },

  wipeUp: {
    type: 'wipe',
    duration: 600,
    easing: 'ease-in-out',
    keyframes: [
      { offset: 0, clipPath: 'inset(100% 0 0 0)' },
      { offset: 1, clipPath: 'inset(0 0 0 0)' },
    ],
  },

  diagonalWipe: {
    type: 'wipe',
    duration: 800,
    easing: 'ease-in-out',
    keyframes: [
      { offset: 0, clipPath: 'polygon(0 0, 0 0, 0 0, 0 0)' },
      { offset: 1, clipPath: 'polygon(0 0, 200% 0, 200% 200%, 0 200%)' },
    ],
  },

  irisOpen: {
    type: 'reveal',
    duration: 700,
    easing: 'ease-out',
    keyframes: [
      { offset: 0, clipPath: 'circle(0% at 50% 50%)' },
      { offset: 0.7, clipPath: 'circle(60% at 50% 50%)' },
      { offset: 1, clipPath: 'circle(100% at 50% 50%)' },
    ],
  },

  irisClose: {
    type: 'reveal',
    duration: 700,
    easing: 'ease-in',
    keyframes: [
      { offset: 0, clipPath: 'circle(100% at 50% 50%)' },
      { offset: 0.3, clipPath: 'circle(60% at 50% 50%)' },
      { offset: 1, clipPath: 'circle(0% at 50% 50%)' },
    ],
  },

  diamondReveal: {
    type: 'reveal',
    duration: 800,
    easing: 'ease-out',
    keyframes: [
      { offset: 0, clipPath: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)' },
      { offset: 1, clipPath: 'polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)' },
    ],
  },

  starReveal: {
    type: 'reveal',
    duration: 1000,
    easing: 'ease-out',
    keyframes: [
      { offset: 0, clipPath: 'circle(0% at 50% 50%)', transform: 'rotate(0deg)' },
      { offset: 1, clipPath: 'circle(150% at 50% 50%)', transform: 'rotate(360deg)' },
    ],
  },
};

// =============================================================================
// Mask Presets
// =============================================================================

export const MASK_PRESETS: MaskPreset[] = [
  // Basic shapes
  { id: 'circle-mask', name: 'Circle', category: 'basic', description: 'Simple circular mask', tags: ['circle', 'round'], config: { type: 'clip-path', clipPath: { shape: 'circle', values: { radius: 50, centerX: 50, centerY: 50 } } } },
  { id: 'ellipse-mask', name: 'Ellipse', category: 'basic', description: 'Elliptical mask', tags: ['ellipse', 'oval'], config: { type: 'clip-path', clipPath: { shape: 'ellipse', values: { radiusX: 50, radiusY: 35, centerX: 50, centerY: 50 } } } },
  { id: 'rounded-rect', name: 'Rounded Rectangle', category: 'basic', description: 'Rounded rectangle mask', tags: ['rectangle', 'rounded'], config: { type: 'clip-path', clipPath: { shape: 'inset', values: { top: 5, right: 5, bottom: 5, left: 5, borderRadius: 15 } } } },

  // Geometric
  { id: 'triangle-mask', name: 'Triangle', category: 'geometric', description: 'Triangle clip mask', tags: ['triangle', 'polygon'], config: { type: 'clip-path', clipPath: { shape: 'triangle', values: {} } } },
  { id: 'pentagon-mask', name: 'Pentagon', category: 'geometric', description: 'Pentagon clip mask', tags: ['pentagon', 'polygon'], config: { type: 'clip-path', clipPath: { shape: 'pentagon', values: {} } } },
  { id: 'hexagon-mask', name: 'Hexagon', category: 'geometric', description: 'Hexagon clip mask', tags: ['hexagon', 'polygon'], config: { type: 'clip-path', clipPath: { shape: 'hexagon', values: {} } } },
  { id: 'octagon-mask', name: 'Octagon', category: 'geometric', description: 'Octagon clip mask', tags: ['octagon', 'polygon'], config: { type: 'clip-path', clipPath: { shape: 'octagon', values: {} } } },
  { id: 'star-mask', name: '5-Point Star', category: 'geometric', description: 'Five-pointed star mask', tags: ['star', 'polygon'], config: { type: 'clip-path', clipPath: { shape: 'star', values: {} } } },
  { id: 'diamond-mask', name: 'Diamond', category: 'geometric', description: 'Diamond shape mask', tags: ['diamond', 'rhombus'], config: { type: 'clip-path', clipPath: { shape: 'diamond', values: {} } } },
  { id: 'cross-mask', name: 'Cross', category: 'geometric', description: 'Cross/plus shape mask', tags: ['cross', 'plus'], config: { type: 'clip-path', clipPath: { shape: 'cross', values: {} } } },

  // Decorative
  { id: 'heart-mask', name: 'Heart', category: 'decorative', description: 'Heart shape mask', tags: ['heart', 'love'], config: { type: 'clip-path', clipPath: { shape: 'heart', values: {} } } },
  { id: 'shield-mask', name: 'Shield', category: 'decorative', description: 'Shield shape mask', tags: ['shield', 'badge'], config: { type: 'clip-path', clipPath: { shape: 'shield', values: {} } } },
  { id: 'bookmark-mask', name: 'Bookmark', category: 'decorative', description: 'Bookmark shape mask', tags: ['bookmark', 'flag'], config: { type: 'clip-path', clipPath: { shape: 'bookmark', values: {} } } },
  { id: 'message-mask', name: 'Message Bubble', category: 'decorative', description: 'Chat bubble mask', tags: ['message', 'chat', 'bubble'], config: { type: 'clip-path', clipPath: { shape: 'message', values: {} } } },
  { id: 'arrow-right-mask', name: 'Arrow Right', category: 'decorative', description: 'Arrow pointing right', tags: ['arrow', 'pointer'], config: { type: 'clip-path', clipPath: { shape: 'arrow-right', values: {} } } },
  { id: 'chevron-mask', name: 'Chevron', category: 'decorative', description: 'Chevron shape mask', tags: ['chevron', 'angular'], config: { type: 'clip-path', clipPath: { shape: 'chevron', values: {} } } },
  { id: 'frame-mask', name: 'Frame', category: 'decorative', description: 'Picture frame mask', tags: ['frame', 'border'], config: { type: 'clip-path', clipPath: { shape: 'frame', values: {} } } },

  // Gradient masks
  { id: 'fade-bottom', name: 'Fade Bottom', category: 'gradient', description: 'Gradient fade at bottom', tags: ['fade', 'gradient'], config: { type: 'css-mask', cssMask: { image: 'linear-gradient(to bottom, black 60%, transparent 100%)', mode: 'alpha', repeat: 'no-repeat', position: 'center', size: '100% 100%', composite: 'add', origin: 'border-box', clip: 'border-box' } } },
  { id: 'fade-edges', name: 'Fade Edges', category: 'gradient', description: 'Gradient fade at all edges', tags: ['fade', 'vignette'], config: { type: 'css-mask', cssMask: { image: 'radial-gradient(ellipse at center, black 50%, transparent 100%)', mode: 'alpha', repeat: 'no-repeat', position: 'center', size: '100% 100%', composite: 'add', origin: 'border-box', clip: 'border-box' } } },
  { id: 'fade-left', name: 'Fade Left', category: 'gradient', description: 'Gradient fade from left', tags: ['fade', 'gradient'], config: { type: 'css-mask', cssMask: { image: 'linear-gradient(to right, transparent, black 30%)', mode: 'alpha', repeat: 'no-repeat', position: 'center', size: '100% 100%', composite: 'add', origin: 'border-box', clip: 'border-box' } } },
];

// =============================================================================
// Utility Functions
// =============================================================================

export function getPresetsByCategory(category: MaskPresetCategory): MaskPreset[] {
  return MASK_PRESETS.filter(p => p.category === category);
}

export function searchMaskPresets(query: string): MaskPreset[] {
  const lower = query.toLowerCase();
  return MASK_PRESETS.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    p.description.toLowerCase().includes(lower) ||
    p.tags.some(t => t.includes(lower))
  );
}

export function morphClipPaths(from: string, to: string, progress: number): string {
  // Simple morph - only works for same-type shapes with same number of coordinates
  const fromMatch = from.match(/polygon\(([^)]+)\)/);
  const toMatch = to.match(/polygon\(([^)]+)\)/);

  if (!fromMatch || !toMatch) return progress < 0.5 ? from : to;

  const fromPoints = fromMatch[1].split(',').map(p => {
    const [x, y] = p.trim().split(/\s+/).map(v => parseFloat(v));
    return { x, y };
  });

  const toPoints = toMatch[1].split(',').map(p => {
    const [x, y] = p.trim().split(/\s+/).map(v => parseFloat(v));
    return { x, y };
  });

  if (fromPoints.length !== toPoints.length) return progress < 0.5 ? from : to;

  const interpolated = fromPoints.map((fp, i) => {
    const tp = toPoints[i];
    return {
      x: fp.x + (tp.x - fp.x) * progress,
      y: fp.y + (tp.y - fp.y) * progress,
    };
  });

  return generatePolygonClipPath(interpolated);
}

export function generateSVGMask(config: SVGMaskConfig): string {
  const elements = config.elements.map(el => {
    const attrs = Object.entries(el.attributes)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');
    const fill = el.fill || 'white';
    const opacity = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
    return `    <${el.type} ${attrs} fill="${fill}"${opacity} />`;
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0">
  <defs>
    <mask id="${config.id}" maskUnits="${config.maskUnits}">
${elements}
    </mask>
  </defs>
</svg>`;
}
