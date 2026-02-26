/**
 * Utility Functions
 * 
 * ID generation, color manipulation, layout helpers, and validators.
 */

import { DimensionValue, SpacingValue, BorderRadiusValue, WidgetStyle, BorderStyle, BackgroundValue, BorderValue, ShadowValue } from '@/types/widget.types';
import { Point2D, Rect, ViewportTransform } from '@/types/canvas.types';

/* ──────────────────────────────────────────────
 * ID Generation
 * ────────────────────────────────────────────── */

let _counter = 0;

/**
 * Generates a unique ID with an optional prefix.
 * Uses a combination of timestamp, random value, and counter
 * to ensure uniqueness even in rapid consecutive calls.
 */
export function generateId(prefix: string = 'w'): string {
  _counter += 1;
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  const counterPart = _counter.toString(36);
  return `${prefix}_${timestamp}_${randomPart}_${counterPart}`;
}

/**
 * Generates a short-form ID for internal use.
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Resets the ID counter (for testing purposes).
 */
export function resetIdCounter(): void {
  _counter = 0;
}

/* ──────────────────────────────────────────────
 * Color Utilities
 * ────────────────────────────────────────────── */

/**
 * Converts a hex color to RGBA components.
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const sanitized = hex.replace('#', '');
  let r: number, g: number, b: number;

  if (sanitized.length === 3) {
    r = parseInt(sanitized[0]! + sanitized[0]!, 16);
    g = parseInt(sanitized[1]! + sanitized[1]!, 16);
    b = parseInt(sanitized[2]! + sanitized[2]!, 16);
  } else if (sanitized.length === 6) {
    r = parseInt(sanitized.substring(0, 2), 16);
    g = parseInt(sanitized.substring(2, 4), 16);
    b = parseInt(sanitized.substring(4, 6), 16);
  } else {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Converts RGBA values to a hex string.
 */
export function rgbaToHex(r: number, g: number, b: number): string {
  const toHex = (n: number): string => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Lightens a hex color by a percentage (0-100).
 */
export function lightenColor(hex: string, percent: number): string {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);

  const factor = percent / 100;
  const newR = Math.round(r + (255 - r) * factor);
  const newG = Math.round(g + (255 - g) * factor);
  const newB = Math.round(b + (255 - b) * factor);

  return rgbaToHex(newR, newG, newB);
}

/**
 * Darkens a hex color by a percentage (0-100).
 */
export function darkenColor(hex: string, percent: number): string {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);

  const factor = 1 - percent / 100;
  const newR = Math.round(r * factor);
  const newG = Math.round(g * factor);
  const newB = Math.round(b * factor);

  return rgbaToHex(newR, newG, newB);
}

/**
 * Gets appropriate text color (black or white) for a given background.
 */
export function getContrastColor(hex: string): string {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);

  // Using WCAG relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/* ──────────────────────────────────────────────
 * Dimension Utilities
 * ────────────────────────────────────────────── */

/**
 * Converts a DimensionValue to a CSS string.
 */
export function dimensionToCSS(dim: DimensionValue | undefined): string {
  if (!dim) return 'auto';
  if (dim.unit === 'auto') return 'auto';
  return `${dim.value}${dim.unit}`;
}

/**
 * Creates a DimensionValue from a number (defaults to px).
 */
export function px(value: number): DimensionValue {
  return { value, unit: 'px' };
}

/**
 * Creates a DimensionValue with percentage unit.
 */
export function percent(value: number): DimensionValue {
  return { value, unit: '%' };
}

/**
 * Creates a DimensionValue with rem unit.
 */
export function rem(value: number): DimensionValue {
  return { value, unit: 'rem' };
}

/**
 * Converts spacing to CSS padding/margin string.
 */
export function spacingToCSS(spacing: SpacingValue | undefined): string {
  if (!spacing) return '0';
  return `${spacing.top}px ${spacing.right}px ${spacing.bottom}px ${spacing.left}px`;
}

/**
 * Creates uniform spacing.
 */
export function uniformSpacing(value: number): SpacingValue {
  return { top: value, right: value, bottom: value, left: value };
}

/**
 * Creates symmetric spacing (vertical, horizontal).
 */
export function symmetricSpacing(vertical: number, horizontal: number): SpacingValue {
  return { top: vertical, right: horizontal, bottom: vertical, left: horizontal };
}

/**
 * Converts BorderRadiusValue to CSS string.
 */
export function borderRadiusToCSS(radius: BorderRadiusValue | undefined): string {
  if (!radius) return '0';
  return `${radius.topLeft}px ${radius.topRight}px ${radius.bottomRight}px ${radius.bottomLeft}px`;
}

/**
 * Creates uniform border radius.
 */
export function uniformRadius(value: number): BorderRadiusValue {
  return { topLeft: value, topRight: value, bottomRight: value, bottomLeft: value };
}

/* ──────────────────────────────────────────────
 * Layout Utilities
 * ────────────────────────────────────────────── */

/**
 * Checks if a point is inside a rectangle.
 */
