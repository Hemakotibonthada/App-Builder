// =============================================================================
// Color Picker Component - Advanced color picker with multiple modes,
// presets, gradients, opacity, and color harmonies
// =============================================================================

'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';

// =============================================================================
// Color Picker Types
// =============================================================================

export interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose?: () => void;
  showAlpha?: boolean;
  showPresets?: boolean;
  showInput?: boolean;
  showEyeDropper?: boolean;
  presets?: string[];
  recentColors?: string[];
  mode?: ColorMode;
}

export type ColorMode = 'hex' | 'rgb' | 'hsl' | 'hsb';

export interface HSL {
  h: number;  // 0-360
  s: number;  // 0-100
  l: number;  // 0-100
}

export interface RGB {
  r: number;  // 0-255
  g: number;  // 0-255
  b: number;  // 0-255
}

export interface HSB {
  h: number;  // 0-360
  s: number;  // 0-100
  b: number;  // 0-100
}

// =============================================================================
// Color Conversion Utilities
// =============================================================================

export function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace('#', '');
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex;

  return {
    r: parseInt(fullHex.slice(0, 2), 16),
    g: parseInt(fullHex.slice(2, 4), 16),
    b: parseInt(fullHex.slice(4, 6), 16),
  };
}

export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;

  if (d === 0) return { h: 0, s: 0, l: Math.round(l * 100) };

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;

  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    case b: h = ((r - g) / d + 4) / 6; break;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1/3) * 255),
  };
}

export function rgbToHsb(rgb: RGB): HSB {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    b: Math.round(v * 100),
  };
}

