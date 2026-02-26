/**
 * Style Panel
 * 
 * Visual editor for widget styling: dimensions, spacing,
 * typography, background, border, shadow, and transforms.
 */

'use client';

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useAppDispatch, useAppSelector, selectPrimarySelectedWidget } from '@/store/store';
import { updateWidgetStyle } from '@/store/canvasSlice';
import { WidgetStyle, DeepPartial, TextAlign } from '@/types/widget.types';

/* ──────────────────────────────────────────────
 * Section Component
 * ────────────────────────────────────────────── */

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border-b border-builder-border/20">
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-builder-text-dim hover:text-builder-text transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <motion.svg
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          animate={{ rotate: isOpen ? 180 : 0 }}
        >
          <path d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Dimension Input
 * ────────────────────────────────────────────── */

interface DimInputProps {
  label: string;
  value: number | undefined;
  unit?: string;
  onChange: (val: number) => void;
}

function DimInput({ label, value, unit = 'px', onChange }: DimInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] text-builder-text-dim uppercase tracking-wider">{label}</label>
      <div className="flex items-center">
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full h-7 px-2 text-xs bg-builder-bg/60 border border-builder-border/40 rounded-l-md text-builder-text font-mono focus:outline-none focus:border-builder-accent/50 transition-colors"
          placeholder="auto"
        />
        <span className="h-7 px-1.5 flex items-center text-[9px] text-builder-text-dim bg-builder-elevated border border-l-0 border-builder-border/40 rounded-r-md">
          {unit}
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Spacing Box
 * ────────────────────────────────────────────── */

interface SpacingBoxProps {
  label: string;
  top: number;
  right: number;
  bottom: number;
  left: number;
  onChange: (side: string, value: number) => void;
  color: string;
}

function SpacingBox({ label, top, right, bottom, left, onChange, color }: SpacingBoxProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] text-builder-text-dim uppercase tracking-wider">{label}</span>
      <div className="relative w-full aspect-[4/3] max-w-[180px]">
        {/* Outer box */}
        <div className={`absolute inset-0 rounded-lg border-2 border-dashed`} style={{ borderColor: color }}>
          {/* Top */}
          <input
            type="number"
            value={top}
            onChange={(e) => onChange('top', parseFloat(e.target.value) || 0)}
            className="absolute top-0.5 left-1/2 -translate-x-1/2 w-10 h-5 text-center text-[10px] bg-transparent text-builder-text font-mono focus:outline-none border-b border-transparent focus:border-builder-accent"
          />
          {/* Right */}
          <input
            type="number"
            value={right}
            onChange={(e) => onChange('right', parseFloat(e.target.value) || 0)}
            className="absolute right-0.5 top-1/2 -translate-y-1/2 w-10 h-5 text-center text-[10px] bg-transparent text-builder-text font-mono focus:outline-none border-b border-transparent focus:border-builder-accent"
          />
          {/* Bottom */}
          <input
            type="number"
            value={bottom}
            onChange={(e) => onChange('bottom', parseFloat(e.target.value) || 0)}
            className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-10 h-5 text-center text-[10px] bg-transparent text-builder-text font-mono focus:outline-none border-b border-transparent focus:border-builder-accent"
          />
          {/* Left */}
          <input
            type="number"
            value={left}
            onChange={(e) => onChange('left', parseFloat(e.target.value) || 0)}
            className="absolute left-0.5 top-1/2 -translate-y-1/2 w-10 h-5 text-center text-[10px] bg-transparent text-builder-text font-mono focus:outline-none border-b border-transparent focus:border-builder-accent"
          />
          {/* Inner box label */}
          <div className="absolute inset-4 rounded border border-builder-border/30 flex items-center justify-center">
            <span className="text-[9px] text-builder-text-dim">content</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Style Panel
 * ────────────────────────────────────────────── */

