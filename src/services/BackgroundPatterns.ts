// =============================================================================
// Background Patterns Service - CSS background patterns, gradients,
// procedural textures, and decorative backgrounds
// =============================================================================

// =============================================================================
// Background Types
// =============================================================================

export interface BackgroundConfig {
  type: BackgroundType;
  layers: BackgroundLayer[];
}

export type BackgroundType = 'solid' | 'gradient' | 'pattern' | 'image' | 'mesh' | 'animated';

export interface BackgroundLayer {
  type: 'color' | 'gradient' | 'pattern' | 'image';
  value: string;
  opacity?: number;
  blendMode?: BlendMode;
  size?: string;
  position?: string;
  repeat?: string;
  attachment?: 'scroll' | 'fixed' | 'local';
}

export type BlendMode =
  | 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten'
  | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light'
  | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';

export interface PatternPreset {
  id: string;
  name: string;
  category: PatternCategory;
  description: string;
  css: string;
  tags: string[];
}

export type PatternCategory =
  | 'geometric' | 'lines' | 'dots' | 'organic' | 'grid'
  | 'decorative' | 'noise' | 'gradient' | 'animated';

// =============================================================================
// CSS Pattern Generators
// =============================================================================

export function generateDotPattern(
  size: number = 20,
  dotSize: number = 2,
  color: string = 'rgba(0,0,0,0.15)',
  bgColor: string = 'transparent'
): string {
  return `background-color: ${bgColor};
background-image: radial-gradient(${color} ${dotSize}px, transparent ${dotSize}px);
background-size: ${size}px ${size}px;`;
}

export function generateGridPattern(
  size: number = 24,
  lineWidth: number = 1,
  color: string = 'rgba(0,0,0,0.1)',
  bgColor: string = 'transparent'
): string {
  return `background-color: ${bgColor};
background-image: 
  linear-gradient(${color} ${lineWidth}px, transparent ${lineWidth}px),
  linear-gradient(to right, ${color} ${lineWidth}px, transparent ${lineWidth}px);
background-size: ${size}px ${size}px;`;
}

export function generateCheckerboard(
  size: number = 20,
  color1: string = '#e5e5e5',
  color2: string = '#ffffff'
): string {
  const half = size / 2;
  return `background-color: ${color1};
background-image: 
  linear-gradient(45deg, ${color2} 25%, transparent 25%),
  linear-gradient(-45deg, ${color2} 25%, transparent 25%),
  linear-gradient(45deg, transparent 75%, ${color2} 75%),
  linear-gradient(-45deg, transparent 75%, ${color2} 75%);
background-size: ${size}px ${size}px;
background-position: 0 0, 0 ${half}px, ${half}px -${half}px, -${half}px 0;`;
}

export function generateStripes(
  angle: number = 45,
  size: number = 10,
  color1: string = 'rgba(0,0,0,0.05)',
  color2: string = 'transparent'
): string {
  return `background-image: repeating-linear-gradient(
  ${angle}deg,
  ${color1},
  ${color1} ${size}px,
  ${color2} ${size}px,
  ${color2} ${size * 2}px
);`;
}

export function generateHerringbone(
  size: number = 20,
  color: string = 'rgba(0,0,0,0.08)',
  bgColor: string = '#ffffff'
): string {
  return `background-color: ${bgColor};
background-image: 
  linear-gradient(135deg, ${color} 25%, transparent 25%),
  linear-gradient(225deg, ${color} 25%, transparent 25%),
  linear-gradient(315deg, ${color} 25%, transparent 25%),
  linear-gradient(45deg, ${color} 25%, transparent 25%);
background-size: ${size}px ${size}px;
background-position: 0 0, ${size / 2}px 0, ${size / 2}px -${size / 2}px, 0 ${size / 2}px;`;
}

export function generateHoneycomb(
  size: number = 30,
  color: string = '#ddd',
  bgColor: string = '#e4e4e4'
): string {
  const s = size;
  const h = s * Math.sqrt(3) / 2;
  return `background-color: ${bgColor};
background-image: 
  radial-gradient(circle farthest-side at 0% 50%, ${bgColor} 23.5%, transparent 0) ${s / 4}px 0,
  radial-gradient(circle farthest-side at 0% 50%, ${color} 24%, transparent 0) ${s / 2}px ${h}px;
background-size: ${s}px ${h * 2}px;`;
}

