// =============================================================================
// Transition Engine - Page transitions, component animations, scroll effects
// Features: Route transitions, element animations, scroll-driven effects,
//           parallax, reveal animations, micro-interactions
// =============================================================================

// =============================================================================
// Types
// =============================================================================

export type TransitionType =
  | 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down'
  | 'scale' | 'scale-up' | 'scale-down' | 'rotate' | 'flip-x' | 'flip-y'
  | 'zoom-in' | 'zoom-out' | 'blur' | 'bounce' | 'elastic'
  | 'swing' | 'dissolve' | 'wipe-left' | 'wipe-right' | 'wipe-up' | 'wipe-down'
  | 'morph' | 'iris' | 'curtain' | 'fold' | 'unfold'
  | 'glitch' | 'pixelate' | 'shutter' | 'reveal' | 'none';

export type EasingFunction =
  | 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
  | 'ease-in-quad' | 'ease-out-quad' | 'ease-in-out-quad'
  | 'ease-in-cubic' | 'ease-out-cubic' | 'ease-in-out-cubic'
  | 'ease-in-quart' | 'ease-out-quart' | 'ease-in-out-quart'
  | 'ease-in-quint' | 'ease-out-quint' | 'ease-in-out-quint'
  | 'ease-in-sine' | 'ease-out-sine' | 'ease-in-out-sine'
  | 'ease-in-expo' | 'ease-out-expo' | 'ease-in-out-expo'
  | 'ease-in-circ' | 'ease-out-circ' | 'ease-in-out-circ'
  | 'ease-in-back' | 'ease-out-back' | 'ease-in-out-back'
  | 'ease-in-elastic' | 'ease-out-elastic' | 'ease-in-out-elastic'
  | 'ease-in-bounce' | 'ease-out-bounce' | 'ease-in-out-bounce'
  | 'spring' | 'custom';

export interface TransitionConfig {
  type: TransitionType;
  duration: number;           // milliseconds
  delay: number;              // milliseconds
  easing: EasingFunction;
  customEasing?: string;      // cubic-bezier string
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode: 'none' | 'forwards' | 'backwards' | 'both';
  iterationCount: number | 'infinite';
  stagger?: number;           // ms delay between staggered children
  origin?: string;            // transform origin
  perspective?: number;
}

export interface ScrollAnimationConfig {
  trigger: 'enter' | 'exit' | 'enter-exit' | 'progress';
  threshold: number;           // 0-1
  offset: { top: number; bottom: number };
  animation: TransitionConfig;
  scrub: boolean;              // Link animation progress to scroll
  pin: boolean;                // Pin element during animation
  pinSpacerHeight?: number;
  once: boolean;               // Only animate once
  markers?: boolean;           // Show debug markers
  start: string;               // "top center", "top 80%"
  end: string;                 // "bottom center"
}

export interface ParallaxConfig {
  speed: number;               // -1 to 1 (negative = reverse)
  direction: 'vertical' | 'horizontal' | 'both';
  easing: EasingFunction;
  overflow: boolean;
  scale: boolean;
  rotation: number;
  opacity: { start: number; end: number };
}

export interface MicroInteraction {
  name: string;
  trigger: InteractionTrigger;
  states: InteractionState[];
  duration: number;
  easing: EasingFunction;
  resetOnLeave: boolean;
}

export type InteractionTrigger = 'hover' | 'click' | 'focus' | 'active' | 'drag' | 'tap' | 'long-press' | 'scroll-into-view' | 'load' | 'intersection';

export interface InteractionState {
  name: string;
  properties: Record<string, string | number>;
  duration?: number;
  delay?: number;
  easing?: EasingFunction;
}

// =============================================================================
// Easing Functions
// =============================================================================

export const EASING_CURVES: Record<string, string> = {
  'linear': 'linear',
  'ease': 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
  'ease-in-quad': 'cubic-bezier(0.550, 0.085, 0.680, 0.530)',
  'ease-out-quad': 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
  'ease-in-out-quad': 'cubic-bezier(0.455, 0.030, 0.515, 0.955)',
  'ease-in-cubic': 'cubic-bezier(0.550, 0.055, 0.675, 0.190)',
  'ease-out-cubic': 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
  'ease-in-out-cubic': 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
  'ease-in-quart': 'cubic-bezier(0.895, 0.030, 0.685, 0.220)',
  'ease-out-quart': 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
  'ease-in-out-quart': 'cubic-bezier(0.770, 0.000, 0.175, 1.000)',
  'ease-in-quint': 'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
  'ease-out-quint': 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
  'ease-in-out-quint': 'cubic-bezier(0.860, 0.000, 0.070, 1.000)',
  'ease-in-sine': 'cubic-bezier(0.470, 0.000, 0.745, 0.715)',
  'ease-out-sine': 'cubic-bezier(0.390, 0.575, 0.565, 1.000)',
  'ease-in-out-sine': 'cubic-bezier(0.445, 0.050, 0.550, 0.950)',
  'ease-in-expo': 'cubic-bezier(0.950, 0.050, 0.795, 0.035)',
  'ease-out-expo': 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
  'ease-in-out-expo': 'cubic-bezier(1.000, 0.000, 0.000, 1.000)',
  'ease-in-circ': 'cubic-bezier(0.600, 0.040, 0.980, 0.335)',
  'ease-out-circ': 'cubic-bezier(0.075, 0.820, 0.165, 1.000)',
  'ease-in-out-circ': 'cubic-bezier(0.785, 0.135, 0.150, 0.860)',
  'ease-in-back': 'cubic-bezier(0.600, -0.280, 0.735, 0.045)',
  'ease-out-back': 'cubic-bezier(0.175, 0.885, 0.320, 1.275)',
  'ease-in-out-back': 'cubic-bezier(0.680, -0.550, 0.265, 1.550)',
  'spring': 'cubic-bezier(0.175, 0.885, 0.320, 1.175)',
};

