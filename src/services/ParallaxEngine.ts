// =============================================================================
// Parallax Engine - Multi-layer parallax scrolling system with depth,
// performance optimization, responsive modes, and scroll-driven animations
// =============================================================================

// =============================================================================
// Parallax Types
// =============================================================================

export interface ParallaxConfig {
  id: string;
  name: string;
  layers: ParallaxLayer[];
  direction: ParallaxDirection;
  overflow: 'hidden' | 'visible';
  perspective: number;
  smoothing: number;
  enabled: boolean;
  reduceMotion: boolean;
}

export interface ParallaxLayer {
  id: string;
  name: string;
  element?: string;
  speed: number; // -1 to 1, where 0 = no parallax, 1 = full speed
  offset: ParallaxOffset;
  opacity?: ParallaxOpacity;
  scale?: ParallaxScale;
  rotation?: ParallaxRotation;
  zIndex: number;
  type: ParallaxLayerType;
  image?: string;
  color?: string;
  filter?: string;
  blendMode?: string;
  sticky?: ParallaxSticky;
}

export type ParallaxLayerType =
  | 'background' | 'content' | 'foreground' | 'overlay'
  | 'image' | 'video' | 'gradient' | 'shape';

export type ParallaxDirection = 'vertical' | 'horizontal' | 'both' | 'diagonal';

export interface ParallaxOffset {
  x: number;
  y: number;
  unit: 'px' | '%' | 'vh' | 'vw';
}

export interface ParallaxOpacity {
  start: number;
  end: number;
  scrollStart: number; // percentage
  scrollEnd: number;
}

export interface ParallaxScale {
  start: number;
  end: number;
  scrollStart: number;
  scrollEnd: number;
}

export interface ParallaxRotation {
  start: number;
  end: number;
  axis: 'x' | 'y' | 'z';
  scrollStart: number;
  scrollEnd: number;
}

export interface ParallaxSticky {
  enabled: boolean;
  start: number; // scroll position to start sticking
  end: number;   // scroll position to unstick
}

// =============================================================================
// Default Configurations
// =============================================================================

export const DEFAULT_PARALLAX_CONFIG: ParallaxConfig = {
  id: 'default-parallax',
  name: 'Default Parallax',
  layers: [],
  direction: 'vertical',
  overflow: 'hidden',
  perspective: 1000,
  smoothing: 0.1,
  enabled: true,
  reduceMotion: true,
};

export const DEFAULT_PARALLAX_LAYER: ParallaxLayer = {
  id: 'default-layer',
  name: 'Layer',
  speed: 0.5,
  offset: { x: 0, y: 0, unit: 'px' },
  zIndex: 0,
  type: 'background',
};

// =============================================================================
// Parallax Calculation Engine
// =============================================================================

export function calculateParallaxOffset(
  scrollPosition: number,
  speed: number,
  direction: ParallaxDirection,
  viewportHeight: number = 0,
  viewportWidth: number = 0
): { x: number; y: number } {
  const baseOffset = scrollPosition * speed;

  switch (direction) {
    case 'vertical':
      return { x: 0, y: -baseOffset };
    case 'horizontal':
      return { x: -baseOffset, y: 0 };
    case 'both':
      return { x: -baseOffset * 0.5, y: -baseOffset };
    case 'diagonal':
      return { x: -baseOffset * 0.7, y: -baseOffset * 0.7 };
  }
}

export function calculateLayerTransform(
  layer: ParallaxLayer,
  scrollPosition: number,
  viewportHeight: number,
  direction: ParallaxDirection
): string {
  const { x, y } = calculateParallaxOffset(
    scrollPosition, layer.speed, direction, viewportHeight
  );

  let transform = `translate3d(${x}px, ${y}px, 0)`;

  if (layer.scale) {
    const progress = calculateScrollProgress(
      scrollPosition, layer.scale.scrollStart, layer.scale.scrollEnd, viewportHeight
    );
    const scale = lerp(layer.scale.start, layer.scale.end, progress);
    transform += ` scale(${scale})`;
  }

  if (layer.rotation) {
    const progress = calculateScrollProgress(
      scrollPosition, layer.rotation.scrollStart, layer.rotation.scrollEnd, viewportHeight
    );
    const angle = lerp(layer.rotation.start, layer.rotation.end, progress);
    transform += ` rotate${layer.rotation.axis.toUpperCase()}(${angle}deg)`;
  }

  return transform;
}

