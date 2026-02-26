// =============================================================================
// Scroll Animations Service - Scroll-triggered animations, parallax effects,
// intersection observer utilities, scroll-linked animations, and waypoints
// =============================================================================

// =============================================================================
// Scroll Animation Types
// =============================================================================

export interface ScrollAnimationConfig {
  id: string;
  name: string;
  trigger: ScrollTrigger;
  animation: ScrollAnimationEffect;
  options?: ScrollAnimationOptions;
}

export interface ScrollTrigger {
  type: 'viewport' | 'element' | 'scroll-position' | 'scroll-progress';
  element?: string; // CSS selector or element ID
  threshold?: number | number[]; // 0-1 for intersection ratio
  rootMargin?: string;
  startOffset?: number; // px from top of viewport
  endOffset?: number;
  once?: boolean;
  direction?: 'up' | 'down' | 'both';
}

export interface ScrollAnimationEffect {
  type: ScrollAnimationType;
  properties: ScrollAnimationProperty[];
  duration?: number;
  delay?: number;
  easing?: string;
  stagger?: number;
  staggerFrom?: 'start' | 'end' | 'center' | 'random';
}

export type ScrollAnimationType =
  | 'fade-in' | 'fade-out' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'
  | 'zoom-in' | 'zoom-out' | 'rotate-in' | 'flip-x' | 'flip-y'
  | 'bounce-in' | 'elastic-in' | 'blur-in' | 'skew-in'
  | 'counter' | 'progress-bar' | 'parallax' | 'sticky' | 'pin'
  | 'reveal-text' | 'draw-line' | 'morph' | 'custom';

export interface ScrollAnimationProperty {
  property: string;
  from: string | number;
  to: string | number;
  unit?: string;
}

export interface ScrollAnimationOptions {
  disabled?: boolean;
  mobile?: boolean;
  reduceMotion?: boolean;
  debug?: boolean;
  markers?: boolean;
  snap?: boolean;
  scrub?: boolean | number; // true or smoothing value
  pin?: boolean;
  pinSpacing?: boolean;
  anticipatePin?: boolean;
  toggleClass?: string;
  toggleActions?: string; // "play pause resume reset"
}

// =============================================================================
// Scroll Position Types
// =============================================================================

export interface ScrollPosition {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'none';
  progress: number; // 0-1 overall page scroll progress
  velocity: number;
  isAtTop: boolean;
  isAtBottom: boolean;
}

export interface ScrollMetrics {
  scrollHeight: number;
  clientHeight: number;
  scrollWidth: number;
  clientWidth: number;
  maxScrollY: number;
  maxScrollX: number;
}

export interface Waypoint {
  id: string;
  element: string;
  offset?: number;
  direction?: 'up' | 'down' | 'both';
  handler: (direction: 'up' | 'down') => void;
  once?: boolean;
  triggered?: boolean;
}

// =============================================================================
// Scroll Animation Presets
// =============================================================================

