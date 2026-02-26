/**
 * Alignment Tools
 * 
 * Aligns, distributes, and resizes selected widgets
 * relative to each other or to the canvas.
 * 
 * Features:
 * - Align left/center/right/top/middle/bottom
 * - Distribute horizontally/vertically
 * - Match width/height/both
 * - Space evenly
 * - Center on canvas
 */

import { WidgetConfig } from '@/types/widget.types';

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export type AlignType = 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom';
export type DistributeType = 'horizontal' | 'vertical';
export type MatchSizeType = 'width' | 'height' | 'both';

interface WidgetRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/* ──────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────── */

function getRect(w: WidgetConfig): WidgetRect {
  return {
    id: w.id,
    x: w.position.x,
    y: w.position.y,
    width: w.style.width?.value ?? 100,
    height: w.style.height?.value ?? 40,
  };
}

/* ──────────────────────────────────────────────
 * Alignment Functions
 * ────────────────────────────────────────────── */

/**
 * Aligns selected widgets.
 * Returns new positions for each widget { id, x, y }.
 */
export function alignWidgets(
  widgets: WidgetConfig[],
  alignment: AlignType,
  canvasWidth?: number,
  canvasHeight?: number,
): { id: string; x: number; y: number }[] {
  if (widgets.length === 0) return [];

  const rects = widgets.map(getRect);

  if (widgets.length === 1 && canvasWidth && canvasHeight) {
    // Align single widget to canvas
    const r = rects[0]!;
    switch (alignment) {
      case 'left': return [{ id: r.id, x: 0, y: r.y }];
      case 'center-h': return [{ id: r.id, x: (canvasWidth - r.width) / 2, y: r.y }];
      case 'right': return [{ id: r.id, x: canvasWidth - r.width, y: r.y }];
      case 'top': return [{ id: r.id, x: r.x, y: 0 }];
      case 'center-v': return [{ id: r.id, x: r.x, y: (canvasHeight - r.height) / 2 }];
      case 'bottom': return [{ id: r.id, x: r.x, y: canvasHeight - r.height }];
    }
  }

  // Multi-widget alignment
  const minX = Math.min(...rects.map(r => r.x));
  const maxX = Math.max(...rects.map(r => r.x + r.width));
  const minY = Math.min(...rects.map(r => r.y));
  const maxY = Math.max(...rects.map(r => r.y + r.height));

  switch (alignment) {
    case 'left':
      return rects.map(r => ({ id: r.id, x: minX, y: r.y }));
    case 'center-h': {
      const centerX = (minX + maxX) / 2;
      return rects.map(r => ({ id: r.id, x: centerX - r.width / 2, y: r.y }));
    }
    case 'right':
      return rects.map(r => ({ id: r.id, x: maxX - r.width, y: r.y }));
    case 'top':
      return rects.map(r => ({ id: r.id, x: r.x, y: minY }));
    case 'center-v': {
      const centerY = (minY + maxY) / 2;
      return rects.map(r => ({ id: r.id, x: r.x, y: centerY - r.height / 2 }));
    }
    case 'bottom':
      return rects.map(r => ({ id: r.id, x: r.x, y: maxY - r.height }));
  }
}

/**
 * Distributes widgets evenly along an axis.
 */
export function distributeWidgets(
  widgets: WidgetConfig[],
  direction: DistributeType,
): { id: string; x: number; y: number }[] {
  if (widgets.length < 3) return widgets.map(w => ({ id: w.id, x: w.position.x, y: w.position.y }));

  const rects = widgets.map(getRect);

  if (direction === 'horizontal') {
    const sorted = [...rects].sort((a, b) => a.x - b.x);
    const totalWidth = sorted.reduce((sum, r) => sum + r.width, 0);
    const totalSpan = sorted[sorted.length - 1]!.x + sorted[sorted.length - 1]!.width - sorted[0]!.x;
    const gap = (totalSpan - totalWidth) / (sorted.length - 1);

    let currentX = sorted[0]!.x;
    return sorted.map(r => {
      const result = { id: r.id, x: currentX, y: r.y };
      currentX += r.width + gap;
      return result;
    });
  }

  // Vertical
  const sorted = [...rects].sort((a, b) => a.y - b.y);
  const totalHeight = sorted.reduce((sum, r) => sum + r.height, 0);
  const totalSpan = sorted[sorted.length - 1]!.y + sorted[sorted.length - 1]!.height - sorted[0]!.y;
  const gap = (totalSpan - totalHeight) / (sorted.length - 1);

  let currentY = sorted[0]!.y;
  return sorted.map(r => {
    const result = { id: r.id, x: r.x, y: currentY };
    currentY += r.height + gap;
    return result;
  });
}

/**
 * Matches sizes of selected widgets to the first selected.
 */