export function isPointInRect(point: Point2D, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Checks if two rectangles intersect.
 */
export function doRectsIntersect(a: Rect, b: Rect): boolean {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  );
}

/**
 * Returns the intersection rectangle of two rects, or null.
 */
export function getIntersection(a: Rect, b: Rect): Rect | null {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);

  if (right > x && bottom > y) {
    return { x, y, width: right - x, height: bottom - y };
  }
  return null;
}

/**
 * Returns the bounding rectangle that contains all given rects.
 */
export function getBoundingRect(rects: readonly Rect[]): Rect {
  if (rects.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const rect of rects) {
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.width);
    maxY = Math.max(maxY, rect.y + rect.height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Calculates the center point of a rectangle.
 */
export function getRectCenter(rect: Rect): Point2D {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

/**
 * Calculates the distance between two points.
 */
export function distance(a: Point2D, b: Point2D): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

/**
 * Clamps a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Snaps a value to the nearest grid increment.
 */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Converts screen coordinates to canvas coordinates.
 */
export function screenToCanvas(
  screenPoint: Point2D,
  viewport: ViewportTransform,
): Point2D {
  return {
    x: (screenPoint.x - viewport.x) / viewport.zoom,
    y: (screenPoint.y - viewport.y) / viewport.zoom,
  };
}

/**
 * Converts canvas coordinates to screen coordinates.
 */
export function canvasToScreen(
  canvasPoint: Point2D,
  viewport: ViewportTransform,
): Point2D {
  return {
    x: canvasPoint.x * viewport.zoom + viewport.x,
    y: canvasPoint.y * viewport.zoom + viewport.y,
  };
}

/* ──────────────────────────────────────────────
 * Style Conversion
 * ────────────────────────────────────────────── */

/**
 * Converts a BackgroundValue to a CSS background string.
 */
export function backgroundToCSS(bg: BackgroundValue | undefined): string {
  if (!bg) return 'transparent';

  switch (bg.type) {
    case 'solid':
      return bg.color ?? 'transparent';

    case 'gradient': {
      const stops = bg.gradientStops?.map(s => `${s.color} ${s.position}%`).join(', ') ?? '';
      if (bg.gradientType === 'radial') {
        return `radial-gradient(circle, ${stops})`;
      }
      if (bg.gradientType === 'conic') {
        return `conic-gradient(from ${bg.gradientAngle ?? 0}deg, ${stops})`;
      }
      return `linear-gradient(${bg.gradientAngle ?? 180}deg, ${stops})`;
    }

    case 'image':
      return `url(${bg.imageUrl}) ${bg.imagePosition ?? 'center'} / ${bg.imageSize ?? 'cover'} ${bg.imageRepeat ?? 'no-repeat'}`;

    default:
      return 'transparent';
  }
}

/**
 * Converts a BorderValue to CSS string.
 */
export function borderToCSS(border: BorderValue | undefined): string {
  if (!border || border.style === BorderStyle.None) return 'none';
  return `${border.width}px ${border.style} ${border.color}`;
}

/**
 * Converts shadow array to CSS box-shadow string.
 */
export function shadowToCSS(shadows: readonly ShadowValue[] | undefined): string {
  if (!shadows || shadows.length === 0) return 'none';
  return shadows
    .map(s => {
      const inset = s.inset ? 'inset ' : '';
      return `${inset}${s.offsetX}px ${s.offsetY}px ${s.blurRadius}px ${s.spreadRadius}px ${s.color}`;
    })
    .join(', ');
}

/**
 * Converts a WidgetStyle to a React CSSProperties object.
 */
export function widgetStyleToCSS(style: WidgetStyle): React.CSSProperties {
  const css: Record<string, unknown> = {};

  // Dimensions
  if (style.width) css.width = dimensionToCSS(style.width);
  if (style.height) css.height = dimensionToCSS(style.height);
  if (style.minWidth) css.minWidth = dimensionToCSS(style.minWidth);
  if (style.maxWidth) css.maxWidth = dimensionToCSS(style.maxWidth);
  if (style.minHeight) css.minHeight = dimensionToCSS(style.minHeight);
  if (style.maxHeight) css.maxHeight = dimensionToCSS(style.maxHeight);

  // Spacing
  if (style.padding) css.padding = spacingToCSS(style.padding);
  if (style.margin) css.margin = spacingToCSS(style.margin);

  // Layout
  if (style.display) css.display = style.display;
  if (style.position) css.position = style.position;
  if (style.flexDirection) css.flexDirection = style.flexDirection;
  if (style.justifyContent) css.justifyContent = style.justifyContent;
  if (style.alignItems) css.alignItems = style.alignItems;
  if (style.alignSelf) css.alignSelf = style.alignSelf;
  if (style.flexWrap) css.flexWrap = style.flexWrap;
  if (style.flexGrow !== undefined) css.flexGrow = style.flexGrow;
  if (style.flexShrink !== undefined) css.flexShrink = style.flexShrink;
  if (style.gap !== undefined) css.gap = `${style.gap}px`;
  if (style.order !== undefined) css.order = style.order;
  if (style.gridTemplateColumns) css.gridTemplateColumns = style.gridTemplateColumns;
  if (style.gridTemplateRows) css.gridTemplateRows = style.gridTemplateRows;

  // Position
  if (style.top) css.top = dimensionToCSS(style.top);
  if (style.right) css.right = dimensionToCSS(style.right);
  if (style.bottom) css.bottom = dimensionToCSS(style.bottom);
  if (style.left) css.left = dimensionToCSS(style.left);
  if (style.zIndex !== undefined) css.zIndex = style.zIndex;

  // Background
  if (style.background) css.background = backgroundToCSS(style.background);
  if (style.opacity !== undefined) css.opacity = style.opacity;

  // Borders
  if (style.border) css.border = borderToCSS(style.border);
  if (style.borderTop) css.borderTop = borderToCSS(style.borderTop);
  if (style.borderRight) css.borderRight = borderToCSS(style.borderRight);
  if (style.borderBottom) css.borderBottom = borderToCSS(style.borderBottom);
  if (style.borderLeft) css.borderLeft = borderToCSS(style.borderLeft);
  if (style.borderRadius) css.borderRadius = borderRadiusToCSS(style.borderRadius);

  // Shadow
  if (style.boxShadow) css.boxShadow = shadowToCSS(style.boxShadow);

  // Typography
  if (style.fontSize) css.fontSize = `${style.fontSize}px`;
  if (style.fontWeight) css.fontWeight = style.fontWeight;
  if (style.fontFamily) css.fontFamily = style.fontFamily;
  if (style.lineHeight) css.lineHeight = style.lineHeight;
  if (style.letterSpacing) css.letterSpacing = `${style.letterSpacing}px`;
  if (style.textAlign) css.textAlign = style.textAlign;
  if (style.textDecoration) css.textDecoration = style.textDecoration;
  if (style.textTransform) css.textTransform = style.textTransform;
  if (style.color) css.color = style.color;

  // Overflow
  if (style.overflow) css.overflow = style.overflow;
  if (style.overflowX) css.overflowX = style.overflowX;
  if (style.overflowY) css.overflowY = style.overflowY;

  // Transform
  if (style.transform) {
    const t = style.transform;
    const parts: string[] = [];
    if (t.translateX || t.translateY) {
      parts.push(`translate(${t.translateX}px, ${t.translateY}px)`);
    }
    if (t.rotate) parts.push(`rotate(${t.rotate}deg)`);
    if (t.scaleX !== 1 || t.scaleY !== 1) {
      parts.push(`scale(${t.scaleX}, ${t.scaleY})`);
    }
    if (t.skewX || t.skewY) {
      parts.push(`skew(${t.skewX}deg, ${t.skewY}deg)`);
    }
    if (parts.length > 0) css.transform = parts.join(' ');
  }
  if (style.transformOrigin) css.transformOrigin = style.transformOrigin;

  // Transitions
  if (style.transitions && style.transitions.length > 0) {
    css.transition = style.transitions
      .map(t => `${t.property} ${t.duration}ms ${t.timingFunction} ${t.delay}ms`)
      .join(', ');
  }

  // Cursor
  if (style.cursor) css.cursor = style.cursor;

  // Filters
  const filters: string[] = [];
  if (style.blur) filters.push(`blur(${style.blur}px)`);
  if (style.brightness !== undefined) filters.push(`brightness(${style.brightness})`);
  if (style.contrast !== undefined) filters.push(`contrast(${style.contrast})`);
  if (style.saturate !== undefined) filters.push(`saturate(${style.saturate})`);
  if (filters.length > 0) css.filter = filters.join(' ');
  if (style.backdropBlur) css.backdropFilter = `blur(${style.backdropBlur}px)`;

  return css as React.CSSProperties;
}

/* ──────────────────────────────────────────────
 * Validators
 * ────────────────────────────────────────────── */

/**
 * Validates a hex color string.
 */
export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color);
}

/**
 * Validates a URL string.
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates a bundle identifier (e.g., com.example.app).
 */
export function isValidBundleId(bundleId: string): boolean {
  return /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/.test(bundleId);
}

/**
 * Validates a semver version string.
 */
export function isValidSemver(version: string): boolean {
  return /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/.test(version);
}

/**
 * Validates that a widget name is acceptable.
 */
export function isValidWidgetName(name: string): boolean {
  return name.length >= 1 && name.length <= 50 && /^[a-zA-Z0-9_\- ]+$/.test(name);
}

/**
 * Deep clones an object using structured clone.
 */
export function deepClone<T>(obj: T): T {
  return structuredClone(obj);
}

/**
 * Throttles a function to only execute once per interval.
 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  intervalMs: number,
): T {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return ((...args: unknown[]) => {
    const now = Date.now();
    const elapsed = now - lastCall;

    if (elapsed >= intervalMs) {
      lastCall = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, intervalMs - elapsed);
    }
  }) as T;
}

/**
 * Debounces a function to only execute after a delay.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delayMs: number,
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: unknown[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delayMs);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}
