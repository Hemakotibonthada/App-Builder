/**
 * AdvancedToolbar — Full-featured toolbar with tools, zoom, mode selection,
 * alignment, distribution, grouping, responsive preview, and more.
 */

'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export type ToolMode =
  | 'select'
  | 'hand'
  | 'text'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'pen'
  | 'image'
  | 'comment'
  | 'measure'
  | 'crop'
  | 'eyedropper'
  | 'gradient'
  | 'blur'
  | 'eraser';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile' | 'custom';

interface ToolDefinition {
  id: ToolMode;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  group: string;
}

interface ToolbarProps {
  activeTool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  previewDevice: PreviewDevice;
  onDeviceChange: (device: PreviewDevice) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onAlignLeft?: () => void;
  onAlignCenter?: () => void;
  onAlignRight?: () => void;
  onAlignTop?: () => void;
  onAlignMiddle?: () => void;
  onAlignBottom?: () => void;
  onDistributeH?: () => void;
  onDistributeV?: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  onLock?: () => void;
  onUnlock?: () => void;
  onFlipH?: () => void;
  onFlipV?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  selectedCount?: number;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  showRulers?: boolean;
  onToggleRulers?: () => void;
  snapToGrid?: boolean;
  onToggleSnap?: () => void;
  className?: string;
}

/* ──────────────────────────────────────────────
 * SVG Icon Components
 * ────────────────────────────────────────────── */

function SvgIcon({ d, ...props }: { d: string } & React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={d} />
    </svg>
  );
}

function CursorIcon() {
  return <SvgIcon d="M4 4l7.07 17 2.51-7.39L21 11.07z" />;
}
function HandIcon() {
  return <SvgIcon d="M18 11V6a2 2 0 00-4 0v1M14 10V5a2 2 0 00-4 0v5M10 10.5V4a2 2 0 00-4 0v9" />;
}
function TypeIcon() {
  return <SvgIcon d="M4 7V4h16v3M9 20h6M12 4v16" />;
}
function SquareIcon() {
  return <SvgIcon d="M3 3h18v18H3z" />;
}
function CircleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
function LineIcon() {
  return <SvgIcon d="M5 12h14" />;
}
function ArrowIcon() {
  return <SvgIcon d="M5 12h14M12 5l7 7-7 7" />;
}
function PenIcon() {
  return <SvgIcon d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />;
}
function ImageIcon() {
  return <SvgIcon d="M21 15l-5-5L5 21M3 3h18v18H3zM8.5 10a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />;
}
function CommentIcon() {
  return <SvgIcon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />;
}
function MeasureIcon() {
  return <SvgIcon d="M2 12h20M12 2v20" />;
}
function CropIcon() {
  return <SvgIcon d="M6.13 1L6 16a2 2 0 002 2h15M1 6.13L16 6a2 2 0 012 2v15" />;
}
function EyedropperIcon() {
  return <SvgIcon d="M2 22l1-1h3l9-9M20.71 5.63l-2.34-2.34a1 1 0 00-1.41 0l-3.12 3.12 3.75 3.75 3.12-3.12a1 1 0 000-1.41z" />;
}
function GradientIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </svg>
  );
}
function BlurIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="7" strokeDasharray="2 2" />
      <circle cx="12" cy="12" r="10" strokeDasharray="1 3" />
    </svg>
  );
}
function EraserIcon() {
  return <SvgIcon d="M20 20H7l-5-5 9-9 9 9-3 3M7 11l6 6" />;
}

/* ──────────────────────────────────────────────
 * Tool Definitions
 * ────────────────────────────────────────────── */

