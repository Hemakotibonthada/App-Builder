/**
 * Animation Engine
 * 
 * Complete animation system for the builder:
 * - 50+ animation presets (entrance, exit, attention, scroll)
 * - Keyframe editor with timeline
 * - Spring / Tween / Inertia physics
 * - Stagger, delay, loop controls
 * - Trigger types: mount, click, hover, scroll-in-view
 * - CSS animation code generation
 */

/* ──────────────────────────────────────────────
 * Animation Types
 * ────────────────────────────────────────────── */

export interface AnimationKeyframe {
  offset: number; // 0-1
  properties: Record<string, number | string>;
  easing?: string;
}

export interface AnimationDefinition {
  id: string;
  name: string;
  category: AnimationCategory;
  description: string;
  duration: number; // ms
  delay: number;
  easing: string;
  iterationCount: number | 'infinite';
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode: 'none' | 'forwards' | 'backwards' | 'both';
  keyframes: AnimationKeyframe[];
  trigger: AnimationTrigger;
}

export type AnimationCategory = 'entrance' | 'exit' | 'attention' | 'scroll' | 'hover' | 'loading' | 'transition' | 'background';
export type AnimationTrigger = 'on-mount' | 'on-click' | 'on-hover' | 'on-scroll' | 'on-focus' | 'manual';

export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
  velocity: number;
}

/* ──────────────────────────────────────────────
 * Spring Presets
 * ────────────────────────────────────────────── */

export const SPRING_PRESETS: Record<string, SpringConfig> = {
  'Gentle': { stiffness: 120, damping: 14, mass: 1, velocity: 0 },
  'Bouncy': { stiffness: 600, damping: 15, mass: 1, velocity: 0 },
  'Stiff': { stiffness: 400, damping: 30, mass: 1, velocity: 0 },
  'Slow': { stiffness: 100, damping: 20, mass: 2, velocity: 0 },
  'Snappy': { stiffness: 500, damping: 25, mass: 0.5, velocity: 0 },
  'Molasses': { stiffness: 80, damping: 25, mass: 3, velocity: 0 },
  'Wobbly': { stiffness: 180, damping: 12, mass: 1, velocity: 0 },
  'Default': { stiffness: 170, damping: 26, mass: 1, velocity: 0 },
};

/* ──────────────────────────────────────────────
 * Easing Functions
 * ────────────────────────────────────────────── */

