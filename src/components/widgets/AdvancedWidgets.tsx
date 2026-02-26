/**
 * Advanced Widget Renderer Library
 * 
 * Production-grade React components for rendering all widget types
 * in the AppBuilder canvas. Each widget is fully interactive,
 * animated, and customizable.
 * 
 * Widgets: Button, Text, Image, Card, Container, Input, Form,
 * Table, Chart, Map, Video, Audio, Calendar, Timer, Carousel,
 * Accordion, Tabs, Modal, Navbar, Footer, Sidebar, Hero,
 * Testimonial, Pricing, FAQ, CTA, Feature, Stats, Team,
 * Gallery, Timeline, Stepper, Rating, FileUpload, RichText
 */

'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';

/* ═══════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════ */

export interface WidgetRenderProps {
  id: string;
  type: string;
  props: Record<string, any>;
  style?: React.CSSProperties;
  className?: string;
  isSelected?: boolean;
  isHovered?: boolean;
  isEditing?: boolean;
  onEvent?: (event: string, data?: any) => void;
}

/* ═══════════════════════════════════════════════════════
 * 1. BUTTON WIDGET
 * ═══════════════════════════════════════════════════════ */

export const ButtonWidget = memo(function ButtonWidget({
  id, props, style, className, isSelected, onEvent,
}: WidgetRenderProps) {
  const {
    text = 'Click Me',
    variant = 'primary',
    size = 'md',
    icon = null,
    iconPosition = 'left',
    disabled = false,
    loading = false,
    rounded = false,
    fullWidth = false,
    href,
    shadow = false,
    animation = 'scale',
  } = props;

  const variants = {
    primary: 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/25',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/25',
    success: 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/25',
    gradient: 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white',
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  const motionProps = animation === 'scale' ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
  } : animation === 'bounce' ? {
    whileHover: { y: -2 },
    whileTap: { y: 1 },
  } : {};

  return (
    <motion.button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium',
        'transition-colors duration-200',
        sizes[size as keyof typeof sizes] ?? sizes.md,
        variants[variant as keyof typeof variants] ?? variants.primary,
        rounded ? 'rounded-full' : 'rounded-lg',
        fullWidth && 'w-full',
        shadow && 'shadow-lg',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
      style={style}
      disabled={disabled || loading}
      onClick={() => onEvent?.('click', { widgetId: id })}
      {...motionProps}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {icon && iconPosition === 'left' && !loading && (
        <span className="w-4 h-4">{icon}</span>
      )}
      <span>{text}</span>
      {icon && iconPosition === 'right' && !loading && (
        <span className="w-4 h-4">{icon}</span>
      )}
    </motion.button>
  );
});

/* ═══════════════════════════════════════════════════════
 * 2. TEXT WIDGET
 * ═══════════════════════════════════════════════════════ */

export const TextWidget = memo(function TextWidget({
  id, props, style, className, isEditing, onEvent,
}: WidgetRenderProps) {
  const {
    content = 'Sample Text',
    tag = 'p',
    fontSize = 16,
    fontWeight = 400,
    fontFamily,
    color,
    textAlign = 'left',
    lineHeight = 1.5,
    letterSpacing = 0,
    textDecoration = 'none',
    textTransform = 'none',
    maxLines,
    gradient,
    textShadow,
    editable = true,
  } = props;

  const [editText, setEditText] = useState(content);
  const editRef = useRef<HTMLDivElement>(null);

  const textStyle: React.CSSProperties = {
    fontSize,
    fontWeight,
    fontFamily,
    color: gradient ? 'transparent' : color,
    textAlign,
    lineHeight,
    letterSpacing,
    textDecoration,
    textTransform,
    textShadow,
    WebkitLineClamp: maxLines,
    WebkitBoxOrient: maxLines ? 'vertical' : undefined,
    display: maxLines ? '-webkit-box' : undefined,
    overflow: maxLines ? 'hidden' : undefined,
    ...(gradient ? {
      backgroundImage: gradient,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
    } : {}),
    ...style,
  };

  if (isEditing && editable) {
    return (
      <div
        ref={editRef}
        contentEditable
        suppressContentEditableWarning
        className={cn('outline-none ring-2 ring-indigo-500 rounded px-1', className)}
        style={textStyle}
        onBlur={(e) => {
          const newText = e.currentTarget.textContent ?? '';
          onEvent?.('textChange', { widgetId: id, text: newText });
        }}
        dangerouslySetInnerHTML={{ __html: editText }}
      />
    );
  }

  const Tag = tag as React.ElementType;

  return (
    <Tag className={className} style={textStyle}>
      {content}
    </Tag>
  );
});

/* ═══════════════════════════════════════════════════════
 * 3. IMAGE WIDGET
 * ═══════════════════════════════════════════════════════ */