export function generateCrossHatch(
  size: number = 16,
  lineWidth: number = 1,
  color: string = 'rgba(0,0,0,0.1)',
  bgColor: string = 'white'
): string {
  return `background-color: ${bgColor};
background-image: 
  repeating-linear-gradient(45deg, transparent, transparent ${size - lineWidth}px, ${color} ${size - lineWidth}px, ${color} ${size}px),
  repeating-linear-gradient(-45deg, transparent, transparent ${size - lineWidth}px, ${color} ${size - lineWidth}px, ${color} ${size}px);`;
}

export function generateDiamondPattern(
  size: number = 30,
  color: string = 'rgba(0,0,0,0.06)',
  bgColor: string = 'white'
): string {
  const half = size / 2;
  return `background-color: ${bgColor};
background-image: 
  linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%),
  linear-gradient(45deg, ${color} 25%, transparent 25%, transparent 75%, ${color} 75%);
background-size: ${size}px ${size}px;
background-position: 0 0, ${half}px ${half}px;`;
}

export function generateZigzag(
  size: number = 20,
  color: string = '#ddd',
  bgColor: string = 'white'
): string {
  return `background-color: ${bgColor};
background-image: 
  linear-gradient(135deg, ${color} 25%, transparent 25%),
  linear-gradient(225deg, ${color} 25%, transparent 25%),
  linear-gradient(315deg, ${color} 25%, transparent 25%),
  linear-gradient(45deg, ${color} 25%, transparent 25%);
background-size: ${size}px ${size * 2}px;
background-position: 0 0, ${size}px 0, ${size}px -${size}px, 0 ${size}px;`;
}

export function generateWaves(
  size: number = 40,
  color: string = 'rgba(0,0,0,0.05)',
  bgColor: string = 'white'
): string {
  return `background-color: ${bgColor};
background-image: 
  radial-gradient(ellipse at 50% 0%, transparent 70%, ${color} 70%, ${color} 71%, transparent 71%),
  radial-gradient(ellipse at 50% 100%, transparent 70%, ${color} 70%, ${color} 71%, transparent 71%);
background-size: ${size}px ${size}px;`;
}

export function generatePlaid(
  size: number = 40,
  color1: string = 'rgba(200,50,50,0.2)',
  color2: string = 'rgba(50,50,200,0.2)',
  bgColor: string = 'white'
): string {
  return `background-color: ${bgColor};
background-image: 
  repeating-linear-gradient(0deg, ${color1}, ${color1} ${size / 4}px, transparent ${size / 4}px, transparent ${size / 2}px),
  repeating-linear-gradient(90deg, ${color2}, ${color2} ${size / 4}px, transparent ${size / 4}px, transparent ${size / 2}px);`;
}

export function generateTriangles(
  size: number = 40,
  color: string = '#ddd',
  bgColor: string = '#eee'
): string {
  return `background-color: ${bgColor};
background-image: 
  linear-gradient(60deg, ${color} 25%, transparent 25.5%, transparent 75%, ${color} 75%, ${color}),
  linear-gradient(120deg, ${color} 25%, transparent 25.5%, transparent 75%, ${color} 75%, ${color});
background-size: ${size}px ${Math.round(size * 0.866)}px;`;
}

export function generateStars(
  size: number = 30,
  color: string = 'rgba(0,0,0,0.08)',
  bgColor: string = 'white'
): string {
  return `background-color: ${bgColor};
background-image: 
  radial-gradient(${color} ${size * 0.05}px, transparent ${size * 0.05}px),
  radial-gradient(${color} ${size * 0.03}px, transparent ${size * 0.03}px);
background-size: ${size}px ${size}px, ${size * 0.7}px ${size * 0.7}px;
background-position: 0 0, ${size * 0.35}px ${size * 0.35}px;`;
}

// =============================================================================
// Gradient Patterns
// =============================================================================