// =============================================================================
// Keyframe math functions
// =============================================================================

export function easingFunction(t: number, type: EasingFunction): number {
  switch (type) {
    case 'linear': return t;
    case 'ease-in-quad': return t * t;
    case 'ease-out-quad': return t * (2 - t);
    case 'ease-in-out-quad': return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    case 'ease-in-cubic': return t * t * t;
    case 'ease-out-cubic': return (--t) * t * t + 1;
    case 'ease-in-out-cubic': return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    case 'ease-in-quart': return t * t * t * t;
    case 'ease-out-quart': return 1 - (--t) * t * t * t;
    case 'ease-in-out-quart': return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
    case 'ease-in-quint': return t * t * t * t * t;
    case 'ease-out-quint': return 1 + (--t) * t * t * t * t;
    case 'ease-in-out-quint': return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
    case 'ease-in-sine': return 1 - Math.cos(t * Math.PI / 2);
    case 'ease-out-sine': return Math.sin(t * Math.PI / 2);
    case 'ease-in-out-sine': return -(Math.cos(Math.PI * t) - 1) / 2;
    case 'ease-in-expo': return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
    case 'ease-out-expo': return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    case 'ease-in-out-expo':
      if (t === 0 || t === 1) return t;
      return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
    case 'ease-in-circ': return 1 - Math.sqrt(1 - t * t);
    case 'ease-out-circ': return Math.sqrt(1 - (--t) * t);
    case 'ease-in-out-circ': return t < 0.5 ? (1 - Math.sqrt(1 - 4 * t * t)) / 2 : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2;
    case 'ease-in-back': {
      const c = 1.70158;
      return (c + 1) * t * t * t - c * t * t;
    }
    case 'ease-out-back': {
      const c = 1.70158;
      return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
    }
    case 'ease-in-out-back': {
      const c = 1.70158 * 1.525;
      return t < 0.5
        ? (Math.pow(2 * t, 2) * ((c + 1) * 2 * t - c)) / 2
        : (Math.pow(2 * t - 2, 2) * ((c + 1) * (t * 2 - 2) + c) + 2) / 2;
    }
    case 'ease-in-elastic': {
      if (t === 0 || t === 1) return t;
      return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (2 * Math.PI / 3));
    }
    case 'ease-out-elastic': {
      if (t === 0 || t === 1) return t;
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
    }
    case 'ease-in-out-elastic': {
      if (t === 0 || t === 1) return t;
      return t < 0.5
        ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI / 4.5))) / 2
        : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI / 4.5))) / 2 + 1;
    }
    case 'ease-out-bounce': {
      if (t < 1 / 2.75) return 7.5625 * t * t;
      if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
      if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
    case 'ease-in-bounce': return 1 - easingFunction(1 - t, 'ease-out-bounce');
    case 'ease-in-out-bounce':
      return t < 0.5
        ? (1 - easingFunction(1 - 2 * t, 'ease-out-bounce')) / 2
        : (1 + easingFunction(2 * t - 1, 'ease-out-bounce')) / 2;
    default: return t;
  }
}

// =============================================================================
// Transition Engine Class
// =============================================================================

export class TransitionEngine {
  private transitions: Map<string, TransitionPreset> = new Map();
  private scrollAnimations: Map<string, ScrollAnimationConfig> = new Map();
  private microInteractions: Map<string, MicroInteraction> = new Map();
  private activeAnimations: Map<string, AnimationState> = new Map();
  private observers: Map<string, IntersectionObserver> = new Map();
  private listeners: Map<string, Array<(data: unknown) => void>> = new Map();
  private frameId: number | null = null;
  private scrollHandlers: Map<string, () => void> = new Map();

  constructor() {
    this.initializePresets();
    this.initializeMicroInteractions();
  }

  // ---------------------------------------------------------------------------
  // Transition Presets
  // ---------------------------------------------------------------------------

  getPreset(name: string): TransitionPreset | undefined {
    return this.transitions.get(name);
  }

  getAllPresets(): TransitionPreset[] {
    return Array.from(this.transitions.values());
  }

  getPresetsByCategory(category: string): TransitionPreset[] {
    return this.getAllPresets().filter(p => p.category === category);
  }

  createPreset(preset: TransitionPreset): void {
    this.transitions.set(preset.name, preset);
    this.emit('preset:created', { preset });
  }

  // ---------------------------------------------------------------------------
  // CSS Keyframe Generation
  // ---------------------------------------------------------------------------

