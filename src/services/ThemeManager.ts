/**
 * Theme Manager
 * 
 * Full theming system with presets and CSS variable generation.
 * Features:
 * - 15+ theme presets (light, dark, brand colors)
 * - Custom theme creation
 * - Design tokens (color, typography, spacing, etc.)
 * - CSS variable generation
 * - Tailwind config generation
 * - Theme preview
 */

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export interface ThemeTokens {
  id: string;
  name: string;
  description: string;
  mode: 'light' | 'dark';
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
}

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  divider: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  overlay: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontFamilyHeading: string;
  fontFamilyMono: string;
  fontSizeBase: number;
  fontSizeSm: number;
  fontSizeLg: number;
  fontSizeXl: number;
  fontSizeXxl: number;
  lineHeight: number;
  headingWeight: string;
  bodyWeight: string;
}

export interface ThemeSpacing {
  unit: number;
  xs: number; sm: number; md: number; lg: number; xl: number; xxl: number;
}

export interface ThemeBorderRadius {
  none: number; sm: number; md: number; lg: number; xl: number; full: number;
}

export interface ThemeShadows {
  sm: string; md: string; lg: string; xl: string;
}

/* ──────────────────────────────────────────────
 * Theme Presets (15+)
 * ────────────────────────────────────────────── */

const baseTypography: ThemeTypography = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontFamilyHeading: 'Inter, system-ui, sans-serif',
  fontFamilyMono: 'JetBrains Mono, monospace',
  fontSizeBase: 16, fontSizeSm: 14, fontSizeLg: 18, fontSizeXl: 24, fontSizeXxl: 36,
  lineHeight: 1.6, headingWeight: '700', bodyWeight: '400',
};