export function matchWidgetSizes(
  widgets: WidgetConfig[],
  matchType: MatchSizeType,
): { id: string; width: number; height: number }[] {
  if (widgets.length < 2) return [];

  const reference = getRect(widgets[0]!);

  return widgets.slice(1).map(w => {
    const r = getRect(w);
    return {
      id: w.id,
      width: matchType === 'height' ? r.width : reference.width,
      height: matchType === 'width' ? r.height : reference.height,
    };
  });
}

/**
 * Centers widgets on the canvas.
 */
export function centerOnCanvas(
  widgets: WidgetConfig[],
  canvasWidth: number,
  canvasHeight: number,
): { id: string; x: number; y: number }[] {
  const rects = widgets.map(getRect);
  const minX = Math.min(...rects.map(r => r.x));
  const maxX = Math.max(...rects.map(r => r.x + r.width));
  const minY = Math.min(...rects.map(r => r.y));
  const maxY = Math.max(...rects.map(r => r.y + r.height));

  const groupWidth = maxX - minX;
  const groupHeight = maxY - minY;

  const offsetX = (canvasWidth - groupWidth) / 2 - minX;
  const offsetY = (canvasHeight - groupHeight) / 2 - minY;

  return rects.map(r => ({
    id: r.id,
    x: r.x + offsetX,
    y: r.y + offsetY,
  }));
}

/* ──────────────────────────────────────────────
 * Alignment Tool Definitions (for toolbar UI)
 * ────────────────────────────────────────────── */

export interface AlignmentTool {
  id: string;
  label: string;
  icon: string;
  type: 'align' | 'distribute' | 'match' | 'center';
  value: string;
  requiresMultiple: boolean;
}

export const ALIGNMENT_TOOLS: AlignmentTool[] = [
  { id: 'align-left', label: 'Align Left', icon: 'AlignLeft', type: 'align', value: 'left', requiresMultiple: false },
  { id: 'align-center-h', label: 'Center Horizontally', icon: 'AlignCenterH', type: 'align', value: 'center-h', requiresMultiple: false },
  { id: 'align-right', label: 'Align Right', icon: 'AlignRight', type: 'align', value: 'right', requiresMultiple: false },
  { id: 'align-top', label: 'Align Top', icon: 'AlignTop', type: 'align', value: 'top', requiresMultiple: false },
  { id: 'align-center-v', label: 'Center Vertically', icon: 'AlignCenterV', type: 'align', value: 'center-v', requiresMultiple: false },
  { id: 'align-bottom', label: 'Align Bottom', icon: 'AlignBottom', type: 'align', value: 'bottom', requiresMultiple: false },
  { id: 'dist-horizontal', label: 'Distribute Horizontally', icon: 'DistH', type: 'distribute', value: 'horizontal', requiresMultiple: true },
  { id: 'dist-vertical', label: 'Distribute Vertically', icon: 'DistV', type: 'distribute', value: 'vertical', requiresMultiple: true },
  { id: 'match-width', label: 'Match Width', icon: 'MatchW', type: 'match', value: 'width', requiresMultiple: true },
  { id: 'match-height', label: 'Match Height', icon: 'MatchH', type: 'match', value: 'height', requiresMultiple: true },
  { id: 'center-canvas', label: 'Center on Canvas', icon: 'Center', type: 'center', value: 'canvas', requiresMultiple: false },
];

/* ──────────────────────────────────────────────
 * Design Presets
 * ────────────────────────────────────────────── */

export const COLOR_PALETTES = {
  'Indigo': ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#4f46e5', '#4338ca', '#3730a3'],
  'Blue': ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#2563eb', '#1d4ed8', '#1e40af'],
  'Green': ['#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7', '#16a34a', '#15803d', '#166534'],
  'Red': ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2', '#dc2626', '#b91c1c', '#991b1b'],
  'Purple': ['#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff', '#f3e8ff', '#9333ea', '#7e22ce', '#6b21a8'],
  'Orange': ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#ea580c', '#c2410c', '#9a3412'],
  'Pink': ['#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8', '#fce7f3', '#db2777', '#be185d', '#9d174d'],
  'Slate': ['#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9', '#475569', '#334155', '#1e293b'],
  'Neutral': ['#000000', '#1a1a1a', '#333333', '#666666', '#999999', '#cccccc', '#e5e5e5', '#ffffff'],
};

