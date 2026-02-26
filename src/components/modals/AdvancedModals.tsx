/**
 * Advanced Modals & Dialogs  
 * Settings, Export, Code Preview, Asset Manager, Theme Editor,
 * Collaboration, and Command Palette modals.
 */

'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

/* ══════════════════════════════════════════════
 * MODAL PRIMITIVES
 * ══════════════════════════════════════════════ */

interface ModalOverlayProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function ModalOverlay({ children, isOpen, onClose, className }: ModalOverlayProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
    return undefined;
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className={clsx(
            'fixed inset-0 z-50 flex items-center justify-center p-4',
            'bg-black/60 backdrop-blur-md',
            className,
          )}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ModalCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  width?: string | number;
  maxHeight?: string;
  className?: string;
  footer?: React.ReactNode;
}

export function ModalCard({
  children,
  title,
  subtitle,
  onClose,
  width = 560,
  maxHeight = '85vh',
  className,
  footer,
}: ModalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={clsx(
        'bg-slate-900 border border-white/10 rounded-2xl shadow-2xl',
        'flex flex-col overflow-hidden',
        className,
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        maxHeight,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      {(title || onClose) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div>
            {title && <h2 className="text-base font-semibold text-white">{title}</h2>}
            {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
          </div>
          {onClose && (
            <motion.button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-3 border-t border-white/5 flex items-center justify-end gap-2">
          {footer}
        </div>
      )}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
 * Modal Button
 * ────────────────────────────────────────────── */

interface ModalBtnProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ModalBtn({
  children,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className,
}: ModalBtnProps) {
  const variantClasses = {
    primary: 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/20',
    secondary: 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white',
    danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
    ghost: 'text-white/50 hover:text-white hover:bg-white/5',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        'rounded-lg font-medium transition-all flex items-center gap-2',
        variantClasses[variant],
        sizeClasses[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className,
      )}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {loading && (
        <motion.div
          className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {children}
    </motion.button>
  );
}

/* ══════════════════════════════════════════════
 * SETTINGS MODAL
 * ══════════════════════════════════════════════ */

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'editor', label: 'Editor', icon: '🎨' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'export', label: 'Export', icon: '📦' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' },
    { id: 'shortcuts', label: 'Shortcuts', icon: '⌨️' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
  ];

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <ModalCard
        title="Settings"
        onClose={onClose}
        width={720}
        maxHeight="80vh"
      >
        <div className="flex gap-6 -mx-6 -my-4">
          {/* Sidebar */}
          <nav className="w-48 flex-shrink-0 border-r border-white/5 py-4 px-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
                  activeTab === tab.id
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-white/50 hover:text-white/70 hover:bg-white/3',
                )}
              >
                <span className="text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 py-4 pr-6 min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'general' && <GeneralSettings />}
                {activeTab === 'editor' && <EditorSettings />}
                {activeTab === 'performance' && <PerformanceSettings />}
                {activeTab === 'export' && <ExportSettings />}
                {activeTab === 'accessibility' && <AccessibilitySettings />}
                {activeTab === 'shortcuts' && <ShortcutSettings />}
                {activeTab === 'about' && <AboutSettings />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}

/* ──────────────────────────────────────────────
 * Settings Sections
 * ────────────────────────────────────────────── */

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function SettingsToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between py-1 cursor-pointer group">
      <div>
        <span className="text-sm text-white/70 group-hover:text-white transition-colors">{label}</span>
        {description && <p className="text-[11px] text-white/30 mt-0.5">{description}</p>}
      </div>
      <div
        onClick={() => onChange(!checked)}
        className={clsx(
          'w-9 h-5 rounded-full relative transition-colors cursor-pointer',
          checked ? 'bg-indigo-500' : 'bg-white/10',
        )}
      >
        <motion.div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
          animate={{ left: checked ? '18px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </label>
  );
}

function SettingsSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-white/70">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80
                   focus:outline-none focus:border-indigo-500/50"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function SettingsSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = '',
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="py-1">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-white/70">{label}</span>
        <span className="text-xs text-white/40 font-mono">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3
                   [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-lg"
      />
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Individual Settings Tabs
 * ────────────────────────────────────────────── */

function GeneralSettings() {
  const [autoSave, setAutoSave] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [language, setLanguage] = useState('en');

  return (
    <>
      <SettingsSection title="Preferences">
        <SettingsSelect
          label="Language"
          value={language}
          options={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
            { value: 'fr', label: 'Français' },
            { value: 'de', label: 'Deutsch' },
            { value: 'ja', label: '日本語' },
            { value: 'ko', label: '한국어' },
            { value: 'zh', label: '中文' },
          ]}
          onChange={setLanguage}
        />
        <SettingsToggle label="Auto Save" description="Automatically save changes" checked={autoSave} onChange={setAutoSave} />
        <SettingsToggle label="Show Welcome" description="Show welcome screen on startup" checked={showWelcome} onChange={setShowWelcome} />
      </SettingsSection>
      <SettingsSection title="Privacy">
        <SettingsToggle label="Usage Analytics" description="Help improve the app by sending anonymous data" checked={analytics} onChange={setAnalytics} />
      </SettingsSection>
    </>
  );
}

function EditorSettings() {
  const [gridSize, setGridSize] = useState(8);
  const [snapThreshold, setSnapThreshold] = useState(5);
  const [showGuides, setShowGuides] = useState(true);
  const [showSmartGuides, setShowSmartGuides] = useState(true);
  const [showPixelGrid, setShowPixelGrid] = useState(false);
  const [bgColor, setBgColor] = useState('#0f172a');

  return (
    <>
      <SettingsSection title="Canvas">
        <SettingsSlider label="Grid Size" value={gridSize} min={4} max={64} step={4} onChange={setGridSize} suffix="px" />
        <SettingsSlider label="Snap Threshold" value={snapThreshold} min={1} max={20} onChange={setSnapThreshold} suffix="px" />
        <SettingsToggle label="Show Guides" checked={showGuides} onChange={setShowGuides} />
        <SettingsToggle label="Smart Guides" description="Show alignment guides when moving elements" checked={showSmartGuides} onChange={setShowSmartGuides} />
        <SettingsToggle label="Pixel Grid (Zoom > 800%)" checked={showPixelGrid} onChange={setShowPixelGrid} />
      </SettingsSection>
      <SettingsSection title="Appearance">
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-white/70">Canvas Background</span>
          <div className="flex items-center gap-2">
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border border-white/10" />
            <span className="text-xs text-white/40 font-mono">{bgColor}</span>
          </div>
        </div>
      </SettingsSection>
    </>
  );
}

function PerformanceSettings() {
  const [hwAccel, setHwAccel] = useState(true);
  const [maxUndo, setMaxUndo] = useState(100);
  const [lazyLoad, setLazyLoad] = useState(true);
  const [virtualize, setVirtualize] = useState(true);

  return (
    <SettingsSection title="Performance">
      <SettingsToggle label="Hardware Acceleration" description="Use GPU for rendering when available" checked={hwAccel} onChange={setHwAccel} />
      <SettingsSlider label="Max Undo Steps" value={maxUndo} min={10} max={500} step={10} onChange={setMaxUndo} />
      <SettingsToggle label="Lazy Load Widgets" description="Load off-screen widgets on demand" checked={lazyLoad} onChange={setLazyLoad} />
      <SettingsToggle label="Virtualize Canvas" description="Only render visible widgets" checked={virtualize} onChange={setVirtualize} />
    </SettingsSection>
  );
}

function ExportSettings() {
  const [format, setFormat] = useState('png');
  const [quality, setQuality] = useState(90);
  const [scale, setScale] = useState(2);
  const [includeBg, setIncludeBg] = useState(true);
  const [optimize, setOptimize] = useState(true);

  return (
    <SettingsSection title="Export Defaults">
      <SettingsSelect
        label="Default Format"
        value={format}
        options={[
          { value: 'png', label: 'PNG' },
          { value: 'jpg', label: 'JPG' },
          { value: 'webp', label: 'WebP' },
          { value: 'svg', label: 'SVG' },
          { value: 'pdf', label: 'PDF' },
        ]}
        onChange={setFormat}
      />
      <SettingsSlider label="Quality" value={quality} min={10} max={100} onChange={setQuality} suffix="%" />
      <SettingsSelect
        label="Scale"
        value={String(scale)}
        options={[
          { value: '0.5', label: '0.5x' },
          { value: '1', label: '1x' },
          { value: '2', label: '2x' },
          { value: '3', label: '3x' },
          { value: '4', label: '4x' },
        ]}
        onChange={(v) => setScale(Number(v))}
      />
      <SettingsToggle label="Include Background" checked={includeBg} onChange={setIncludeBg} />
      <SettingsToggle label="Optimize Assets" description="Compress images and minify code" checked={optimize} onChange={setOptimize} />
    </SettingsSection>
  );
}

function AccessibilitySettings() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [screenReader, setScreenReader] = useState(true);
  const [focusIndicators, setFocusIndicators] = useState(true);

  return (
    <SettingsSection title="Accessibility">
      <SettingsToggle label="Reduce Motion" description="Minimize animations and transitions" checked={reduceMotion} onChange={setReduceMotion} />
      <SettingsToggle label="High Contrast" description="Increase contrast of UI elements" checked={highContrast} onChange={setHighContrast} />
      <SettingsToggle label="Large Text" description="Increase text size across the app" checked={largeText} onChange={setLargeText} />
      <SettingsToggle label="Screen Reader" description="Announce changes to screen readers" checked={screenReader} onChange={setScreenReader} />
      <SettingsToggle label="Focus Indicators" description="Show visible focus rings" checked={focusIndicators} onChange={setFocusIndicators} />
    </SettingsSection>
  );
}

function ShortcutSettings() {
  const shortcuts = [
    { label: 'Select Tool', key: 'V' },
    { label: 'Hand Tool', key: 'H' },
    { label: 'Text Tool', key: 'T' },
    { label: 'Rectangle', key: 'R' },
    { label: 'Circle', key: 'O' },
    { label: 'Undo', key: 'Ctrl+Z' },
    { label: 'Redo', key: 'Ctrl+Shift+Z' },
    { label: 'Copy', key: 'Ctrl+C' },
    { label: 'Paste', key: 'Ctrl+V' },
    { label: 'Cut', key: 'Ctrl+X' },
    { label: 'Delete', key: 'Delete' },
    { label: 'Duplicate', key: 'Ctrl+D' },
    { label: 'Select All', key: 'Ctrl+A' },
    { label: 'Zoom In', key: 'Ctrl+=' },
    { label: 'Zoom Out', key: 'Ctrl+-' },
    { label: 'Save', key: 'Ctrl+S' },
    { label: 'Export', key: 'Ctrl+E' },
    { label: 'Preview', key: 'Ctrl+P' },
    { label: 'Toggle Grid', key: "Ctrl+'" },
    { label: 'Group', key: 'Ctrl+G' },
    { label: 'Command Palette', key: 'Ctrl+K' },
    { label: 'Toggle Code', key: 'Ctrl+`' },
  ];

  return (
    <SettingsSection title="Keyboard Shortcuts">
      <div className="space-y-0.5">
        {shortcuts.map(s => (
          <div key={s.label} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-white/3">
            <span className="text-xs text-white/60">{s.label}</span>
            <kbd className="px-2 py-0.5 text-[10px] font-mono text-white/40 bg-white/5 border border-white/10 rounded">
              {s.key}
            </kbd>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}

function AboutSettings() {
  return (
    <div className="text-center py-8">
      <motion.div
        className="text-4xl mb-4"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      >
        🏗️
      </motion.div>
      <h3 className="text-lg font-bold text-white mb-1">AppBuilder</h3>
      <p className="text-xs text-white/40 mb-4">Version 1.0.0</p>
      <p className="text-xs text-white/30 max-w-xs mx-auto">
        A professional web application builder with drag-and-drop interface,
        real-time collaboration, and multi-platform export capabilities.
      </p>
      <div className="mt-6 flex items-center justify-center gap-4">
        <ModalBtn variant="ghost" size="sm">Documentation</ModalBtn>
        <ModalBtn variant="ghost" size="sm">Changelog</ModalBtn>
        <ModalBtn variant="ghost" size="sm">License</ModalBtn>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
 * EXPORT MODAL
 * ══════════════════════════════════════════════ */

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport?: (config: ExportConfig) => void;
}

interface ExportConfig {
  format: 'png' | 'jpg' | 'svg' | 'pdf' | 'webp';
  quality: number;
  scale: number;
  pages: 'current' | 'all' | 'selected';
  includeBackground: boolean;
  flattenLayers: boolean;
}

export function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
  const [config, setConfig] = useState<ExportConfig>({
    format: 'png',
    quality: 90,
    scale: 2,
    pages: 'current',
    includeBackground: true,
    flattenLayers: false,
  });

  const formatInfo = {
    png: { label: 'PNG', desc: 'Best for images with transparency', icon: '🖼️' },
    jpg: { label: 'JPG', desc: 'Best for photos, smaller file size', icon: '📷' },
    svg: { label: 'SVG', desc: 'Scalable vector format', icon: '✏️' },
    pdf: { label: 'PDF', desc: 'Best for documents and printing', icon: '📄' },
    webp: { label: 'WebP', desc: 'Modern format with great compression', icon: '🌐' },
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <ModalCard
        title="Export"
        subtitle="Export your design to various formats"
        onClose={onClose}
        width={480}
        footer={
          <>
            <ModalBtn variant="secondary" onClick={onClose}>Cancel</ModalBtn>
            <ModalBtn variant="primary" onClick={() => { onExport?.(config); onClose(); }}>
              Export
            </ModalBtn>
          </>
        }
      >
        {/* Format selection */}
        <div className="mb-6">
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 block">Format</label>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(formatInfo).map(([key, info]) => (
              <motion.button
                key={key}
                onClick={() => setConfig(c => ({ ...c, format: key as ExportConfig['format'] }))}
                className={clsx(
                  'flex flex-col items-center gap-1 p-3 rounded-xl border transition-all',
                  config.format === key
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                    : 'border-white/5 bg-white/3 text-white/50 hover:border-white/10 hover:text-white/70',
                )}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-lg">{info.icon}</span>
                <span className="text-xs font-medium">{info.label}</span>
              </motion.button>
            ))}
          </div>
          <p className="text-[11px] text-white/30 mt-2">
            {formatInfo[config.format].desc}
          </p>
        </div>

        {/* Scale */}
        <div className="mb-5">
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 block">Scale</label>
          <div className="flex gap-2">
            {[0.5, 1, 2, 3, 4].map(s => (
              <button
                key={s}
                onClick={() => setConfig(c => ({ ...c, scale: s }))}
                className={clsx(
                  'flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all',
                  config.scale === s
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                    : 'border-white/5 text-white/40 hover:text-white/60 hover:border-white/10',
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Quality (for raster formats) */}
        {['png', 'jpg', 'webp'].includes(config.format) && (
          <SettingsSlider
            label="Quality"
            value={config.quality}
            min={10}
            max={100}
            onChange={(v) => setConfig(c => ({ ...c, quality: v }))}
            suffix="%"
          />
        )}

        {/* Pages */}
        <div className="mb-5">
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 block">Pages</label>
          <div className="flex gap-2">
            {(['current', 'all', 'selected'] as const).map(p => (
              <button
                key={p}
                onClick={() => setConfig(c => ({ ...c, pages: p }))}
                className={clsx(
                  'flex-1 py-1.5 text-xs font-medium rounded-lg border capitalize transition-all',
                  config.pages === p
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                    : 'border-white/5 text-white/40 hover:text-white/60 hover:border-white/10',
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div>
          <SettingsToggle
            label="Include Background"
            checked={config.includeBackground}
            onChange={(v) => setConfig(c => ({ ...c, includeBackground: v }))}
          />
          <SettingsToggle
            label="Flatten Layers"
            checked={config.flattenLayers}
            onChange={(v) => setConfig(c => ({ ...c, flattenLayers: v }))}
          />
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}

/* ══════════════════════════════════════════════
 * COMMAND PALETTE
 * ══════════════════════════════════════════════ */

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  category: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
}

export function CommandPaletteModal({ isOpen, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    if (!query) return commands;
    const q = query.toLowerCase();
    return commands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const cmd of filtered) {
      const arr = map.get(cmd.category) ?? [];
      arr.push(cmd);
      map.set(cmd.category, arr);
    }
    return map;
  }, [filtered]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filtered[selectedIndex]?.action();
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [filtered, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
              <svg className="w-5 h-5 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command..."
                className="flex-1 bg-transparent text-white text-sm placeholder-white/30 focus:outline-none"
              />
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-white/20 bg-white/5 border border-white/10 rounded">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-auto py-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-white/30">No commands found</p>
                  <p className="text-xs text-white/20 mt-1">Try a different search term</p>
                </div>
              ) : (
                Array.from(grouped.entries()).map(([category, items]) => (
                  <div key={category}>
                    <div className="px-4 py-1">
                      <span className="text-[10px] text-white/20 uppercase tracking-wider font-medium">
                        {category}
                      </span>
                    </div>
                    {items.map((cmd, i) => {
                      const globalIndex = filtered.indexOf(cmd);
                      return (
                        <motion.button
                          key={cmd.id}
                          onClick={() => { cmd.action(); onClose(); }}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={clsx(
                            'w-full flex items-center justify-between px-4 py-2 transition-colors',
                            globalIndex === selectedIndex
                              ? 'bg-indigo-500/10 text-white'
                              : 'text-white/60 hover:text-white/80',
                          )}
                          initial={false}
                          animate={{
                            backgroundColor: globalIndex === selectedIndex ? 'rgba(99,102,241,0.1)' : 'transparent',
                          }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {cmd.icon && <span className="text-white/30 flex-shrink-0">{cmd.icon}</span>}
                            <div className="text-left min-w-0">
                              <span className="text-sm block truncate">{cmd.label}</span>
                              {cmd.description && (
                                <span className="text-[11px] text-white/30 block truncate">{cmd.description}</span>
                              )}
                            </div>
                          </div>
                          {cmd.shortcut && (
                            <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-white/20 bg-white/5 border border-white/10 rounded flex-shrink-0 ml-3">
                              {cmd.shortcut}
                            </kbd>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-white/5">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-white/20">
                  {filtered.length} command{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1 py-0.5 text-[9px] font-mono text-white/15 bg-white/5 rounded">↑↓</kbd>
                <span className="text-[10px] text-white/15">navigate</span>
                <kbd className="px-1 py-0.5 text-[9px] font-mono text-white/15 bg-white/5 rounded">↵</kbd>
                <span className="text-[10px] text-white/15">select</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════════════════════════════════
 * CONFIRMATION DIALOG
 * ══════════════════════════════════════════════ */

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}: ConfirmDialogProps) {
  const iconMap = {
    danger: '⚠️',
    warning: '⚡',
    info: 'ℹ️',
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <ModalCard width={400} onClose={onClose}>
        <div className="text-center py-4">
          <motion.div
            className="text-3xl mb-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            {iconMap[variant]}
          </motion.div>
          <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-white/50 max-w-xs mx-auto">{message}</p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <ModalBtn variant="secondary" onClick={onClose}>{cancelText}</ModalBtn>
            <ModalBtn variant={variant === 'danger' ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }}>
              {confirmText}
            </ModalBtn>
          </div>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}

/* ══════════════════════════════════════════════
 * ASSET MANAGER MODAL
 * ══════════════════════════════════════════════ */

interface AssetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (asset: { id: string; url: string; name: string }) => void;
}

export function AssetManagerModal({ isOpen, onClose, onSelect }: AssetManagerModalProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Mock assets for UI demonstration
  const assetTypes = ['image', 'video', 'audio', 'font', 'icon', 'svg'];

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <ModalCard
        title="Asset Manager"
        subtitle="Manage your project assets"
        onClose={onClose}
        width={800}
        maxHeight="80vh"
      >
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 -mt-1">
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assets..."
                className="w-48 pl-8 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg
                           text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilter(null)}
                className={clsx(
                  'px-2 py-1 text-[10px] rounded-md transition-colors',
                  filter === null ? 'bg-indigo-500/20 text-indigo-400' : 'text-white/40 hover:text-white/60',
                )}
              >
                All
              </button>
              {assetTypes.map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t === filter ? null : t)}
                  className={clsx(
                    'px-2 py-1 text-[10px] rounded-md capitalize transition-colors',
                    filter === t ? 'bg-indigo-500/20 text-indigo-400' : 'text-white/40 hover:text-white/60',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center bg-white/5 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  'p-1 rounded-md transition-colors',
                  viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/30',
                )}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'p-1 rounded-md transition-colors',
                  viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/30',
                )}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
            </div>

            {/* Upload button */}
            <ModalBtn variant="primary" size="sm">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              Upload
            </ModalBtn>
          </div>
        </div>

        {/* Drop zone */}
        <motion.div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={() => setDragOver(false)}
          className={clsx(
            'border-2 border-dashed rounded-xl transition-all min-h-[300px] flex items-center justify-center',
            dragOver
              ? 'border-indigo-500 bg-indigo-500/5'
              : 'border-white/10',
          )}
          animate={dragOver ? { scale: 1.01 } : { scale: 1 }}
        >
          <div className="text-center py-12">
            <motion.div
              className="text-4xl mb-3"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📁
            </motion.div>
            <p className="text-sm text-white/40 mb-1">
              {dragOver ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-[11px] text-white/20">
              or click Upload to browse from your computer
            </p>
            <p className="text-[10px] text-white/15 mt-2">
              Supports PNG, JPG, SVG, WebP, MP4, MP3, WOFF2, TTF
            </p>
          </div>
        </motion.div>
      </ModalCard>
    </ModalOverlay>
  );
}

/* ══════════════════════════════════════════════
 * THEME EDITOR MODAL
 * ══════════════════════════════════════════════ */

interface ThemeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeEditorModal({ isOpen, onClose }: ThemeEditorModalProps) {
  const [activeSection, setActiveSection] = useState('colors');
  const [mode, setMode] = useState<'light' | 'dark'>('dark');

  const colorPairs = [
    { key: 'primary', label: 'Primary', value: '#6366f1' },
    { key: 'secondary', label: 'Secondary', value: '#8b5cf6' },
    { key: 'accent', label: 'Accent', value: '#06b6d4' },
    { key: 'background', label: 'Background', value: '#0f172a' },
    { key: 'surface', label: 'Surface', value: '#1e293b' },
    { key: 'text', label: 'Text', value: '#f1f5f9' },
    { key: 'border', label: 'Border', value: '#334155' },
    { key: 'error', label: 'Error', value: '#ef4444' },
    { key: 'warning', label: 'Warning', value: '#f59e0b' },
    { key: 'success', label: 'Success', value: '#22c55e' },
    { key: 'info', label: 'Info', value: '#3b82f6' },
  ];

  const sections = [
    { id: 'colors', label: 'Colors' },
    { id: 'typography', label: 'Typography' },
    { id: 'spacing', label: 'Spacing' },
    { id: 'borders', label: 'Borders' },
    { id: 'shadows', label: 'Shadows' },
    { id: 'tokens', label: 'Custom Tokens' },
  ];

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <ModalCard
        title="Theme Editor"
        subtitle="Customize your design system"
        onClose={onClose}
        width={680}
        maxHeight="85vh"
        footer={
          <>
            <ModalBtn variant="ghost" size="sm">Reset</ModalBtn>
            <ModalBtn variant="secondary" onClick={onClose}>Cancel</ModalBtn>
            <ModalBtn variant="primary" onClick={onClose}>Save Theme</ModalBtn>
          </>
        }
      >
        {/* Mode toggle */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setMode('light')}
              className={clsx(
                'px-3 py-1 text-xs rounded-md transition-all',
                mode === 'light' ? 'bg-white/10 text-white' : 'text-white/40',
              )}
            >
              ☀️ Light
            </button>
            <button
              onClick={() => setMode('dark')}
              className={clsx(
                'px-3 py-1 text-xs rounded-md transition-all',
                mode === 'dark' ? 'bg-white/10 text-white' : 'text-white/40',
              )}
            >
              🌙 Dark
            </button>
          </div>
        </div>

        <div className="flex gap-4 -mx-6 px-6">
          {/* Section nav */}
          <nav className="w-32 flex-shrink-0 space-y-0.5">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={clsx(
                  'w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors',
                  activeSection === s.id
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/3',
                )}
              >
                {s.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 min-h-[300px]">
            {activeSection === 'colors' && (
              <div className="grid grid-cols-2 gap-3">
                {colorPairs.map(c => (
                  <div key={c.key} className="flex items-center gap-3 p-2 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                    <input
                      type="color"
                      defaultValue={c.value}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-white/10"
                    />
                    <div>
                      <span className="text-xs text-white/70 block">{c.label}</span>
                      <span className="text-[10px] text-white/30 font-mono">{c.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'typography' && (
              <div className="space-y-4">
                <SettingsSelect label="Font Family" value="inter" options={[
                  { value: 'inter', label: 'Inter' },
                  { value: 'roboto', label: 'Roboto' },
                  { value: 'poppins', label: 'Poppins' },
                  { value: 'montserrat', label: 'Montserrat' },
                  { value: 'open-sans', label: 'Open Sans' },
                  { value: 'lato', label: 'Lato' },
                ]} onChange={() => {}} />
                <SettingsSlider label="Base Size" value={16} min={12} max={24} onChange={() => {}} suffix="px" />
                <SettingsSlider label="Line Height" value={1.5} min={1} max={2} step={0.1} onChange={() => {}} />
                <SettingsSlider label="Heading Weight" value={700} min={100} max={900} step={100} onChange={() => {}} />

                {/* Type scale preview */}
                <div className="mt-4 p-3 bg-white/3 rounded-lg">
                  <span className="text-[10px] text-white/30 uppercase tracking-wider block mb-2">Preview</span>
                  {[48, 36, 24, 20, 16, 14, 12].map(size => (
                    <div key={size} className="flex items-baseline gap-2 mb-1">
                      <span className="text-[10px] text-white/20 w-8 text-right font-mono">{size}</span>
                      <span style={{ fontSize: `${size}px` }} className="text-white/70 truncate">
                        The quick brown fox
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'spacing' && (
              <div className="space-y-4">
                <SettingsSlider label="Base Unit" value={4} min={2} max={8} onChange={() => {}} suffix="px" />
                <div className="mt-4 p-3 bg-white/3 rounded-lg">
                  <span className="text-[10px] text-white/30 uppercase tracking-wider block mb-2">Scale Preview</span>
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24].map(mult => (
                    <div key={mult} className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-white/20 w-8 text-right font-mono">{mult * 4}px</span>
                      <div className="bg-indigo-500/30 rounded-sm" style={{ width: `${mult * 4}px`, height: 12 }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'borders' && (
              <div className="space-y-4">
                <div className="text-xs text-white/40 mb-2">Border Radius Scale</div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'None', value: '0' },
                    { label: 'Small', value: '2px' },
                    { label: 'Medium', value: '6px' },
                    { label: 'Large', value: '8px' },
                    { label: 'XL', value: '12px' },
                    { label: 'Full', value: '9999px' },
                  ].map(r => (
                    <div key={r.label} className="p-3 bg-white/3 rounded-lg text-center">
                      <div
                        className="w-12 h-12 bg-indigo-500/30 border border-indigo-500/50 mx-auto mb-2"
                        style={{ borderRadius: r.value }}
                      />
                      <span className="text-[10px] text-white/40">{r.label}</span>
                      <span className="text-[10px] text-white/20 block font-mono">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'shadows' && (
              <div className="space-y-4">
                <div className="text-xs text-white/40 mb-2">Shadow Scale</div>
                <div className="space-y-3">
                  {[
                    { label: 'Small', value: '0 1px 2px rgba(0,0,0,.05)' },
                    { label: 'Medium', value: '0 4px 6px -1px rgba(0,0,0,.1)' },
                    { label: 'Large', value: '0 10px 15px -3px rgba(0,0,0,.1)' },
                    { label: 'XL', value: '0 20px 25px -5px rgba(0,0,0,.1)' },
                    { label: 'Inner', value: 'inset 0 2px 4px rgba(0,0,0,.06)' },
                    { label: 'Glow', value: '0 0 20px rgba(99,102,241,0.3)' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-4 p-3 bg-white/3 rounded-lg">
                      <div
                        className="w-16 h-12 bg-slate-700 rounded-lg flex-shrink-0"
                        style={{ boxShadow: s.value }}
                      />
                      <div>
                        <span className="text-xs text-white/60 block">{s.label}</span>
                        <span className="text-[10px] text-white/20 font-mono block mt-0.5 break-all">{s.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'tokens' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/40">Custom Design Tokens</span>
                  <ModalBtn variant="ghost" size="sm">+ Add Token</ModalBtn>
                </div>
                <div className="p-6 text-center bg-white/3 rounded-xl">
                  <span className="text-2xl block mb-2">🎨</span>
                  <p className="text-xs text-white/40">No custom tokens yet</p>
                  <p className="text-[11px] text-white/20 mt-1">
                    Create reusable design tokens for consistent styling
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}

/* ══════════════════════════════════════════════
 * DATA CONNECTOR MODAL
 * ══════════════════════════════════════════════ */

interface DataConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DataConnectorModal({ isOpen, onClose }: DataConnectorModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [connectorType, setConnectorType] = useState<string | null>(null);

  const connectors = [
    { id: 'rest', label: 'REST API', icon: '🔗', desc: 'Connect to any RESTful API' },
    { id: 'graphql', label: 'GraphQL', icon: '◈', desc: 'Query GraphQL endpoints' },
    { id: 'firebase', label: 'Firebase', icon: '🔥', desc: 'Google Firebase services' },
    { id: 'supabase', label: 'Supabase', icon: '⚡', desc: 'Open source Firebase alternative' },
    { id: 'airtable', label: 'Airtable', icon: '📋', desc: 'Spreadsheet-database hybrid' },
    { id: 'notion', label: 'Notion', icon: '📝', desc: 'Notion databases and pages' },
    { id: 'stripe', label: 'Stripe', icon: '💳', desc: 'Payment processing' },
    { id: 'shopify', label: 'Shopify', icon: '🛒', desc: 'E-commerce platform' },
    { id: 'google-sheets', label: 'Google Sheets', icon: '📊', desc: 'Google Spreadsheets' },
    { id: 'mysql', label: 'MySQL', icon: '🐬', desc: 'MySQL database' },
    { id: 'postgres', label: 'PostgreSQL', icon: '🐘', desc: 'PostgreSQL database' },
    { id: 'mongodb', label: 'MongoDB', icon: '🍃', desc: 'NoSQL document database' },
  ];

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <ModalCard
        title="Data Connector"
        subtitle="Connect your app to external data sources"
        onClose={onClose}
        width={640}
        maxHeight="85vh"
        footer={
          activeStep > 0 ? (
            <>
              <ModalBtn variant="secondary" onClick={() => setActiveStep(0)}>Back</ModalBtn>
              <ModalBtn variant="primary">Connect</ModalBtn>
            </>
          ) : undefined
        }
      >
        {activeStep === 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {connectors.map(c => (
              <motion.button
                key={c.id}
                onClick={() => { setConnectorType(c.id); setActiveStep(1); }}
                className="flex flex-col items-center p-4 rounded-xl border border-white/5 bg-white/3
                           hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-center"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-2xl mb-2">{c.icon}</span>
                <span className="text-xs font-medium text-white/70">{c.label}</span>
                <span className="text-[10px] text-white/30 mt-1">{c.desc}</span>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-white/3 rounded-lg mb-4">
              <span className="text-xl">{connectors.find(c => c.id === connectorType)?.icon}</span>
              <div>
                <span className="text-sm font-medium text-white/70">{connectors.find(c => c.id === connectorType)?.label}</span>
                <span className="text-[11px] text-white/30 block">{connectors.find(c => c.id === connectorType)?.desc}</span>
              </div>
            </div>

            {/* Connection form */}
            <div>
              <label className="text-xs text-white/40 block mb-1">Connection Name</label>
              <input
                type="text"
                placeholder="My API Connection"
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg
                           text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1">Base URL</label>
              <input
                type="text"
                placeholder="https://api.example.com"
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg
                           text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1">Authentication</label>
              <select className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg
                                 text-white focus:outline-none focus:border-indigo-500/50">
                <option>None</option>
                <option>API Key</option>
                <option>Bearer Token</option>
                <option>Basic Auth</option>
                <option>OAuth 2.0</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 block mb-1">Headers (JSON)</label>
              <textarea
                rows={3}
                placeholder={'{\n  "Content-Type": "application/json"\n}'}
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg
                           text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 font-mono
                           resize-none"
              />
            </div>
          </div>
        )}
      </ModalCard>
    </ModalOverlay>
  );
}