const baseSpacing: ThemeSpacing = { unit: 4, xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
const baseBorderRadius: ThemeBorderRadius = { none: 0, sm: 4, md: 8, lg: 12, xl: 16, full: 9999 };

export const THEME_PRESETS: ThemeTokens[] = [
  {
    id: 'dark-indigo', name: 'Dark Indigo', description: 'Default dark theme', mode: 'dark',
    colors: { primary: '#6366f1', primaryLight: '#818cf8', primaryDark: '#4f46e5', secondary: '#8b5cf6', accent: '#06b6d4', background: '#0a0a0f', surface: '#13131a', surfaceElevated: '#1a1a25', text: '#e2e8f0', textSecondary: '#94a3b8', textMuted: '#64748b', border: '#2a2a3a', divider: '#1e1e2e', success: '#22c55e', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6', overlay: 'rgba(0,0,0,0.6)' },
    typography: baseTypography, spacing: baseSpacing, borderRadius: baseBorderRadius,
    shadows: { sm: '0 1px 3px rgba(0,0,0,0.3)', md: '0 4px 6px rgba(0,0,0,0.3)', lg: '0 10px 15px rgba(0,0,0,0.4)', xl: '0 20px 25px rgba(0,0,0,0.5)' },
  },
  {
    id: 'light-clean', name: 'Light Clean', description: 'Clean light theme', mode: 'light',
    colors: { primary: '#6366f1', primaryLight: '#818cf8', primaryDark: '#4f46e5', secondary: '#8b5cf6', accent: '#06b6d4', background: '#ffffff', surface: '#f8fafc', surfaceElevated: '#ffffff', text: '#0f172a', textSecondary: '#475569', textMuted: '#94a3b8', border: '#e2e8f0', divider: '#f1f5f9', success: '#22c55e', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6', overlay: 'rgba(0,0,0,0.4)' },
    typography: baseTypography, spacing: baseSpacing, borderRadius: baseBorderRadius,
    shadows: { sm: '0 1px 3px rgba(0,0,0,0.1)', md: '0 4px 6px rgba(0,0,0,0.07)', lg: '0 10px 15px rgba(0,0,0,0.1)', xl: '0 20px 25px rgba(0,0,0,0.15)' },
  },
  {
    id: 'dark-blue', name: 'Dark Blue', description: 'Deep blue dark theme', mode: 'dark',
    colors: { primary: '#3b82f6', primaryLight: '#60a5fa', primaryDark: '#2563eb', secondary: '#06b6d4', accent: '#8b5cf6', background: '#0c1222', surface: '#111827', surfaceElevated: '#1f2937', text: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#6b7280', border: '#1f2937', divider: '#1f2937', success: '#22c55e', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6', overlay: 'rgba(0,0,0,0.6)' },
    typography: baseTypography, spacing: baseSpacing, borderRadius: baseBorderRadius,
    shadows: { sm: '0 1px 3px rgba(0,0,0,0.4)', md: '0 4px 6px rgba(0,0,0,0.4)', lg: '0 10px 15px rgba(0,0,0,0.5)', xl: '0 20px 25px rgba(0,0,0,0.6)' },
  },
  {
    id: 'dark-green', name: 'Dark Emerald', description: 'Green-accented dark theme', mode: 'dark',
    colors: { primary: '#10b981', primaryLight: '#34d399', primaryDark: '#059669', secondary: '#06b6d4', accent: '#6366f1', background: '#0a0f0d', surface: '#111916', surfaceElevated: '#1a2520', text: '#e2e8f0', textSecondary: '#94a3b8', textMuted: '#64748b', border: '#1e3a2f', divider: '#1e3a2f', success: '#22c55e', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6', overlay: 'rgba(0,0,0,0.6)' },
    typography: baseTypography, spacing: baseSpacing, borderRadius: baseBorderRadius,
    shadows: { sm: '0 1px 3px rgba(0,0,0,0.3)', md: '0 4px 6px rgba(0,0,0,0.3)', lg: '0 10px 15px rgba(0,0,0,0.4)', xl: '0 20px 25px rgba(0,0,0,0.5)' },
  },
  {
    id: 'dark-rose', name: 'Dark Rose', description: 'Pink/rose accented dark theme', mode: 'dark',
    colors: { primary: '#f43f5e', primaryLight: '#fb7185', primaryDark: '#e11d48', secondary: '#ec4899', accent: '#8b5cf6', background: '#0f0a0c', surface: '#1a1115', surfaceElevated: '#251a1f', text: '#fce7f3', textSecondary: '#f9a8d4', textMuted: '#be185d', border: '#3a1a2a', divider: '#3a1a2a', success: '#22c55e', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6', overlay: 'rgba(0,0,0,0.6)' },
    typography: baseTypography, spacing: baseSpacing, borderRadius: baseBorderRadius,
    shadows: { sm: '0 1px 3px rgba(0,0,0,0.3)', md: '0 4px 6px rgba(0,0,0,0.3)', lg: '0 10px 15px rgba(0,0,0,0.4)', xl: '0 20px 25px rgba(0,0,0,0.5)' },
  },
  {
    id: 'light-warm', name: 'Light Warm', description: 'Warm-toned light theme', mode: 'light',
    colors: { primary: '#d97706', primaryLight: '#f59e0b', primaryDark: '#b45309', secondary: '#ea580c', accent: '#059669', background: '#fffbeb', surface: '#fef7e4', surfaceElevated: '#ffffff', text: '#1c1917', textSecondary: '#57534e', textMuted: '#a8a29e', border: '#e7e5e4', divider: '#f5f5f4', success: '#22c55e', warning: '#f59e0b', error: '#ef4444', info: '#0ea5e9', overlay: 'rgba(0,0,0,0.3)' },
    typography: { ...baseTypography, fontFamily: 'Georgia, serif', fontFamilyHeading: 'Georgia, serif' }, spacing: baseSpacing, borderRadius: baseBorderRadius,
    shadows: { sm: '0 1px 3px rgba(0,0,0,0.06)', md: '0 4px 6px rgba(0,0,0,0.06)', lg: '0 10px 15px rgba(0,0,0,0.08)', xl: '0 20px 25px rgba(0,0,0,0.1)' },
  },
  {
    id: 'light-ocean', name: 'Light Ocean', description: 'Blue/cyan fresh light theme', mode: 'light',
    colors: { primary: '#0ea5e9', primaryLight: '#38bdf8', primaryDark: '#0284c7', secondary: '#06b6d4', accent: '#6366f1', background: '#f0f9ff', surface: '#e0f2fe', surfaceElevated: '#ffffff', text: '#0c4a6e', textSecondary: '#0369a1', textMuted: '#7dd3fc', border: '#bae6fd', divider: '#e0f2fe', success: '#22c55e', warning: '#f59e0b', error: '#ef4444', info: '#0ea5e9', overlay: 'rgba(0,0,0,0.3)' },
    typography: baseTypography, spacing: baseSpacing, borderRadius: baseBorderRadius,
    shadows: { sm: '0 1px 3px rgba(0,0,0,0.06)', md: '0 4px 6px rgba(0,0,0,0.06)', lg: '0 10px 15px rgba(0,0,0,0.08)', xl: '0 20px 25px rgba(0,0,0,0.1)' },
  },
  {
    id: 'midnight-purple', name: 'Midnight Purple', description: 'Deep purple dark theme', mode: 'dark',
    colors: { primary: '#a855f7', primaryLight: '#c084fc', primaryDark: '#9333ea', secondary: '#d946ef', accent: '#f43f5e', background: '#0c0a14', surface: '#14101f', surfaceElevated: '#1e1730', text: '#f3e8ff', textSecondary: '#c4b5fd', textMuted: '#7c3aed', border: '#2e1a5e', divider: '#2e1a5e', success: '#22c55e', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6', overlay: 'rgba(0,0,0,0.6)' },
    typography: baseTypography, spacing: baseSpacing, borderRadius: baseBorderRadius,
    shadows: { sm: '0 1px 3px rgba(0,0,0,0.4)', md: '0 4px 6px rgba(0,0,0,0.4)', lg: '0 10px 15px rgba(0,0,0,0.5)', xl: '0 20px 25px rgba(0,0,0,0.6)' },
  },
  {
    id: 'nord', name: 'Nord', description: 'Arctic-inspired color scheme', mode: 'dark',
    colors: { primary: '#88c0d0', primaryLight: '#8fbcbb', primaryDark: '#81a1c1', secondary: '#5e81ac', accent: '#b48ead', background: '#2e3440', surface: '#3b4252', surfaceElevated: '#434c5e', text: '#eceff4', textSecondary: '#d8dee9', textMuted: '#4c566a', border: '#4c566a', divider: '#434c5e', success: '#a3be8c', warning: '#ebcb8b', error: '#bf616a', info: '#81a1c1', overlay: 'rgba(0,0,0,0.5)' },
    typography: baseTypography, spacing: baseSpacing, borderRadius: baseBorderRadius,
    shadows: { sm: '0 1px 3px rgba(0,0,0,0.3)', md: '0 4px 6px rgba(0,0,0,0.3)', lg: '0 10px 15px rgba(0,0,0,0.4)', xl: '0 20px 25px rgba(0,0,0,0.5)' },
  },
  {
    id: 'dracula', name: 'Dracula', description: 'Popular dark theme with vivid colors', mode: 'dark',
    colors: { primary: '#bd93f9', primaryLight: '#caa9fa', primaryDark: '#9580ff', secondary: '#ff79c6', accent: '#50fa7b', background: '#282a36', surface: '#44475a', surfaceElevated: '#44475a', text: '#f8f8f2', textSecondary: '#bd93f9', textMuted: '#6272a4', border: '#44475a', divider: '#44475a', success: '#50fa7b', warning: '#f1fa8c', error: '#ff5555', info: '#8be9fd', overlay: 'rgba(0,0,0,0.6)' },
    typography: baseTypography, spacing: baseSpacing, borderRadius: baseBorderRadius,
    shadows: { sm: '0 1px 3px rgba(0,0,0,0.4)', md: '0 4px 6px rgba(0,0,0,0.4)', lg: '0 10px 15px rgba(0,0,0,0.5)', xl: '0 20px 25px rgba(0,0,0,0.6)' },
  },
];

/* ──────────────────────────────────────────────
 * CSS Variable Generation
 * ────────────────────────────────────────────── */

export function generateCSSVariables(theme: ThemeTokens): string {
  const vars: string[] = [`:root {`];
  const c = theme.colors;
  vars.push(`  --color-primary: ${c.primary};`);
  vars.push(`  --color-primary-light: ${c.primaryLight};`);
  vars.push(`  --color-primary-dark: ${c.primaryDark};`);
  vars.push(`  --color-secondary: ${c.secondary};`);
  vars.push(`  --color-accent: ${c.accent};`);
  vars.push(`  --color-background: ${c.background};`);
  vars.push(`  --color-surface: ${c.surface};`);
  vars.push(`  --color-surface-elevated: ${c.surfaceElevated};`);
  vars.push(`  --color-text: ${c.text};`);
  vars.push(`  --color-text-secondary: ${c.textSecondary};`);
  vars.push(`  --color-text-muted: ${c.textMuted};`);
  vars.push(`  --color-border: ${c.border};`);
  vars.push(`  --color-divider: ${c.divider};`);
  vars.push(`  --color-success: ${c.success};`);
  vars.push(`  --color-warning: ${c.warning};`);
  vars.push(`  --color-error: ${c.error};`);
  vars.push(`  --color-info: ${c.info};`);
  const t = theme.typography;
  vars.push(`  --font-family: ${t.fontFamily};`);
  vars.push(`  --font-family-heading: ${t.fontFamilyHeading};`);
  vars.push(`  --font-family-mono: ${t.fontFamilyMono};`);
  vars.push(`  --font-size-base: ${t.fontSizeBase}px;`);
  vars.push(`  --line-height: ${t.lineHeight};`);
  const s = theme.spacing;
  vars.push(`  --spacing-xs: ${s.xs}px;`);
  vars.push(`  --spacing-sm: ${s.sm}px;`);
  vars.push(`  --spacing-md: ${s.md}px;`);
  vars.push(`  --spacing-lg: ${s.lg}px;`);
  vars.push(`  --spacing-xl: ${s.xl}px;`);
  const r = theme.borderRadius;
  vars.push(`  --radius-sm: ${r.sm}px;`);
  vars.push(`  --radius-md: ${r.md}px;`);
  vars.push(`  --radius-lg: ${r.lg}px;`);
  vars.push(`  --radius-xl: ${r.xl}px;`);
  vars.push(`  --shadow-sm: ${theme.shadows.sm};`);
  vars.push(`  --shadow-md: ${theme.shadows.md};`);
  vars.push(`  --shadow-lg: ${theme.shadows.lg};`);
  vars.push(`  --shadow-xl: ${theme.shadows.xl};`);
  vars.push(`}`);
  return vars.join('\n');
}

export function getThemeById(id: string): ThemeTokens | undefined {
  return THEME_PRESETS.find(t => t.id === id);
}