export function calculateLayerOpacity(
  layer: ParallaxLayer,
  scrollPosition: number,
  viewportHeight: number
): number {
  if (!layer.opacity) return 1;

  const progress = calculateScrollProgress(
    scrollPosition, layer.opacity.scrollStart, layer.opacity.scrollEnd, viewportHeight
  );

  return lerp(layer.opacity.start, layer.opacity.end, progress);
}

function calculateScrollProgress(
  scrollPosition: number,
  startPercent: number,
  endPercent: number,
  viewportHeight: number
): number {
  const totalHeight = document.documentElement.scrollHeight || viewportHeight * 3;
  const startPx = (startPercent / 100) * totalHeight;
  const endPx = (endPercent / 100) * totalHeight;

  if (scrollPosition <= startPx) return 0;
  if (scrollPosition >= endPx) return 1;
  return (scrollPosition - startPx) / (endPx - startPx);
}

function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * Math.max(0, Math.min(1, progress));
}

// =============================================================================
// Smoothing / Lerp Animation
// =============================================================================

export function createSmoothScroller(smoothing: number = 0.1) {
  let currentY = 0;
  let targetY = 0;
  let animFrameId: number | null = null;

  function update() {
    currentY += (targetY - currentY) * smoothing;

    if (Math.abs(targetY - currentY) > 0.5) {
      animFrameId = requestAnimationFrame(update);
    } else {
      currentY = targetY;
      animFrameId = null;
    }
  }

  return {
    setTarget(y: number) {
      targetY = y;
      if (!animFrameId) {
        animFrameId = requestAnimationFrame(update);
      }
    },
    getCurrent(): number {
      return currentY;
    },
    destroy() {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    },
  };
}

// =============================================================================
// CSS Generation for Parallax
// =============================================================================

export function generateParallaxContainerCSS(
  config: ParallaxConfig,
  className: string = 'parallax-container'
): string {
  return `.${className} {
  position: relative;
  overflow: ${config.overflow};
  perspective: ${config.perspective}px;
  perspective-origin: center center;
  height: 100vh;
  transform-style: preserve-3d;
}`;
}

export function generateParallaxLayerCSS(
  layer: ParallaxLayer,
  containerId: string = 'parallax-container',
  layerIndex: number = 0
): string {
  const depth = (1 - layer.speed) * -1;
  const scale = 1 + Math.abs(depth);

  let css = `.${containerId}__layer-${layerIndex} {
  position: absolute;
  inset: 0;
  z-index: ${layer.zIndex};
  transform: translateZ(${depth * 1000}px) scale(${scale});
  transform-origin: center center;
  will-change: transform;`;

  if (layer.image) {
    css += `\n  background-image: url('${layer.image}');`;
    css += '\n  background-size: cover;';
    css += '\n  background-position: center;';
    css += '\n  background-repeat: no-repeat;';
  }

  if (layer.color) {
    css += `\n  background-color: ${layer.color};`;
  }

  if (layer.filter) {
    css += `\n  filter: ${layer.filter};`;
  }

  if (layer.blendMode) {
    css += `\n  mix-blend-mode: ${layer.blendMode};`;
  }

  css += '\n}';

  return css;
}

export function generateFullParallaxCSS(
  config: ParallaxConfig,
  className: string = 'parallax'
): string {
  let css = generateParallaxContainerCSS(config, className);
  css += '\n\n';

  config.layers.forEach((layer, index) => {
    css += generateParallaxLayerCSS(layer, className, index);
    css += '\n\n';
  });

  // Reduced motion
  if (config.reduceMotion) {
    css += `@media (prefers-reduced-motion: reduce) {
  .${className},
  .${className} [class*="layer"] {
    transform: none !important;
    animation: none !important;
  }
}\n\n`;
  }

  return css;
}

// =============================================================================
// Parallax Scene Presets
// =============================================================================

export interface ParallaxScenePreset {
  id: string;
  name: string;
  description: string;
  category: ParallaxSceneCategory;
  config: ParallaxConfig;
  tags: string[];
}

export type ParallaxSceneCategory =
  | 'landscape' | 'abstract' | 'hero' | 'card' | 'section' | 'background';