export const SCROLL_ANIMATION_PRESETS: Record<string, ScrollAnimationConfig> = {
  // Fade animations
  fadeIn: {
    id: 'fade-in',
    name: 'Fade In',
    trigger: { type: 'viewport', threshold: 0.2, once: true },
    animation: {
      type: 'fade-in',
      properties: [
        { property: 'opacity', from: 0, to: 1 },
      ],
      duration: 600,
      easing: 'ease-out',
    },
  },

  fadeInUp: {
    id: 'fade-in-up',
    name: 'Fade In Up',
    trigger: { type: 'viewport', threshold: 0.2, once: true },
    animation: {
      type: 'slide-up',
      properties: [
        { property: 'opacity', from: 0, to: 1 },
        { property: 'transform', from: 'translateY(40px)', to: 'translateY(0)' },
      ],
      duration: 600,
      easing: 'ease-out',
    },
  },

  fadeInDown: {
    id: 'fade-in-down',
    name: 'Fade In Down',
    trigger: { type: 'viewport', threshold: 0.2, once: true },
    animation: {
      type: 'slide-down',
      properties: [
        { property: 'opacity', from: 0, to: 1 },
        { property: 'transform', from: 'translateY(-40px)', to: 'translateY(0)' },
      ],
      duration: 600,
      easing: 'ease-out',
    },
  },

  fadeInLeft: {
    id: 'fade-in-left',
    name: 'Fade In Left',
    trigger: { type: 'viewport', threshold: 0.2, once: true },
    animation: {
      type: 'slide-left',
      properties: [
        { property: 'opacity', from: 0, to: 1 },
        { property: 'transform', from: 'translateX(-60px)', to: 'translateX(0)' },
      ],
      duration: 600,
      easing: 'ease-out',
    },
  },

  fadeInRight: {
    id: 'fade-in-right',
    name: 'Fade In Right',
    trigger: { type: 'viewport', threshold: 0.2, once: true },
    animation: {
      type: 'slide-right',
      properties: [
        { property: 'opacity', from: 0, to: 1 },
        { property: 'transform', from: 'translateX(60px)', to: 'translateX(0)' },
      ],
      duration: 600,
      easing: 'ease-out',
    },
  },

  // Zoom animations
  zoomIn: {
    id: 'zoom-in',
    name: 'Zoom In',
    trigger: { type: 'viewport', threshold: 0.2, once: true },
    animation: {
      type: 'zoom-in',
      properties: [
        { property: 'opacity', from: 0, to: 1 },
        { property: 'transform', from: 'scale(0.6)', to: 'scale(1)' },
      ],
      duration: 500,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
  },

  zoomOut: {
    id: 'zoom-out',
    name: 'Zoom Out',
    trigger: { type: 'viewport', threshold: 0.2, once: true },
    animation: {
      type: 'zoom-out',
      properties: [
        { property: 'opacity', from: 0, to: 1 },
        { property: 'transform', from: 'scale(1.4)', to: 'scale(1)' },
      ],
      duration: 500,
      easing: 'ease-out',
    },
  },

  // Rotate animations
  rotateIn: {
    id: 'rotate-in',
    name: 'Rotate In',
    trigger: { type: 'viewport', threshold: 0.3, once: true },
    animation: {
      type: 'rotate-in',
      properties: [
        { property: 'opacity', from: 0, to: 1 },
        { property: 'transform', from: 'rotate(-15deg) scale(0.9)', to: 'rotate(0) scale(1)' },
      ],
      duration: 600,
      easing: 'ease-out',
    },
  },

  flipX: {
    id: 'flip-x',
    name: 'Flip X',
    trigger: { type: 'viewport', threshold: 0.3, once: true },
    animation: {
      type: 'flip-x',
      properties: [
        { property: 'opacity', from: 0, to: 1 },
        { property: 'transform', from: 'perspective(400px) rotateX(90deg)', to: 'perspective(400px) rotateX(0)' },
      ],
      duration: 700,
      easing: 'ease-out',
    },
  },

  flipY: {
    id: 'flip-y',
    name: 'Flip Y',
    trigger: { type: 'viewport', threshold: 0.3, once: true },
    animation: {
      type: 'flip-y',
      properties: [
        { property: 'opacity', from: 0, to: 1 },
        { property: 'transform', from: 'perspective(400px) rotateY(90deg)', to: 'perspective(400px) rotateY(0)' },
      ],
      duration: 700,
      easing: 'ease-out',
    },
  },

  // Special animations
  bounceIn: {
    id: 'bounce-in',
    name: 'Bounce In',
    trigger: { type: 'viewport', threshold: 0.2, once: true },
    animation: {
      type: 'bounce-in',
      properties: [
        { property: 'opacity', from: 0, to: 1 },
        { property: 'transform', from: 'scale(0.3)', to: 'scale(1)' },
      ],
      duration: 700,
      easing: 'cubic-bezier(0.87, -0.41, 0.19, 1.44)',
    },
  },

  elasticIn: {
    id: 'elastic-in',
    name: 'Elastic In',
    trigger: { type: 'viewport', threshold: 0.2, once: true },
    animation: {
      type: 'elastic-in',
      properties: [
        { property: 'opacity', from: 0, to: 1 },
        { property: 'transform', from: 'scale(0.5) translateY(20px)', to: 'scale(1) translateY(0)' },
      ],
      duration: 1000,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  blurIn: {
    id: 'blur-in',
    name: 'Blur In',
    trigger: { type: 'viewport', threshold: 0.2, once: true },
    animation: {
      type: 'blur-in',
      properties: [
        { property: 'opacity', from: 0, to: 1 },
        { property: 'filter', from: 'blur(20px)', to: 'blur(0px)' },
      ],
      duration: 600,
      easing: 'ease-out',
    },
  },

  skewIn: {
    id: 'skew-in',
    name: 'Skew In',
    trigger: { type: 'viewport', threshold: 0.2, once: true },
    animation: {
      type: 'skew-in',
      properties: [
        { property: 'opacity', from: 0, to: 1 },
        { property: 'transform', from: 'skewX(-10deg) translateX(-40px)', to: 'skewX(0) translateX(0)' },
      ],
      duration: 600,
      easing: 'ease-out',
    },
  },

  // Content animations
  counterUp: {
    id: 'counter-up',
    name: 'Counter Up',
    trigger: { type: 'viewport', threshold: 0.5, once: true },
    animation: {
      type: 'counter',
      properties: [
        { property: 'textContent', from: 0, to: 1000 },
      ],
      duration: 2000,
      easing: 'ease-out',
    },
  },

  progressBar: {
    id: 'progress-bar',
    name: 'Progress Bar Fill',
    trigger: { type: 'viewport', threshold: 0.5, once: true },
    animation: {
      type: 'progress-bar',
      properties: [
        { property: 'width', from: '0%', to: '100%' },
      ],
      duration: 1500,
      easing: 'ease-in-out',
    },
  },

  textReveal: {
    id: 'text-reveal',
    name: 'Text Reveal',
    trigger: { type: 'viewport', threshold: 0.3, once: true },
    animation: {
      type: 'reveal-text',
      properties: [
        { property: 'clip-path', from: 'inset(0 100% 0 0)', to: 'inset(0 0 0 0)' },
      ],
      duration: 800,
      easing: 'ease-out',
    },
  },

  drawLine: {
    id: 'draw-line',
    name: 'Draw Line (SVG)',
    trigger: { type: 'viewport', threshold: 0.3, once: true },
    animation: {
      type: 'draw-line',
      properties: [
        { property: 'stroke-dashoffset', from: 1000, to: 0 },
      ],
      duration: 2000,
      easing: 'ease-in-out',
    },
  },

  // Parallax
  parallaxSlow: {
    id: 'parallax-slow',
    name: 'Parallax Slow',
    trigger: { type: 'scroll-progress' },
    animation: {
      type: 'parallax',
      properties: [
        { property: 'transform', from: 'translateY(0)', to: 'translateY(-100px)' },
      ],
    },
    options: { scrub: true },
  },

  parallaxFast: {
    id: 'parallax-fast',
    name: 'Parallax Fast',
    trigger: { type: 'scroll-progress' },
    animation: {
      type: 'parallax',
      properties: [
        { property: 'transform', from: 'translateY(0)', to: 'translateY(-300px)' },
      ],
    },
    options: { scrub: true },
  },

  parallaxScale: {
    id: 'parallax-scale',
    name: 'Parallax Scale',
    trigger: { type: 'scroll-progress' },
    animation: {
      type: 'parallax',
      properties: [
        { property: 'transform', from: 'scale(1)', to: 'scale(1.3)' },
      ],
    },
    options: { scrub: true },
  },

  parallaxRotate: {
    id: 'parallax-rotate',
    name: 'Parallax Rotate',
    trigger: { type: 'scroll-progress' },
    animation: {
      type: 'parallax',
      properties: [
        { property: 'transform', from: 'rotate(0deg)', to: 'rotate(45deg)' },
      ],
    },
    options: { scrub: true },
  },

  parallaxOpacity: {
    id: 'parallax-opacity',
    name: 'Parallax Fade',
    trigger: { type: 'scroll-progress' },
    animation: {
      type: 'parallax',
      properties: [
        { property: 'opacity', from: 1, to: 0 },
      ],
    },
    options: { scrub: true },
  },
};

// =============================================================================
// CSS Generation for Scroll Animations
// =============================================================================

export function generateScrollAnimationCSS(config: ScrollAnimationConfig): string {
  const { animation } = config;
  const className = `scroll-anim-${config.id}`;
  const animName = `scroll-${config.id}`;

  // Generate initial state (before animation)
  const initialProps = animation.properties.map(p => {
    const prop = p.property.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `  ${prop}: ${p.from}${p.unit || ''};`;
  }).join('\n');

  // Generate keyframe animation
  const fromProps = animation.properties.map(p => {
    const prop = p.property.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `    ${prop}: ${p.from}${p.unit || ''};`;
  }).join('\n');

  const toProps = animation.properties.map(p => {
    const prop = p.property.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `    ${prop}: ${p.to}${p.unit || ''};`;
  }).join('\n');

  return `/* ${config.name} */
.${className} {
${initialProps}
  transition: none;
}

.${className}.is-visible {
  animation: ${animName} ${animation.duration || 600}ms ${animation.easing || 'ease-out'} ${animation.delay || 0}ms both;
}

@keyframes ${animName} {
  from {
${fromProps}
  }
  to {
${toProps}
  }
}`;
}

export function generateAllScrollAnimationsCSS(): string {
  return Object.values(SCROLL_ANIMATION_PRESETS)
    .filter(p => p.animation.type !== 'parallax')
    .map(generateScrollAnimationCSS)
    .join('\n\n');
}

// =============================================================================
// Stagger Animation Generation
// =============================================================================

export function generateStaggerCSS(
  baseClass: string,
  itemCount: number,
  staggerDelay: number = 100,
  animation: ScrollAnimationEffect
): string {
  const animName = `stagger-${baseClass}`;

  const fromProps = animation.properties.map(p => {
    const prop = p.property.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `    ${prop}: ${p.from}${p.unit || ''};`;
  }).join('\n');

  const toProps = animation.properties.map(p => {
    const prop = p.property.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `    ${prop}: ${p.to}${p.unit || ''};`;
  }).join('\n');

  let css = `@keyframes ${animName} {
  from {
${fromProps}
  }
  to {
${toProps}
  }
}\n\n`;

  // Initial state for all items
  const initialProps = animation.properties.map(p => {
    const prop = p.property.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `  ${prop}: ${p.from}${p.unit || ''};`;
  }).join('\n');

  css += `.${baseClass} > * {
${initialProps}
}\n\n`;

  // Visible state with stagger
  css += `.${baseClass}.is-visible > * {
  animation: ${animName} ${animation.duration || 600}ms ${animation.easing || 'ease-out'} both;
}\n\n`;

  // Individual delays
  for (let i = 0; i < itemCount; i++) {
    css += `.${baseClass}.is-visible > *:nth-child(${i + 1}) {
  animation-delay: ${i * staggerDelay}ms;
}\n`;
  }

  return css;
}

// =============================================================================
// Smooth Scroll Utilities
// =============================================================================

export interface SmoothScrollConfig {
  duration: number;
  easing: 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic';
  offset: number;
}

export const DEFAULT_SMOOTH_SCROLL_CONFIG: SmoothScrollConfig = {
  duration: 800,
  easing: 'easeInOutCubic',
  offset: 0,
};

export const EASING_FUNCTIONS: Record<SmoothScrollConfig['easing'], (t: number) => number> = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
};

// =============================================================================
// Scroll-Linked Animations CSS (Scroll Timeline API)
// =============================================================================

export function generateScrollTimelineCSS(
  animationName: string,
  timelineName: string,
  axis: 'block' | 'inline' | 'x' | 'y' = 'block',
  source: 'nearest' | 'root' | 'self' = 'nearest'
): string {
  return `@keyframes ${animationName} {
  from { }
  to { }
}

.scroll-timeline-element {
  animation: ${animationName} linear both;
  animation-timeline: ${timelineName};
  scroll-timeline-name: ${timelineName};
  scroll-timeline-axis: ${axis};
}

/* Fallback for browsers without Scroll Timeline support */
@supports not (animation-timeline: scroll()) {
  .scroll-timeline-element {
    /* Add JS-based scroll fallback */
  }
}`;
}

export function generateViewTimelineCSS(
  animationName: string,
  timelineName: string,
  inset: string = 'auto'
): string {
  return `@keyframes ${animationName} {
  entry 0% {
    opacity: 0;
    transform: translateY(100px);
  }
  entry 100% {
    opacity: 1;
    transform: translateY(0);
  }
  exit 0% {
    opacity: 1;
    transform: translateY(0);
  }
  exit 100% {
    opacity: 0;
    transform: translateY(-100px);
  }
}

.view-timeline-element {
  view-timeline-name: ${timelineName};
  view-timeline-inset: ${inset};
  animation: ${animationName} linear both;
  animation-timeline: ${timelineName};
}`;
}

// =============================================================================
// Intersection Observer Configuration
// =============================================================================

export interface IntersectionConfig {
  root?: string | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export const INTERSECTION_PRESETS: Record<string, IntersectionConfig> = {
  default: { rootMargin: '0px', threshold: 0.1 },
  eager: { rootMargin: '200px 0px', threshold: 0 },
  lazy: { rootMargin: '-50px 0px', threshold: 0.5 },
  precise: { rootMargin: '0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
  fullView: { rootMargin: '0px', threshold: 1 },
  halfView: { rootMargin: '0px', threshold: 0.5 },
  topHalf: { rootMargin: '0px 0px -50% 0px', threshold: 0 },
  bottomHalf: { rootMargin: '-50% 0px 0px 0px', threshold: 0 },
};

// =============================================================================
// Scroll Snap CSS Generation
// =============================================================================

export interface ScrollSnapConfig {
  type: 'mandatory' | 'proximity';
  axis: 'x' | 'y' | 'both';
  align: 'start' | 'end' | 'center';
  padding?: string;
  stop?: 'always' | 'normal';
}

export function generateScrollSnapCSS(config: ScrollSnapConfig, containerClass: string, itemClass: string): string {
  const axisMap = { x: 'x', y: 'y', both: 'both' };
  return `.${containerClass} {
  scroll-snap-type: ${axisMap[config.axis]} ${config.type};
  overflow-${config.axis === 'x' ? 'x' : config.axis === 'y' ? 'y' : ''}: auto;
  ${config.padding ? `scroll-padding: ${config.padding};` : ''}
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.${containerClass}::-webkit-scrollbar {
  display: none;
}

.${itemClass} {
  scroll-snap-align: ${config.align};
  ${config.stop === 'always' ? 'scroll-snap-stop: always;' : ''}
}`;
}

// =============================================================================
// Scroll Progress Bar CSS
// =============================================================================

export function generateScrollProgressCSS(
  position: 'top' | 'bottom' = 'top',
  height: number = 3,
  color: string = '#6366f1',
  backgroundColor: string = 'transparent',
  zIndex: number = 9999
): string {
  return `.scroll-progress-container {
  position: fixed;
  ${position}: 0;
  left: 0;
  right: 0;
  height: ${height}px;
  background: ${backgroundColor};
  z-index: ${zIndex};
}

.scroll-progress-bar {
  height: 100%;
  background: ${color};
  width: 0%;
  transition: width 100ms linear;
  will-change: width;
}

/* Alternative: Using scroll-driven animation (modern browsers) */
@supports (animation-timeline: scroll()) {
  @keyframes scroll-progress {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
  
  .scroll-progress-bar--native {
    width: 100%;
    transform-origin: left;
    animation: scroll-progress linear both;
    animation-timeline: scroll(root);
    transition: none;
  }
}`;
}

// =============================================================================
// Back to Top Button CSS
// =============================================================================

export function generateBackToTopCSS(
  size: number = 48,
  offset: number = 24,
  color: string = '#6366f1'
): string {
  return `.back-to-top {
  position: fixed;
  bottom: ${offset}px;
  right: ${offset}px;
  width: ${size}px;
  height: ${size}px;
  border-radius: 50%;
  background: ${color};
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: opacity 300ms, visibility 300ms, transform 300ms;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
}

.back-to-top.is-visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.back-to-top:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}

.back-to-top:active {
  transform: translateY(0);
}

.back-to-top svg {
  width: ${size * 0.4}px;
  height: ${size * 0.4}px;
}`;
}

// =============================================================================
// Horizontal Scroll Section CSS
// =============================================================================

export function generateHorizontalScrollCSS(
  containerClass: string = 'horizontal-scroll',
  sectionCount: number = 5,
  sectionWidth: string = '100vw'
): string {
  const totalWidth = `${sectionCount * 100}vw`;
  return `.${containerClass} {
  height: ${totalWidth};
  position: relative;
}

.${containerClass}__sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

.${containerClass}__track {
  display: flex;
  height: 100%;
  width: ${totalWidth};
  will-change: transform;
}

.${containerClass}__section {
  width: ${sectionWidth};
  height: 100%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Using scroll-driven animation for horizontal scroll */
@supports (animation-timeline: scroll()) {
  @keyframes horizontal-scroll-anim {
    from { transform: translateX(0); }
    to { transform: translateX(-${(sectionCount - 1) * 100}vw); }
  }
  
  .${containerClass}__track--native {
    animation: horizontal-scroll-anim linear both;
    animation-timeline: scroll(nearest block);
  }
}`;
}
