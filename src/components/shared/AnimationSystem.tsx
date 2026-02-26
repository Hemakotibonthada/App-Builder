/**
 * Advanced Animation System
 * 
 * Comprehensive Framer Motion animation components, presets, and utilities:
 * 1. AnimateIn - Intersection Observer based reveal animations
 * 2. StaggerContainer - Staggered children animations
 * 3. PageTransition - Route transition wrapper
 * 4. ParallaxSection - Scroll parallax effect
 * 5. TypewriterText - Character-by-character text reveal
 * 6. CountUp - Animated number counter
 * 7. MorphShape - SVG shape morphing
 * 8. FloatingElement - Floating/levitating animation
 * 9. GlowEffect - Animated glow/pulse
 * 10. RippleEffect - Material ripple on click
 * 11. ShakeElement - Attention-grabbing shake
 * 12. FlipCard - 3D card flip
 * 13. DrawSVG - SVG path drawing animation
 * 14. MagneticElement - Cursor magnetic attraction
 * 15. TextReveal - Word/line reveal animations
 * 16. Animation Presets - 50+ reusable presets
 * 17. Spring Configs - Named spring configurations
 * 18. Transition utilities
 */

'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  Children,
  cloneElement,
  isValidElement,
} from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
  useAnimation,
  Variants,
  Transition,
  MotionValue,
  animate as motionAnimate,
  TargetAndTransition,
} from 'framer-motion';
import { cn } from '@/utils';

/* ═══════════════════════════════════════════════════════════════
 * SPRING CONFIGURATIONS
 * ═══════════════════════════════════════════════════════════════ */

export const springs = {
  /** Extremely bouncy - for playful/attention-grabbing elements */
  bouncy: { type: 'spring' as const, stiffness: 600, damping: 15, mass: 1 },
  /** Gentle bounce - for delightful micro-interactions */
  gentle: { type: 'spring' as const, stiffness: 200, damping: 20, mass: 1 },
  /** Snappy feel - for responsive UI elements */
  snappy: { type: 'spring' as const, stiffness: 400, damping: 30, mass: 0.8 },
  /** Smooth and elegant - for most transitions */
  smooth: { type: 'spring' as const, stiffness: 300, damping: 25, mass: 1 },
  /** Slow and heavy - for dramatic reveals */
  heavy: { type: 'spring' as const, stiffness: 100, damping: 30, mass: 2 },
  /** Quick snap - for instant feedback */
  quick: { type: 'spring' as const, stiffness: 500, damping: 35, mass: 0.5 },
  /** Wobbly - for fun interactions */
  wobbly: { type: 'spring' as const, stiffness: 180, damping: 12, mass: 1 },
  /** Stiff - minimal overshoot */
  stiff: { type: 'spring' as const, stiffness: 400, damping: 40, mass: 1 },
  /** Elastic - for rubber-band effects */
  elastic: { type: 'spring' as const, stiffness: 250, damping: 10, mass: 0.5 },
  /** Molasses - very slow and deliberate */
  molasses: { type: 'spring' as const, stiffness: 80, damping: 40, mass: 3 },
};

/* ═══════════════════════════════════════════════════════════════
 * ANIMATION PRESETS (50+)
 * ═══════════════════════════════════════════════════════════════ */