export const PARALLAX_SCENE_PRESETS: ParallaxScenePreset[] = [
  {
    id: 'hero-simple',
    name: 'Simple Hero',
    description: 'Simple 2-layer hero section with background parallax',
    category: 'hero',
    tags: ['hero', 'simple', 'landing'],
    config: {
      ...DEFAULT_PARALLAX_CONFIG,
      id: 'hero-simple',
      name: 'Simple Hero',
      layers: [
        {
          id: 'bg', name: 'Background', speed: 0.3, type: 'background',
          offset: { x: 0, y: 0, unit: 'px' }, zIndex: 0,
        },
        {
          id: 'content', name: 'Content', speed: 1, type: 'content',
          offset: { x: 0, y: 0, unit: 'px' }, zIndex: 1,
        },
      ],
    },
  },
  {
    id: 'hero-multi',
    name: 'Multi-Layer Hero',
    description: '4-layer hero with depth and overlay',
    category: 'hero',
    tags: ['hero', 'multi', 'depth'],
    config: {
      ...DEFAULT_PARALLAX_CONFIG,
      id: 'hero-multi',
      name: 'Multi-Layer Hero',
      layers: [
        {
          id: 'far-bg', name: 'Far Background', speed: 0.1, type: 'background',
          offset: { x: 0, y: 0, unit: 'px' }, zIndex: 0,
        },
        {
          id: 'mid-bg', name: 'Mid Background', speed: 0.3, type: 'background',
          offset: { x: 0, y: 0, unit: 'px' }, zIndex: 1,
          opacity: { start: 0.8, end: 0.2, scrollStart: 0, scrollEnd: 60 },
        },
        {
          id: 'content', name: 'Content', speed: 0.6, type: 'content',
          offset: { x: 0, y: 0, unit: 'px' }, zIndex: 2,
          opacity: { start: 1, end: 0, scrollStart: 20, scrollEnd: 50 },
        },
        {
          id: 'foreground', name: 'Foreground', speed: 0.9, type: 'foreground',
          offset: { x: 0, y: 0, unit: 'px' }, zIndex: 3,
        },
      ],
    },
  },
  {
    id: 'landscape-layers',
    name: 'Landscape Layers',
    description: 'Mountain landscape with 5 depth layers',
    category: 'landscape',
    tags: ['landscape', 'mountains', 'nature', 'depth'],
    config: {
      ...DEFAULT_PARALLAX_CONFIG,
      id: 'landscape',
      name: 'Landscape Layers',
      perspective: 1200,
      layers: [
        { id: 'sky', name: 'Sky', speed: 0.05, type: 'background', offset: { x: 0, y: 0, unit: 'px' }, zIndex: 0, color: '#87ceeb' },
        { id: 'far-mountains', name: 'Far Mountains', speed: 0.15, type: 'image', offset: { x: 0, y: 0, unit: 'px' }, zIndex: 1 },
        { id: 'near-mountains', name: 'Near Mountains', speed: 0.3, type: 'image', offset: { x: 0, y: 0, unit: 'px' }, zIndex: 2 },
        { id: 'trees', name: 'Trees', speed: 0.5, type: 'image', offset: { x: 0, y: 0, unit: 'px' }, zIndex: 3 },
        { id: 'ground', name: 'Ground', speed: 0.8, type: 'foreground', offset: { x: 0, y: 0, unit: 'px' }, zIndex: 4 },
      ],
    },
  },
  {
    id: 'floating-cards',
    name: 'Floating Cards',
    description: 'Cards that float at different speeds',
    category: 'card',
    tags: ['cards', 'floating', 'ui'],
    config: {
      ...DEFAULT_PARALLAX_CONFIG,
      id: 'floating-cards',
      name: 'Floating Cards',
      layers: [
        { id: 'card-bg', name: 'Card Background', speed: 0.2, type: 'content', offset: { x: 0, y: 0, unit: 'px' }, zIndex: 0, scale: { start: 0.9, end: 1.1, scrollStart: 10, scrollEnd: 90 } },
        { id: 'card-1', name: 'Card 1', speed: 0.3, type: 'content', offset: { x: -100, y: 0, unit: 'px' }, zIndex: 1 },
        { id: 'card-2', name: 'Card 2', speed: 0.5, type: 'content', offset: { x: 0, y: 0, unit: 'px' }, zIndex: 2 },
        { id: 'card-3', name: 'Card 3', speed: 0.7, type: 'content', offset: { x: 100, y: 0, unit: 'px' }, zIndex: 3 },
      ],
    },
  },
  {
    id: 'abstract-shapes',
    name: 'Abstract Shapes',
    description: 'Abstract geometric shapes with parallax',
    category: 'abstract',
    tags: ['abstract', 'shapes', 'geometric'],
    config: {
      ...DEFAULT_PARALLAX_CONFIG,
      id: 'abstract-shapes',
      name: 'Abstract Shapes',
      layers: [
        { id: 'shape-1', name: 'Circle', speed: 0.15, type: 'shape', offset: { x: -150, y: -100, unit: 'px' }, zIndex: 0, rotation: { start: 0, end: 360, axis: 'z', scrollStart: 0, scrollEnd: 100 } },
        { id: 'shape-2', name: 'Square', speed: 0.3, type: 'shape', offset: { x: 200, y: 50, unit: 'px' }, zIndex: 1, rotation: { start: 0, end: -180, axis: 'z', scrollStart: 0, scrollEnd: 100 }, scale: { start: 0.5, end: 1.5, scrollStart: 10, scrollEnd: 90 } },
        { id: 'shape-3', name: 'Triangle', speed: 0.5, type: 'shape', offset: { x: -50, y: 200, unit: 'px' }, zIndex: 2, opacity: { start: 0.3, end: 1, scrollStart: 20, scrollEnd: 80 } },
        { id: 'content-layer', name: 'Content', speed: 1, type: 'content', offset: { x: 0, y: 0, unit: 'px' }, zIndex: 10 },
      ],
    },
  },
  {
    id: 'gradient-depth',
    name: 'Gradient Depth',
    description: 'Gradient layers creating depth illusion',
    category: 'background',
    tags: ['gradient', 'depth', 'colorful'],
    config: {
      ...DEFAULT_PARALLAX_CONFIG,
      id: 'gradient-depth',
      name: 'Gradient Depth',
      layers: [
        { id: 'grad-1', name: 'Base Gradient', speed: 0.05, type: 'gradient', offset: { x: 0, y: 0, unit: 'px' }, zIndex: 0, color: 'linear-gradient(180deg, #1e1b4b, #312e81)' },
        { id: 'grad-2', name: 'Mid Gradient', speed: 0.2, type: 'gradient', offset: { x: 0, y: 0, unit: 'px' }, zIndex: 1, blendMode: 'screen', opacity: { start: 0.6, end: 0.2, scrollStart: 0, scrollEnd: 80 } },
        { id: 'grad-3', name: 'Top Gradient', speed: 0.4, type: 'gradient', offset: { x: 0, y: 0, unit: 'px' }, zIndex: 2, blendMode: 'overlay' },
      ],
    },
  },
  {
    id: 'horizontal-scroll',
    name: 'Horizontal Scroll',
    description: 'Horizontal parallax scroll section',
    category: 'section',
    tags: ['horizontal', 'scroll', 'section'],
    config: {
      ...DEFAULT_PARALLAX_CONFIG,
      id: 'horizontal-scroll',
      name: 'Horizontal Scroll',
      direction: 'horizontal',
      layers: [
        { id: 'h-bg', name: 'Background', speed: 0.2, type: 'background', offset: { x: 0, y: 0, unit: 'px' }, zIndex: 0 },
        { id: 'h-mid', name: 'Midground', speed: 0.5, type: 'content', offset: { x: 0, y: 0, unit: 'px' }, zIndex: 1 },
        { id: 'h-fg', name: 'Foreground', speed: 0.8, type: 'foreground', offset: { x: 0, y: 0, unit: 'px' }, zIndex: 2 },
      ],
    },
  },
];

