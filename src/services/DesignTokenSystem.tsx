/**
 * Design Token System — Comprehensive theming with CSS variables,
 * token management, and live theme switching.
 */

'use client';

import React, {
  useState,
  useCallback,
  useMemo,
  createContext,
  useContext,
  useEffect,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

/* ──────────────────────────────────────────────
 * Token Types
 * ────────────────────────────────────────────── */

export interface ColorToken {
  name: string;
  value: string;
  description?: string;
  category: 'primary' | 'neutral' | 'semantic' | 'brand' | 'custom';
}

export interface TypographyToken {
  name: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  letterSpacing: string;
  textTransform?: string;
}

export interface SpacingToken {
  name: string;
  value: string;
  px: number;
}

export interface ShadowToken {
  name: string;
  value: string;
  layers: {
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string;
    inset?: boolean;
  }[];
}

export interface BorderToken {
  name: string;
  width: string;
  style: string;
  color: string;
  radius: string;
}

export interface AnimationToken {
  name: string;
  duration: string;
  easing: string;
  delay?: string;
  iterationCount?: string;
  direction?: string;
}

export interface DesignTokenSet {
  id: string;
  name: string;
  description?: string;
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
  shadows: ShadowToken[];
  borders: BorderToken[];
  animations: AnimationToken[];
  breakpoints: { name: string; value: string; min: number }[];
  zIndex: { name: string; value: number }[];
}

/* ──────────────────────────────────────────────
 * Default Token Set
 * ────────────────────────────────────────────── */

const defaultTokenSet: DesignTokenSet = {
  id: 'default',
  name: 'Default Design System',
  description: 'Built-in design token set with comprehensive defaults',
  colors: [
    // Primary palette
    { name: 'primary-50', value: '#eef2ff', category: 'primary' },
    { name: 'primary-100', value: '#e0e7ff', category: 'primary' },
    { name: 'primary-200', value: '#c7d2fe', category: 'primary' },
    { name: 'primary-300', value: '#a5b4fc', category: 'primary' },
    { name: 'primary-400', value: '#818cf8', category: 'primary' },
    { name: 'primary-500', value: '#6366f1', category: 'primary' },
    { name: 'primary-600', value: '#4f46e5', category: 'primary' },
    { name: 'primary-700', value: '#4338ca', category: 'primary' },
    { name: 'primary-800', value: '#3730a3', category: 'primary' },
    { name: 'primary-900', value: '#312e81', category: 'primary' },
    // Neutral palette
    { name: 'neutral-50', value: '#f8fafc', category: 'neutral' },
    { name: 'neutral-100', value: '#f1f5f9', category: 'neutral' },
    { name: 'neutral-200', value: '#e2e8f0', category: 'neutral' },
    { name: 'neutral-300', value: '#cbd5e1', category: 'neutral' },
    { name: 'neutral-400', value: '#94a3b8', category: 'neutral' },
    { name: 'neutral-500', value: '#64748b', category: 'neutral' },
    { name: 'neutral-600', value: '#475569', category: 'neutral' },
    { name: 'neutral-700', value: '#334155', category: 'neutral' },
    { name: 'neutral-800', value: '#1e293b', category: 'neutral' },
    { name: 'neutral-900', value: '#0f172a', category: 'neutral' },
    { name: 'neutral-950', value: '#020617', category: 'neutral' },
    // Semantic colors
    { name: 'error', value: '#ef4444', category: 'semantic', description: 'Error and destructive actions' },
    { name: 'error-light', value: '#fecaca', category: 'semantic' },
    { name: 'error-dark', value: '#991b1b', category: 'semantic' },
    { name: 'warning', value: '#f59e0b', category: 'semantic', description: 'Warnings and caution' },
    { name: 'warning-light', value: '#fde68a', category: 'semantic' },
    { name: 'warning-dark', value: '#92400e', category: 'semantic' },
    { name: 'success', value: '#22c55e', category: 'semantic', description: 'Success and confirmation' },
    { name: 'success-light', value: '#bbf7d0', category: 'semantic' },
    { name: 'success-dark', value: '#166534', category: 'semantic' },
    { name: 'info', value: '#3b82f6', category: 'semantic', description: 'Informational messages' },
    { name: 'info-light', value: '#bfdbfe', category: 'semantic' },
    { name: 'info-dark', value: '#1e40af', category: 'semantic' },
  ],
  typography: [
    { name: 'display-xl', fontFamily: 'Inter, system-ui', fontSize: '4.5rem', fontWeight: 800, lineHeight: '1', letterSpacing: '-0.025em' },
    { name: 'display-lg', fontFamily: 'Inter, system-ui', fontSize: '3.75rem', fontWeight: 800, lineHeight: '1', letterSpacing: '-0.025em' },
    { name: 'display-md', fontFamily: 'Inter, system-ui', fontSize: '3rem', fontWeight: 700, lineHeight: '1.1', letterSpacing: '-0.02em' },
    { name: 'display-sm', fontFamily: 'Inter, system-ui', fontSize: '2.25rem', fontWeight: 700, lineHeight: '1.15', letterSpacing: '-0.02em' },
    { name: 'heading-xl', fontFamily: 'Inter, system-ui', fontSize: '1.875rem', fontWeight: 700, lineHeight: '1.2', letterSpacing: '-0.01em' },
    { name: 'heading-lg', fontFamily: 'Inter, system-ui', fontSize: '1.5rem', fontWeight: 600, lineHeight: '1.25', letterSpacing: '-0.01em' },
    { name: 'heading-md', fontFamily: 'Inter, system-ui', fontSize: '1.25rem', fontWeight: 600, lineHeight: '1.3', letterSpacing: '0' },
    { name: 'heading-sm', fontFamily: 'Inter, system-ui', fontSize: '1.125rem', fontWeight: 600, lineHeight: '1.4', letterSpacing: '0' },
    { name: 'body-lg', fontFamily: 'Inter, system-ui', fontSize: '1.125rem', fontWeight: 400, lineHeight: '1.6', letterSpacing: '0' },
    { name: 'body-md', fontFamily: 'Inter, system-ui', fontSize: '1rem', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
    { name: 'body-sm', fontFamily: 'Inter, system-ui', fontSize: '0.875rem', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0' },
    { name: 'body-xs', fontFamily: 'Inter, system-ui', fontSize: '0.75rem', fontWeight: 400, lineHeight: '1.5', letterSpacing: '0.01em' },
    { name: 'caption', fontFamily: 'Inter, system-ui', fontSize: '0.6875rem', fontWeight: 500, lineHeight: '1.4', letterSpacing: '0.02em', textTransform: 'uppercase' },
    { name: 'code', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', fontWeight: 400, lineHeight: '1.6', letterSpacing: '-0.01em' },
    { name: 'label', fontFamily: 'Inter, system-ui', fontSize: '0.8125rem', fontWeight: 500, lineHeight: '1.3', letterSpacing: '0.01em' },
  ],
  spacing: [
    { name: 'space-0', value: '0px', px: 0 },
    { name: 'space-0.5', value: '0.125rem', px: 2 },
    { name: 'space-1', value: '0.25rem', px: 4 },
    { name: 'space-1.5', value: '0.375rem', px: 6 },
    { name: 'space-2', value: '0.5rem', px: 8 },
    { name: 'space-2.5', value: '0.625rem', px: 10 },
    { name: 'space-3', value: '0.75rem', px: 12 },
    { name: 'space-3.5', value: '0.875rem', px: 14 },
    { name: 'space-4', value: '1rem', px: 16 },
    { name: 'space-5', value: '1.25rem', px: 20 },
    { name: 'space-6', value: '1.5rem', px: 24 },
    { name: 'space-7', value: '1.75rem', px: 28 },
    { name: 'space-8', value: '2rem', px: 32 },
    { name: 'space-9', value: '2.25rem', px: 36 },
    { name: 'space-10', value: '2.5rem', px: 40 },
    { name: 'space-11', value: '2.75rem', px: 44 },
    { name: 'space-12', value: '3rem', px: 48 },
    { name: 'space-14', value: '3.5rem', px: 56 },
    { name: 'space-16', value: '4rem', px: 64 },
    { name: 'space-20', value: '5rem', px: 80 },
    { name: 'space-24', value: '6rem', px: 96 },
    { name: 'space-28', value: '7rem', px: 112 },
    { name: 'space-32', value: '8rem', px: 128 },
    { name: 'space-36', value: '9rem', px: 144 },
    { name: 'space-40', value: '10rem', px: 160 },
    { name: 'space-48', value: '12rem', px: 192 },
    { name: 'space-56', value: '14rem', px: 224 },
    { name: 'space-64', value: '16rem', px: 256 },
  ],
  shadows: [
    { name: 'shadow-xs', value: '0 1px 2px 0 rgba(0,0,0,0.05)', layers: [{ x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,0.05)' }] },
    { name: 'shadow-sm', value: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)', layers: [{ x: 0, y: 1, blur: 3, spread: 0, color: 'rgba(0,0,0,0.1)' }, { x: 0, y: 1, blur: 2, spread: -1, color: 'rgba(0,0,0,0.1)' }] },
    { name: 'shadow-md', value: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)', layers: [{ x: 0, y: 4, blur: 6, spread: -1, color: 'rgba(0,0,0,0.1)' }, { x: 0, y: 2, blur: 4, spread: -2, color: 'rgba(0,0,0,0.1)' }] },
    { name: 'shadow-lg', value: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)', layers: [{ x: 0, y: 10, blur: 15, spread: -3, color: 'rgba(0,0,0,0.1)' }, { x: 0, y: 4, blur: 6, spread: -4, color: 'rgba(0,0,0,0.1)' }] },
    { name: 'shadow-xl', value: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', layers: [{ x: 0, y: 20, blur: 25, spread: -5, color: 'rgba(0,0,0,0.1)' }, { x: 0, y: 8, blur: 10, spread: -6, color: 'rgba(0,0,0,0.1)' }] },
    { name: 'shadow-2xl', value: '0 25px 50px -12px rgba(0,0,0,0.25)', layers: [{ x: 0, y: 25, blur: 50, spread: -12, color: 'rgba(0,0,0,0.25)' }] },
    { name: 'shadow-inner', value: 'inset 0 2px 4px 0 rgba(0,0,0,0.05)', layers: [{ x: 0, y: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.05)', inset: true }] },
    { name: 'shadow-glow-sm', value: '0 0 10px rgba(99,102,241,0.2)', layers: [{ x: 0, y: 0, blur: 10, spread: 0, color: 'rgba(99,102,241,0.2)' }] },
    { name: 'shadow-glow-md', value: '0 0 20px rgba(99,102,241,0.3)', layers: [{ x: 0, y: 0, blur: 20, spread: 0, color: 'rgba(99,102,241,0.3)' }] },
    { name: 'shadow-glow-lg', value: '0 0 40px rgba(99,102,241,0.4)', layers: [{ x: 0, y: 0, blur: 40, spread: 0, color: 'rgba(99,102,241,0.4)' }] },
  ],
  borders: [
    { name: 'border-none', width: '0', style: 'none', color: 'transparent', radius: '0' },
    { name: 'border-thin', width: '1px', style: 'solid', color: 'var(--color-neutral-200)', radius: '0.375rem' },
    { name: 'border-medium', width: '2px', style: 'solid', color: 'var(--color-neutral-300)', radius: '0.5rem' },
    { name: 'border-thick', width: '3px', style: 'solid', color: 'var(--color-neutral-400)', radius: '0.75rem' },
    { name: 'border-accent', width: '2px', style: 'solid', color: 'var(--color-primary-500)', radius: '0.5rem' },
    { name: 'border-dashed', width: '2px', style: 'dashed', color: 'var(--color-neutral-300)', radius: '0.5rem' },
    { name: 'border-dotted', width: '2px', style: 'dotted', color: 'var(--color-neutral-300)', radius: '0.5rem' },
  ],
  animations: [
    { name: 'transition-fast', duration: '150ms', easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    { name: 'transition-normal', duration: '200ms', easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    { name: 'transition-slow', duration: '300ms', easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    { name: 'transition-spring', duration: '500ms', easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
    { name: 'transition-bounce', duration: '600ms', easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
    { name: 'fade-in', duration: '200ms', easing: 'ease-out' },
    { name: 'fade-out', duration: '150ms', easing: 'ease-in' },
    { name: 'slide-in-up', duration: '300ms', easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    { name: 'slide-in-down', duration: '300ms', easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    { name: 'scale-in', duration: '200ms', easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
    { name: 'scale-out', duration: '150ms', easing: 'cubic-bezier(0.4, 0, 1, 1)' },
    { name: 'spin', duration: '750ms', easing: 'linear', iterationCount: 'infinite' },
    { name: 'pulse', duration: '2000ms', easing: 'cubic-bezier(0.4, 0, 0.6, 1)', iterationCount: 'infinite' },
    { name: 'ping', duration: '1000ms', easing: 'cubic-bezier(0, 0, 0.2, 1)', iterationCount: 'infinite' },
  ],
  breakpoints: [
    { name: 'xs', value: '0px', min: 0 },
    { name: 'sm', value: '640px', min: 640 },
    { name: 'md', value: '768px', min: 768 },
    { name: 'lg', value: '1024px', min: 1024 },
    { name: 'xl', value: '1280px', min: 1280 },
    { name: '2xl', value: '1536px', min: 1536 },
  ],
  zIndex: [
    { name: 'z-behind', value: -1 },
    { name: 'z-auto', value: 0 },
    { name: 'z-base', value: 1 },
    { name: 'z-dropdown', value: 10 },
    { name: 'z-sticky', value: 20 },
    { name: 'z-fixed', value: 30 },
    { name: 'z-overlay', value: 40 },
    { name: 'z-modal', value: 50 },
    { name: 'z-popover', value: 60 },
    { name: 'z-tooltip', value: 70 },
    { name: 'z-toast', value: 80 },
    { name: 'z-max', value: 9999 },
  ],
};

/* ──────────────────────────────────────────────
 * Design Token Context
 * ────────────────────────────────────────────── */

interface DesignTokenContextValue {
  tokens: DesignTokenSet;
  setTokens: (tokens: DesignTokenSet) => void;
  getColor: (name: string) => string | undefined;
  getTypography: (name: string) => TypographyToken | undefined;
  getSpacing: (name: string) => string | undefined;
  getShadow: (name: string) => string | undefined;
  getCssVariables: () => Record<string, string>;
  generateCss: () => string;
}

const DesignTokenContext = createContext<DesignTokenContextValue | null>(null);

export function useDesignTokens() {
  const ctx = useContext(DesignTokenContext);
  if (!ctx) throw new Error('useDesignTokens must be used within DesignTokenProvider');
  return ctx;
}

/* ──────────────────────────────────────────────
 * Design Token Provider
 * ────────────────────────────────────────────── */

export function DesignTokenProvider({
  children,
  initialTokens,
}: {
  children: React.ReactNode;
  initialTokens?: DesignTokenSet;
}) {
  const [tokens, setTokens] = useState<DesignTokenSet>(initialTokens ?? defaultTokenSet);

  const getColor = useCallback((name: string) => {
    return tokens.colors.find(c => c.name === name)?.value;
  }, [tokens.colors]);

  const getTypography = useCallback((name: string) => {
    return tokens.typography.find(t => t.name === name);
  }, [tokens.typography]);

  const getSpacing = useCallback((name: string) => {
    return tokens.spacing.find(s => s.name === name)?.value;
  }, [tokens.spacing]);

  const getShadow = useCallback((name: string) => {
    return tokens.shadows.find(s => s.name === name)?.value;
  }, [tokens.shadows]);

  const getCssVariables = useCallback((): Record<string, string> => {
    const vars: Record<string, string> = {};

    // Colors
    for (const c of tokens.colors) {
      vars[`--color-${c.name}`] = c.value;
    }

    // Typography
    for (const t of tokens.typography) {
      vars[`--font-${t.name}-family`] = t.fontFamily;
      vars[`--font-${t.name}-size`] = t.fontSize;
      vars[`--font-${t.name}-weight`] = String(t.fontWeight);
      vars[`--font-${t.name}-line-height`] = t.lineHeight;
      vars[`--font-${t.name}-letter-spacing`] = t.letterSpacing;
    }

    // Spacing
    for (const s of tokens.spacing) {
      vars[`--${s.name}`] = s.value;
    }

    // Shadows
    for (const s of tokens.shadows) {
      vars[`--${s.name}`] = s.value;
    }

    // Animations
    for (const a of tokens.animations) {
      vars[`--${a.name}-duration`] = a.duration;
      vars[`--${a.name}-easing`] = a.easing;
    }

    // Borders
    for (const b of tokens.borders) {
      vars[`--${b.name}-width`] = b.width;
      vars[`--${b.name}-color`] = b.color;
      vars[`--${b.name}-radius`] = b.radius;
    }

    // Breakpoints
    for (const bp of tokens.breakpoints) {
      vars[`--breakpoint-${bp.name}`] = bp.value;
    }

    // Z-index
    for (const z of tokens.zIndex) {
      vars[`--${z.name}`] = String(z.value);
    }

    return vars;
  }, [tokens]);

  const generateCss = useCallback((): string => {
    const vars = getCssVariables();
    const lines = [':root {'];
    for (const [key, value] of Object.entries(vars)) {
      lines.push(`  ${key}: ${value};`);
    }
    lines.push('}');
    lines.push('');

    // Utility classes for colors
    lines.push('/* Color utilities */');
    for (const c of tokens.colors) {
      lines.push(`.text-${c.name} { color: var(--color-${c.name}); }`);
      lines.push(`.bg-${c.name} { background-color: var(--color-${c.name}); }`);
      lines.push(`.border-${c.name} { border-color: var(--color-${c.name}); }`);
    }
    lines.push('');

    // Typography classes
    lines.push('/* Typography utilities */');
    for (const t of tokens.typography) {
      lines.push(`.text-${t.name} {`);
      lines.push(`  font-family: ${t.fontFamily};`);
      lines.push(`  font-size: ${t.fontSize};`);
      lines.push(`  font-weight: ${t.fontWeight};`);
      lines.push(`  line-height: ${t.lineHeight};`);
      lines.push(`  letter-spacing: ${t.letterSpacing};`);
      if (t.textTransform) lines.push(`  text-transform: ${t.textTransform};`);
      lines.push('}');
    }
    lines.push('');

    // Shadow classes
    lines.push('/* Shadow utilities */');
    for (const s of tokens.shadows) {
      lines.push(`.${s.name} { box-shadow: var(--${s.name}); }`);
    }
    lines.push('');

    // Spacing classes
    lines.push('/* Spacing utilities */');
    for (const s of tokens.spacing) {
      const shortName = s.name.replace('space-', '');
      lines.push(`.p-${shortName} { padding: ${s.value}; }`);
      lines.push(`.m-${shortName} { margin: ${s.value}; }`);
      lines.push(`.gap-${shortName} { gap: ${s.value}; }`);
    }

    return lines.join('\n');
  }, [tokens, getCssVariables]);

  // Apply CSS variables to document
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const vars = getCssVariables();
    const root = document.documentElement;
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
    return () => {
      for (const key of Object.keys(vars)) {
        root.style.removeProperty(key);
      }
    };
  }, [getCssVariables]);

  const value: DesignTokenContextValue = {
    tokens,
    setTokens,
    getColor,
    getTypography,
    getSpacing,
    getShadow,
    getCssVariables,
    generateCss,
  };

  return (
    <DesignTokenContext.Provider value={value}>
      {children}
    </DesignTokenContext.Provider>
  );
}

/* ──────────────────────────────────────────────
 * Token Visualizer Component
 * ────────────────────────────────────────────── */

export function TokenVisualizer() {
  const { tokens } = useDesignTokens();
  const [activeTab, setActiveTab] = useState('colors');

  const tabs = [
    { id: 'colors', label: 'Colors', count: tokens.colors.length },
    { id: 'typography', label: 'Typography', count: tokens.typography.length },
    { id: 'spacing', label: 'Spacing', count: tokens.spacing.length },
    { id: 'shadows', label: 'Shadows', count: tokens.shadows.length },
    { id: 'borders', label: 'Borders', count: tokens.borders.length },
    { id: 'animations', label: 'Animations', count: tokens.animations.length },
    { id: 'breakpoints', label: 'Breakpoints', count: tokens.breakpoints.length },
    { id: 'z-index', label: 'Z-Index', count: tokens.zIndex.length },
  ];

  return (
    <div className="p-4">
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'bg-indigo-500/10 text-indigo-400'
                : 'text-white/40 hover:text-white/60 hover:bg-white/5',
            )}
          >
            {tab.label}
            <span className="ml-1 text-[10px] opacity-50">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'colors' && <ColorTokenGrid colors={tokens.colors} />}
          {activeTab === 'typography' && <TypographyTokenList typography={tokens.typography} />}
          {activeTab === 'spacing' && <SpacingTokenList spacing={tokens.spacing} />}
          {activeTab === 'shadows' && <ShadowTokenList shadows={tokens.shadows} />}
          {activeTab === 'borders' && <BorderTokenList borders={tokens.borders} />}
          {activeTab === 'animations' && <AnimationTokenList animations={tokens.animations} />}
          {activeTab === 'breakpoints' && <BreakpointTokenList breakpoints={tokens.breakpoints} />}
          {activeTab === 'z-index' && <ZIndexTokenList zIndex={tokens.zIndex} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Token Visualizer Sub-components
 * ────────────────────────────────────────────── */

function ColorTokenGrid({ colors }: { colors: ColorToken[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, ColorToken[]>();
    for (const c of colors) {
      const arr = map.get(c.category) ?? [];
      arr.push(c);
      map.set(c.category, arr);
    }
    return map;
  }, [colors]);

  return (
    <div className="space-y-6">
      {Array.from(grouped.entries()).map(([category, items]) => (
        <div key={category}>
          <h4 className="text-[10px] text-white/30 uppercase tracking-wider mb-2 font-medium capitalize">{category}</h4>
          <div className="grid grid-cols-6 gap-2">
            {items.map(c => (
              <motion.div
                key={c.name}
                className="group cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                <div
                  className="w-full aspect-square rounded-lg border border-white/10 mb-1 shadow-sm"
                  style={{ backgroundColor: c.value }}
                />
                <span className="text-[10px] text-white/40 block truncate group-hover:text-white/60">
                  {c.name}
                </span>
                <span className="text-[9px] text-white/20 font-mono block truncate">
                  {c.value}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TypographyTokenList({ typography }: { typography: TypographyToken[] }) {
  return (
    <div className="space-y-3">
      {typography.map(t => (
        <div key={t.name} className="p-3 bg-white/3 rounded-lg hover:bg-white/5 transition-colors">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-[10px] text-indigo-400 font-mono">{t.name}</span>
            <span className="text-[10px] text-white/20 font-mono">
              {t.fontSize} / {t.fontWeight}
            </span>
          </div>
          <div
            style={{
              fontFamily: t.fontFamily,
              fontSize: t.fontSize,
              fontWeight: t.fontWeight,
              lineHeight: t.lineHeight,
              letterSpacing: t.letterSpacing,
              textTransform: (t.textTransform ?? 'none') as React.CSSProperties['textTransform'],
            }}
            className="text-white/80 truncate"
          >
            The quick brown fox jumps over the lazy dog
          </div>
        </div>
      ))}
    </div>
  );
}

function SpacingTokenList({ spacing }: { spacing: SpacingToken[] }) {
  return (
    <div className="space-y-1">
      {spacing.filter(s => s.px > 0).map(s => (
        <div key={s.name} className="flex items-center gap-3 py-1">
          <span className="text-[10px] text-white/30 font-mono w-20 text-right">{s.name}</span>
          <div className="flex-1 flex items-center gap-2">
            <motion.div
              className="bg-indigo-500/30 rounded-sm h-4"
              style={{ width: `${Math.min(s.px, 256)}px` }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(s.px, 256)}px` }}
              transition={{ duration: 0.3 }}
            />
            <span className="text-[10px] text-white/20 font-mono">{s.px}px</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ShadowTokenList({ shadows }: { shadows: ShadowToken[] }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {shadows.map(s => (
        <div key={s.name} className="p-4 bg-white/3 rounded-lg">
          <div
            className="w-full h-16 rounded-lg bg-slate-700 mb-3"
            style={{ boxShadow: s.value }}
          />
          <span className="text-[10px] text-indigo-400 font-mono block">{s.name}</span>
          <span className="text-[9px] text-white/20 font-mono block mt-0.5 break-all">{s.value}</span>
        </div>
      ))}
    </div>
  );
}

function BorderTokenList({ borders }: { borders: BorderToken[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {borders.map(b => (
        <div key={b.name} className="p-4 bg-white/3 rounded-lg">
          <div
            className="w-full h-16 rounded-lg bg-transparent mb-3"
            style={{
              borderWidth: b.width,
              borderStyle: b.style,
              borderColor: b.color.startsWith('var') ? '#64748b' : b.color,
              borderRadius: b.radius,
            }}
          />
          <span className="text-[10px] text-indigo-400 font-mono block">{b.name}</span>
          <span className="text-[9px] text-white/20 font-mono block mt-0.5">
            {b.width} {b.style} / r:{b.radius}
          </span>
        </div>
      ))}
    </div>
  );
}

function AnimationTokenList({ animations }: { animations: AnimationToken[] }) {
  return (
    <div className="space-y-2">
      {animations.map(a => (
        <div key={a.name} className="flex items-center justify-between p-3 bg-white/3 rounded-lg hover:bg-white/5 transition-colors">
          <div>
            <span className="text-xs text-indigo-400 font-mono block">{a.name}</span>
            <span className="text-[10px] text-white/20 block mt-0.5">
              {a.duration} · {a.easing}
              {a.iterationCount ? ` · ${a.iterationCount}` : ''}
            </span>
          </div>
          <motion.div
            className="w-6 h-6 bg-indigo-500/40 rounded"
            animate={{
              x: [0, 20, 0],
              transition: {
                duration: parseFloat(a.duration) / 1000,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          />
        </div>
      ))}
    </div>
  );
}

function BreakpointTokenList({ breakpoints }: { breakpoints: { name: string; value: string; min: number }[] }) {
  const maxVal = Math.max(...breakpoints.map(b => b.min));
  return (
    <div className="space-y-2">
      {breakpoints.map(b => (
        <div key={b.name} className="flex items-center gap-3 py-1">
          <span className="text-xs text-indigo-400 font-mono w-12">{b.name}</span>
          <div className="flex-1 relative">
            <div className="h-2 bg-white/5 rounded-full">
              <motion.div
                className="h-full bg-indigo-500/30 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${maxVal > 0 ? (b.min / maxVal) * 100 : 0}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
          <span className="text-[10px] text-white/30 font-mono w-16 text-right">{b.value}</span>
        </div>
      ))}
    </div>
  );
}

function ZIndexTokenList({ zIndex }: { zIndex: { name: string; value: number }[] }) {
  return (
    <div className="space-y-1">
      {zIndex.map((z, i) => (
        <div key={z.name} className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-white/3 transition-colors">
          <div
            className="w-8 h-8 rounded bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] text-indigo-400 font-mono"
            style={{ zIndex: z.value }}
          >
            {z.value}
          </div>
          <span className="text-xs text-white/60 font-mono">{z.name}</span>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Token CSS Generator
 * ────────────────────────────────────────────── */

export function generateTokenStylesheet(tokens: DesignTokenSet): string {
  const lines: string[] = [];

  lines.push('/**');
  lines.push(` * Generated Design Tokens: ${tokens.name}`);
  lines.push(` * ${tokens.description ?? ''}`);
  lines.push(' * Auto-generated — do not edit manually');
  lines.push(' */');
  lines.push('');
  lines.push(':root {');

  // Colors
  lines.push('  /* Colors */');
  for (const c of tokens.colors) {
    const comment = c.description ? ` /* ${c.description} */` : '';
    lines.push(`  --color-${c.name}: ${c.value};${comment}`);
  }
  lines.push('');

  // Typography
  lines.push('  /* Typography */');
  for (const t of tokens.typography) {
    lines.push(`  --font-${t.name}-size: ${t.fontSize};`);
    lines.push(`  --font-${t.name}-weight: ${t.fontWeight};`);
    lines.push(`  --font-${t.name}-line-height: ${t.lineHeight};`);
  }
  lines.push('');

  // Spacing
  lines.push('  /* Spacing */');
  for (const s of tokens.spacing) {
    lines.push(`  --${s.name}: ${s.value};`);
  }
  lines.push('');

  // Shadows
  lines.push('  /* Shadows */');
  for (const s of tokens.shadows) {
    lines.push(`  --${s.name}: ${s.value};`);
  }
  lines.push('');

  // Animations
  lines.push('  /* Animations */');
  for (const a of tokens.animations) {
    lines.push(`  --${a.name}-duration: ${a.duration};`);
    lines.push(`  --${a.name}-easing: ${a.easing};`);
  }
  lines.push('');

  // Z-Index
  lines.push('  /* Z-Index */');
  for (const z of tokens.zIndex) {
    lines.push(`  --${z.name}: ${z.value};`);
  }

  lines.push('}');

  return lines.join('\n');
}

/* ──────────────────────────────────────────────
 * Exports
 * ────────────────────────────────────────────── */

export { defaultTokenSet };
export type { DesignTokenContextValue };