export const presets = {
  /* --- Fade --- */
  fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  fadeInUp: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 20 } },
  fadeInDown: { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 } },
  fadeInLeft: { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } },
  fadeInRight: { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 } },
  fadeInScale: { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 } },
  fadeInScaleUp: { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.5 } },
  
  /* --- Slide --- */
  slideInUp: { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } },
  slideInDown: { initial: { y: '-100%' }, animate: { y: 0 }, exit: { y: '-100%' } },
  slideInLeft: { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
  slideInRight: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } },
  slideInUpSmall: { initial: { y: 10, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 10, opacity: 0 } },
  slideInDownSmall: { initial: { y: -10, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: -10, opacity: 0 } },
  
  /* --- Scale --- */
  scaleIn: { initial: { scale: 0 }, animate: { scale: 1 }, exit: { scale: 0 } },
  scaleInCenter: { initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0, opacity: 0 } },
  scaleInBounce: { initial: { scale: 0 }, animate: { scale: [0, 1.2, 0.9, 1] }, exit: { scale: 0 } },
  popIn: { initial: { scale: 0.5, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.5, opacity: 0 } },
  growIn: { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.8, opacity: 0 } },
  shrinkIn: { initial: { scale: 1.2, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 1.2, opacity: 0 } },
  
  /* --- Rotate --- */
  rotateIn: { initial: { rotate: -180, opacity: 0 }, animate: { rotate: 0, opacity: 1 }, exit: { rotate: 180, opacity: 0 } },
  rotateInLeft: { initial: { rotate: -90, x: -50, opacity: 0 }, animate: { rotate: 0, x: 0, opacity: 1 }, exit: { rotate: -90, x: -50, opacity: 0 } },
  rotateInRight: { initial: { rotate: 90, x: 50, opacity: 0 }, animate: { rotate: 0, x: 0, opacity: 1 }, exit: { rotate: 90, x: 50, opacity: 0 } },
  flipInX: { initial: { rotateX: 90, opacity: 0 }, animate: { rotateX: 0, opacity: 1 }, exit: { rotateX: 90, opacity: 0 } },
  flipInY: { initial: { rotateY: 90, opacity: 0 }, animate: { rotateY: 0, opacity: 1 }, exit: { rotateY: 90, opacity: 0 } },
  
  /* --- Blur --- */
  blurIn: { initial: { filter: 'blur(10px)', opacity: 0 }, animate: { filter: 'blur(0px)', opacity: 1 }, exit: { filter: 'blur(10px)', opacity: 0 } },
  blurInUp: { initial: { filter: 'blur(10px)', opacity: 0, y: 20 }, animate: { filter: 'blur(0px)', opacity: 1, y: 0 }, exit: { filter: 'blur(10px)', opacity: 0, y: 20 } },
  
  /* --- Clip path --- */
  clipInLeft: { initial: { clipPath: 'inset(0 100% 0 0)' }, animate: { clipPath: 'inset(0 0% 0 0)' }, exit: { clipPath: 'inset(0 100% 0 0)' } },
  clipInRight: { initial: { clipPath: 'inset(0 0 0 100%)' }, animate: { clipPath: 'inset(0 0 0 0%)' }, exit: { clipPath: 'inset(0 0 0 100%)' } },
  clipInTop: { initial: { clipPath: 'inset(0 0 100% 0)' }, animate: { clipPath: 'inset(0 0 0% 0)' }, exit: { clipPath: 'inset(0 0 100% 0)' } },
  clipInBottom: { initial: { clipPath: 'inset(100% 0 0 0)' }, animate: { clipPath: 'inset(0% 0 0 0)' }, exit: { clipPath: 'inset(100% 0 0 0)' } },
  clipCircleIn: { initial: { clipPath: 'circle(0% at 50% 50%)' }, animate: { clipPath: 'circle(100% at 50% 50%)' }, exit: { clipPath: 'circle(0% at 50% 50%)' } },
  
  /* --- 3D / Perspective --- */
  perspectiveIn: { initial: { perspective: 800, rotateX: 45, scale: 0.8, opacity: 0 }, animate: { perspective: 800, rotateX: 0, scale: 1, opacity: 1 }, exit: { perspective: 800, rotateX: -45, scale: 0.8, opacity: 0 } },
  tiltIn: { initial: { perspective: 600, rotateX: 20, rotateY: -20, opacity: 0 }, animate: { perspective: 600, rotateX: 0, rotateY: 0, opacity: 1 }, exit: { perspective: 600, rotateX: 20, rotateY: -20, opacity: 0 } },
  
  /* --- Bounce --- */
  bounceIn: { initial: { scale: 0.3, opacity: 0 }, animate: { scale: [0.3, 1.1, 0.9, 1.03, 0.97, 1], opacity: 1 }, exit: { scale: 0.3, opacity: 0 } },
  bounceInUp: { initial: { y: 50, opacity: 0 }, animate: { y: [50, -8, 4, -2, 0], opacity: 1 }, exit: { y: 50, opacity: 0 } },
  bounceInDown: { initial: { y: -50, opacity: 0 }, animate: { y: [-50, 8, -4, 2, 0], opacity: 1 }, exit: { y: -50, opacity: 0 } },
  
  /* --- Swing / Wobble --- */
  swingIn: { initial: { rotate: 0, opacity: 0 }, animate: { rotate: [0, 15, -10, 5, -3, 0], opacity: 1 }, exit: { rotate: 0, opacity: 0 } },
  wobbleIn: { initial: { x: 0, opacity: 0 }, animate: { x: [0, -15, 10, -7, 4, 0], opacity: 1 }, exit: { x: 0, opacity: 0 } },
  jelloIn: { initial: { skewX: 0, skewY: 0, opacity: 0 }, animate: { skewX: [0, -12.5, 6.25, -3.125, 1.5625, 0], skewY: [0, -12.5, 6.25, -3.125, 1.5625, 0], opacity: 1 }, exit: { opacity: 0 } },
  
  /* --- Special --- */
  heartbeat: { animate: { scale: [1, 1.3, 1, 1.3, 1] } },
  pulse: { animate: { scale: [1, 1.05, 1] } },
  breathe: { animate: { scale: [1, 1.02, 1], opacity: [1, 0.8, 1] } },
  rubberBand: { animate: { scaleX: [1, 1.25, 0.75, 1.15, 0.95, 1.05, 1], scaleY: [1, 0.75, 1.25, 0.85, 1.05, 0.95, 1] } },
  tada: { animate: { scale: [1, 0.9, 0.9, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1], rotate: [0, -3, -3, 3, -3, 3, -3, 3, -3, 0] } },
  headShake: { animate: { x: [0, -6, 5, -3, 2, 0], rotateY: [0, -9, 7, -5, 3, 0] } },
  flash: { animate: { opacity: [1, 0, 1, 0, 1] } },
} as const;