export function generateMeshGradient(
  colors: string[] = ['#6366f1', '#ec4899', '#f59e0b', '#10b981']
): string {
  const [c1, c2, c3, c4] = colors;
  return `background-color: ${c1};
background-image: 
  radial-gradient(at 40% 20%, ${c1} 0px, transparent 50%),
  radial-gradient(at 80% 0%, ${c2} 0px, transparent 50%),
  radial-gradient(at 0% 50%, ${c3} 0px, transparent 50%),
  radial-gradient(at 80% 50%, ${c4 || c1} 0px, transparent 50%),
  radial-gradient(at 0% 100%, ${c2} 0px, transparent 50%),
  radial-gradient(at 80% 100%, ${c3} 0px, transparent 50%),
  radial-gradient(at 0% 0%, ${c4 || c2} 0px, transparent 50%);`;
}

export function generateAuroraGradient(
  colors: string[] = ['#0ea5e9', '#22d3ee', '#6366f1', '#a855f7']
): string {
  return `background: linear-gradient(135deg, ${colors.join(', ')});
background-size: 400% 400%;
animation: aurora-shift 15s ease infinite;`;
}

export function generateNoiseTexture(opacity: number = 0.05): string {
  return `position: relative;

&::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: ${opacity};
  pointer-events: none;
  mix-blend-mode: overlay;
}`;
}

// =============================================================================
// Pattern Presets
// =============================================================================