// =============================================================================
// JavaScript-Based Parallax Controller (for dynamic use)
// =============================================================================

export interface ParallaxController {
  init(): void;
  update(scrollY: number): void;
  destroy(): void;
  addLayer(layer: ParallaxLayer): void;
  removeLayer(id: string): void;
  setEnabled(enabled: boolean): void;
}

export function createParallaxController(
  config: ParallaxConfig,
  containerElement?: HTMLElement | null
): ParallaxController {
  let _enabled = config.enabled;
  let _layers = [...config.layers];
  let _scrollY = 0;
  let _rafId: number | null = null;
  const _smoother = createSmoothScroller(config.smoothing);

  function onScroll() {
    if (!_enabled) return;
    _scrollY = window.scrollY || window.pageYOffset;
    _smoother.setTarget(_scrollY);
    if (!_rafId) {
      _rafId = requestAnimationFrame(render);
    }
  }

  function render() {
    const currentY = _smoother.getCurrent();
    const vh = window.innerHeight;

    _layers.forEach((layer, index) => {
      const transform = calculateLayerTransform(layer, currentY, vh, config.direction);
      const opacity = calculateLayerOpacity(layer, currentY, vh);

      const el = containerElement?.querySelector(`[data-parallax-layer="${layer.id}"]`) as HTMLElement;
      if (el) {
        el.style.transform = transform;
        el.style.opacity = String(opacity);
      }
    });

    _rafId = null;
    if (Math.abs(_scrollY - _smoother.getCurrent()) > 0.5) {
      _rafId = requestAnimationFrame(render);
    }
  }

  return {
    init() {
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    },
    update(scrollY: number) {
      _scrollY = scrollY;
      _smoother.setTarget(scrollY);
      if (!_rafId) {
        _rafId = requestAnimationFrame(render);
      }
    },
    destroy() {
      window.removeEventListener('scroll', onScroll);
      if (_rafId) cancelAnimationFrame(_rafId);
      _smoother.destroy();
    },
    addLayer(layer: ParallaxLayer) {
      _layers.push(layer);
    },
    removeLayer(id: string) {
      _layers = _layers.filter(l => l.id !== id);
    },
    setEnabled(enabled: boolean) {
      _enabled = enabled;
    },
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

export function getPresetsByCategory(category: ParallaxSceneCategory): ParallaxScenePreset[] {
  return PARALLAX_SCENE_PRESETS.filter(p => p.category === category);
}

export function searchParallaxPresets(query: string): ParallaxScenePreset[] {
  const lower = query.toLowerCase();
  return PARALLAX_SCENE_PRESETS.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    p.description.toLowerCase().includes(lower) ||
    p.tags.some(t => t.includes(lower))
  );
}

export function estimatePerformanceImpact(config: ParallaxConfig): {
  level: 'low' | 'medium' | 'high';
  suggestions: string[];
} {
  const suggestions: string[] = [];
  let score = 0;

  if (config.layers.length > 5) {
    score += 2;
    suggestions.push('Consider reducing the number of parallax layers for better performance');
  }

  const hasScale = config.layers.some(l => l.scale);
  const hasRotation = config.layers.some(l => l.rotation);
  const hasOpacity = config.layers.some(l => l.opacity);

  if (hasScale) { score += 1; suggestions.push('Scale transforms increase paint complexity'); }
  if (hasRotation) { score += 1; suggestions.push('Rotation transforms may cause repaints'); }
  if (hasOpacity) { score += 1; }

  if (config.smoothing < 0.05) {
    suggestions.push('Very low smoothing values increase frame computation');
    score += 1;
  }

  const hasImages = config.layers.some(l => l.image);
  if (hasImages) {
    suggestions.push('Optimize images: use responsive sizes and lazy loading');
    score += 1;
  }

  if (!config.reduceMotion) {
    suggestions.push('Enable prefers-reduced-motion support for accessibility');
  }

  return {
    level: score <= 2 ? 'low' : score <= 4 ? 'medium' : 'high',
    suggestions,
  };
}

export function generateParallaxHTML(config: ParallaxConfig, className: string = 'parallax'): string {
  let html = `<div class="${className}">\n`;

  config.layers.forEach((layer, index) => {
    html += `  <div
    class="${className}__layer-${index}"
    data-parallax-layer="${layer.id}"
    data-speed="${layer.speed}"
    ${layer.image ? `style="background-image: url('${layer.image}')"` : ''}
  >\n`;

    if (layer.type === 'content') {
      html += `    <!-- ${layer.name} content goes here -->\n`;
    }

    html += `  </div>\n`;
  });

  html += '</div>';
  return html;
}