/* ═══════════════════════════════════════════════════════════════
 * TRANSITION DURATIONS
 * ═══════════════════════════════════════════════════════════════ */

export const durations = {
  instant: 0,
  fast: 0.1,
  normal: 0.2,
  moderate: 0.3,
  slow: 0.5,
  verySlow: 0.8,
  dramatic: 1.2,
} as const;

export const easings = {
  ease: [0.25, 0.1, 0.25, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
  sharp: [0.4, 0, 0.6, 1],
  bounce: [0.34, 1.56, 0.64, 1],
  elastic: [0.68, -0.55, 0.27, 1.55],
  smooth: [0.4, 0, 0.2, 1],
  decelerate: [0, 0, 0.2, 1],
  accelerate: [0.4, 0, 1, 1],
} as const;

/* ═══════════════════════════════════════════════════════════════
 * 1. ANIMATE IN (Scroll reveal)
 * ═══════════════════════════════════════════════════════════════ */

interface AnimateInProps {
  children: React.ReactNode;
  preset?: keyof typeof presets;
  delay?: number;
  duration?: number;
  once?: boolean;
  threshold?: number;
  className?: string;
  as?: React.ElementType;
  custom?: {
    initial?: TargetAndTransition;
    animate?: TargetAndTransition;
    exit?: TargetAndTransition;
  };
}

export function AnimateIn({
  children,
  preset = 'fadeInUp',
  delay = 0,
  duration = 0.5,
  once = true,
  threshold = 0.2,
  className,
  as: Tag = 'div',
  custom,
}: AnimateInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });

  const animation = custom ?? presets[preset];
  const MotionTag = motion(Tag as any);
  const anim = animation as any;

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial={anim.initial ?? {}}
      animate={isInView ? (anim.animate ?? {}) : (anim.initial ?? {})}
      exit={anim.exit ?? undefined}
      transition={{
        duration,
        delay,
        ...springs.smooth,
      }}
    >
      {children}
    </MotionTag>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 2. STAGGER CONTAINER
 * ═══════════════════════════════════════════════════════════════ */

interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  delayStart?: number;
  preset?: keyof typeof presets;
  className?: string;
  once?: boolean;
}

const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  delayStart = 0,
  preset = 'fadeInUp',
  className,
  once = true,
}: StaggerContainerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.1 });

  const animation = presets[preset] as any;

  const containerVars: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delayStart,
      },
    },
  };

  const childVars: Variants = {
    hidden: animation.initial as any,
    visible: {
      ...(animation.animate as any),
      transition: { ...springs.smooth, duration: 0.5 },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVars}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {Children.map(children, (child, i) => {
        if (!isValidElement(child)) return child;
        return (
          <motion.div key={i} variants={childVars}>
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 3. PAGE TRANSITION
 * ═══════════════════════════════════════════════════════════════ */

type PageTransitionType = 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown' | 'none';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: PageTransitionType;
  duration?: number;
  className?: string;
}

const pageTransitionVariants: Record<PageTransitionType, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  scale: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.1, opacity: 0 },
  },
  slideUp: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
  },
  slideDown: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  },
  none: {
    initial: {},
    animate: {},
    exit: {},
  },
};

export function PageTransition({
  children,
  type = 'fade',
  duration = 0.3,
  className,
}: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      variants={pageTransitionVariants[type]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration, ease: easings.smooth }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 4. PARALLAX SECTION
 * ═══════════════════════════════════════════════════════════════ */

interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  overlay?: boolean;
  overlayColor?: string;
}

export function ParallaxSection({
  children,
  speed = 0.5,
  direction = 'up',
  className,
  overlay = false,
  overlayColor = 'rgba(0,0,0,0.4)',
}: ParallaxSectionProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const range = 100 * speed;
  const yUp = useTransform(scrollYProgress, [0, 1], [range, -range]);
  const yDown = useTransform(scrollYProgress, [0, 1], [-range, range]);
  const xLeft = useTransform(scrollYProgress, [0, 1], [range, -range]);
  const xRight = useTransform(scrollYProgress, [0, 1], [-range, range]);

  const style: Record<string, MotionValue> = {};
  if (direction === 'up') style.y = yUp;
  else if (direction === 'down') style.y = yDown;
  else if (direction === 'left') style.x = xLeft;
  else if (direction === 'right') style.x = xRight;

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div style={style} className="w-full h-full">
        {children}
      </motion.div>
      {overlay && (
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: overlayColor }} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 5. TYPEWRITER TEXT
 * ═══════════════════════════════════════════════════════════════ */

interface TypewriterTextProps {
  text: string | string[];
  speed?: number;
  deleteSpeed?: number;
  delay?: number;
  loop?: boolean;
  cursor?: boolean;
  cursorChar?: string;
  className?: string;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  speed = 50,
  deleteSpeed = 30,
  delay = 1500,
  loop = false,
  cursor = true,
  cursorChar = '|',
  className,
  onComplete,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const texts = Array.isArray(text) ? text : [text];
  const currentText = texts[textIndex] ?? '';

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeleting && charIndex < currentText.length) {
      timeout = setTimeout(() => {
        setDisplayed(prev => prev + currentText[charIndex]);
        setCharIndex(prev => prev + 1);
      }, speed);
    } else if (!isDeleting && charIndex === currentText.length) {
      if (texts.length > 1 || loop) {
        timeout = setTimeout(() => setIsDeleting(true), delay);
      } else {
        onComplete?.();
      }
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => {
        setDisplayed(prev => prev.slice(0, -1));
      }, deleteSpeed);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      const nextIndex = (textIndex + 1) % texts.length;
      if (nextIndex === 0 && !loop) {
        onComplete?.();
        return;
      }
      setTextIndex(nextIndex);
      setCharIndex(0);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, displayed, currentText, texts, textIndex, speed, deleteSpeed, delay, loop, onComplete]);

  return (
    <span className={className}>
      {displayed}
      {cursor && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block ml-0.5"
        >
          {cursorChar}
        </motion.span>
      )}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 6. COUNT UP
 * ═══════════════════════════════════════════════════════════════ */

interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function CountUp({
  from = 0,
  to,
  duration = 2,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  className,
  delay = 0,
  once = true,
}: CountUpProps) {
  const [value, setValue] = useState(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.5 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView) return;
    if (once && hasAnimated.current) return;
    hasAnimated.current = true;

    const timeout = setTimeout(() => {
      const controls = motionAnimate(from, to, {
        duration,
        ease: 'easeOut',
        onUpdate: (latest) => setValue(latest),
      });

      return () => controls.stop();
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [isInView, from, to, duration, delay, once]);

  const formatted = useMemo(() => {
    const fixed = value.toFixed(decimals);
    if (!separator) return `${prefix}${fixed}${suffix}`;

    const parts = fixed.split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    const result = parts.length > 1 ? `${intPart}.${parts[1]}` : intPart;
    return `${prefix}${result}${suffix}`;
  }, [value, decimals, prefix, suffix, separator]);

  return (
    <span ref={ref} className={className}>
      {formatted}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 7. FLOATING ELEMENT
 * ═══════════════════════════════════════════════════════════════ */

interface FloatingElementProps {
  children: React.ReactNode;
  amplitude?: number;
  frequency?: number;
  direction?: 'vertical' | 'horizontal' | 'both';
  className?: string;
}

export function FloatingElement({
  children,
  amplitude = 10,
  frequency = 3,
  direction = 'vertical',
  className,
}: FloatingElementProps) {
  const yAnim = direction !== 'horizontal' ? {
    y: [-amplitude, amplitude, -amplitude],
  } : {};

  const xAnim = direction !== 'vertical' ? {
    x: [-amplitude * 0.6, amplitude * 0.6, -amplitude * 0.6],
  } : {};

  return (
    <motion.div
      className={className}
      animate={{
        ...yAnim,
        ...xAnim,
      }}
      transition={{
        duration: frequency,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 8. GLOW EFFECT
 * ═══════════════════════════════════════════════════════════════ */

interface GlowEffectProps {
  children: React.ReactNode;
  color?: string;
  size?: number;
  intensity?: number;
  pulse?: boolean;
  className?: string;
}

export function GlowEffect({
  children,
  color = 'rgba(99, 102, 241, 0.5)',
  size = 20,
  intensity = 1,
  pulse = true,
  className,
}: GlowEffectProps) {
  return (
    <div className={cn('relative inline-block', className)}>
      <motion.div
        className="absolute inset-0 rounded-inherit pointer-events-none"
        style={{
          boxShadow: `0 0 ${size}px ${size / 2}px ${color}`,
          opacity: intensity,
        }}
        animate={pulse ? {
          opacity: [intensity * 0.5, intensity, intensity * 0.5],
          scale: [0.95, 1.02, 0.95],
        } : undefined}
        transition={pulse ? {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        } : undefined}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 9. RIPPLE EFFECT
 * ═══════════════════════════════════════════════════════════════ */

interface RippleEffectProps {
  children: React.ReactNode;
  color?: string;
  duration?: number;
  className?: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function RippleEffect({
  children,
  color = 'rgba(255, 255, 255, 0.3)',
  duration = 600,
  className,
}: RippleEffectProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const addRipple = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    const id = nextId.current++;
    setRipples(prev => [...prev, { id, x, y, size }]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, duration);
  }, [duration]);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      onMouseDown={addRipple}
    >
      {children}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: color,
          }}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: duration / 1000, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 10. SHAKE ELEMENT
 * ═══════════════════════════════════════════════════════════════ */

interface ShakeElementProps {
  children: React.ReactNode;
  trigger?: boolean;
  intensity?: number;
  duration?: number;
  className?: string;
}

export function ShakeElement({
  children,
  trigger = false,
  intensity = 10,
  duration = 0.4,
  className,
}: ShakeElementProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (trigger) {
      controls.start({
        x: [0, -intensity, intensity, -intensity * 0.5, intensity * 0.5, 0],
        transition: { duration },
      });
    }
  }, [trigger, intensity, duration, controls]);

  return (
    <motion.div className={className} animate={controls}>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 11. FLIP CARD
 * ═══════════════════════════════════════════════════════════════ */

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  isFlipped?: boolean;
  onFlip?: () => void;
  flipDirection?: 'horizontal' | 'vertical';
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function FlipCard({
  front,
  back,
  isFlipped: controlledFlip,
  onFlip,
  flipDirection = 'horizontal',
  width = 300,
  height = 200,
  className,
}: FlipCardProps) {
  const [internalFlip, setInternalFlip] = useState(false);
  const isFlipped = controlledFlip ?? internalFlip;

  const handleClick = () => {
    if (onFlip) {
      onFlip();
    } else {
      setInternalFlip(!internalFlip);
    }
  };

  const rotateAxis = flipDirection === 'horizontal' ? 'rotateY' : 'rotateX';

  return (
    <div
      className={cn('perspective-[1000px] cursor-pointer', className)}
      style={{ width, height }}
      onClick={handleClick}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ [rotateAxis]: isFlipped ? 180 : 0 }}
        transition={springs.smooth}
      >
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {front}
        </div>
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: `${rotateAxis}(180deg)`,
          }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 12. DRAW SVG
 * ═══════════════════════════════════════════════════════════════ */

interface DrawSVGProps {
  path: string;
  width?: number;
  height?: number;
  viewBox?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  duration?: number;
  delay?: number;
  once?: boolean;
  className?: string;
}

export function DrawSVG({
  path,
  width = 100,
  height = 100,
  viewBox = '0 0 100 100',
  strokeColor = 'currentColor',
  strokeWidth = 2,
  fillColor = 'none',
  duration = 2,
  delay = 0,
  once = true,
  className,
}: DrawSVGProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.5 });

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={viewBox}
      className={className}
    >
      <motion.path
        d={path}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{
          pathLength: { duration, delay, ease: 'easeInOut' },
          opacity: { duration: 0.3, delay },
        }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 13. MAGNETIC ELEMENT
 * ═══════════════════════════════════════════════════════════════ */

interface MagneticElementProps {
  children: React.ReactNode;
  strength?: number;
  radius?: number;
  className?: string;
}

export function MagneticElement({
  children,
  strength = 0.3,
  radius = 200,
  className,
}: MagneticElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 150, damping: 15 });
  const smoothY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.sqrt(
      Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2),
    );

    if (distance < radius) {
      const factor = 1 - distance / radius;
      x.set((e.clientX - centerX) * strength * factor);
      y.set((e.clientY - centerY) * strength * factor);
    }
  }, [strength, radius, x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: smoothX, y: smoothY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 14. TEXT REVEAL
 * ═══════════════════════════════════════════════════════════════ */

interface TextRevealProps {
  text: string;
  mode?: 'word' | 'character' | 'line';
  staggerDelay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export function TextReveal({
  text,
  mode = 'word',
  staggerDelay = 0.05,
  duration = 0.5,
  className,
  once = true,
}: TextRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.3 });

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration, ...springs.smooth },
    },
  };

  const items = mode === 'character'
    ? text.split('')
    : mode === 'word'
      ? text.split(' ')
      : text.split('\n');

  return (
    <motion.span
      ref={ref}
      className={cn('inline-flex flex-wrap', className)}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {items.map((item, i) => (
        <motion.span
          key={i}
          variants={itemVariants}
          className="inline-block"
        >
          {item}
          {mode === 'word' && i < items.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 15. SCROLL PROGRESS
 * ═══════════════════════════════════════════════════════════════ */

interface ScrollProgressProps {
  position?: 'top' | 'bottom';
  color?: string;
  height?: number;
  className?: string;
}

export function ScrollProgress({
  position = 'top',
  color = 'rgb(99, 102, 241)',
  height = 3,
  className,
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className={cn(
        'fixed left-0 right-0 z-[100] origin-left',
        position === 'top' ? 'top-0' : 'bottom-0',
        className,
      )}
      style={{
        scaleX,
        height,
        backgroundColor: color,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 16. MORPH CONTAINER
 * ═══════════════════════════════════════════════════════════════ */

interface MorphContainerProps {
  children: React.ReactNode;
  layoutId: string;
  className?: string;
  style?: React.CSSProperties;
}

export function MorphContainer({ children, layoutId, className, style }: MorphContainerProps) {
  return (
    <motion.div
      layoutId={layoutId}
      className={className}
      style={style}
      transition={springs.smooth}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 17. ANIMATED LIST
 * ═══════════════════════════════════════════════════════════════ */

interface AnimatedListProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  preset?: keyof typeof presets;
}

export function AnimatedList<T>({
  items,
  keyExtractor,
  renderItem,
  className,
  preset = 'fadeInUp',
}: AnimatedListProps<T>) {
  const animation = presets[preset] as any;

  return (
    <div className={className}>
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={keyExtractor(item)}
            layout
            initial={animation.initial}
            animate={animation.animate}
            exit={'exit' in animation ? animation.exit : { opacity: 0 }}
            transition={{
              ...springs.smooth,
              delay: index * 0.05,
            }}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 18. CURSOR FOLLOWER
 * ═══════════════════════════════════════════════════════════════ */

interface CursorFollowerProps {
  size?: number;
  color?: string;
  blur?: number;
  mix?: string;
  className?: string;
}

export function CursorFollower({
  size = 20,
  color = 'rgba(99, 102, 241, 0.5)',
  blur = 0,
  mix = 'normal',
  className,
}: CursorFollowerProps) {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const smoothX = useSpring(x, { stiffness: 300, damping: 28 });
  const smoothY = useSpring(y, { stiffness: 300, damping: 28 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      x.set(e.clientX - size / 2);
      y.set(e.clientY - size / 2);
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [x, y, size]);

  return (
    <motion.div
      className={cn('fixed top-0 left-0 pointer-events-none z-[9999] rounded-full', className)}
      style={{
        x: smoothX,
        y: smoothY,
        width: size,
        height: size,
        backgroundColor: color,
        filter: blur ? `blur(${blur}px)` : undefined,
        mixBlendMode: mix as any,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 19. ANIMATED GRADIENT BORDER
 * ═══════════════════════════════════════════════════════════════ */

interface GradientBorderProps {
  children: React.ReactNode;
  gradient?: string;
  borderWidth?: number;
  borderRadius?: number;
  animationDuration?: number;
  className?: string;
}

export function GradientBorder({
  children,
  gradient = 'linear-gradient(90deg, #6366f1, #ec4899, #f59e0b, #6366f1)',
  borderWidth = 2,
  borderRadius = 12,
  animationDuration = 3,
  className,
}: GradientBorderProps) {
  return (
    <div
      className={cn('relative', className)}
      style={{ padding: borderWidth, borderRadius: borderRadius + borderWidth }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: gradient,
          backgroundSize: '300% 100%',
          borderRadius: borderRadius + borderWidth,
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: animationDuration,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      <div
        className="relative bg-white dark:bg-gray-900"
        style={{ borderRadius }}
      >
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * 20. SPRING BUTTON
 * ═══════════════════════════════════════════════════════════════ */

interface SpringButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'bounce' | 'scale' | 'rotate' | 'jelly';
  children: React.ReactNode;
  className?: string;
}

export function SpringButton({
  variant = 'scale',
  children,
  className,
  ...props
}: SpringButtonProps) {
  const variantConfig = {
    bounce: {
      whileHover: { y: -4 },
      whileTap: { y: 2, scale: 0.95 },
    },
    scale: {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 },
    },
    rotate: {
      whileHover: { rotate: 5, scale: 1.05 },
      whileTap: { rotate: -5, scale: 0.95 },
    },
    jelly: {
      whileHover: { scaleX: 1.1, scaleY: 0.9 },
      whileTap: { scaleX: 0.9, scaleY: 1.1 },
    },
  };

  return (
    <motion.button
      className={className}
      transition={springs.bouncy}
      {...variantConfig[variant]}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