export function StylePanel() {
  const dispatch = useAppDispatch();
  const widget = useAppSelector(selectPrimarySelectedWidget);

  const updateStyle = useCallback(
    (updates: DeepPartial<WidgetStyle>) => {
      if (!widget) return;
      dispatch(updateWidgetStyle({ id: widget.id, style: updates }));
    },
    [dispatch, widget],
  );

  if (!widget) {
    return (
      <div className="flex items-center justify-center h-full py-12 text-center">
        <p className="text-xs text-builder-text-dim">Select a widget to edit styles</p>
      </div>
    );
  }

  const style = widget.style;

  return (
    <div className="flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-builder-border/30">
      {/* Dimensions */}
      <Section title="Size">
        <div className="grid grid-cols-2 gap-2">
          <DimInput
            label="Width"
            value={style.width?.value}
            onChange={(v) => updateStyle({ width: { value: v, unit: 'px' } })}
          />
          <DimInput
            label="Height"
            value={style.height?.value}
            onChange={(v) => updateStyle({ height: { value: v, unit: 'px' } })}
          />
          <DimInput
            label="Min W"
            value={style.minWidth?.value}
            onChange={(v) => updateStyle({ minWidth: { value: v, unit: 'px' } })}
          />
          <DimInput
            label="Min H"
            value={style.minHeight?.value}
            onChange={(v) => updateStyle({ minHeight: { value: v, unit: 'px' } })}
          />
          <DimInput
            label="Max W"
            value={style.maxWidth?.value}
            onChange={(v) => updateStyle({ maxWidth: { value: v, unit: 'px' } })}
          />
          <DimInput
            label="Max H"
            value={style.maxHeight?.value}
            onChange={(v) => updateStyle({ maxHeight: { value: v, unit: 'px' } })}
          />
        </div>
      </Section>

      {/* Spacing */}
      <Section title="Spacing">
        <div className="flex flex-col gap-3">
          <SpacingBox
            label="Padding"
            top={style.padding?.top ?? 0}
            right={style.padding?.right ?? 0}
            bottom={style.padding?.bottom ?? 0}
            left={style.padding?.left ?? 0}
            onChange={(side, value) => {
              const current = style.padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
              updateStyle({ padding: { ...current, [side]: value } });
            }}
            color="#6366f1"
          />
          <SpacingBox
            label="Margin"
            top={style.margin?.top ?? 0}
            right={style.margin?.right ?? 0}
            bottom={style.margin?.bottom ?? 0}
            left={style.margin?.left ?? 0}
            onChange={(side, value) => {
              const current = style.margin ?? { top: 0, right: 0, bottom: 0, left: 0 };
              updateStyle({ margin: { ...current, [side]: value } });
            }}
            color="#f59e0b"
          />
        </div>
      </Section>

      {/* Typography */}
      <Section title="Typography" defaultOpen={false}>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <DimInput
              label="Font Size"
              value={style.fontSize}
              onChange={(v) => updateStyle({ fontSize: v })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-builder-text-dim uppercase tracking-wider">Weight</label>
              <select
                value={style.fontWeight ?? '400'}
                onChange={(e) => updateStyle({ fontWeight: e.target.value as any })}
                className="h-7 px-1.5 text-xs bg-builder-bg/60 border border-builder-border/40 rounded-md text-builder-text focus:outline-none focus:border-builder-accent/50 cursor-pointer"
              >
                <option value="100">Thin</option>
                <option value="300">Light</option>
                <option value="400">Regular</option>
                <option value="500">Medium</option>
                <option value="600">Semi Bold</option>
                <option value="700">Bold</option>
                <option value="900">Black</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-builder-text-dim uppercase tracking-wider">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.color ?? '#e2e8f0'}
                onChange={(e) => updateStyle({ color: e.target.value })}
                className="w-7 h-7 rounded border border-builder-border/40 cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={style.color ?? '#e2e8f0'}
                onChange={(e) => updateStyle({ color: e.target.value })}
                className="flex-1 h-7 px-2 text-xs bg-builder-bg/60 border border-builder-border/40 rounded-md text-builder-text font-mono focus:outline-none focus:border-builder-accent/50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-builder-text-dim uppercase tracking-wider">Text Align</label>
            <div className="flex gap-1">
              {([{ v: TextAlign.Left, l: 'L' }, { v: TextAlign.Center, l: 'C' }, { v: TextAlign.Right, l: 'R' }, { v: TextAlign.Justify, l: 'J' }]).map(({ v, l }) => (
                <button
                  key={v}
                  className={clsx(
                    'flex-1 h-7 flex items-center justify-center rounded border text-xs transition-colors',
                    style.textAlign === v
                      ? 'border-builder-accent/40 bg-builder-accent/10 text-builder-accent'
                      : 'border-builder-border/40 text-builder-text-dim hover:text-builder-text',
                  )}
                  onClick={() => updateStyle({ textAlign: v })}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <DimInput
              label="Line Height"
              value={style.lineHeight}
              unit=""
              onChange={(v) => updateStyle({ lineHeight: v })}
            />
            <DimInput
              label="Letter Sp."
              value={style.letterSpacing}
              onChange={(v) => updateStyle({ letterSpacing: v })}
            />
          </div>
        </div>
      </Section>

      {/* Background */}
      <Section title="Background" defaultOpen={false}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={style.background?.color ?? '#transparent'}
              onChange={(e) =>
                updateStyle({
                  background: { type: 'solid', color: e.target.value },
                })
              }
              className="w-7 h-7 rounded border border-builder-border/40 cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={style.background?.color ?? 'transparent'}
              onChange={(e) =>
                updateStyle({
                  background: { type: 'solid', color: e.target.value },
                })
              }
              className="flex-1 h-7 px-2 text-xs bg-builder-bg/60 border border-builder-border/40 rounded-md text-builder-text font-mono focus:outline-none focus:border-builder-accent/50"
            />
          </div>
          <DimInput
            label="Opacity"
            value={style.opacity !== undefined ? style.opacity * 100 : 100}
            unit="%"
            onChange={(v) => updateStyle({ opacity: v / 100 })}
          />
        </div>
      </Section>

      {/* Border */}
      <Section title="Border" defaultOpen={false}>
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <DimInput
              label="Width"
              value={style.border?.width ?? 0}
              onChange={(v) =>
                updateStyle({
                  border: {
                    width: v,
                    style: style.border?.style ?? ('solid' as any),
                    color: style.border?.color ?? '#2a2a3a',
                  },
                })
              }
            />
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-builder-text-dim uppercase tracking-wider">Style</label>
              <select
                value={style.border?.style ?? 'none'}
                onChange={(e) =>
                  updateStyle({
                    border: {
                      width: style.border?.width ?? 1,
                      style: e.target.value as any,
                      color: style.border?.color ?? '#2a2a3a',
                    },
                  })
                }
                className="h-7 px-1.5 text-xs bg-builder-bg/60 border border-builder-border/40 rounded-md text-builder-text focus:outline-none cursor-pointer"
              >
                <option value="none">None</option>
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[9px] text-builder-text-dim flex-shrink-0">Color</label>
            <input
              type="color"
              value={style.border?.color ?? '#2a2a3a'}
              onChange={(e) =>
                updateStyle({
                  border: {
                    width: style.border?.width ?? 1,
                    style: style.border?.style ?? ('solid' as any),
                    color: e.target.value,
                  },
                })
              }
              className="w-7 h-7 rounded border border-builder-border/40 cursor-pointer bg-transparent"
            />
          </div>

          {/* Border Radius */}
          <div className="grid grid-cols-4 gap-1 mt-2">
            {(['topLeft', 'topRight', 'bottomRight', 'bottomLeft'] as const).map((corner) => (
              <div key={corner} className="flex flex-col gap-0.5">
                <label className="text-[8px] text-builder-text-dim text-center">
                  {corner.replace('top', 'T').replace('bottom', 'B').replace('Left', 'L').replace('Right', 'R')}
                </label>
                <input
                  type="number"
                  value={style.borderRadius?.[corner] ?? 0}
                  onChange={(e) => {
                    const current = style.borderRadius ?? { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 };
                    updateStyle({ borderRadius: { ...current, [corner]: parseFloat(e.target.value) || 0 } });
                  }}
                  className="w-full h-6 px-1 text-center text-[10px] bg-builder-bg/60 border border-builder-border/40 rounded text-builder-text font-mono focus:outline-none focus:border-builder-accent/50"
                />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Layout */}
      <Section title="Layout" defaultOpen={false}>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-builder-text-dim uppercase tracking-wider">Display</label>
            <select
              value={style.display ?? 'flex'}
              onChange={(e) => updateStyle({ display: e.target.value as any })}
              className="h-7 px-1.5 text-xs bg-builder-bg/60 border border-builder-border/40 rounded-md text-builder-text focus:outline-none cursor-pointer"
            >
              <option value="block">Block</option>
              <option value="flex">Flex</option>
              <option value="grid">Grid</option>
              <option value="inline-block">Inline Block</option>
              <option value="none">None</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-builder-text-dim uppercase tracking-wider">Direction</label>
            <div className="flex gap-1">
              {(['row', 'column'] as const).map((dir) => (
                <button
                  key={dir}
                  className={clsx(
                    'flex-1 h-7 flex items-center justify-center rounded border text-xs transition-colors capitalize',
                    style.flexDirection === dir
                      ? 'border-builder-accent/40 bg-builder-accent/10 text-builder-accent'
                      : 'border-builder-border/40 text-builder-text-dim hover:text-builder-text',
                  )}
                  onClick={() => updateStyle({ flexDirection: dir as any })}
                >
                  {dir}
                </button>
              ))}
            </div>
          </div>
          <DimInput
            label="Gap"
            value={style.gap}
            onChange={(v) => updateStyle({ gap: v })}
          />
        </div>
      </Section>
    </div>
  );
}