export const TYPOGRAPHY_PRESETS = {
  'Heading 1': { fontSize: 36, fontWeight: '900', lineHeight: 1.2, letterSpacing: -0.5 },
  'Heading 2': { fontSize: 28, fontWeight: '800', lineHeight: 1.25, letterSpacing: -0.3 },
  'Heading 3': { fontSize: 22, fontWeight: '700', lineHeight: 1.3, letterSpacing: 0 },
  'Heading 4': { fontSize: 18, fontWeight: '700', lineHeight: 1.35, letterSpacing: 0 },
  'Heading 5': { fontSize: 16, fontWeight: '600', lineHeight: 1.4, letterSpacing: 0 },
  'Heading 6': { fontSize: 14, fontWeight: '600', lineHeight: 1.4, letterSpacing: 0 },
  'Body Large': { fontSize: 18, fontWeight: '400', lineHeight: 1.6, letterSpacing: 0 },
  'Body': { fontSize: 16, fontWeight: '400', lineHeight: 1.6, letterSpacing: 0 },
  'Body Small': { fontSize: 14, fontWeight: '400', lineHeight: 1.5, letterSpacing: 0 },
  'Caption': { fontSize: 12, fontWeight: '400', lineHeight: 1.4, letterSpacing: 0.2 },
  'Overline': { fontSize: 11, fontWeight: '600', lineHeight: 1.4, letterSpacing: 1.5 },
  'Button': { fontSize: 14, fontWeight: '600', lineHeight: 1, letterSpacing: 0.5 },
  'Code': { fontSize: 13, fontWeight: '400', lineHeight: 1.5, letterSpacing: 0 },
};

export const SHADOW_PRESETS = {
  'None': [],
  'Small': [{ offsetX: 0, offsetY: 1, blurRadius: 3, spreadRadius: 0, color: 'rgba(0,0,0,0.12)', inset: false }],
  'Medium': [{ offsetX: 0, offsetY: 4, blurRadius: 6, spreadRadius: -1, color: 'rgba(0,0,0,0.1)', inset: false }, { offsetX: 0, offsetY: 2, blurRadius: 4, spreadRadius: -2, color: 'rgba(0,0,0,0.1)', inset: false }],
  'Large': [{ offsetX: 0, offsetY: 10, blurRadius: 15, spreadRadius: -3, color: 'rgba(0,0,0,0.1)', inset: false }, { offsetX: 0, offsetY: 4, blurRadius: 6, spreadRadius: -4, color: 'rgba(0,0,0,0.1)', inset: false }],
  'XL': [{ offsetX: 0, offsetY: 20, blurRadius: 25, spreadRadius: -5, color: 'rgba(0,0,0,0.1)', inset: false }, { offsetX: 0, offsetY: 8, blurRadius: 10, spreadRadius: -6, color: 'rgba(0,0,0,0.1)', inset: false }],
  'Inner': [{ offsetX: 0, offsetY: 2, blurRadius: 4, spreadRadius: 0, color: 'rgba(0,0,0,0.06)', inset: true }],
  'Glow (Indigo)': [{ offsetX: 0, offsetY: 0, blurRadius: 20, spreadRadius: 0, color: 'rgba(99,102,241,0.3)', inset: false }],
  'Glow (Blue)': [{ offsetX: 0, offsetY: 0, blurRadius: 20, spreadRadius: 0, color: 'rgba(59,130,246,0.3)', inset: false }],
  'Glow (Green)': [{ offsetX: 0, offsetY: 0, blurRadius: 20, spreadRadius: 0, color: 'rgba(34,197,94,0.3)', inset: false }],
};

export const BORDER_RADIUS_PRESETS = {
  'None': { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
  'Small': { topLeft: 4, topRight: 4, bottomRight: 4, bottomLeft: 4 },
  'Medium': { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
  'Large': { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 },
  'XL': { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 },
  '2XL': { topLeft: 24, topRight: 24, bottomRight: 24, bottomLeft: 24 },
  'Full': { topLeft: 9999, topRight: 9999, bottomRight: 9999, bottomLeft: 9999 },
  'Top Only': { topLeft: 12, topRight: 12, bottomRight: 0, bottomLeft: 0 },
  'Bottom Only': { topLeft: 0, topRight: 0, bottomRight: 12, bottomLeft: 12 },
  'Left Only': { topLeft: 12, topRight: 0, bottomRight: 0, bottomLeft: 12 },
  'Right Only': { topLeft: 0, topRight: 12, bottomRight: 12, bottomLeft: 0 },
};

export const SPACING_PRESETS = {
  'None': { top: 0, right: 0, bottom: 0, left: 0 },
  'XS': { top: 4, right: 4, bottom: 4, left: 4 },
  'Small': { top: 8, right: 8, bottom: 8, left: 8 },
  'Medium': { top: 16, right: 16, bottom: 16, left: 16 },
  'Large': { top: 24, right: 24, bottom: 24, left: 24 },
  'XL': { top: 32, right: 32, bottom: 32, left: 32 },
  '2XL': { top: 48, right: 48, bottom: 48, left: 48 },
  'Horizontal': { top: 0, right: 16, bottom: 0, left: 16 },
  'Vertical': { top: 16, right: 0, bottom: 16, left: 0 },
  'Card': { top: 20, right: 24, bottom: 20, left: 24 },
  'Section': { top: 48, right: 24, bottom: 48, left: 24 },
  'Page': { top: 64, right: 32, bottom: 64, left: 32 },
};