const tools: ToolDefinition[] = [
  { id: 'select', label: 'Select', icon: <CursorIcon />, shortcut: 'V', group: 'pointer' },
  { id: 'hand', label: 'Hand', icon: <HandIcon />, shortcut: 'H', group: 'pointer' },
  { id: 'text', label: 'Text', icon: <TypeIcon />, shortcut: 'T', group: 'create' },
  { id: 'rectangle', label: 'Rectangle', icon: <SquareIcon />, shortcut: 'R', group: 'create' },
  { id: 'circle', label: 'Circle', icon: <CircleIcon />, shortcut: 'O', group: 'create' },
  { id: 'line', label: 'Line', icon: <LineIcon />, shortcut: 'L', group: 'create' },
  { id: 'arrow', label: 'Arrow', icon: <ArrowIcon />, shortcut: 'A', group: 'create' },
  { id: 'pen', label: 'Pen', icon: <PenIcon />, shortcut: 'P', group: 'draw' },
  { id: 'image', label: 'Image', icon: <ImageIcon />, shortcut: 'I', group: 'media' },
  { id: 'comment', label: 'Comment', icon: <CommentIcon />, shortcut: 'C', group: 'annotate' },
  { id: 'measure', label: 'Measure', icon: <MeasureIcon />, shortcut: 'M', group: 'annotate' },
  { id: 'crop', label: 'Crop', icon: <CropIcon />, shortcut: 'K', group: 'transform' },
  { id: 'eyedropper', label: 'Eyedropper', icon: <EyedropperIcon />, shortcut: 'E', group: 'color' },
  { id: 'gradient', label: 'Gradient', icon: <GradientIcon />, shortcut: 'G', group: 'color' },
  { id: 'blur', label: 'Blur', icon: <BlurIcon />, shortcut: 'B', group: 'effect' },
  { id: 'eraser', label: 'Eraser', icon: <EraserIcon />, shortcut: 'X', group: 'draw' },
];

const toolGroups = ['pointer', 'create', 'draw', 'media', 'annotate', 'transform', 'color', 'effect'];

/* ──────────────────────────────────────────────
 * Toolbar Button
 * ────────────────────────────────────────────── */

interface ToolBtnProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
  variant?: 'default' | 'ghost';
}