export const ImageWidget = memo(function ImageWidget({
  id, props, style, className, onEvent,
}: WidgetRenderProps) {
  const {
    src = 'https://via.placeholder.com/400x300',
    alt = 'Image',
    objectFit = 'cover',
    borderRadius = 8,
    overlay = false,
    overlayColor = 'rgba(0,0,0,0.4)',
    overlayText,
    caption,
    hoverEffect = 'none',
    lazy = true,
    aspectRatio,
  } = props;

  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const hoverEffects = {
    none: {},
    zoom: { whileHover: { scale: 1.05 } },
    brighten: { whileHover: { filter: 'brightness(1.2)' } },
    grayscale: { whileHover: { filter: 'grayscale(0)' }, initial: { filter: 'grayscale(1)' } },
    blur: { whileHover: { filter: 'blur(0px)' }, initial: { filter: 'blur(2px)' } },
  };

  return (
    <motion.div
      className={cn('relative overflow-hidden', className)}
      style={{
        borderRadius,
        aspectRatio,
        ...style,
      }}
      {...(hoverEffects[hoverEffect as keyof typeof hoverEffects] ?? {})}
      transition={{ duration: 0.3 }}
    >
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
      {error ? (
        <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 text-gray-400">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={lazy ? 'lazy' : 'eager'}
          className="w-full h-full"
          style={{ objectFit: objectFit as any }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
      {overlay && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: overlayColor }}
        >
          {overlayText && (
            <p className="text-white text-lg font-semibold text-center px-4">{overlayText}</p>
          )}
        </div>
      )}
      {caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm px-3 py-2">
          {caption}
        </div>
      )}
    </motion.div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 4. CARD WIDGET
 * ═══════════════════════════════════════════════════════ */

export const CardWidget = memo(function CardWidget({
  id, props, style, className, onEvent,
}: WidgetRenderProps) {
  const {
    title,
    subtitle,
    description,
    image,
    imagePosition = 'top',
    badge,
    tags = [],
    actions = [],
    variant = 'elevated',
    hoverEffect = true,
    clickable = false,
    borderRadius = 12,
    padding = 16,
  } = props;

  const variantClasses = {
    elevated: 'bg-white dark:bg-gray-800 shadow-lg',
    outlined: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    filled: 'bg-gray-100 dark:bg-gray-800',
    glass: 'bg-white/30 dark:bg-gray-900/30 backdrop-blur-lg border border-white/20',
  };

  return (
    <motion.div
      className={cn(
        'overflow-hidden relative',
        variantClasses[variant as keyof typeof variantClasses] ?? variantClasses.elevated,
        clickable && 'cursor-pointer',
        className,
      )}
      style={{ borderRadius, ...style }}
      whileHover={hoverEffect ? { y: -4, shadow: '0 20px 60px rgba(0,0,0,0.15)' } : undefined}
      onClick={clickable ? () => onEvent?.('click', { widgetId: id }) : undefined}
    >
      {image && imagePosition === 'top' && (
        <div className="aspect-video overflow-hidden">
          <img src={image} alt={title ?? ''} className="w-full h-full object-cover" />
        </div>
      )}

      <div style={{ padding }}>
        {badge && (
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full mb-2">
            {badge}
          </span>
        )}

        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{subtitle}</p>
        )}
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.map((tag: string, i: number) => (
              <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {actions.length > 0 && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            {actions.map((action: any, i: number) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  onEvent?.('action', { widgetId: id, action: action.id });
                }}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  action.primary
                    ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 5. INPUT WIDGET
 * ═══════════════════════════════════════════════════════ */

export const InputWidget = memo(function InputWidget({
  id, props, style, className, onEvent,
}: WidgetRenderProps) {
  const {
    type = 'text',
    placeholder = 'Enter text...',
    label,
    value = '',
    name,
    required = false,
    disabled = false,
    error,
    hint,
    prefix,
    suffix,
    maxLength,
    pattern,
    autoComplete,
    size = 'md',
    variant = 'outline',
  } = props;

  const [val, setVal] = useState(value);
  const [focused, setFocused] = useState(false);

  const sizeClasses = {
    sm: 'py-1.5 text-xs',
    md: 'py-2 text-sm',
    lg: 'py-3 text-base',
  };

  const variantClasses = {
    outline: cn(
      'border bg-white dark:bg-gray-800',
      error
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
        : focused
          ? 'border-indigo-500 ring-2 ring-indigo-500/20'
          : 'border-gray-300 dark:border-gray-600',
    ),
    filled: cn(
      'bg-gray-100 dark:bg-gray-800 border-2 border-transparent',
      focused && 'border-indigo-500',
    ),
    underline: cn(
      'border-b-2 rounded-none bg-transparent',
      focused ? 'border-indigo-500' : 'border-gray-300 dark:border-gray-600',
    ),
  };

  return (
    <div className={cn('w-full', className)} style={style}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            {prefix}
          </span>
        )}
        <input
          type={type}
          name={name}
          value={val}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          pattern={pattern}
          autoComplete={autoComplete}
          onChange={(e) => {
            setVal(e.target.value);
            onEvent?.('change', { widgetId: id, value: e.target.value });
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onEvent?.('blur', { widgetId: id, value: val });
          }}
          className={cn(
            'w-full rounded-lg transition-all duration-200',
            sizeClasses[size as keyof typeof sizeClasses] ?? sizeClasses.md,
            variantClasses[variant as keyof typeof variantClasses] ?? variantClasses.outline,
            prefix ? 'pl-10' : 'pl-3',
            suffix ? 'pr-10' : 'pr-3',
            'text-gray-900 dark:text-white placeholder:text-gray-400',
            'focus:outline-none',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-xs text-red-500"
        >
          {error}
        </motion.p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-400">{hint}</p>
      )}
      {maxLength && (
        <p className="mt-1 text-xs text-gray-400 text-right">
          {val.length}/{maxLength}
        </p>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 6. CONTAINER/SECTION WIDGET
 * ═══════════════════════════════════════════════════════ */

export const ContainerWidget = memo(function ContainerWidget({
  id, props, style, className, onEvent,
}: WidgetRenderProps) {
  const {
    children,
    layout = 'block',
    gap = 16,
    padding = 16,
    background,
    backgroundImage,
    backgroundSize = 'cover',
    backgroundPosition = 'center',
    borderRadius = 0,
    border,
    shadow,
    minHeight,
    maxWidth,
    alignItems = 'stretch',
    justifyContent = 'flex-start',
    flexDirection = 'column',
    flexWrap = 'nowrap',
    gridColumns = 2,
    gridRows,
  } = props;

  const layoutStyles: React.CSSProperties = layout === 'flex' ? {
    display: 'flex',
    flexDirection,
    flexWrap,
    alignItems,
    justifyContent,
    gap,
  } : layout === 'grid' ? {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
    gridTemplateRows: gridRows,
    gap,
    alignItems,
    justifyContent,
  } : {
    display: 'block',
  };

  return (
    <div
      className={className}
      style={{
        padding,
        background,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize,
        backgroundPosition,
        borderRadius,
        border,
        boxShadow: shadow,
        minHeight,
        maxWidth,
        ...layoutStyles,
        ...style,
      }}
    >
      {children}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 7. NAVBAR WIDGET
 * ═══════════════════════════════════════════════════════ */

export const NavbarWidget = memo(function NavbarWidget({
  id, props, style, className, onEvent,
}: WidgetRenderProps) {
  const {
    logo,
    logoText = 'Brand',
    links = [
      { label: 'Home', href: '#' },
      { label: 'About', href: '#' },
      { label: 'Services', href: '#' },
      { label: 'Contact', href: '#' },
    ],
    cta,
    variant = 'solid',
    sticky = true,
    transparent = false,
  } = props;

  const [mobileOpen, setMobileOpen] = useState(false);

  const variantClasses = {
    solid: 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800',
    transparent: 'bg-transparent',
    blur: 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50',
    gradient: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
  };

  return (
    <nav
      className={cn(
        'w-full px-4 py-3',
        variantClasses[variant as keyof typeof variantClasses] ?? variantClasses.solid,
        sticky && 'sticky top-0 z-50',
        className,
      )}
      style={style}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          {logo ? (
            <img src={logo} alt={logoText} className="h-8" />
          ) : (
            <span className="text-xl font-bold">{logoText}</span>
          )}
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link: any, i: number) => (
            <a
              key={i}
              href={link.href}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-500 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                onEvent?.('navigate', { widgetId: id, href: link.href });
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {cta && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 text-sm font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              onClick={() => onEvent?.('cta', { widgetId: id })}
            >
              {cta}
            </motion.button>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="py-3 space-y-2">
              {links.map((link: any, i: number) => (
                <a
                  key={i}
                  href={link.href}
                  className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    onEvent?.('navigate', { widgetId: id, href: link.href });
                    setMobileOpen(false);
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
});

/* ═══════════════════════════════════════════════════════
 * 8. HERO SECTION WIDGET
 * ═══════════════════════════════════════════════════════ */

export const HeroWidget = memo(function HeroWidget({
  id, props, style, className, onEvent,
}: WidgetRenderProps) {
  const {
    title = 'Build Something Amazing',
    subtitle = 'Create beautiful applications with our powerful builder',
    ctaText = 'Get Started',
    ctaSecondaryText,
    backgroundImage,
    backgroundGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    alignment = 'center',
    height = '80vh',
    overlay = true,
    stats,
    image,
  } = props;

  return (
    <motion.section
      className={cn(
        'relative flex items-center overflow-hidden',
        alignment === 'center' && 'text-center justify-center',
        alignment === 'left' && 'text-left',
        alignment === 'right' && 'text-right',
        className,
      )}
      style={{
        minHeight: height,
        background: backgroundImage ? `url(${backgroundImage})` : backgroundGradient,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...style,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {overlay && (
        <div className="absolute inset-0 bg-black/40" />
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {title}
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {subtitle}
        </motion.p>

        <motion.div
          className="flex items-center gap-4 justify-center flex-wrap"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 text-lg font-semibold bg-white text-indigo-600 rounded-full shadow-xl hover:shadow-2xl transition-shadow"
            onClick={() => onEvent?.('cta', { widgetId: id })}
          >
            {ctaText}
          </motion.button>
          {ctaSecondaryText && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 text-lg font-semibold text-white border-2 border-white/50 rounded-full hover:border-white transition-colors"
              onClick={() => onEvent?.('ctaSecondary', { widgetId: id })}
            >
              {ctaSecondaryText}
            </motion.button>
          )}
        </motion.div>

        {stats && (
          <motion.div
            className="flex items-center justify-center gap-12 mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {stats.map((stat: any, i: number) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
});

/* ═══════════════════════════════════════════════════════
 * 9. TABLE WIDGET
 * ═══════════════════════════════════════════════════════ */

export const TableWidget = memo(function TableWidget({
  id, props, style, className, onEvent,
}: WidgetRenderProps) {
  const {
    columns = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status' },
    ],
    data = [
      { name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
      { name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
      { name: 'Bob Wilson', email: 'bob@example.com', role: 'Editor', status: 'Inactive' },
    ],
    striped = true,
    hoverable = true,
    bordered = false,
    compact = false,
    selectable = false,
    sortable = true,
    searchable = false,
    pagination = false,
    pageSize = 10,
  } = props;

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchQuery) {
      result = result.filter((row: any) =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    }

    if (sortKey) {
      result.sort((a: any, b: any) => {
        const aVal = a[sortKey] ?? '';
        const bVal = b[sortKey] ?? '';
        const cmp = String(aVal).localeCompare(String(bVal));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [data, searchQuery, sortKey, sortDir]);

  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pagination, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  return (
    <div className={cn('w-full', className)} style={style}>
      {searchable && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-64 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              {selectable && (
                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(new Set(paginatedData.map((_: any, i: number) => i)));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
              )}
              {columns.map((col: any) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                    sortable && 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 select-none',
                  )}
                  onClick={() => {
                    if (!sortable) return;
                    if (sortKey === col.key) {
                      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortKey(col.key);
                      setSortDir('asc');
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    {sortable && sortKey === col.key && (
                      <svg className={cn('w-4 h-4', sortDir === 'desc' && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row: any, rowIndex: number) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: rowIndex * 0.03 }}
                className={cn(
                  'border-b border-gray-100 dark:border-gray-700/50',
                  striped && rowIndex % 2 === 1 && 'bg-gray-50/50 dark:bg-gray-800/30',
                  hoverable && 'hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10',
                  selectedRows.has(rowIndex) && 'bg-indigo-50 dark:bg-indigo-900/20',
                  bordered && 'border',
                )}
              >
                {selectable && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(rowIndex)}
                      onChange={(e) => {
                        const next = new Set(selectedRows);
                        if (e.target.checked) next.add(rowIndex);
                        else next.delete(rowIndex);
                        setSelectedRows(next);
                        onEvent?.('select', { widgetId: id, selected: Array.from(next) });
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                )}
                {columns.map((col: any) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 text-gray-700 dark:text-gray-300',
                      compact ? 'py-2' : 'py-3',
                    )}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'px-3 py-1 text-sm rounded-md transition-colors',
                  page === currentPage
                    ? 'bg-indigo-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
                )}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 10. PRICING WIDGET
 * ═══════════════════════════════════════════════════════ */

export const PricingWidget = memo(function PricingWidget({
  id, props, style, className, onEvent,
}: WidgetRenderProps) {
  const {
    plans = [
      {
        name: 'Starter',
        price: 9,
        period: 'month',
        description: 'Perfect for individuals',
        features: ['5 Projects', '1GB Storage', 'Basic Support', 'API Access'],
        highlighted: false,
        cta: 'Start Free Trial',
      },
      {
        name: 'Pro',
        price: 29,
        period: 'month',
        description: 'Best for growing teams',
        features: ['Unlimited Projects', '10GB Storage', 'Priority Support', 'API Access', 'Custom Domains', 'Analytics'],
        highlighted: true,
        cta: 'Get Started',
        badge: 'Most Popular',
      },
      {
        name: 'Enterprise',
        price: 99,
        period: 'month',
        description: 'For large organizations',
        features: ['Everything in Pro', '100GB Storage', 'Dedicated Support', 'SLA', 'SSO', 'Audit Logs', 'Custom Integrations'],
        highlighted: false,
        cta: 'Contact Sales',
      },
    ],
    currency = '$',
    annualDiscount = 20,
  } = props;

  const [annual, setAnnual] = useState(false);

  return (
    <div className={cn('w-full', className)} style={style}>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={cn('text-sm font-medium', !annual && 'text-gray-900 dark:text-white')}>Monthly</span>
        <button
          onClick={() => setAnnual(!annual)}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            annual ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600',
          )}
        >
          <motion.span
            className="inline-block h-4 w-4 rounded-full bg-white shadow"
            animate={{ x: annual ? 24 : 4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
        <span className={cn('text-sm font-medium', annual && 'text-gray-900 dark:text-white')}>
          Annual
          <span className="ml-1 text-xs text-green-500 font-semibold">Save {annualDiscount}%</span>
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan: any, i: number) => {
          const price = annual
            ? Math.round(plan.price * 12 * (1 - annualDiscount / 100) / 12)
            : plan.price;

          return (
            <motion.div
              key={i}
              className={cn(
                'relative rounded-2xl p-8',
                plan.highlighted
                  ? 'bg-indigo-500 text-white shadow-2xl shadow-indigo-500/30 scale-105'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg',
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold bg-yellow-400 text-yellow-900 rounded-full">
                  {plan.badge}
                </span>
              )}

              <h3 className={cn('text-xl font-bold mb-1', !plan.highlighted && 'text-gray-900 dark:text-white')}>
                {plan.name}
              </h3>
              <p className={cn('text-sm mb-6', plan.highlighted ? 'text-white/70' : 'text-gray-500')}>
                {plan.description}
              </p>

              <div className="mb-6">
                <span className="text-4xl font-bold">{currency}{price}</span>
                <span className={cn('text-sm ml-1', plan.highlighted ? 'text-white/60' : 'text-gray-400')}>
                  /{plan.period}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'w-full py-3 rounded-xl text-sm font-semibold mb-6 transition-colors',
                  plan.highlighted
                    ? 'bg-white text-indigo-600 hover:bg-gray-100'
                    : 'bg-indigo-500 text-white hover:bg-indigo-600',
                )}
                onClick={() => onEvent?.('selectPlan', { widgetId: id, plan: plan.name })}
              >
                {plan.cta}
              </motion.button>

              <ul className="space-y-3">
                {plan.features.map((feature: string, fi: number) => (
                  <li key={fi} className="flex items-center gap-2 text-sm">
                    <svg className={cn('w-5 h-5 flex-shrink-0', plan.highlighted ? 'text-white' : 'text-green-500')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={plan.highlighted ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 11. TESTIMONIAL WIDGET
 * ═══════════════════════════════════════════════════════ */

export const TestimonialWidget = memo(function TestimonialWidget({
  id, props, style, className,
}: WidgetRenderProps) {
  const {
    testimonials = [
      { name: 'Sarah Johnson', role: 'CEO, TechCorp', avatar: '', content: 'This product has transformed how we build applications. Incredible tool!', rating: 5 },
      { name: 'Mike Chen', role: 'CTO, StartupXYZ', avatar: '', content: 'The best builder I have ever used. Saves us hours of development time.', rating: 5 },
      { name: 'Emily Davis', role: 'Designer, CreativeStudio', avatar: '', content: 'Beautiful UI components and smooth animations. Love it!', rating: 4 },
    ],
    variant = 'card',
    autoPlay = true,
    autoPlayInterval = 5000,
  } = props;

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!autoPlay || testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent(c => (c + 1) % testimonials.length);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, testimonials.length]);

  const t = testimonials[current];

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)} style={style}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
        >
          {/* Stars */}
          <div className="flex gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={cn('w-5 h-5', i < (t?.rating ?? 5) ? 'text-yellow-400' : 'text-gray-200')}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          <blockquote className="text-lg text-gray-700 dark:text-gray-200 mb-6 italic">
            &ldquo;{t?.content}&rdquo;
          </blockquote>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
              {t?.name?.charAt(0) ?? 'U'}
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{t?.name}</div>
              <div className="text-sm text-gray-500">{t?.role}</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      {testimonials.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-all',
                i === current
                  ? 'bg-indigo-500 w-6'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 12. FAQ WIDGET
 * ═══════════════════════════════════════════════════════ */

export const FAQWidget = memo(function FAQWidget({
  id, props, style, className,
}: WidgetRenderProps) {
  const {
    title = 'Frequently Asked Questions',
    questions = [
      { q: 'How does the free trial work?', a: 'You get 14 days of full access with no credit card required.' },
      { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time from your dashboard.' },
      { q: 'Do you offer refunds?', a: 'We offer a 30-day money-back guarantee on all paid plans.' },
      { q: 'Is there a team plan?', a: 'Yes! Our Pro and Enterprise plans support team collaboration.' },
      { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and wire transfers.' },
    ],
  } = props;

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={cn('w-full max-w-3xl mx-auto', className)} style={style}>
      {title && (
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
          {title}
        </h2>
      )}

      <div className="space-y-3">
        {questions.map((item: any, i: number) => (
          <motion.div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            initial={false}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-4 text-left"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">{item.q}</span>
              <motion.svg
                animate={{ rotate: openIndex === i ? 45 : 0 }}
                className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </motion.svg>
            </button>
            <AnimatePresence initial={false}>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 text-sm text-gray-600 dark:text-gray-300">
                    {item.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 13. STATS WIDGET
 * ═══════════════════════════════════════════════════════ */

export const StatsWidget = memo(function StatsWidget({
  id, props, style, className,
}: WidgetRenderProps) {
  const {
    stats = [
      { value: '10K+', label: 'Active Users', icon: '👥' },
      { value: '500+', label: 'Projects Built', icon: '🚀' },
      { value: '99.9%', label: 'Uptime', icon: '⚡' },
      { value: '24/7', label: 'Support', icon: '💬' },
    ],
    variant = 'card',
    columns = 4,
  } = props;

  return (
    <div
      className={cn('grid gap-6', className)}
      style={{
        gridTemplateColumns: `repeat(${Math.min(columns, stats.length)}, 1fr)`,
        ...style,
      }}
    >
      {stats.map((stat: any, i: number) => (
        <motion.div
          key={i}
          className={cn(
            'text-center',
            variant === 'card' && 'bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700',
            variant === 'minimal' && 'py-4',
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={variant === 'card' ? { y: -4 } : undefined}
        >
          {stat.icon && (
            <div className="text-3xl mb-3">{stat.icon}</div>
          )}
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {stat.value}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 14. FOOTER WIDGET
 * ═══════════════════════════════════════════════════════ */

export const FooterWidget = memo(function FooterWidget({
  id, props, style, className, onEvent,
}: WidgetRenderProps) {
  const {
    brand = 'AppBuilder',
    description = 'Build beautiful applications with our powerful drag-and-drop builder.',
    columns: footerColumns = [
      {
        title: 'Product',
        links: [
          { label: 'Features', href: '#' },
          { label: 'Pricing', href: '#' },
          { label: 'Templates', href: '#' },
          { label: 'Integrations', href: '#' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'About', href: '#' },
          { label: 'Blog', href: '#' },
          { label: 'Careers', href: '#' },
          { label: 'Contact', href: '#' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { label: 'Privacy', href: '#' },
          { label: 'Terms', href: '#' },
          { label: 'License', href: '#' },
        ],
      },
    ],
    socialLinks = [],
    copyright = `© ${new Date().getFullYear()} AppBuilder. All rights reserved.`,
    variant = 'default',
  } = props;

  return (
    <footer
      className={cn(
        'w-full',
        variant === 'default' && 'bg-gray-900 text-gray-300',
        variant === 'light' && 'bg-gray-50 text-gray-600 border-t border-gray-200',
        variant === 'gradient' && 'bg-gradient-to-br from-gray-900 to-indigo-950 text-gray-300',
        className,
      )}
      style={style}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold text-white mb-3">{brand}</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-sm">{description}</p>
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((social: any, i: number) => (
                  <a
                    key={i}
                    href={social.href}
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      onEvent?.('social', { widgetId: id, platform: social.platform });
                    }}
                  >
                    {social.icon ?? social.platform}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link columns */}
          {footerColumns.map((col: any, i: number) => (
            <div key={i}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link: any, li: number) => (
                  <li key={li}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        onEvent?.('navigate', { widgetId: id, href: link.href });
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500 text-center">{copyright}</p>
        </div>
      </div>
    </footer>
  );
});

/* ═══════════════════════════════════════════════════════
 * 15. CAROUSEL WIDGET
 * ═══════════════════════════════════════════════════════ */

export const CarouselWidget = memo(function CarouselWidget({
  id, props, style, className, onEvent,
}: WidgetRenderProps) {
  const {
    slides = [
      { image: 'https://via.placeholder.com/800x400/6366f1/fff?text=Slide+1', title: 'First Slide', description: 'Amazing content here' },
      { image: 'https://via.placeholder.com/800x400/ec4899/fff?text=Slide+2', title: 'Second Slide', description: 'More great content' },
      { image: 'https://via.placeholder.com/800x400/f59e0b/fff?text=Slide+3', title: 'Third Slide', description: 'Even better content' },
    ],
    autoPlay = true,
    interval = 5000,
    showDots = true,
    showArrows = true,
    aspectRatio = '16/9',
    borderRadius = 16,
  } = props;

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent(c => (c + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  const prev = () => {
    setDirection(-1);
    setCurrent(c => (c - 1 + slides.length) % slides.length);
  };

  const next = () => {
    setDirection(1);
    setCurrent(c => (c + 1) % slides.length);
  };

  const slide = slides[current];

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ borderRadius, aspectRatio, ...style }}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction > 0 ? '-100%' : '100%', opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            src={slide?.image}
            alt={slide?.title ?? ''}
            className="w-full h-full object-cover"
          />
          {(slide?.title || slide?.description) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              {slide.title && <h3 className="text-xl font-bold text-white">{slide.title}</h3>}
              {slide.description && <p className="text-sm text-white/80 mt-1">{slide.description}</p>}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {showArrows && slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-900/80 flex items-center justify-center shadow-lg hover:bg-white transition-colors z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-900/80 flex items-center justify-center shadow-lg hover:bg-white transition-colors z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {showDots && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > current ? 1 : -1);
                setCurrent(i);
              }}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === current ? 'w-6 bg-white' : 'w-2 bg-white/50',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 16. TIMELINE WIDGET
 * ═══════════════════════════════════════════════════════ */

export const TimelineWidget = memo(function TimelineWidget({
  id, props, style, className,
}: WidgetRenderProps) {
  const {
    events = [
      { date: 'Jan 2024', title: 'Project Started', description: 'We kicked off the project with our amazing team.', icon: '🚀' },
      { date: 'Mar 2024', title: 'Beta Launch', description: 'Released the beta version to early adopters.', icon: '🎯' },
      { date: 'Jun 2024', title: 'Public Launch', description: 'Officially launched to the public.', icon: '🎉' },
      { date: 'Sep 2024', title: 'Milestone', description: 'Reached 10,000 active users.', icon: '📈' },
    ],
    variant = 'alternate',
  } = props;

  return (
    <div className={cn('w-full max-w-3xl mx-auto', className)} style={style}>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -translate-x-1/2" />

        {events.map((event: any, i: number) => {
          const isLeft = variant === 'alternate' ? i % 2 === 0 : true;

          return (
            <motion.div
              key={i}
              className={cn(
                'relative flex items-center mb-8',
                isLeft ? 'flex-row' : 'flex-row-reverse',
              )}
              initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
            >
              {/* Content */}
              <div className={cn('w-5/12', isLeft ? 'text-right pr-8' : 'text-left pl-8')}>
                <span className="text-xs font-semibold text-indigo-500">{event.date}</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{event.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{event.description}</p>
              </div>

              {/* Center dot */}
              <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-4 border-indigo-500 flex items-center justify-center text-lg z-10">
                {event.icon ?? '⚡'}
              </div>

              {/* Empty space */}
              <div className="w-5/12" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 17. CTA WIDGET
 * ═══════════════════════════════════════════════════════ */

export const CTAWidget = memo(function CTAWidget({
  id, props, style, className, onEvent,
}: WidgetRenderProps) {
  const {
    title = 'Ready to get started?',
    description = 'Join thousands of users building amazing apps today.',
    ctaText = 'Start for Free',
    ctaSecondary = 'Learn More',
    variant = 'centered',
    gradient = 'from-indigo-500 to-purple-600',
    image,
  } = props;

  return (
    <motion.section
      className={cn(
        'w-full rounded-2xl overflow-hidden',
        `bg-gradient-to-r ${gradient}`,
        className,
      )}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={cn(
        'px-8 py-16',
        variant === 'split' && 'flex items-center gap-8',
        variant === 'centered' && 'text-center',
      )}>
        <div className={variant === 'split' ? 'flex-1' : ''}>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">{description}</p>
          <div className={cn('flex gap-4', variant === 'centered' && 'justify-center')}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-shadow"
              onClick={() => onEvent?.('cta', { widgetId: id })}
            >
              {ctaText}
            </motion.button>
            {ctaSecondary && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 text-white font-semibold border-2 border-white/30 rounded-full hover:border-white transition-colors"
                onClick={() => onEvent?.('ctaSecondary', { widgetId: id })}
              >
                {ctaSecondary}
              </motion.button>
            )}
          </div>
        </div>
        {variant === 'split' && image && (
          <div className="flex-1 hidden md:block">
            <img src={image} alt="" className="rounded-xl shadow-2xl" />
          </div>
        )}
      </div>
    </motion.section>
  );
});

/* ═══════════════════════════════════════════════════════
 * 18. RATING WIDGET
 * ═══════════════════════════════════════════════════════ */

export const RatingWidget = memo(function RatingWidget({
  id, props, style, className, onEvent,
}: WidgetRenderProps) {
  const {
    value = 0,
    max = 5,
    readOnly = false,
    size = 'md',
    showLabel = false,
    label,
    allowHalf = false,
  } = props;

  const [hovered, setHovered] = useState<number | null>(null);
  const [rating, setRating] = useState(value);

  const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };

  const displayValue = hovered ?? rating;

  return (
    <div className={cn('inline-flex items-center gap-2', className)} style={style}>
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <motion.button
            key={i}
            disabled={readOnly}
            whileHover={!readOnly ? { scale: 1.2 } : undefined}
            whileTap={!readOnly ? { scale: 0.9 } : undefined}
            onClick={() => {
              if (readOnly) return;
              setRating(i + 1);
              onEvent?.('rate', { widgetId: id, rating: i + 1 });
            }}
            onMouseEnter={() => !readOnly && setHovered(i + 1)}
            onMouseLeave={() => setHovered(null)}
            className={cn('transition-colors', !readOnly && 'cursor-pointer')}
          >
            <svg
              className={cn(
                sizeMap[size as keyof typeof sizeMap] ?? sizeMap.md,
                i < displayValue ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600',
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </motion.button>
        ))}
      </div>
      {showLabel && (
        <span className="text-sm text-gray-500">
          {label ?? `${displayValue} / ${max}`}
        </span>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 19. FILE UPLOAD WIDGET
 * ═══════════════════════════════════════════════════════ */

export const FileUploadWidget = memo(function FileUploadWidget({
  id, props, style, className, onEvent,
}: WidgetRenderProps) {
  const {
    accept = '*',
    multiple = false,
    maxSize = 10 * 1024 * 1024,
    label = 'Upload files',
    description = 'Drag and drop files here or click to browse',
  } = props;

  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((fileList: FileList) => {
    const validFiles = Array.from(fileList).filter(f => f.size <= maxSize);
    setFiles(prev => multiple ? [...prev, ...validFiles] : validFiles.slice(0, 1));
    onEvent?.('upload', { widgetId: id, files: validFiles });
  }, [id, maxSize, multiple, onEvent]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('w-full', className)} style={style}>
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>}

      <motion.div
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer',
          'transition-colors duration-200',
          isDragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <svg className="w-10 h-10 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        <p className="text-xs text-gray-400 mt-1">Max size: {(maxSize / 1024 / 1024).toFixed(0)}MB</p>
      </motion.div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{file.name}</span>
              <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)}KB</span>
              <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 20. GALLERY WIDGET
 * ═══════════════════════════════════════════════════════ */

export const GalleryWidget = memo(function GalleryWidget({
  id, props, style, className, onEvent,
}: WidgetRenderProps) {
  const {
    images = [
      { src: 'https://via.placeholder.com/400x300/6366f1/fff?text=Image+1', alt: 'Image 1', title: 'Beautiful Sunset' },
      { src: 'https://via.placeholder.com/400x300/ec4899/fff?text=Image+2', alt: 'Image 2', title: 'Mountain View' },
      { src: 'https://via.placeholder.com/400x300/f59e0b/fff?text=Image+3', alt: 'Image 3', title: 'Ocean Waves' },
      { src: 'https://via.placeholder.com/400x300/10b981/fff?text=Image+4', alt: 'Image 4', title: 'Forest Path' },
      { src: 'https://via.placeholder.com/400x300/ef4444/fff?text=Image+5', alt: 'Image 5', title: 'City Lights' },
      { src: 'https://via.placeholder.com/400x300/8b5cf6/fff?text=Image+6', alt: 'Image 6', title: 'Desert Sand' },
    ],
    columns = 3,
    gap = 8,
    variant = 'grid',
    lightbox = true,
  } = props;

  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <>
      <div
        className={cn(
          variant === 'grid' && 'grid',
          variant === 'masonry' && 'columns-3 space-y-2',
          className,
        )}
        style={{
          ...(variant === 'grid' ? { gridTemplateColumns: `repeat(${columns}, 1fr)`, gap } : {}),
          ...style,
        }}
      >
        {images.map((img: any, i: number) => (
          <motion.div
            key={i}
            className="relative overflow-hidden rounded-lg cursor-pointer group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              if (lightbox) setSelectedImage(i);
              onEvent?.('imageClick', { widgetId: id, index: i });
            }}
          >
            <img src={img.src} alt={img.alt} className="w-full h-full object-cover aspect-square" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
              <motion.div
                className="w-full p-3 bg-gradient-to-t from-black/60 to-transparent"
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
              >
                {img.title && <p className="text-sm text-white font-medium">{img.title}</p>}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && selectedImage !== null && (
          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              src={images[selectedImage]?.src}
              alt={images[selectedImage]?.alt}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
            />
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
              onClick={() => setSelectedImage(null)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

/* ═══════════════════════════════════════════════════════
 * WIDGET REGISTRY MAP
 * ═══════════════════════════════════════════════════════ */

export const widgetRenderers: Record<string, React.ComponentType<WidgetRenderProps>> = {
  button: ButtonWidget,
  text: TextWidget,
  image: ImageWidget,
  card: CardWidget,
  input: InputWidget,
  container: ContainerWidget,
  section: ContainerWidget,
  navbar: NavbarWidget,
  hero: HeroWidget,
  table: TableWidget,
  pricing: PricingWidget,
  testimonial: TestimonialWidget,
  faq: FAQWidget,
  stats: StatsWidget,
  footer: FooterWidget,
  carousel: CarouselWidget,
  timeline: TimelineWidget,
  cta: CTAWidget,
  rating: RatingWidget,
  fileUpload: FileUploadWidget,
  gallery: GalleryWidget,
};

/**
 * Universal Widget Renderer
 * Renders any widget type by looking up the appropriate renderer
 */
export function WidgetComponent(renderProps: WidgetRenderProps) {
  const Renderer = widgetRenderers[renderProps.type];
  if (!Renderer) {
    return (
      <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center text-sm text-gray-400">
        Unknown widget: {renderProps.type}
      </div>
    );
  }
  return <Renderer {...renderProps} />;
}