  generateKeyframes(type: TransitionType, config: Partial<TransitionConfig> = {}): string {
    const name = `transition-${type}-${Date.now()}`;

    switch (type) {
      case 'fade':
        return this.buildKeyframes(name, [
          { offset: 0, opacity: 0 },
          { offset: 1, opacity: 1 },
        ]);
      case 'slide-left':
        return this.buildKeyframes(name, [
          { offset: 0, transform: 'translateX(-100%)', opacity: 0 },
          { offset: 1, transform: 'translateX(0)', opacity: 1 },
        ]);
      case 'slide-right':
        return this.buildKeyframes(name, [
          { offset: 0, transform: 'translateX(100%)', opacity: 0 },
          { offset: 1, transform: 'translateX(0)', opacity: 1 },
        ]);
      case 'slide-up':
        return this.buildKeyframes(name, [
          { offset: 0, transform: 'translateY(100%)', opacity: 0 },
          { offset: 1, transform: 'translateY(0)', opacity: 1 },
        ]);
      case 'slide-down':
        return this.buildKeyframes(name, [
          { offset: 0, transform: 'translateY(-100%)', opacity: 0 },
          { offset: 1, transform: 'translateY(0)', opacity: 1 },
        ]);
      case 'scale':
        return this.buildKeyframes(name, [
          { offset: 0, transform: 'scale(0)', opacity: 0 },
          { offset: 1, transform: 'scale(1)', opacity: 1 },
        ]);
      case 'scale-up':
        return this.buildKeyframes(name, [
          { offset: 0, transform: 'scale(0.5)', opacity: 0 },
          { offset: 0.6, opacity: 1 },
          { offset: 1, transform: 'scale(1)' },
        ]);
      case 'scale-down':
        return this.buildKeyframes(name, [
          { offset: 0, transform: 'scale(1.5)', opacity: 0 },
          { offset: 1, transform: 'scale(1)', opacity: 1 },
        ]);
      case 'rotate':
        return this.buildKeyframes(name, [
          { offset: 0, transform: 'rotate(-180deg) scale(0)', opacity: 0 },
          { offset: 1, transform: 'rotate(0) scale(1)', opacity: 1 },
        ]);
      case 'flip-x':
        return this.buildKeyframes(name, [
          { offset: 0, transform: 'perspective(400px) rotateX(90deg)', opacity: 0 },
          { offset: 0.4, transform: 'perspective(400px) rotateX(-20deg)' },
          { offset: 0.6, transform: 'perspective(400px) rotateX(10deg)', opacity: 1 },
          { offset: 0.8, transform: 'perspective(400px) rotateX(-5deg)' },
          { offset: 1, transform: 'perspective(400px) rotateX(0deg)' },
        ]);
      case 'flip-y':
        return this.buildKeyframes(name, [
          { offset: 0, transform: 'perspective(400px) rotateY(90deg)', opacity: 0 },
          { offset: 0.4, transform: 'perspective(400px) rotateY(-20deg)' },
          { offset: 0.6, transform: 'perspective(400px) rotateY(10deg)', opacity: 1 },
          { offset: 0.8, transform: 'perspective(400px) rotateY(-5deg)' },
          { offset: 1, transform: 'perspective(400px) rotateY(0deg)' },
        ]);
      case 'zoom-in':
        return this.buildKeyframes(name, [
          { offset: 0, transform: 'scale(0.3)', opacity: 0 },
          { offset: 0.5, opacity: 1 },
          { offset: 1, transform: 'scale(1)' },
        ]);
      case 'zoom-out':
        return this.buildKeyframes(name, [
          { offset: 0, transform: 'scale(1.3)', opacity: 0 },
          { offset: 0.5, opacity: 1 },
          { offset: 1, transform: 'scale(1)' },
        ]);
      case 'blur':
        return this.buildKeyframes(name, [
          { offset: 0, filter: 'blur(20px)', opacity: 0 },
          { offset: 1, filter: 'blur(0px)', opacity: 1 },
        ]);
      case 'bounce':
        return this.buildKeyframes(name, [
          { offset: 0, transform: 'translateY(-100%)', opacity: 0 },
          { offset: 0.6, transform: 'translateY(0)', opacity: 1 },
          { offset: 0.75, transform: 'translateY(-15%)' },
          { offset: 0.9, transform: 'translateY(0)' },
          { offset: 0.95, transform: 'translateY(-5%)' },
          { offset: 1, transform: 'translateY(0)' },
        ]);
      case 'elastic':
        return this.buildKeyframes(name, [
          { offset: 0, transform: 'scale(0)', opacity: 0 },
          { offset: 0.55, transform: 'scale(1.1)', opacity: 1 },
          { offset: 0.75, transform: 'scale(0.95)' },
          { offset: 0.87, transform: 'scale(1.03)' },
          { offset: 0.95, transform: 'scale(0.99)' },
          { offset: 1, transform: 'scale(1)' },
        ]);
      case 'swing':
        return this.buildKeyframes(name, [
          { offset: 0, transform: 'rotate(15deg)' },
          { offset: 0.2, transform: 'rotate(-10deg)' },
          { offset: 0.4, transform: 'rotate(5deg)' },
          { offset: 0.6, transform: 'rotate(-5deg)' },
          { offset: 0.8, transform: 'rotate(2deg)' },
          { offset: 1, transform: 'rotate(0deg)' },
        ]);
      case 'dissolve':
        return this.buildKeyframes(name, [
          { offset: 0, opacity: 0, filter: 'blur(10px) saturate(0)' },
          { offset: 0.5, opacity: 0.5, filter: 'blur(5px) saturate(0.5)' },
          { offset: 1, opacity: 1, filter: 'blur(0px) saturate(1)' },
        ]);
      case 'wipe-left':
        return this.buildKeyframes(name, [
          { offset: 0, 'clip-path': 'inset(0 100% 0 0)' },
          { offset: 1, 'clip-path': 'inset(0 0 0 0)' },
        ]);
      case 'wipe-right':
        return this.buildKeyframes(name, [
          { offset: 0, 'clip-path': 'inset(0 0 0 100%)' },
          { offset: 1, 'clip-path': 'inset(0 0 0 0)' },
        ]);
      case 'wipe-up':
        return this.buildKeyframes(name, [
          { offset: 0, 'clip-path': 'inset(100% 0 0 0)' },
          { offset: 1, 'clip-path': 'inset(0 0 0 0)' },
        ]);
      case 'wipe-down':
        return this.buildKeyframes(name, [
          { offset: 0, 'clip-path': 'inset(0 0 100% 0)' },
          { offset: 1, 'clip-path': 'inset(0 0 0 0)' },
        ]);
      case 'iris':
        return this.buildKeyframes(name, [
          { offset: 0, 'clip-path': 'circle(0% at 50% 50%)' },
          { offset: 1, 'clip-path': 'circle(100% at 50% 50%)' },
        ]);
      case 'curtain':
        return this.buildKeyframes(name, [
          { offset: 0, 'clip-path': 'polygon(50% 0, 50% 0, 50% 100%, 50% 100%)' },
          { offset: 1, 'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
        ]);
      case 'fold':
        return this.buildKeyframes(name, [
          { offset: 0, transform: 'perspective(800px) rotateY(-90deg)', opacity: 0 },
          { offset: 0.4, transform: 'perspective(800px) rotateY(-20deg)', opacity: 0.5 },
          { offset: 1, transform: 'perspective(800px) rotateY(0)', opacity: 1 },
        ]);
      case 'unfold':
        return this.buildKeyframes(name, [
          { offset: 0, transform: 'perspective(800px) rotateX(-90deg)', opacity: 0 },
          { offset: 0.4, transform: 'perspective(800px) rotateX(-20deg)', opacity: 0.5 },
          { offset: 1, transform: 'perspective(800px) rotateX(0)', opacity: 1 },
        ]);
      case 'glitch':
        return this.buildKeyframes(name, [
          { offset: 0, transform: 'translate(0)' },
          { offset: 0.1, transform: 'translate(-5px, 5px)' },
          { offset: 0.2, transform: 'translate(5px, -5px)' },
          { offset: 0.3, transform: 'translate(-3px, 3px)' },
          { offset: 0.4, transform: 'translate(3px, -3px)' },
          { offset: 0.5, transform: 'translate(0)' },
          { offset: 0.6, transform: 'translate(5px, 0)' },
          { offset: 0.7, transform: 'translate(-5px, 0)' },
          { offset: 0.8, transform: 'translate(0, 5px)' },
          { offset: 0.9, transform: 'translate(0, -5px)' },
          { offset: 1, transform: 'translate(0)' },
        ]);
      case 'reveal':
        return this.buildKeyframes(name, [
          { offset: 0, 'clip-path': 'polygon(0 0, 0 0, 0 100%, 0 100%)', opacity: 0.5 },
          { offset: 1, 'clip-path': 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', opacity: 1 },
        ]);
      default:
        return this.buildKeyframes(name, [
          { offset: 0, opacity: 0 },
          { offset: 1, opacity: 1 },
        ]);
    }
  }

  generateTransitionCSS(config: TransitionConfig): string {
    const easing = config.customEasing || EASING_CURVES[config.easing] || 'ease';
    const keyframeName = `t-${config.type}`;
    const keyframes = this.generateKeyframes(config.type, config);

    let css = keyframes;
    css += `.${keyframeName} {\n`;
    css += `  animation-name: ${keyframeName};\n`;
    css += `  animation-duration: ${config.duration}ms;\n`;
    css += `  animation-delay: ${config.delay}ms;\n`;
    css += `  animation-timing-function: ${easing};\n`;
    css += `  animation-direction: ${config.direction};\n`;
    css += `  animation-fill-mode: ${config.fillMode};\n`;
    css += `  animation-iteration-count: ${config.iterationCount};\n`;
    if (config.origin) css += `  transform-origin: ${config.origin};\n`;
    if (config.perspective) css += `  perspective: ${config.perspective}px;\n`;
    css += `}\n`;

    return css;
  }

  // ---------------------------------------------------------------------------
  // Scroll Animations
  // ---------------------------------------------------------------------------

  createScrollAnimation(id: string, config: ScrollAnimationConfig): void {
    this.scrollAnimations.set(id, config);
    this.emit('scroll:created', { id, config });
  }

  removeScrollAnimation(id: string): void {
    this.scrollAnimations.delete(id);
    const observer = this.observers.get(id);
    if (observer) {
      observer.disconnect();
      this.observers.delete(id);
    }
    this.emit('scroll:removed', { id });
  }

  getAllScrollAnimations(): Array<{ id: string; config: ScrollAnimationConfig }> {
    return Array.from(this.scrollAnimations.entries()).map(([id, config]) => ({ id, config }));
  }

  generateScrollCSS(id: string): string {
    const config = this.scrollAnimations.get(id);
    if (!config) return '';

    const keyframes = this.generateKeyframes(config.animation.type);
    const easing = config.animation.customEasing || EASING_CURVES[config.animation.easing] || 'ease';

    let css = keyframes;
    css += `\n.scroll-animate-${id} {\n`;
    css += `  opacity: 0;\n`;
    css += `  transition: opacity ${config.animation.duration}ms ${easing} ${config.animation.delay}ms;\n`;
    css += `}\n`;
    css += `.scroll-animate-${id}.is-visible {\n`;
    css += `  animation: ${id} ${config.animation.duration}ms ${easing} ${config.animation.delay}ms ${config.animation.fillMode};\n`;
    css += `  opacity: 1;\n`;
    css += `}\n`;

    return css;
  }

  // ---------------------------------------------------------------------------
  // Parallax
  // ---------------------------------------------------------------------------

  generateParallaxCSS(config: ParallaxConfig, id: string): string {
    let css = `.parallax-${id} {\n`;
    css += `  will-change: transform;\n`;

    if (config.direction === 'vertical') {
      css += `  transform: translateY(calc(var(--scroll-y, 0) * ${config.speed}));\n`;
    } else if (config.direction === 'horizontal') {
      css += `  transform: translateX(calc(var(--scroll-x, 0) * ${config.speed}));\n`;
    } else {
      css += `  transform: translate(calc(var(--scroll-x, 0) * ${config.speed}), calc(var(--scroll-y, 0) * ${config.speed}));\n`;
    }

    if (config.scale) {
      css += `  transform: scale(calc(1 + var(--scroll-progress, 0) * ${config.speed * 0.1}));\n`;
    }
    if (config.rotation) {
      css += `  transform: rotate(calc(var(--scroll-progress, 0) * ${config.rotation}deg));\n`;
    }

    const easing = EASING_CURVES[config.easing] || 'ease';
    css += `  transition: transform 0.1s ${easing};\n`;
    
    if (!config.overflow) {
      css += `  overflow: hidden;\n`;
    }

    css += `}\n`;
    return css;
  }

  // ---------------------------------------------------------------------------
  // Micro Interactions
  // ---------------------------------------------------------------------------

  getMicroInteraction(name: string): MicroInteraction | undefined {
    return this.microInteractions.get(name);
  }

  getAllMicroInteractions(): MicroInteraction[] {
    return Array.from(this.microInteractions.values());
  }

  createMicroInteraction(interaction: MicroInteraction): void {
    this.microInteractions.set(interaction.name, interaction);
    this.emit('interaction:created', { interaction });
  }

  generateMicroInteractionCSS(interaction: MicroInteraction): string {
    let css = '';
    const baseName = interaction.name.toLowerCase().replace(/\s+/g, '-');

    // Base state
    css += `.mi-${baseName} {\n`;
    css += `  transition: all ${interaction.duration}ms ${EASING_CURVES[interaction.easing] || 'ease'};\n`;
    css += `}\n\n`;

    // Trigger states
    const triggerSelector = this.getTriggerSelector(interaction.trigger);

    for (const state of interaction.states) {
      const stateEasing = state.easing ? EASING_CURVES[state.easing] : EASING_CURVES[interaction.easing];
      css += `.mi-${baseName}${triggerSelector} {\n`;
      
      if (state.duration || state.delay) {
        css += `  transition: all ${state.duration || interaction.duration}ms ${stateEasing || 'ease'} ${state.delay || 0}ms;\n`;
      }

      for (const [prop, value] of Object.entries(state.properties)) {
        css += `  ${prop}: ${value};\n`;
      }
      css += `}\n\n`;
    }

    return css;
  }

  // ---------------------------------------------------------------------------
  // Stagger Animation
  // ---------------------------------------------------------------------------

  generateStaggerCSS(parentSelector: string, childSelector: string, config: TransitionConfig, childCount = 10): string {
    const easing = config.customEasing || EASING_CURVES[config.easing] || 'ease';
    const keyframes = this.generateKeyframes(config.type);
    const stagger = config.stagger || 100;

    let css = keyframes;
    css += `\n${parentSelector} ${childSelector} {\n`;
    css += `  animation: ${config.type} ${config.duration}ms ${easing} ${config.fillMode || 'both'};\n`;
    css += `}\n\n`;

    for (let i = 0; i < childCount; i++) {
      css += `${parentSelector} ${childSelector}:nth-child(${i + 1}) {\n`;
      css += `  animation-delay: ${config.delay + i * stagger}ms;\n`;
      css += `}\n`;
    }

    return css;
  }

  // ---------------------------------------------------------------------------
  // Page Transition
  // ---------------------------------------------------------------------------

  generatePageTransitionCSS(enterType: TransitionType, exitType: TransitionType, duration = 300): string {
    const enterKeyframes = this.generateKeyframes(enterType);
    const exitConfig = this.getExitVariant(exitType);
    const exitKeyframes = this.buildKeyframes(`exit-${exitType}`, exitConfig);
    const easing = EASING_CURVES['ease-in-out-cubic'];

    let css = '/* Page Transition Styles */\n';
    css += enterKeyframes;
    css += exitKeyframes;

    css += `\n.page-enter {\n`;
    css += `  animation: enter-${enterType} ${duration}ms ${easing} both;\n`;
    css += `}\n`;
    css += `.page-exit {\n`;
    css += `  animation: exit-${exitType} ${duration}ms ${easing} both;\n`;
    css += `}\n`;

    return css;
  }

  // ---------------------------------------------------------------------------
  // Reveal Animations (Scroll-triggered)
  // ---------------------------------------------------------------------------

  generateRevealCSS(preset: RevealPreset): string {
    let css = `/* Reveal: ${preset.name} */\n`;
    css += `.reveal-${preset.name} {\n`;
    
    if (preset.initialState.opacity !== undefined) css += `  opacity: ${preset.initialState.opacity};\n`;
    if (preset.initialState.transform) css += `  transform: ${preset.initialState.transform};\n`;
    if (preset.initialState.filter) css += `  filter: ${preset.initialState.filter};\n`;

    const easing = EASING_CURVES[preset.easing] || 'ease';
    css += `  transition: all ${preset.duration}ms ${easing} ${preset.delay}ms;\n`;
    css += `}\n`;

    css += `.reveal-${preset.name}.revealed {\n`;
    if (preset.finalState.opacity !== undefined) css += `  opacity: ${preset.finalState.opacity};\n`;
    if (preset.finalState.transform) css += `  transform: ${preset.finalState.transform};\n`;
    if (preset.finalState.filter) css += `  filter: ${preset.finalState.filter};\n`;
    css += `}\n\n`;

    return css;
  }

  // ---------------------------------------------------------------------------
  // Loading States
  // ---------------------------------------------------------------------------

  generateLoadingCSS(type: LoadingType): string {
    switch (type) {
      case 'spinner':
        return `@keyframes spin { to { transform: rotate(360deg); } }\n.loading-spinner { width: 40px; height: 40px; border: 3px solid rgba(0,0,0,0.1); border-top-color: currentColor; border-radius: 50%; animation: spin 0.8s linear infinite; }\n`;
      case 'dots':
        return `@keyframes dot-bounce { 0%, 100% { transform: scale(0); } 50% { transform: scale(1); } }\n.loading-dots span { display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: currentColor; animation: dot-bounce 1.4s infinite ease-in-out; }\n.loading-dots span:nth-child(1) { animation-delay: -0.32s; }\n.loading-dots span:nth-child(2) { animation-delay: -0.16s; }\n`;
      case 'pulse':
        return `@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }\n.loading-pulse { animation: pulse 2s ease-in-out infinite; }\n`;
      case 'skeleton':
        return `@keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }\n.loading-skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; }\n`;
      case 'progress':
        return `@keyframes progress { from { transform: translateX(-100%); } to { transform: translateX(100%); } }\n.loading-progress { overflow: hidden; height: 4px; background: rgba(0,0,0,0.1); }\n.loading-progress::after { content: ''; display: block; width: 50%; height: 100%; background: currentColor; animation: progress 1.5s infinite; }\n`;
      case 'wave':
        return `@keyframes wave { 0%, 40%, 100% { transform: scaleY(0.4); } 20% { transform: scaleY(1); } }\n.loading-wave span { display: inline-block; width: 4px; height: 20px; margin: 0 2px; background: currentColor; animation: wave 1.2s infinite ease-in-out; }\n.loading-wave span:nth-child(1) { animation-delay: -1.2s; }\n.loading-wave span:nth-child(2) { animation-delay: -1.1s; }\n.loading-wave span:nth-child(3) { animation-delay: -1.0s; }\n.loading-wave span:nth-child(4) { animation-delay: -0.9s; }\n.loading-wave span:nth-child(5) { animation-delay: -0.8s; }\n`;
      default:
        return '';
    }
  }

  // ---------------------------------------------------------------------------
  // Export All
  // ---------------------------------------------------------------------------

  exportAllCSS(): string {
    let css = '/* ===================================== */\n';
    css += '/* Transition Engine - Generated Styles   */\n';
    css += '/* ===================================== */\n\n';

    // Presets
    for (const preset of this.transitions.values()) {
      css += this.generateTransitionCSS(preset.config);
      css += '\n';
    }

    // Scroll animations
    for (const [id] of this.scrollAnimations) {
      css += this.generateScrollCSS(id);
      css += '\n';
    }

    // Micro interactions
    for (const interaction of this.microInteractions.values()) {
      css += this.generateMicroInteractionCSS(interaction);
    }

    // Loading states
    const loadingTypes: LoadingType[] = ['spinner', 'dots', 'pulse', 'skeleton', 'progress', 'wave'];
    css += '/* Loading States */\n';
    for (const type of loadingTypes) {
      css += this.generateLoadingCSS(type);
    }

    return css;
  }

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------

  destroy(): void {
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();

    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    this.scrollHandlers.clear();
    this.activeAnimations.clear();
    this.listeners.clear();
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private buildKeyframes(name: string, frames: Array<Record<string, string | number>>): string {
    let css = `@keyframes ${name} {\n`;
    for (const frame of frames) {
      const { offset, ...props } = frame;
      const pct = typeof offset === 'number' ? `${offset * 100}%` : offset;
      css += `  ${pct} {\n`;
      for (const [prop, value] of Object.entries(props)) {
        css += `    ${prop}: ${value};\n`;
      }
      css += `  }\n`;
    }
    css += `}\n`;
    return css;
  }

  private getExitVariant(type: TransitionType): Array<Record<string, string | number>> {
    switch (type) {
      case 'fade': return [{ offset: 0, opacity: 1 }, { offset: 1, opacity: 0 }];
      case 'slide-left': return [{ offset: 0, transform: 'translateX(0)', opacity: 1 }, { offset: 1, transform: 'translateX(-100%)', opacity: 0 }];
      case 'slide-right': return [{ offset: 0, transform: 'translateX(0)', opacity: 1 }, { offset: 1, transform: 'translateX(100%)', opacity: 0 }];
      case 'slide-up': return [{ offset: 0, transform: 'translateY(0)', opacity: 1 }, { offset: 1, transform: 'translateY(-100%)', opacity: 0 }];
      case 'slide-down': return [{ offset: 0, transform: 'translateY(0)', opacity: 1 }, { offset: 1, transform: 'translateY(100%)', opacity: 0 }];
      case 'scale': return [{ offset: 0, transform: 'scale(1)', opacity: 1 }, { offset: 1, transform: 'scale(0)', opacity: 0 }];
      case 'zoom-out': return [{ offset: 0, transform: 'scale(1)', opacity: 1 }, { offset: 1, transform: 'scale(0.3)', opacity: 0 }];
      default: return [{ offset: 0, opacity: 1 }, { offset: 1, opacity: 0 }];
    }
  }

  private getTriggerSelector(trigger: InteractionTrigger): string {
    switch (trigger) {
      case 'hover': return ':hover';
      case 'click':
      case 'active': return ':active';
      case 'focus': return ':focus';
      case 'tap': return ':active';
      default: return '.is-active';
    }
  }

  private initializePresets(): void {
    const presets: TransitionPreset[] = [
      { name: 'Fade In', category: 'Basic', config: { type: 'fade', duration: 300, delay: 0, easing: 'ease-out', direction: 'normal', fillMode: 'both', iterationCount: 1 } },
      { name: 'Slide In Left', category: 'Slide', config: { type: 'slide-left', duration: 400, delay: 0, easing: 'ease-out-cubic', direction: 'normal', fillMode: 'both', iterationCount: 1 } },
      { name: 'Slide In Right', category: 'Slide', config: { type: 'slide-right', duration: 400, delay: 0, easing: 'ease-out-cubic', direction: 'normal', fillMode: 'both', iterationCount: 1 } },
      { name: 'Slide In Up', category: 'Slide', config: { type: 'slide-up', duration: 400, delay: 0, easing: 'ease-out-cubic', direction: 'normal', fillMode: 'both', iterationCount: 1 } },
      { name: 'Slide In Down', category: 'Slide', config: { type: 'slide-down', duration: 400, delay: 0, easing: 'ease-out-cubic', direction: 'normal', fillMode: 'both', iterationCount: 1 } },
      { name: 'Scale In', category: 'Scale', config: { type: 'scale', duration: 300, delay: 0, easing: 'ease-out-back', direction: 'normal', fillMode: 'both', iterationCount: 1 } },
      { name: 'Scale Up', category: 'Scale', config: { type: 'scale-up', duration: 500, delay: 0, easing: 'ease-out-cubic', direction: 'normal', fillMode: 'both', iterationCount: 1 } },
      { name: 'Flip X', category: '3D', config: { type: 'flip-x', duration: 600, delay: 0, easing: 'ease-in-out', direction: 'normal', fillMode: 'both', iterationCount: 1, perspective: 400 } },
      { name: 'Flip Y', category: '3D', config: { type: 'flip-y', duration: 600, delay: 0, easing: 'ease-in-out', direction: 'normal', fillMode: 'both', iterationCount: 1, perspective: 400 } },
      { name: 'Zoom In', category: 'Zoom', config: { type: 'zoom-in', duration: 400, delay: 0, easing: 'ease-out-cubic', direction: 'normal', fillMode: 'both', iterationCount: 1 } },
      { name: 'Zoom Out', category: 'Zoom', config: { type: 'zoom-out', duration: 400, delay: 0, easing: 'ease-out-cubic', direction: 'normal', fillMode: 'both', iterationCount: 1 } },
      { name: 'Blur In', category: 'Filter', config: { type: 'blur', duration: 400, delay: 0, easing: 'ease-out', direction: 'normal', fillMode: 'both', iterationCount: 1 } },
      { name: 'Bounce', category: 'Special', config: { type: 'bounce', duration: 800, delay: 0, easing: 'ease-out', direction: 'normal', fillMode: 'both', iterationCount: 1 } },
      { name: 'Elastic', category: 'Special', config: { type: 'elastic', duration: 600, delay: 0, easing: 'ease-out', direction: 'normal', fillMode: 'both', iterationCount: 1 } },
      { name: 'Swing', category: 'Special', config: { type: 'swing', duration: 800, delay: 0, easing: 'ease-in-out', direction: 'normal', fillMode: 'both', iterationCount: 1, origin: 'top center' } },
      { name: 'Dissolve', category: 'Filter', config: { type: 'dissolve', duration: 500, delay: 0, easing: 'ease-in-out', direction: 'normal', fillMode: 'both', iterationCount: 1 } },
      { name: 'Wipe Left', category: 'Wipe', config: { type: 'wipe-left', duration: 500, delay: 0, easing: 'ease-in-out', direction: 'normal', fillMode: 'both', iterationCount: 1 } },
      { name: 'Wipe Right', category: 'Wipe', config: { type: 'wipe-right', duration: 500, delay: 0, easing: 'ease-in-out', direction: 'normal', fillMode: 'both', iterationCount: 1 } },
      { name: 'Iris', category: 'Mask', config: { type: 'iris', duration: 600, delay: 0, easing: 'ease-in-out', direction: 'normal', fillMode: 'both', iterationCount: 1 } },
      { name: 'Curtain', category: 'Mask', config: { type: 'curtain', duration: 600, delay: 0, easing: 'ease-in-out', direction: 'normal', fillMode: 'both', iterationCount: 1 } },
      { name: 'Fold', category: '3D', config: { type: 'fold', duration: 600, delay: 0, easing: 'ease-out', direction: 'normal', fillMode: 'both', iterationCount: 1, perspective: 800 } },
      { name: 'Glitch', category: 'Special', config: { type: 'glitch', duration: 400, delay: 0, easing: 'linear', direction: 'normal', fillMode: 'both', iterationCount: 1 } },
      { name: 'Reveal', category: 'Mask', config: { type: 'reveal', duration: 800, delay: 0, easing: 'ease-out-cubic', direction: 'normal', fillMode: 'both', iterationCount: 1 } },
    ];

    for (const preset of presets) {
      this.transitions.set(preset.name, preset);
    }
  }

  private initializeMicroInteractions(): void {
    const interactions: MicroInteraction[] = [
      {
        name: 'Button Hover Scale',
        trigger: 'hover',
        states: [{ name: 'hovered', properties: { transform: 'scale(1.05)', 'box-shadow': '0 4px 12px rgba(0,0,0,0.15)' } }],
        duration: 200,
        easing: 'ease-out',
        resetOnLeave: true,
      },
      {
        name: 'Button Press',
        trigger: 'active',
        states: [{ name: 'pressed', properties: { transform: 'scale(0.95)' } }],
        duration: 100,
        easing: 'ease-in',
        resetOnLeave: true,
      },
      {
        name: 'Card Hover Lift',
        trigger: 'hover',
        states: [{ name: 'lifted', properties: { transform: 'translateY(-4px)', 'box-shadow': '0 12px 24px rgba(0,0,0,0.12)' } }],
        duration: 300,
        easing: 'ease-out-cubic',
        resetOnLeave: true,
      },
      {
        name: 'Icon Spin',
        trigger: 'hover',
        states: [{ name: 'spinning', properties: { transform: 'rotate(360deg)' } }],
        duration: 500,
        easing: 'ease-in-out',
        resetOnLeave: true,
      },
      {
        name: 'Input Focus Glow',
        trigger: 'focus',
        states: [{ name: 'focused', properties: { 'box-shadow': '0 0 0 3px rgba(66, 153, 225, 0.5)', 'border-color': '#4299e1' } }],
        duration: 200,
        easing: 'ease-out',
        resetOnLeave: true,
      },
      {
        name: 'Link Underline Slide',
        trigger: 'hover',
        states: [{ name: 'hovered', properties: { 'background-size': '100% 2px' } }],
        duration: 300,
        easing: 'ease-in-out',
        resetOnLeave: true,
      },
      {
        name: 'Toggle Switch',
        trigger: 'click',
        states: [{ name: 'active', properties: { transform: 'translateX(24px)', 'background-color': '#48bb78' } }],
        duration: 200,
        easing: 'spring',
        resetOnLeave: false,
      },
      {
        name: 'Checkbox Check',
        trigger: 'click',
        states: [{ name: 'checked', properties: { transform: 'scale(1)', opacity: '1' }, duration: 300, easing: 'ease-out-back' }],
        duration: 300,
        easing: 'ease-out-back',
        resetOnLeave: false,
      },
      {
        name: 'Notification Slide',
        trigger: 'load',
        states: [{ name: 'visible', properties: { transform: 'translateX(0)', opacity: '1' } }],
        duration: 400,
        easing: 'ease-out-cubic',
        resetOnLeave: false,
      },
      {
        name: 'Tooltip Fade',
        trigger: 'hover',
        states: [{ name: 'visible', properties: { opacity: '1', transform: 'translateY(0)', visibility: 'visible' } }],
        duration: 200,
        easing: 'ease-out',
        resetOnLeave: true,
      },
    ];

    for (const interaction of interactions) {
      this.microInteractions.set(interaction.name, interaction);
    }
  }

  on(event: string, handler: (data: unknown) => void): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(handler);
    return () => {
      const handlers = this.listeners.get(event);
      if (handlers) {
        const idx = handlers.indexOf(handler);
        if (idx >= 0) handlers.splice(idx, 1);
      }
    };
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.listeners.get(event);
    if (handlers) handlers.forEach(h => { try { h(data); } catch (e) { console.error(e); } });
  }
}

// =============================================================================
// Types (continued)
// =============================================================================

export interface TransitionPreset {
  name: string;
  category: string;
  config: TransitionConfig;
}

export interface AnimationState {
  id: string;
  element?: Element;
  startTime: number;
  duration: number;
  progress: number;
  paused: boolean;
  completed: boolean;
}

export interface RevealPreset {
  name: string;
  initialState: { opacity?: number; transform?: string; filter?: string };
  finalState: { opacity?: number; transform?: string; filter?: string };
  duration: number;
  delay: number;
  easing: EasingFunction;
}

export type LoadingType = 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'progress' | 'wave';

// =============================================================================
// Reveal Presets
// =============================================================================

export const REVEAL_PRESETS: RevealPreset[] = [
  { name: 'fade-up', initialState: { opacity: 0, transform: 'translateY(30px)' }, finalState: { opacity: 1, transform: 'translateY(0)' }, duration: 600, delay: 0, easing: 'ease-out-cubic' },
  { name: 'fade-down', initialState: { opacity: 0, transform: 'translateY(-30px)' }, finalState: { opacity: 1, transform: 'translateY(0)' }, duration: 600, delay: 0, easing: 'ease-out-cubic' },
  { name: 'fade-left', initialState: { opacity: 0, transform: 'translateX(-30px)' }, finalState: { opacity: 1, transform: 'translateX(0)' }, duration: 600, delay: 0, easing: 'ease-out-cubic' },
  { name: 'fade-right', initialState: { opacity: 0, transform: 'translateX(30px)' }, finalState: { opacity: 1, transform: 'translateX(0)' }, duration: 600, delay: 0, easing: 'ease-out-cubic' },
  { name: 'scale-up', initialState: { opacity: 0, transform: 'scale(0.8)' }, finalState: { opacity: 1, transform: 'scale(1)' }, duration: 500, delay: 0, easing: 'ease-out-back' },
  { name: 'scale-down', initialState: { opacity: 0, transform: 'scale(1.2)' }, finalState: { opacity: 1, transform: 'scale(1)' }, duration: 500, delay: 0, easing: 'ease-out-cubic' },
  { name: 'rotate-in', initialState: { opacity: 0, transform: 'rotate(-10deg) scale(0.9)' }, finalState: { opacity: 1, transform: 'rotate(0) scale(1)' }, duration: 600, delay: 0, easing: 'ease-out-cubic' },
  { name: 'blur-in', initialState: { opacity: 0, filter: 'blur(10px)' }, finalState: { opacity: 1, filter: 'blur(0)' }, duration: 500, delay: 0, easing: 'ease-out' },
  { name: 'flip-in-x', initialState: { opacity: 0, transform: 'perspective(400px) rotateX(-90deg)' }, finalState: { opacity: 1, transform: 'perspective(400px) rotateX(0)' }, duration: 700, delay: 0, easing: 'ease-out-cubic' },
  { name: 'flip-in-y', initialState: { opacity: 0, transform: 'perspective(400px) rotateY(-90deg)' }, finalState: { opacity: 1, transform: 'perspective(400px) rotateY(0)' }, duration: 700, delay: 0, easing: 'ease-out-cubic' },
  { name: 'zoom-in-spin', initialState: { opacity: 0, transform: 'scale(0) rotate(360deg)' }, finalState: { opacity: 1, transform: 'scale(1) rotate(0deg)' }, duration: 800, delay: 0, easing: 'ease-out-back' },
  { name: 'slide-up-fade', initialState: { opacity: 0, transform: 'translateY(50px)' }, finalState: { opacity: 1, transform: 'translateY(0)' }, duration: 500, delay: 100, easing: 'ease-out-quart' },
];

// =============================================================================
// Singleton Instance
// =============================================================================

export const transitionEngine = new TransitionEngine();