function ToolBtn({
  icon,
  label,
  shortcut,
  active = false,
  disabled = false,
  onClick,
  size = 'md',
  variant = 'default',
}: ToolBtnProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={clsx(
          'flex items-center justify-center rounded-lg transition-all',
          size === 'sm' ? 'w-7 h-7' : 'w-8 h-8',
          active
            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
            : variant === 'ghost'
              ? 'text-white/40 hover:text-white/70 hover:bg-white/5'
              : 'text-white/50 hover:text-white hover:bg-white/8',
          disabled && 'opacity-30 cursor-not-allowed',
        )}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
      >
        {icon}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 pointer-events-none"
          >
            <div className="bg-gray-900 border border-white/10 rounded-md px-2 py-1 shadow-xl whitespace-nowrap">
              <span className="text-[11px] text-white/80">{label}</span>
              {shortcut && (
                <span className="text-[10px] text-white/30 ml-1.5 font-mono">{shortcut}</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Divider
 * ────────────────────────────────────────────── */

function ToolbarDivider() {
  return <div className="w-px h-5 bg-white/10 mx-1" />;
}

/* ──────────────────────────────────────────────
 * Zoom Controls
 * ────────────────────────────────────────────── */

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (z: number) => void;
}

function ZoomControls({ zoom, onZoomChange }: ZoomControlsProps) {
  const presets = [25, 50, 75, 100, 125, 150, 200, 300, 400];
  const [showPresets, setShowPresets] = useState(false);

  return (
    <div className="relative flex items-center gap-0.5">
      <ToolBtn
        icon={<SvgIcon d="M20 12H4" />}
        label="Zoom Out"
        shortcut="Ctrl+−"
        onClick={() => onZoomChange(Math.max(10, zoom - 10))}
        size="sm"
        variant="ghost"
      />

      <button
        onClick={() => setShowPresets(!showPresets)}
        className="px-2 py-0.5 text-xs text-white/60 hover:text-white font-mono rounded hover:bg-white/5 min-w-[48px] text-center"
      >
        {Math.round(zoom)}%
      </button>

      <ToolBtn
        icon={<SvgIcon d="M12 4v16M4 12h16" />}
        label="Zoom In"
        shortcut="Ctrl+="
        onClick={() => onZoomChange(Math.min(400, zoom + 10))}
        size="sm"
        variant="ghost"
      />

      {/* Presets dropdown */}
      <AnimatePresence>
        {showPresets && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowPresets(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-40
                         bg-slate-900 border border-white/10 rounded-lg shadow-2xl p-1 min-w-[80px]"
            >
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => { onZoomChange(p); setShowPresets(false); }}
                  className={clsx(
                    'w-full px-3 py-1 text-xs text-left rounded-md transition-colors',
                    p === Math.round(zoom)
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'text-white/60 hover:bg-white/5 hover:text-white',
                  )}
                >
                  {p}%
                </button>
              ))}
              <div className="border-t border-white/10 mt-1 pt-1">
                <button
                  onClick={() => { onZoomChange(100); setShowPresets(false); }}
                  className="w-full px-3 py-1 text-xs text-left rounded-md text-white/60 hover:bg-white/5 hover:text-white"
                >
                  Fit to Screen
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Device Preview Selector
 * ────────────────────────────────────────────── */

interface DevicePreviewProps {
  device: PreviewDevice;
  onChange: (d: PreviewDevice) => void;
}

function DevicePreview({ device, onChange }: DevicePreviewProps) {
  const devices: { id: PreviewDevice; label: string; icon: React.ReactNode; width: string }[] = [
    {
      id: 'desktop',
      label: 'Desktop',
      width: '100%',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
    {
      id: 'tablet',
      label: 'Tablet',
      width: '768px',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      ),
    },
    {
      id: 'mobile',
      label: 'Mobile',
      width: '375px',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center bg-white/5 rounded-lg p-0.5">
      {devices.map(d => (
        <motion.button
          key={d.id}
          onClick={() => onChange(d.id)}
          className={clsx(
            'flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-all',
            device === d.id
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-white/40 hover:text-white/70',
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {d.icon}
          <span className="hidden xl:inline">{d.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Alignment Tools
 * ────────────────────────────────────────────── */

interface AlignmentToolsProps {
  onAlignLeft?: () => void;
  onAlignCenter?: () => void;
  onAlignRight?: () => void;
  onAlignTop?: () => void;
  onAlignMiddle?: () => void;
  onAlignBottom?: () => void;
  onDistributeH?: () => void;
  onDistributeV?: () => void;
  hasSelection: boolean;
}

function AlignmentTools({
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignTop,
  onAlignMiddle,
  onAlignBottom,
  onDistributeH,
  onDistributeV,
  hasSelection,
}: AlignmentToolsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      <ToolBtn
        icon={
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="4" x2="4" y2="20" />
            <rect x="8" y="6" width="12" height="4" />
            <rect x="8" y="14" width="8" height="4" />
          </svg>
        }
        label="Alignment"
        active={expanded}
        disabled={!hasSelection}
        onClick={() => setExpanded(!expanded)}
      />

      <AnimatePresence>
        {expanded && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setExpanded(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-40
                         bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-3"
            >
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Align</div>
              <div className="grid grid-cols-3 gap-1 mb-3">
                <ToolBtn icon={<SvgIcon d="M4 4v16M8 8h12M8 12h8M8 16h10" />} label="Left" onClick={onAlignLeft} size="sm" />
                <ToolBtn icon={<SvgIcon d="M12 4v16M6 8h12M8 12h8M7 16h10" />} label="Center" onClick={onAlignCenter} size="sm" />
                <ToolBtn icon={<SvgIcon d="M20 4v16M4 8h12M8 12h8M6 16h10" />} label="Right" onClick={onAlignRight} size="sm" />
                <ToolBtn icon={<SvgIcon d="M4 4h16M8 8v12M12 8v8M16 8v10" />} label="Top" onClick={onAlignTop} size="sm" />
                <ToolBtn icon={<SvgIcon d="M4 12h16M8 6v12M12 8v8M16 7v10" />} label="Middle" onClick={onAlignMiddle} size="sm" />
                <ToolBtn icon={<SvgIcon d="M4 20h16M8 4v12M12 8v8M16 6v10" />} label="Bottom" onClick={onAlignBottom} size="sm" />
              </div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Distribute</div>
              <div className="grid grid-cols-2 gap-1">
                <ToolBtn icon={<SvgIcon d="M4 4v16M12 8v8M20 4v16" />} label="Horizontal" onClick={onDistributeH} size="sm" />
                <ToolBtn icon={<SvgIcon d="M4 4h16M8 12h8M4 20h16" />} label="Vertical" onClick={onDistributeV} size="sm" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Layer Order Tools
 * ────────────────────────────────────────────── */

interface LayerToolsProps {
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  hasSelection: boolean;
}

function LayerTools({
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  hasSelection,
}: LayerToolsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      <ToolBtn
        icon={
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 22 8.5 12 15 2 8.5" />
            <polyline points="2 15.5 12 22 22 15.5" />
          </svg>
        }
        label="Layer Order"
        active={expanded}
        disabled={!hasSelection}
        onClick={() => setExpanded(!expanded)}
      />

      <AnimatePresence>
        {expanded && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setExpanded(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-40
                         bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 min-w-[140px]"
            >
              {[
                { label: 'Bring to Front', shortcut: 'Ctrl+]', onClick: onBringToFront },
                { label: 'Bring Forward', shortcut: 'Ctrl+Shift+]', onClick: onBringForward },
                { label: 'Send Backward', shortcut: 'Ctrl+Shift+[', onClick: onSendBackward },
                { label: 'Send to Back', shortcut: 'Ctrl+[', onClick: onSendToBack },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => { item.onClick?.(); setExpanded(false); }}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-white/60
                             hover:text-white hover:bg-white/5 rounded-md transition-colors"
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] text-white/20 font-mono ml-3">{item.shortcut}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Canvas Controls (Grid, Rulers, Snap)
 * ────────────────────────────────────────────── */

interface CanvasControlsProps {
  showGrid: boolean;
  onToggleGrid: () => void;
  showRulers: boolean;
  onToggleRulers: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
}

function CanvasControls({
  showGrid,
  onToggleGrid,
  showRulers,
  onToggleRulers,
  snapToGrid,
  onToggleSnap,
}: CanvasControlsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      <ToolBtn
        icon={
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        }
        label="Canvas Settings"
        active={expanded}
        onClick={() => setExpanded(!expanded)}
      />

      <AnimatePresence>
        {expanded && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setExpanded(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              className="absolute top-full mt-2 right-0 z-40
                         bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-3 min-w-[180px]"
            >
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Canvas</div>
              {[
                { label: 'Show Grid', checked: showGrid, onChange: onToggleGrid },
                { label: 'Show Rulers', checked: showRulers, onChange: onToggleRulers },
                { label: 'Snap to Grid', checked: snapToGrid, onChange: onToggleSnap },
              ].map(item => (
                <label
                  key={item.label}
                  className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer"
                >
                  <span className="text-xs text-white/60">{item.label}</span>
                  <div
                    onClick={item.onChange}
                    className={clsx(
                      'w-8 h-4 rounded-full relative transition-colors cursor-pointer',
                      item.checked ? 'bg-indigo-500' : 'bg-white/10',
                    )}
                  >
                    <motion.div
                      className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm"
                      animate={{ left: item.checked ? '16px' : '2px' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </div>
                </label>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Main Advanced Toolbar
 * ────────────────────────────────────────────── */

export function AdvancedToolbar({
  activeTool,
  onToolChange,
  zoom,
  onZoomChange,
  previewDevice,
  onDeviceChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignTop,
  onAlignMiddle,
  onAlignBottom,
  onDistributeH,
  onDistributeV,
  onGroup,
  onUngroup,
  onLock,
  onUnlock,
  onFlipH,
  onFlipV,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  selectedCount = 0,
  showGrid = false,
  onToggleGrid,
  showRulers = false,
  onToggleRulers,
  snapToGrid = false,
  onToggleSnap,
  className,
}: ToolbarProps) {
  const hasSelection = selectedCount > 0;

  // Group tools by category
  const groupedTools = useMemo(() => {
    const map = new Map<string, ToolDefinition[]>();
    for (const tool of tools) {
      const arr = map.get(tool.group) ?? [];
      arr.push(tool);
      map.set(tool.group, arr);
    }
    return map;
  }, []);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={clsx(
        'flex items-center justify-between gap-2 px-3 py-1.5',
        'bg-slate-900/95 backdrop-blur-xl border-b border-white/5',
        'shadow-2xl shadow-black/20',
        className,
      )}
    >
      {/* Left: Tools */}
      <div className="flex items-center gap-0.5">
        {/* Undo/Redo */}
        <ToolBtn
          icon={<SvgIcon d="M3 10h10a5 5 0 015 5v2" />}
          label="Undo"
          shortcut="Ctrl+Z"
          disabled={!canUndo}
          onClick={onUndo}
          size="sm"
          variant="ghost"
        />
        <ToolBtn
          icon={<SvgIcon d="M21 10H11a5 5 0 00-5 5v2" />}
          label="Redo"
          shortcut="Ctrl+Shift+Z"
          disabled={!canRedo}
          onClick={onRedo}
          size="sm"
          variant="ghost"
        />

        <ToolbarDivider />

        {/* Tool groups */}
        {toolGroups.map((group, gi) => {
          const groupTools = groupedTools.get(group);
          if (!groupTools) return null;
          return (
            <React.Fragment key={group}>
              {gi > 0 && <ToolbarDivider />}
              {groupTools.map(tool => (
                <ToolBtn
                  key={tool.id}
                  icon={tool.icon}
                  label={tool.label}
                  shortcut={tool.shortcut}
                  active={activeTool === tool.id}
                  onClick={() => onToolChange(tool.id)}
                />
              ))}
            </React.Fragment>
          );
        })}
      </div>

      {/* Center: Device Preview */}
      <div className="flex items-center gap-3">
        <DevicePreview device={previewDevice} onChange={onDeviceChange} />
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-0.5">
        <ZoomControls zoom={zoom} onZoomChange={onZoomChange} />

        <ToolbarDivider />

        {/* Selection actions */}
        <AlignmentTools
          onAlignLeft={onAlignLeft}
          onAlignCenter={onAlignCenter}
          onAlignRight={onAlignRight}
          onAlignTop={onAlignTop}
          onAlignMiddle={onAlignMiddle}
          onAlignBottom={onAlignBottom}
          onDistributeH={onDistributeH}
          onDistributeV={onDistributeV}
          hasSelection={hasSelection}
        />

        <LayerTools
          onBringForward={onBringForward}
          onSendBackward={onSendBackward}
          onBringToFront={onBringToFront}
          onSendToBack={onSendToBack}
          hasSelection={hasSelection}
        />

        {/* Group/Lock */}
        <ToolBtn
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="1" width="10" height="10" />
              <rect x="13" y="13" width="10" height="10" />
              <line x1="6" y1="11" x2="6" y2="13" strokeDasharray="2" />
              <line x1="18" y1="11" x2="18" y2="13" strokeDasharray="2" />
            </svg>
          }
          label="Group"
          shortcut="Ctrl+G"
          disabled={selectedCount < 2}
          onClick={onGroup}
        />
        <ToolBtn
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 018 0v4" />
            </svg>
          }
          label="Lock"
          disabled={!hasSelection}
          onClick={onLock}
        />

        {/* Flip */}
        <ToolBtn
          icon={<SvgIcon d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />}
          label="Flip Horizontal"
          disabled={!hasSelection}
          onClick={onFlipH}
          size="sm"
          variant="ghost"
        />

        <ToolbarDivider />

        {/* Canvas settings */}
        {onToggleGrid && onToggleRulers && onToggleSnap && (
          <CanvasControls
            showGrid={showGrid}
            onToggleGrid={onToggleGrid}
            showRulers={showRulers}
            onToggleRulers={onToggleRulers}
            snapToGrid={snapToGrid}
            onToggleSnap={onToggleSnap}
          />
        )}
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
 * Floating Toolbar (appears next to selection)
 * ────────────────────────────────────────────── */

interface FloatingToolbarProps {
  position: { x: number; y: number };
  visible: boolean;
  actions: {
    id: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    danger?: boolean;
  }[];
}

export function FloatingToolbar({ position, visible, actions }: FloatingToolbarProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.9 }}
          style={{ left: position.x, top: position.y }}
          className="fixed z-50 flex items-center gap-0.5 px-1.5 py-1
                     bg-slate-800/95 backdrop-blur-xl border border-white/10
                     rounded-xl shadow-2xl shadow-black/30"
        >
          {actions.map((action, i) => (
            <React.Fragment key={action.id}>
              {i > 0 && i % 3 === 0 && <ToolbarDivider />}
              <motion.button
                onClick={action.onClick}
                title={action.label}
                className={clsx(
                  'p-1.5 rounded-lg transition-colors',
                  action.danger
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-white/50 hover:text-white hover:bg-white/8',
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {action.icon}
              </motion.button>
            </React.Fragment>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ──────────────────────────────────────────────
 * Mini Map
 * ────────────────────────────────────────────── */

interface MiniMapProps {
  canvasWidth: number;
  canvasHeight: number;
  viewportX: number;
  viewportY: number;
  viewportWidth: number;
  viewportHeight: number;
  zoom: number;
  widgets?: { x: number; y: number; width: number; height: number; color?: string }[];
  onViewportChange?: (x: number, y: number) => void;
  className?: string;
}

export function MiniMap({
  canvasWidth,
  canvasHeight,
  viewportX,
  viewportY,
  viewportWidth,
  viewportHeight,
  zoom,
  widgets = [],
  onViewportChange,
  className,
}: MiniMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapWidth = 180;
  const mapHeight = (canvasHeight / canvasWidth) * mapWidth;
  const scale = mapWidth / canvasWidth;

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!mapRef.current || !onViewportChange) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale - viewportWidth / 2;
    const y = (e.clientY - rect.top) / scale - viewportHeight / 2;
    onViewportChange(x, y);
  }, [scale, viewportWidth, viewportHeight, onViewportChange]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={clsx(
        'bg-slate-800/90 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden shadow-xl',
        className,
      )}
      style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
    >
      <div
        ref={mapRef}
        className="relative w-full h-full cursor-crosshair"
        onClick={handleClick}
      >
        {/* Widget representations */}
        {widgets.map((w, i) => (
          <div
            key={i}
            className="absolute rounded-sm"
            style={{
              left: `${w.x * scale}px`,
              top: `${w.y * scale}px`,
              width: `${Math.max(2, w.width * scale)}px`,
              height: `${Math.max(2, w.height * scale)}px`,
              backgroundColor: w.color ?? 'rgba(99, 102, 241, 0.4)',
            }}
          />
        ))}

        {/* Viewport rectangle */}
        <div
          className="absolute border-2 border-indigo-400/60 rounded-sm bg-indigo-400/5"
          style={{
            left: `${viewportX * scale}px`,
            top: `${viewportY * scale}px`,
            width: `${viewportWidth * scale}px`,
            height: `${viewportHeight * scale}px`,
          }}
        />

        {/* Zoom label */}
        <div className="absolute bottom-1 right-1 text-[9px] font-mono text-white/30 bg-black/30 px-1 rounded">
          {Math.round(zoom)}%
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
 * Breadcrumb / Page Path
 * ────────────────────────────────────────────── */

interface BreadcrumbItem {
  id: string;
  label: string;
  onClick?: () => void;
}

interface BreadcrumbBarProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbBar({ items, className }: BreadcrumbBarProps) {
  return (
    <div className={clsx('flex items-center gap-1', className)}>
      {items.map((item, i) => (
        <React.Fragment key={item.id}>
          {i > 0 && (
            <svg className="w-3 h-3 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
          <motion.button
            onClick={item.onClick}
            className={clsx(
              'text-xs px-1.5 py-0.5 rounded-md transition-colors',
              i === items.length - 1
                ? 'text-white/70 font-medium'
                : 'text-white/40 hover:text-white/60 hover:bg-white/5',
            )}
            whileHover={{ scale: 1.02 }}
          >
            {item.label}
          </motion.button>
        </React.Fragment>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Status Bar
 * ────────────────────────────────────────────── */

interface StatusBarProps {
  selectedCount: number;
  totalWidgets: number;
  currentPage: string;
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';
  zoom: number;
  cursorPosition?: { x: number; y: number };
  className?: string;
}

export function StatusBar({
  selectedCount,
  totalWidgets,
  currentPage,
  saveStatus,
  zoom,
  cursorPosition,
  className,
}: StatusBarProps) {
  const statusColors = {
    saved: 'text-emerald-400',
    saving: 'text-yellow-400',
    unsaved: 'text-orange-400',
    error: 'text-red-400',
  };

  const statusLabels = {
    saved: 'Saved',
    saving: 'Saving...',
    unsaved: 'Unsaved changes',
    error: 'Save failed',
  };

  return (
    <div className={clsx(
      'flex items-center justify-between px-3 py-1',
      'bg-slate-950/80 border-t border-white/5 text-[11px]',
      className,
    )}>
      <div className="flex items-center gap-4">
        <span className="text-white/30">
          {selectedCount > 0 ? `${selectedCount} selected` : `${totalWidgets} widgets`}
        </span>
        <span className="text-white/20">{currentPage}</span>
      </div>

      <div className="flex items-center gap-4">
        {cursorPosition && (
          <span className="text-white/20 font-mono">
            {Math.round(cursorPosition.x)}, {Math.round(cursorPosition.y)}
          </span>
        )}
        <span className="text-white/20 font-mono">{Math.round(zoom)}%</span>
        <span className={clsx('flex items-center gap-1', statusColors[saveStatus])}>
          <span className={clsx(
            'w-1.5 h-1.5 rounded-full',
            saveStatus === 'saved' && 'bg-emerald-400',
            saveStatus === 'saving' && 'bg-yellow-400 animate-pulse',
            saveStatus === 'unsaved' && 'bg-orange-400',
            saveStatus === 'error' && 'bg-red-400',
          )} />
          {statusLabels[saveStatus]}
        </span>
      </div>
    </div>
  );
}