export function hsbToRgb(hsb: HSB): RGB {
  const h = hsb.h / 360;
  const s = hsb.s / 100;
  const v = hsb.b / 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r = 0, g = 0, b = 0;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// =============================================================================
// Color Analysis & Harmonies
// =============================================================================

export function getContrastRatio(color1: RGB, color2: RGB): number {
  const luminance = (rgb: RGB) => {
    const linearize = (c: number) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * linearize(rgb.r) + 0.7152 * linearize(rgb.g) + 0.0722 * linearize(rgb.b);
  };

  const l1 = luminance(color1);
  const l2 = luminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

export function getWCAGLevel(ratio: number): 'AAA' | 'AA' | 'A' | 'Fail' {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'A';
  return 'Fail';
}

export function getComplementary(hsl: HSL): HSL {
  return { ...hsl, h: (hsl.h + 180) % 360 };
}

export function getAnalogous(hsl: HSL, spread: number = 30): HSL[] {
  return [
    { ...hsl, h: (hsl.h - spread + 360) % 360 },
    hsl,
    { ...hsl, h: (hsl.h + spread) % 360 },
  ];
}

export function getTriadic(hsl: HSL): HSL[] {
  return [
    hsl,
    { ...hsl, h: (hsl.h + 120) % 360 },
    { ...hsl, h: (hsl.h + 240) % 360 },
  ];
}

export function getTetradic(hsl: HSL): HSL[] {
  return [
    hsl,
    { ...hsl, h: (hsl.h + 90) % 360 },
    { ...hsl, h: (hsl.h + 180) % 360 },
    { ...hsl, h: (hsl.h + 270) % 360 },
  ];
}

export function getSplitComplementary(hsl: HSL): HSL[] {
  return [
    hsl,
    { ...hsl, h: (hsl.h + 150) % 360 },
    { ...hsl, h: (hsl.h + 210) % 360 },
  ];
}

export function generateShades(hsl: HSL, count: number = 9): HSL[] {
  const shades: HSL[] = [];
  for (let i = 0; i < count; i++) {
    const lightness = 95 - (i * (90 / (count - 1)));
    shades.push({ ...hsl, l: Math.round(lightness) });
  }
  return shades;
}

export function generateTints(hsl: HSL, count: number = 5): HSL[] {
  const tints: HSL[] = [];
  for (let i = 0; i < count; i++) {
    const lightness = hsl.l + ((100 - hsl.l) * (i / (count - 1)));
    tints.push({ ...hsl, l: Math.round(lightness) });
  }
  return tints;
}

// =============================================================================
// Color Presets
// =============================================================================

export const DEFAULT_COLOR_PRESETS: string[] = [
  // Reds
  '#fecaca', '#f87171', '#ef4444', '#dc2626', '#991b1b',
  // Oranges
  '#fed7aa', '#fb923c', '#f97316', '#ea580c', '#9a3412',
  // Yellows
  '#fef08a', '#facc15', '#eab308', '#ca8a04', '#854d0e',
  // Greens
  '#bbf7d0', '#4ade80', '#22c55e', '#16a34a', '#166534',
  // Blues
  '#bfdbfe', '#60a5fa', '#3b82f6', '#2563eb', '#1e3a8a',
  // Purples
  '#e9d5ff', '#a78bfa', '#8b5cf6', '#7c3aed', '#5b21b6',
  // Pinks
  '#fbcfe8', '#f472b6', '#ec4899', '#db2777', '#9d174d',
  // Grays
  '#f9fafb', '#d1d5db', '#9ca3af', '#6b7280', '#374151',
  '#1f2937', '#111827', '#000000', '#ffffff', 'transparent',
];

export const TAILWIND_COLORS: Record<string, Record<number, string>> = {
  slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' },
  gray: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#030712' },
  red: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a' },
  orange: { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407' },
  yellow: { 50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047', 400: '#facc15', 500: '#eab308', 600: '#ca8a04', 700: '#a16207', 800: '#854d0e', 900: '#713f12', 950: '#422006' },
  green: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d', 950: '#052e16' },
  blue: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' },
  indigo: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b' },
  purple: { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7c3aed', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764' },
  pink: { 50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d', 900: '#831843', 950: '#500724' },
};

// =============================================================================
// Color Format Utils
// =============================================================================

export function formatColor(rgb: RGB, alpha: number, mode: ColorMode): string {
  switch (mode) {
    case 'hex':
      return alpha < 1
        ? `${rgbToHex(rgb)}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
        : rgbToHex(rgb);
    case 'rgb':
      return alpha < 1
        ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
        : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    case 'hsl': {
      const hsl = rgbToHsl(rgb);
      return alpha < 1
        ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha})`
        : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    }
    case 'hsb': {
      const hsb = rgbToHsb(rgb);
      return `hsb(${hsb.h}, ${hsb.s}%, ${hsb.b}%)`;
    }
  }
}

export function parseColor(color: string): { rgb: RGB; alpha: number } | null {
  // Hex
  const hexMatch = color.match(/^#([0-9a-f]{3,8})$/i);
  if (hexMatch && hexMatch[1]) {
    const hex = hexMatch[1];
    let r = 0, g = 0, b = 0, a = 1;
    if (hex.length === 3) {
      r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
      g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else if (hex.length === 8) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
      a = parseInt(hex.slice(6, 8), 16) / 255;
    }
    return { rgb: { r, g, b }, alpha: a };
  }

  // RGB/RGBA
  const rgbMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (rgbMatch) {
    return {
      rgb: { r: Number(rgbMatch[1]), g: Number(rgbMatch[2]), b: Number(rgbMatch[3]) },
      alpha: rgbMatch[4] !== undefined ? Number(rgbMatch[4]) : 1,
    };
  }

  // HSL/HSLA
  const hslMatch = color.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+))?\s*\)/);
  if (hslMatch) {
    const hsl: HSL = { h: Number(hslMatch[1]), s: Number(hslMatch[2]), l: Number(hslMatch[3]) };
    return {
      rgb: hslToRgb(hsl),
      alpha: hslMatch[4] !== undefined ? Number(hslMatch[4]) : 1,
    };
  }

  return null;
}

// =============================================================================
// CSS Generation for Color Picker Component
// =============================================================================

export function generateColorPickerCSS(theme: 'light' | 'dark' = 'dark'): string {
  const isDark = theme === 'dark';

  return `.color-picker {
  width: 280px;
  background: ${isDark ? '#1e1e2e' : '#ffffff'};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,${isDark ? '0.4' : '0.15'}),
              0 4px 16px rgba(0,0,0,${isDark ? '0.2' : '0.08'});
  border: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'};
  font-family: system-ui, -apple-system, sans-serif;
}

.color-picker__saturation {
  position: relative;
  width: 100%;
  height: 180px;
  border-radius: 8px;
  cursor: crosshair;
  overflow: hidden;
  margin-bottom: 12px;
}

.color-picker__saturation-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, white, transparent),
              linear-gradient(to top, black, transparent);
}

.color-picker__cursor {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.color-picker__hue-slider {
  width: 100%;
  height: 14px;
  border-radius: 7px;
  background: linear-gradient(to right,
    hsl(0, 100%, 50%),
    hsl(60, 100%, 50%),
    hsl(120, 100%, 50%),
    hsl(180, 100%, 50%),
    hsl(240, 100%, 50%),
    hsl(300, 100%, 50%),
    hsl(360, 100%, 50%)
  );
  cursor: pointer;
  position: relative;
  margin-bottom: 8px;
}

.color-picker__alpha-slider {
  width: 100%;
  height: 14px;
  border-radius: 7px;
  cursor: pointer;
  position: relative;
  margin-bottom: 12px;
  background-image: 
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0;
}

.color-picker__alpha-gradient {
  position: absolute;
  inset: 0;
  border-radius: 7px;
}

.color-picker__slider-thumb {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  top: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.color-picker__inputs {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.color-picker__input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.color-picker__input {
  width: 100%;
  padding: 6px 8px;
  background: ${isDark ? '#2a2a3e' : '#f3f4f6'};
  border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'};
  border-radius: 6px;
  color: ${isDark ? '#e5e7eb' : '#1f2937'};
  font-size: 12px;
  text-align: center;
  outline: none;
  transition: border-color 150ms ease;
}

.color-picker__input:focus {
  border-color: #6366f1;
}

.color-picker__input-label {
  font-size: 10px;
  color: ${isDark ? '#6b7280' : '#9ca3af'};
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.color-picker__mode-toggle {
  background: none;
  border: none;
  color: ${isDark ? '#6b7280' : '#9ca3af'};
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.color-picker__mode-toggle:hover {
  background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
  color: ${isDark ? '#d1d5db' : '#374151'};
}

.color-picker__preview {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.color-picker__preview-swatch {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  flex-shrink: 0;
}

.color-picker__hex-input {
  flex: 1;
  padding: 8px 12px;
  background: ${isDark ? '#2a2a3e' : '#f3f4f6'};
  border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'};
  border-radius: 8px;
  color: ${isDark ? '#e5e7eb' : '#1f2937'};
  font-size: 14px;
  font-family: monospace;
  outline: none;
}

.color-picker__hex-input:focus {
  border-color: #6366f1;
}

.color-picker__presets {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4px;
  margin-top: 8px;
}

.color-picker__preset {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 4px;
  border: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
  cursor: pointer;
  transition: transform 100ms ease;
}

.color-picker__preset:hover {
  transform: scale(1.2);
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.color-picker__section-label {
  font-size: 11px;
  font-weight: 600;
  color: ${isDark ? '#6b7280' : '#9ca3af'};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 12px 0 6px;
}

.color-picker__harmonies {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

.color-picker__harmony-swatch {
  flex: 1;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
  transition: transform 100ms ease;
}

.color-picker__harmony-swatch:hover {
  transform: scaleY(1.3);
}

.color-picker__eyedropper {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${isDark ? '#2a2a3e' : '#f3f4f6'};
  border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'};
  border-radius: 6px;
  color: ${isDark ? '#d1d5db' : '#374151'};
  cursor: pointer;
  font-size: 13px;
  transition: all 150ms ease;
  width: 100%;
  justify-content: center;
  margin-top: 8px;
}

.color-picker__eyedropper:hover {
  background: ${isDark ? '#3a3a4e' : '#e5e7eb'};
  border-color: ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'};
}`;
}

// =============================================================================
// Color Picker Component (skeleton for React)
// =============================================================================

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  onClose,
  showAlpha = true,
  showPresets = true,
  showInput = true,
  showEyeDropper = true,
  presets = DEFAULT_COLOR_PRESETS,
  mode: initialMode = 'hex',
}) => {
  const [mode, setMode] = useState<ColorMode>(initialMode);
  const [alpha, setAlpha] = useState(1);
  const parsed = useMemo(() => parseColor(color), [color]);
  const rgb = parsed?.rgb ?? { r: 0, g: 0, b: 0 };
  const hsl = useMemo(() => rgbToHsl(rgb), [rgb.r, rgb.g, rgb.b]);
  const hsb = useMemo(() => rgbToHsb(rgb), [rgb.r, rgb.g, rgb.b]);
  const containerRef = useRef<HTMLDivElement>(null);

  const cycleMode = useCallback(() => {
    const modes: ColorMode[] = ['hex', 'rgb', 'hsl'];
    const currentIndex = modes.indexOf(mode);
    const nextMode = modes[(currentIndex + 1) % modes.length] ?? 'hex';
    setMode(nextMode);
  }, [mode]);

  const handlePresetClick = useCallback(
    (preset: string) => { onChange(preset); },
    [onChange]
  );

  const complementary = useMemo(() => getComplementary(hsl), [hsl]);
  const analogous = useMemo(() => getAnalogous(hsl), [hsl]);
  const triadic = useMemo(() => getTriadic(hsl), [hsl]);

  return React.createElement('div', {
    ref: containerRef,
    className: 'color-picker',
  },
    // Saturation area
    React.createElement('div', {
      className: 'color-picker__saturation',
      style: { backgroundColor: `hsl(${hsl.h}, 100%, 50%)` },
    },
      React.createElement('div', { className: 'color-picker__saturation-overlay' }),
      React.createElement('div', {
        className: 'color-picker__cursor',
        style: {
          left: `${hsb.s}%`,
          top: `${100 - hsb.b}%`,
          backgroundColor: color,
        },
      }),
    ),

    // Preview
    React.createElement('div', { className: 'color-picker__preview' },
      React.createElement('div', {
        className: 'color-picker__preview-swatch',
        style: { backgroundColor: color },
      }),
      showInput && React.createElement('input', {
        className: 'color-picker__hex-input',
        value: formatColor(rgb, alpha, mode),
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          const parsed = parseColor(e.target.value);
          if (parsed) onChange(rgbToHex(parsed.rgb));
        },
      }),
      React.createElement('button', {
        className: 'color-picker__mode-toggle',
        onClick: cycleMode,
      }, mode.toUpperCase()),
    ),

    // Presets
    showPresets && React.createElement('div', null,
      React.createElement('div', { className: 'color-picker__section-label' }, 'Presets'),
      React.createElement('div', { className: 'color-picker__presets' },
        ...presets.map(preset =>
          React.createElement('button', {
            key: preset,
            className: 'color-picker__preset',
            style: { backgroundColor: preset },
            onClick: () => handlePresetClick(preset),
          })
        ),
      ),
    ),

    // Harmonies
    React.createElement('div', null,
      React.createElement('div', { className: 'color-picker__section-label' }, 'Harmonies'),
      React.createElement('div', { className: 'color-picker__harmonies' },
        ...[complementary, ...analogous, ...triadic].map((h, i) =>
          React.createElement('div', {
            key: i,
            className: 'color-picker__harmony-swatch',
            style: { backgroundColor: `hsl(${h.h}, ${h.s}%, ${h.l}%)` },
            onClick: () => onChange(rgbToHex(hslToRgb(h))),
          })
        ),
      ),
    ),
  );
};

export default ColorPicker;