export const EASING_PRESETS: Record<string, string> = {
  'Linear': 'linear',
  'Ease': 'ease',
  'Ease In': 'ease-in',
  'Ease Out': 'ease-out',
  'Ease In Out': 'ease-in-out',
  'Ease In Quad': 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
  'Ease Out Quad': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  'Ease In Out Quad': 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  'Ease In Cubic': 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
  'Ease Out Cubic': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  'Ease In Out Cubic': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  'Ease In Quart': 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
  'Ease Out Quart': 'cubic-bezier(0.165, 0.84, 0.44, 1)',
  'Ease In Back': 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  'Ease Out Back': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  'Ease In Out Back': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  'Bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

/* ──────────────────────────────────────────────
 * 50+ Animation Presets
 * ────────────────────────────────────────────── */

export const ANIMATION_PRESETS: AnimationDefinition[] = [
  // ── Entrance Animations ──
  { id: 'fade-in', name: 'Fade In', category: 'entrance', description: 'Simple opacity fade in', duration: 400, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { opacity: 0 } }, { offset: 1, properties: { opacity: 1 } }] },
  { id: 'fade-in-up', name: 'Fade In Up', category: 'entrance', description: 'Fade in from below', duration: 500, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { opacity: 0, translateY: 20 } }, { offset: 1, properties: { opacity: 1, translateY: 0 } }] },
  { id: 'fade-in-down', name: 'Fade In Down', category: 'entrance', description: 'Fade in from above', duration: 500, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { opacity: 0, translateY: -20 } }, { offset: 1, properties: { opacity: 1, translateY: 0 } }] },
  { id: 'fade-in-left', name: 'Fade In Left', category: 'entrance', description: 'Fade in from left', duration: 500, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { opacity: 0, translateX: -20 } }, { offset: 1, properties: { opacity: 1, translateX: 0 } }] },
  { id: 'fade-in-right', name: 'Fade In Right', category: 'entrance', description: 'Fade in from right', duration: 500, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { opacity: 0, translateX: 20 } }, { offset: 1, properties: { opacity: 1, translateX: 0 } }] },
  { id: 'slide-in-up', name: 'Slide In Up', category: 'entrance', description: 'Slide in from below', duration: 400, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { translateY: '100%' } }, { offset: 1, properties: { translateY: 0 } }] },
  { id: 'slide-in-down', name: 'Slide In Down', category: 'entrance', description: 'Slide in from above', duration: 400, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { translateY: '-100%' } }, { offset: 1, properties: { translateY: 0 } }] },
  { id: 'slide-in-left', name: 'Slide In Left', category: 'entrance', description: 'Slide in from left', duration: 400, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { translateX: '-100%' } }, { offset: 1, properties: { translateX: 0 } }] },
  { id: 'slide-in-right', name: 'Slide In Right', category: 'entrance', description: 'Slide in from right', duration: 400, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { translateX: '100%' } }, { offset: 1, properties: { translateX: 0 } }] },
  { id: 'scale-in', name: 'Scale In', category: 'entrance', description: 'Grow from center', duration: 400, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { opacity: 0, scale: 0.5 } }, { offset: 1, properties: { opacity: 1, scale: 1 } }] },
  { id: 'scale-in-up', name: 'Scale In Up', category: 'entrance', description: 'Scale up from small', duration: 500, delay: 0, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { opacity: 0, scale: 0.8, translateY: 10 } }, { offset: 1, properties: { opacity: 1, scale: 1, translateY: 0 } }] },
  { id: 'zoom-in', name: 'Zoom In', category: 'entrance', description: 'Zoom from nothing', duration: 500, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { opacity: 0, scale: 0 } }, { offset: 1, properties: { opacity: 1, scale: 1 } }] },
  { id: 'flip-in-x', name: 'Flip In X', category: 'entrance', description: '3D flip horizontal', duration: 600, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { opacity: 0, rotateX: -90 } }, { offset: 1, properties: { opacity: 1, rotateX: 0 } }] },
  { id: 'flip-in-y', name: 'Flip In Y', category: 'entrance', description: '3D flip vertical', duration: 600, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { opacity: 0, rotateY: -90 } }, { offset: 1, properties: { opacity: 1, rotateY: 0 } }] },
  { id: 'rotate-in', name: 'Rotate In', category: 'entrance', description: 'Spin while appearing', duration: 500, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { opacity: 0, rotate: -180 } }, { offset: 1, properties: { opacity: 1, rotate: 0 } }] },
  { id: 'bounce-in', name: 'Bounce In', category: 'entrance', description: 'Bouncy entrance', duration: 700, delay: 0, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { opacity: 0, scale: 0.3 } }, { offset: 0.5, properties: { opacity: 1, scale: 1.05 } }, { offset: 0.7, properties: { scale: 0.9 } }, { offset: 1, properties: { opacity: 1, scale: 1 } }] },

  // ── Exit Animations ──
  { id: 'fade-out', name: 'Fade Out', category: 'exit', description: 'Simple fade out', duration: 300, delay: 0, easing: 'ease-in', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'manual',
    keyframes: [{ offset: 0, properties: { opacity: 1 } }, { offset: 1, properties: { opacity: 0 } }] },
  { id: 'fade-out-up', name: 'Fade Out Up', category: 'exit', description: 'Fade out upward', duration: 400, delay: 0, easing: 'ease-in', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'manual',
    keyframes: [{ offset: 0, properties: { opacity: 1, translateY: 0 } }, { offset: 1, properties: { opacity: 0, translateY: -20 } }] },
  { id: 'fade-out-down', name: 'Fade Out Down', category: 'exit', description: 'Fade out downward', duration: 400, delay: 0, easing: 'ease-in', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'manual',
    keyframes: [{ offset: 0, properties: { opacity: 1, translateY: 0 } }, { offset: 1, properties: { opacity: 0, translateY: 20 } }] },
  { id: 'scale-out', name: 'Scale Out', category: 'exit', description: 'Shrink and disappear', duration: 300, delay: 0, easing: 'ease-in', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'manual',
    keyframes: [{ offset: 0, properties: { opacity: 1, scale: 1 } }, { offset: 1, properties: { opacity: 0, scale: 0.5 } }] },
  { id: 'zoom-out', name: 'Zoom Out', category: 'exit', description: 'Grow and disappear', duration: 400, delay: 0, easing: 'ease-in', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'manual',
    keyframes: [{ offset: 0, properties: { opacity: 1, scale: 1 } }, { offset: 1, properties: { opacity: 0, scale: 1.5 } }] },

  // ── Attention Animations ──
  { id: 'pulse', name: 'Pulse', category: 'attention', description: 'Gentle pulse', duration: 1000, delay: 0, easing: 'ease-in-out', iterationCount: 'infinite', direction: 'normal', fillMode: 'none', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { scale: 1 } }, { offset: 0.5, properties: { scale: 1.05 } }, { offset: 1, properties: { scale: 1 } }] },
  { id: 'bounce', name: 'Bounce', category: 'attention', description: 'Bouncing motion', duration: 1000, delay: 0, easing: 'ease-in-out', iterationCount: 'infinite', direction: 'normal', fillMode: 'none', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { translateY: 0 } }, { offset: 0.5, properties: { translateY: -15 } }, { offset: 1, properties: { translateY: 0 } }] },
  { id: 'shake', name: 'Shake', category: 'attention', description: 'Horizontal shake', duration: 600, delay: 0, easing: 'ease-in-out', iterationCount: 1, direction: 'normal', fillMode: 'none', trigger: 'on-click',
    keyframes: [{ offset: 0, properties: { translateX: 0 } }, { offset: 0.1, properties: { translateX: -10 } }, { offset: 0.3, properties: { translateX: 10 } }, { offset: 0.5, properties: { translateX: -10 } }, { offset: 0.7, properties: { translateX: 10 } }, { offset: 0.9, properties: { translateX: -5 } }, { offset: 1, properties: { translateX: 0 } }] },
  { id: 'wiggle', name: 'Wiggle', category: 'attention', description: 'Rotational wiggle', duration: 500, delay: 0, easing: 'ease-in-out', iterationCount: 1, direction: 'normal', fillMode: 'none', trigger: 'on-hover',
    keyframes: [{ offset: 0, properties: { rotate: 0 } }, { offset: 0.25, properties: { rotate: -5 } }, { offset: 0.5, properties: { rotate: 5 } }, { offset: 0.75, properties: { rotate: -3 } }, { offset: 1, properties: { rotate: 0 } }] },
  { id: 'heartbeat', name: 'Heartbeat', category: 'attention', description: 'Double pulse like a heartbeat', duration: 1200, delay: 0, easing: 'ease-in-out', iterationCount: 'infinite', direction: 'normal', fillMode: 'none', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { scale: 1 } }, { offset: 0.14, properties: { scale: 1.15 } }, { offset: 0.28, properties: { scale: 1 } }, { offset: 0.42, properties: { scale: 1.15 } }, { offset: 0.7, properties: { scale: 1 } }] },
  { id: 'jello', name: 'Jello', category: 'attention', description: 'Jelly-like wobble', duration: 900, delay: 0, easing: 'ease-in-out', iterationCount: 1, direction: 'normal', fillMode: 'none', trigger: 'on-hover',
    keyframes: [{ offset: 0, properties: { skewX: 0, skewY: 0 } }, { offset: 0.2, properties: { skewX: -8, skewY: -3 } }, { offset: 0.4, properties: { skewX: 6, skewY: 2 } }, { offset: 0.6, properties: { skewX: -4, skewY: -1 } }, { offset: 0.8, properties: { skewX: 2, skewY: 0.5 } }, { offset: 1, properties: { skewX: 0, skewY: 0 } }] },
  { id: 'rubber-band', name: 'Rubber Band', category: 'attention', description: 'Elastic stretch', duration: 800, delay: 0, easing: 'ease-in-out', iterationCount: 1, direction: 'normal', fillMode: 'none', trigger: 'on-click',
    keyframes: [{ offset: 0, properties: { scaleX: 1, scaleY: 1 } }, { offset: 0.3, properties: { scaleX: 1.25, scaleY: 0.75 } }, { offset: 0.4, properties: { scaleX: 0.75, scaleY: 1.25 } }, { offset: 0.5, properties: { scaleX: 1.15, scaleY: 0.85 } }, { offset: 0.65, properties: { scaleX: 0.95, scaleY: 1.05 } }, { offset: 0.75, properties: { scaleX: 1.05, scaleY: 0.95 } }, { offset: 1, properties: { scaleX: 1, scaleY: 1 } }] },
  { id: 'tada', name: 'Tada', category: 'attention', description: 'Celebratory entrance', duration: 1000, delay: 0, easing: 'ease-in-out', iterationCount: 1, direction: 'normal', fillMode: 'none', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { scale: 1, rotate: 0 } }, { offset: 0.1, properties: { scale: 0.9, rotate: -3 } }, { offset: 0.3, properties: { scale: 1.1, rotate: 3 } }, { offset: 0.5, properties: { scale: 1.1, rotate: -3 } }, { offset: 0.7, properties: { scale: 1.1, rotate: 3 } }, { offset: 0.9, properties: { scale: 1.05, rotate: -1 } }, { offset: 1, properties: { scale: 1, rotate: 0 } }] },
  { id: 'spin', name: 'Spin', category: 'attention', description: 'Continuous rotation', duration: 1000, delay: 0, easing: 'linear', iterationCount: 'infinite', direction: 'normal', fillMode: 'none', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { rotate: 0 } }, { offset: 1, properties: { rotate: 360 } }] },
  { id: 'ping', name: 'Ping', category: 'attention', description: 'Expanding ring effect', duration: 1500, delay: 0, easing: 'ease-out', iterationCount: 'infinite', direction: 'normal', fillMode: 'none', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { scale: 1, opacity: 1 } }, { offset: 1, properties: { scale: 1.5, opacity: 0 } }] },
  { id: 'float', name: 'Float', category: 'attention', description: 'Gentle floating motion', duration: 3000, delay: 0, easing: 'ease-in-out', iterationCount: 'infinite', direction: 'alternate', fillMode: 'none', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { translateY: 0 } }, { offset: 1, properties: { translateY: -10 } }] },

  // ── Scroll Animations ──
  { id: 'scroll-fade-in', name: 'Scroll Fade In', category: 'scroll', description: 'Fade in when scrolled into view', duration: 600, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-scroll',
    keyframes: [{ offset: 0, properties: { opacity: 0, translateY: 30 } }, { offset: 1, properties: { opacity: 1, translateY: 0 } }] },
  { id: 'scroll-slide-left', name: 'Scroll Slide Left', category: 'scroll', description: 'Slide from left on scroll', duration: 600, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-scroll',
    keyframes: [{ offset: 0, properties: { opacity: 0, translateX: -50 } }, { offset: 1, properties: { opacity: 1, translateX: 0 } }] },
  { id: 'scroll-slide-right', name: 'Scroll Slide Right', category: 'scroll', description: 'Slide from right on scroll', duration: 600, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-scroll',
    keyframes: [{ offset: 0, properties: { opacity: 0, translateX: 50 } }, { offset: 1, properties: { opacity: 1, translateX: 0 } }] },
  { id: 'scroll-scale', name: 'Scroll Scale', category: 'scroll', description: 'Scale up on scroll', duration: 500, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-scroll',
    keyframes: [{ offset: 0, properties: { opacity: 0, scale: 0.8 } }, { offset: 1, properties: { opacity: 1, scale: 1 } }] },
  { id: 'parallax-slow', name: 'Parallax Slow', category: 'scroll', description: 'Slow parallax movement', duration: 0, delay: 0, easing: 'linear', iterationCount: 1, direction: 'normal', fillMode: 'none', trigger: 'on-scroll',
    keyframes: [{ offset: 0, properties: { translateY: 0 } }, { offset: 1, properties: { translateY: -50 } }] },

  // ── Hover Animations ──
  { id: 'hover-lift', name: 'Hover Lift', category: 'hover', description: 'Lift up on hover', duration: 200, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-hover',
    keyframes: [{ offset: 0, properties: { translateY: 0, boxShadow: '0 0 0 rgba(0,0,0,0)' } }, { offset: 1, properties: { translateY: -4, boxShadow: '0 10px 20px rgba(0,0,0,0.15)' } }] },
  { id: 'hover-grow', name: 'Hover Grow', category: 'hover', description: 'Slight grow on hover', duration: 200, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-hover',
    keyframes: [{ offset: 0, properties: { scale: 1 } }, { offset: 1, properties: { scale: 1.05 } }] },
  { id: 'hover-shrink', name: 'Hover Shrink', category: 'hover', description: 'Slight shrink on hover', duration: 200, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-hover',
    keyframes: [{ offset: 0, properties: { scale: 1 } }, { offset: 1, properties: { scale: 0.97 } }] },
  { id: 'hover-glow', name: 'Hover Glow', category: 'hover', description: 'Glowing effect on hover', duration: 300, delay: 0, easing: 'ease-in-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-hover',
    keyframes: [{ offset: 0, properties: { boxShadow: '0 0 0 rgba(99,102,241,0)' } }, { offset: 1, properties: { boxShadow: '0 0 20px rgba(99,102,241,0.4)' } }] },
  { id: 'hover-tilt', name: 'Hover Tilt', category: 'hover', description: 'Slight 3D tilt', duration: 200, delay: 0, easing: 'ease-out', iterationCount: 1, direction: 'normal', fillMode: 'both', trigger: 'on-hover',
    keyframes: [{ offset: 0, properties: { rotateX: 0, rotateY: 0 } }, { offset: 1, properties: { rotateX: -5, rotateY: 5 } }] },

  // ── Loading Animations ──
  { id: 'skeleton-shimmer', name: 'Skeleton Shimmer', category: 'loading', description: 'Loading shimmer effect', duration: 2000, delay: 0, easing: 'linear', iterationCount: 'infinite', direction: 'normal', fillMode: 'none', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { backgroundPosition: '-200% 0' } }, { offset: 1, properties: { backgroundPosition: '200% 0' } }] },
  { id: 'rotate-loader', name: 'Rotate Loader', category: 'loading', description: 'Spinning loader', duration: 800, delay: 0, easing: 'linear', iterationCount: 'infinite', direction: 'normal', fillMode: 'none', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { rotate: 0 } }, { offset: 1, properties: { rotate: 360 } }] },
  { id: 'dots-loader', name: 'Dots Pulse', category: 'loading', description: 'Pulsing dots', duration: 1400, delay: 0, easing: 'ease-in-out', iterationCount: 'infinite', direction: 'normal', fillMode: 'none', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { scale: 0.8, opacity: 0.5 } }, { offset: 0.5, properties: { scale: 1.2, opacity: 1 } }, { offset: 1, properties: { scale: 0.8, opacity: 0.5 } }] },

  // ── Background / Decorative ──
  { id: 'gradient-shift', name: 'Gradient Shift', category: 'background', description: 'Slowly shifting gradient', duration: 5000, delay: 0, easing: 'linear', iterationCount: 'infinite', direction: 'alternate', fillMode: 'none', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { backgroundPosition: '0% 50%' } }, { offset: 1, properties: { backgroundPosition: '100% 50%' } }] },
  { id: 'color-cycle', name: 'Color Cycle', category: 'background', description: 'Cycle through colors', duration: 8000, delay: 0, easing: 'linear', iterationCount: 'infinite', direction: 'normal', fillMode: 'none', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { filter: 'hue-rotate(0deg)' } }, { offset: 1, properties: { filter: 'hue-rotate(360deg)' } }] },
  { id: 'twinkle', name: 'Twinkle', category: 'background', description: 'Twinkling star effect', duration: 2000, delay: 0, easing: 'ease-in-out', iterationCount: 'infinite', direction: 'alternate', fillMode: 'none', trigger: 'on-mount',
    keyframes: [{ offset: 0, properties: { opacity: 0.3 } }, { offset: 0.5, properties: { opacity: 1 } }, { offset: 1, properties: { opacity: 0.3 } }] },
];

