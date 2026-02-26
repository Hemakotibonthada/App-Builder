/**
 * AnimatedButton
 * 
 * Button component with Framer Motion micro-interactions,
 * multiple variants, and loading state.
 */

'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
  className?: string;
}

/* ──────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────── */

const variantStyles: Record<string, string> = {
  primary:
    'bg-builder-accent text-white hover:bg-builder-accent-light active:bg-builder-accent-dark shadow-md shadow-builder-accent/20',
  secondary:
    'bg-builder-elevated text-builder-text hover:bg-builder-hover border border-builder-border',
  ghost:
    'bg-transparent text-builder-text-muted hover:bg-glass-white-10 hover:text-builder-text',
  danger:
    'bg-builder-error/90 text-white hover:bg-builder-error active:bg-red-700 shadow-md shadow-red-500/20',
  success:
    'bg-builder-success/90 text-white hover:bg-builder-success active:bg-green-700 shadow-md shadow-green-500/20',
  outline:
    'bg-transparent text-builder-accent border border-builder-accent/40 hover:bg-builder-accent/10 hover:border-builder-accent',
};

const sizeStyles: Record<string, string> = {
  xs: 'h-7 px-2 text-xs gap-1',
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-base gap-2.5',
};

/* ──────────────────────────────────────────────
 * Spinner
 * ────────────────────────────────────────────── */

function Spinner({ size }: { size: string }) {
  const sizeMap: Record<string, string> = {
    xs: 'h-3 w-3',
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <motion.svg
      className={clsx('animate-spin', sizeMap[size] ?? 'h-4 w-4')}
      viewBox="0 0 24 24"
      fill="none"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </motion.svg>
  );
}

/* ──────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────── */

export function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  rounded = false,
  className,
  ...motionProps
}: AnimatedButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      className={clsx(
        'relative inline-flex items-center justify-center font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-builder-accent focus-visible:ring-offset-2 focus-visible:ring-offset-builder-bg',
        rounded ? 'rounded-full' : 'rounded-lg',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...motionProps}
    >
      {loading && <Spinner size={size} />}

      {!loading && icon && iconPosition === 'left' && (
        <motion.span
          className="flex-shrink-0"
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
        >
          {icon}
        </motion.span>
      )}

      <span className={clsx(loading && 'ml-2')}>{children}</span>

      {!loading && icon && iconPosition === 'right' && (
        <motion.span
          className="flex-shrink-0"
          initial={{ opacity: 0, x: 4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
        >
          {icon}
        </motion.span>
      )}
    </motion.button>
  );
}

/* ──────────────────────────────────────────────
 * Icon Button Variant
 * ────────────────────────────────────────────── */

interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  icon: React.ReactNode;
  label: string; // Accessibility label
  variant?: 'ghost' | 'secondary' | 'primary' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  active?: boolean;
  disabled?: boolean;
  className?: string;
  tooltip?: string;
}

const iconSizeStyles: Record<string, string> = {
  xs: 'h-6 w-6',
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
};

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  active = false,
  disabled = false,
  className,
  tooltip,
  ...motionProps
}: IconButtonProps) {
  return (
    <motion.button
      className={clsx(
        'inline-flex items-center justify-center rounded-lg transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-builder-accent',
        iconSizeStyles[size],
        variant === 'ghost' && !active && 'text-builder-text-muted hover:text-builder-text hover:bg-glass-white-10',
        variant === 'ghost' && active && 'text-builder-accent bg-builder-accent/10',
        variant === 'secondary' && 'text-builder-text-muted hover:text-builder-text bg-builder-elevated hover:bg-builder-hover border border-builder-border',
        variant === 'primary' && 'text-white bg-builder-accent hover:bg-builder-accent-light',
        variant === 'danger' && 'text-builder-text-muted hover:text-builder-error hover:bg-builder-error/10',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className,
      )}
      disabled={disabled}
      aria-label={label}
      title={tooltip ?? label}
      whileHover={!disabled ? { scale: 1.08 } : undefined}
      whileTap={!disabled ? { scale: 0.92 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...motionProps}
    >
      {icon}
    </motion.button>
  );
}