export const PATTERN_PRESETS: PatternPreset[] = [
  // Dots
  { id: 'dots-sm', name: 'Small Dots', category: 'dots', description: 'Small dot grid pattern', tags: ['dots', 'small', 'minimal'], css: generateDotPattern(16, 1, 'rgba(0,0,0,0.15)') },
  { id: 'dots-md', name: 'Medium Dots', category: 'dots', description: 'Medium dot grid pattern', tags: ['dots', 'medium'], css: generateDotPattern(24, 2, 'rgba(0,0,0,0.12)') },
  { id: 'dots-lg', name: 'Large Dots', category: 'dots', description: 'Large dot grid pattern', tags: ['dots', 'large'], css: generateDotPattern(32, 4, 'rgba(0,0,0,0.1)') },
  { id: 'dots-colored', name: 'Colored Dots', category: 'dots', description: 'Colored dot pattern', tags: ['dots', 'colored'], css: generateDotPattern(20, 3, 'rgba(99,102,241,0.2)') },

  // Grid
  { id: 'grid-sm', name: 'Small Grid', category: 'grid', description: 'Fine grid pattern', tags: ['grid', 'small', 'graph'], css: generateGridPattern(16, 1, 'rgba(0,0,0,0.08)') },
  { id: 'grid-md', name: 'Medium Grid', category: 'grid', description: 'Medium grid pattern', tags: ['grid', 'medium'], css: generateGridPattern(24, 1, 'rgba(0,0,0,0.1)') },
  { id: 'grid-lg', name: 'Large Grid', category: 'grid', description: 'Large grid pattern', tags: ['grid', 'large'], css: generateGridPattern(48, 1, 'rgba(0,0,0,0.06)') },
  { id: 'graph-paper', name: 'Graph Paper', category: 'grid', description: 'Graph paper with major/minor lines', tags: ['grid', 'graph', 'paper'],
    css: `background-color: #fff;
background-image: 
  linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
  linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px),
  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px);
background-size: 10px 10px, 10px 10px, 50px 50px, 50px 50px;` },

  // Lines
  { id: 'horizontal-lines', name: 'Horizontal Lines', category: 'lines', description: 'Horizontal lined pattern', tags: ['lines', 'horizontal'], css: generateStripes(0, 8, 'rgba(0,0,0,0.05)') },
  { id: 'vertical-lines', name: 'Vertical Lines', category: 'lines', description: 'Vertical lined pattern', tags: ['lines', 'vertical'], css: generateStripes(90, 8, 'rgba(0,0,0,0.05)') },
  { id: 'diagonal-lines', name: 'Diagonal Lines', category: 'lines', description: 'Diagonal stripe pattern', tags: ['lines', 'diagonal', 'stripes'], css: generateStripes(45, 10, 'rgba(0,0,0,0.06)') },
  { id: 'diagonal-lines-thick', name: 'Thick Diagonal', category: 'lines', description: 'Thick diagonal stripes', tags: ['lines', 'diagonal', 'thick'], css: generateStripes(45, 20, 'rgba(0,0,0,0.04)') },
  { id: 'cross-hatch', name: 'Cross Hatch', category: 'lines', description: 'Cross-hatched pattern', tags: ['crosshatch', 'hatching'], css: generateCrossHatch(16, 1, 'rgba(0,0,0,0.08)') },

  // Geometric
  { id: 'checkerboard', name: 'Checkerboard', category: 'geometric', description: 'Chess-like checkerboard', tags: ['checker', 'chess', 'squares'], css: generateCheckerboard(20, '#e8e8e8', '#ffffff') },
  { id: 'diamonds', name: 'Diamonds', category: 'geometric', description: 'Diamond pattern', tags: ['diamond', 'argyle'], css: generateDiamondPattern(30, 'rgba(0,0,0,0.06)') },
  { id: 'herringbone', name: 'Herringbone', category: 'geometric', description: 'Herringbone weave pattern', tags: ['herringbone', 'weave', 'fabric'], css: generateHerringbone(20, 'rgba(0,0,0,0.06)') },
  { id: 'zigzag', name: 'Zigzag', category: 'geometric', description: 'Zigzag pattern', tags: ['zigzag', 'chevron'], css: generateZigzag(20, '#e8e8e8') },
  { id: 'triangles', name: 'Triangles', category: 'geometric', description: 'Triangular pattern', tags: ['triangle', 'geometric'], css: generateTriangles(40, '#e0e0e0', '#eeeeee') },
  { id: 'honeycomb', name: 'Honeycomb', category: 'geometric', description: 'Hexagonal honeycomb', tags: ['hexagon', 'honeycomb', 'hex'], css: generateHoneycomb(30, '#ddd', '#e4e4e4') },

  // Organic
  { id: 'waves', name: 'Waves', category: 'organic', description: 'Wave pattern', tags: ['wave', 'water', 'organic'], css: generateWaves(40, 'rgba(0,0,0,0.04)') },
  { id: 'stars', name: 'Stars', category: 'organic', description: 'Star/constellation pattern', tags: ['stars', 'constellation', 'sky'], css: generateStars(30, 'rgba(0,0,0,0.08)') },
  { id: 'plaid', name: 'Plaid', category: 'organic', description: 'Plaid/tartan pattern', tags: ['plaid', 'tartan', 'fabric'], css: generatePlaid(40) },

  // Gradient backgrounds
  { id: 'mesh-default', name: 'Mesh Gradient', category: 'gradient', description: 'Colorful mesh gradient', tags: ['mesh', 'gradient', 'colorful'], css: generateMeshGradient() },
  { id: 'mesh-sunset', name: 'Sunset Mesh', category: 'gradient', description: 'Warm sunset mesh gradient', tags: ['mesh', 'sunset', 'warm'], css: generateMeshGradient(['#f97316', '#ef4444', '#ec4899', '#8b5cf6']) },
  { id: 'mesh-ocean', name: 'Ocean Mesh', category: 'gradient', description: 'Cool ocean mesh gradient', tags: ['mesh', 'ocean', 'cool'], css: generateMeshGradient(['#0ea5e9', '#06b6d4', '#14b8a6', '#3b82f6']) },
  { id: 'mesh-forest', name: 'Forest Mesh', category: 'gradient', description: 'Green forest mesh gradient', tags: ['mesh', 'forest', 'green'], css: generateMeshGradient(['#22c55e', '#10b981', '#14b8a6', '#65a30d']) },
  { id: 'mesh-night', name: 'Night Sky Mesh', category: 'gradient', description: 'Dark night sky gradient', tags: ['mesh', 'night', 'dark'], css: generateMeshGradient(['#1e1b4b', '#312e81', '#4c1d95', '#0f172a']) },

  // Noise
  { id: 'noise-light', name: 'Light Noise', category: 'noise', description: 'Subtle noise texture', tags: ['noise', 'texture', 'subtle'], css: generateNoiseTexture(0.03) },
  { id: 'noise-medium', name: 'Medium Noise', category: 'noise', description: 'Medium noise texture', tags: ['noise', 'texture', 'grainy'], css: generateNoiseTexture(0.06) },
  { id: 'noise-heavy', name: 'Heavy Noise', category: 'noise', description: 'Heavy noise texture', tags: ['noise', 'texture', 'rough'], css: generateNoiseTexture(0.12) },
];