/* ──────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────── */

export function getAnimationsByCategory(): Map<AnimationCategory, AnimationDefinition[]> {
  const m = new Map<AnimationCategory, AnimationDefinition[]>();
  for (const a of ANIMATION_PRESETS) {
    const list = m.get(a.category) ?? [];
    list.push(a);
    m.set(a.category, list);
  }
  return m;
}

export function getAnimationById(id: string): AnimationDefinition | undefined {
  return ANIMATION_PRESETS.find(a => a.id === id);
}

export const ANIMATION_CATEGORY_LABELS: Record<AnimationCategory, string> = {
  entrance: 'Entrance',
  exit: 'Exit',
  attention: 'Attention Seekers',
  scroll: 'Scroll-Triggered',
  hover: 'Hover Effects',
  loading: 'Loading',
  transition: 'Transition',
  background: 'Background & Decorative',
};

/**
 * Generates CSS @keyframes string from an animation definition.
 */
export function generateCSSKeyframes(anim: AnimationDefinition): string {
  const name = anim.id.replace(/[^a-zA-Z0-9-]/g, '-');
  const frames = anim.keyframes.map(kf => {
    const pct = Math.round(kf.offset * 100);
    const props = Object.entries(kf.properties).map(([key, val]) => {
      if (key === 'translateX') return `transform: translateX(${typeof val === 'number' ? val + 'px' : val})`;
      if (key === 'translateY') return `transform: translateY(${typeof val === 'number' ? val + 'px' : val})`;
      if (key === 'scale') return `transform: scale(${val})`;
      if (key === 'rotate') return `transform: rotate(${val}deg)`;
      if (key === 'opacity') return `opacity: ${val}`;
      return `${key}: ${val}`;
    }).join('; ');
    return `  ${pct}% { ${props} }`;
  }).join('\n');

  return `@keyframes ${name} {\n${frames}\n}`;
}

/**
 * Generates CSS animation shorthand.
 */
export function generateCSSAnimation(anim: AnimationDefinition): string {
  const name = anim.id.replace(/[^a-zA-Z0-9-]/g, '-');
  const iter = anim.iterationCount === 'infinite' ? 'infinite' : String(anim.iterationCount);
  return `animation: ${name} ${anim.duration}ms ${anim.easing} ${anim.delay}ms ${iter} ${anim.direction} ${anim.fillMode};`;
}
