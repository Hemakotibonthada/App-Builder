/**
 * GlassCard
 * 
 * Glassmorphism-styled card component used throughout the builder UI.
 * Supports multiple variants, hover effects, and Framer Motion animations.
 */

'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'inset' | 'accent' | 'transparent';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  border?: boolean;
  glow?: boolean;
  hoverable?: boolean;
  animated?: boolean;
  className?: string;
}

/* ──────────────────────────────────────────────
 * Variant Styles
 * ────────────────────────────────────────────── */

const variantStyles: Record<string, string> = {
  default: 'bg-glass-white backdrop-blur-glass border-white/[0.06]',
  elevated: 'bg-builder-elevated/80 backdrop-blur-glass-lg border-white/[0.08] shadow-glass',
  inset: 'bg-builder-bg/60 backdrop-blur-glass border-white/[0.04] shadow-inner',
  accent: 'bg-builder-accent/10 backdrop-blur-glass border-builder-accent/20',
  transparent: 'bg-transparent border-transparent',
};

const paddingStyles: Record<string, string> = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const roundedStyles: Record<string, string> = {
  none: 'rounded-none',
  sm: 'rounded-lg',
  md: 'rounded-glass-sm',
  lg: 'rounded-glass',
  xl: 'rounded-3xl',
  full: 'rounded-full',
};

/* ──────────────────────────────────────────────
 * Animation Variants
 * ────────────────────────────────────────────── */

const cardVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  hover: {
    y: -2,
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.99,
    transition: { duration: 0.1 },
  },
};

/* ──────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────── */

export function GlassCard({
  children,
  variant = 'default',
  padding = 'md',
  rounded = 'lg',
  border = true,
  glow = false,
  hoverable = false,
  animated = true,
  className,
  ...motionProps
}: GlassCardProps) {
  const baseClasses = clsx(
    'relative overflow-hidden',
    variantStyles[variant],
    paddingStyles[padding],
    roundedStyles[rounded],
    border && 'border',
    glow && 'shadow-glow',
    hoverable && 'cursor-pointer transition-shadow hover:shadow-glass-lg',
    className,
  );

  if (!animated) {
    return (
      <div className={baseClasses} {...(motionProps as Record<string, unknown>)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={baseClasses}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={hoverable ? 'hover' : undefined}
      whileTap={hoverable ? 'tap' : undefined}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
 * Sub-components
 * ────────────────────────────────────────────── */

interface GlassCardHeaderProps {
  children: React.ReactNode;
  className?: string;
  borderBottom?: boolean;
}

export function GlassCardHeader({
  children,
  className,
  borderBottom = true,
}: GlassCardHeaderProps) {
  return (
    <div
      className={clsx(
        'flex items-center justify-between px-4 py-3',
        borderBottom && 'border-b border-white/[0.06]',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface GlassCardBodyProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
}

export function GlassCardBody({
  children,
  className,
  scrollable = false,
}: GlassCardBodyProps) {
  return (
    <div
      className={clsx(
        'flex-1',
        scrollable && 'overflow-y-auto scrollbar-thin scrollbar-thumb-white/10',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface GlassCardFooterProps {
  children: React.ReactNode;
  className?: string;
  borderTop?: boolean;
}

export function GlassCardFooter({
  children,
  className,
  borderTop = true,
}: GlassCardFooterProps) {
  return (
    <div
      className={clsx(
        'flex items-center justify-end gap-2 px-4 py-3',
        borderTop && 'border-t border-white/[0.06]',
        className,
      )}
    >
      {children}
    </div>
  );
}