// =============================================================================
// Animated Backgrounds
// =============================================================================

export function generateAnimatedGradientCSS(
  colors: string[],
  duration: number = 10,
  angle: number = 135,
  className: string = 'animated-gradient'
): string {
  return `.${className} {
  background: linear-gradient(${angle}deg, ${colors.join(', ')});
  background-size: ${colors.length * 100}% ${colors.length * 100}%;
  animation: ${className}-shift ${duration}s ease infinite;
}

@keyframes ${className}-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}`;
}

export function generateParticleBackgroundCSS(
  className: string = 'particle-bg',
  count: number = 20,
  color: string = 'rgba(255,255,255,0.3)',
  minSize: number = 2,
  maxSize: number = 6
): string {
  let shadows = '';
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = minSize + Math.random() * (maxSize - minSize);
    shadows += `${i > 0 ? ',' : ''}\n    ${x}vw ${y}vh ${size}px ${color}`;
  }

  return `.${className} {
  position: relative;
  overflow: hidden;
}

.${className}::before {
  content: '';
  position: absolute;
  top: -10vh;
  left: 0;
  width: 1px;
  height: 1px;
  border-radius: 50%;
  box-shadow: ${shadows};
  animation: ${className}-float ${count}s linear infinite;
}

@keyframes ${className}-float {
  from { transform: translateY(0); }
  to { transform: translateY(110vh); }
}`;
}

export function generateMovingStripesCSS(
  className: string = 'moving-stripes',
  color1: string = 'rgba(255,255,255,0.05)',
  color2: string = 'transparent',
  size: number = 40,
  speed: number = 2
): string {
  return `.${className} {
  background-image: repeating-linear-gradient(
    45deg,
    ${color1},
    ${color1} ${size / 2}px,
    ${color2} ${size / 2}px,
    ${color2} ${size}px
  );
  background-size: ${size * 2}px ${size * 2}px;
  animation: ${className}-move ${speed}s linear infinite;
}

@keyframes ${className}-move {
  from { background-position: 0 0; }
  to { background-position: ${size * 2}px ${size * 2}px; }
}`;
}

// =============================================================================
// Utility Functions
// =============================================================================

export function getPatternsByCategory(category: PatternCategory): PatternPreset[] {
  return PATTERN_PRESETS.filter(p => p.category === category);
}

export function searchPatterns(query: string): PatternPreset[] {
  const lower = query.toLowerCase();
  return PATTERN_PRESETS.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    p.description.toLowerCase().includes(lower) ||
    p.tags.some(t => t.includes(lower))
  );
}

export function generateBackgroundCSS(config: BackgroundConfig): string {
  if (config.layers.length === 0) return '';

  const images: string[] = [];
  const sizes: string[] = [];
  const positions: string[] = [];
  const repeats: string[] = [];
  const blendModes: string[] = [];

  for (const layer of config.layers) {
    if (layer.type === 'gradient' || layer.type === 'pattern') {
      images.push(layer.value);
      sizes.push(layer.size || 'auto');
      positions.push(layer.position || 'center');
      repeats.push(layer.repeat || 'repeat');
      if (layer.blendMode) blendModes.push(layer.blendMode);
    }
  }

  let css = '';
  if (images.length > 0) css += `background-image: ${images.join(',\n  ')};\n`;
  if (sizes.some(s => s !== 'auto')) css += `background-size: ${sizes.join(', ')};\n`;
  if (positions.some(p => p !== 'center')) css += `background-position: ${positions.join(', ')};\n`;
  if (repeats.some(r => r !== 'repeat')) css += `background-repeat: ${repeats.join(', ')};\n`;
  if (blendModes.length > 0) css += `background-blend-mode: ${blendModes.join(', ')};\n`;

  return css;
}
