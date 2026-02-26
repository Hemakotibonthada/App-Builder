/**
 * Component Panel (Left Sidebar)
 * 
 * Segregated into two collapsible top-level sections:
 *  1. Default Widgets – built-in, organized by category
 *  2. User Created   – custom widgets (empty initially)
 * 
 * Clicking a dropdown arrow expands/collapses each section.
 * Supports search across both pools.
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useAppDispatch } from '@/store/store';
import { addWidget } from '@/store/canvasSlice';
import { WidgetCategory, WidgetType } from '@/types/widget.types';
import {
  getDefaultWidgetsByCategory,
  getUserWidgetsByCategory,
  searchWidgets,
  CATEGORY_LABELS,
  DEFAULT_WIDGETS,
  USER_CREATED_WIDGETS,
} from '@/components/widgets/WidgetRegistry';
import type { ExtendedWidgetDefinition } from '@/components/widgets/WidgetRegistry';

/* ──────────────────────────────────────────────
 * SVG Icon helper
 * ────────────────────────────────────────────── */

function WidgetIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    Square: <rect x="4" y="4" width="16" height="16" rx="2" />,
    Columns: <><rect x="3" y="3" width="8" height="18" rx="1" /><rect x="13" y="3" width="8" height="18" rx="1" /></>,
    Rows: <><rect x="3" y="3" width="18" height="8" rx="1" /><rect x="3" y="13" width="18" height="8" rx="1" /></>,
    Layers: <><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></>,
    LayoutGrid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    ScrollText: <><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M9 6h6M9 10h6M9 14h4" /></>,
    CreditCard: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></>,
    ChevronDown: <path d="M6 9l6 6 6-6" />,
    PanelTop: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /></>,
    Minus: <path d="M5 12h14" />,
    Space: <><path d="M5 17H4a2 2 0 01-2-2V5" /><path d="M22 17h-1a2 2 0 01-2-2V5" /><path d="M2 17h20" /></>,
    Type: <><path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" /></>,
    Heading: <><path d="M6 4v16" /><path d="M18 4v16" /><path d="M6 12h12" /></>,
    AlignLeft: <><path d="M21 6H3" /><path d="M15 12H3" /><path d="M17 18H3" /></>,
    Tag: <><path d="M12.586 2.586A2 2 0 0011.172 2H4a2 2 0 00-2 2v7.172a2 2 0 00.586 1.414l8.704 8.704a2 2 0 002.83 0l5.172-5.172a2 2 0 000-2.83L12.586 2.586z" /><circle cx="7.5" cy="7.5" r="1.5" /></>,
    Hash: <><path d="M4 9h16" /><path d="M4 15h16" /><path d="M10 3L8 21" /><path d="M16 3l-2 18" /></>,
    Circle: <circle cx="12" cy="12" r="10" />,
    User: <><path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    Star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    MessageCircle: <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />,
    Loader: <><path d="M21 12a9 9 0 11-6.219-8.56" /></>,
    TextCursorInput: <><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M12 10v4" /></>,
    AlignJustify: <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>,
    CheckSquare: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></>,
    CircleDot: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></>,
    ToggleLeft: <><rect x="1" y="5" width="22" height="14" rx="7" /><circle cx="8" cy="12" r="3" /></>,
    ChevronsUpDown: <><path d="M7 15l5 5 5-5" /><path d="M7 9l5-5 5 5" /></>,
    SlidersHorizontal: <><path d="M21 4h-7" /><path d="M10 4H3" /><path d="M21 12h-3" /><path d="M14 12H3" /><path d="M21 20h-7" /><path d="M10 20H3" /><circle cx="12" cy="4" r="2" /><circle cx="16" cy="12" r="2" /><circle cx="12" cy="20" r="2" /></>,
    Calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></>,
    Clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
    Upload: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>,
    Palette: <><circle cx="13.5" cy="6.5" r="1.5" /><circle cx="17.5" cy="10.5" r="1.5" /><circle cx="8.5" cy="7.5" r="1.5" /><circle cx="6.5" cy="12.5" r="1.5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></>,
    MousePointerClick: <><path d="M9 9l7.5 2.5L13 14l-1.5 5L9 9z" /><path d="M14.5 14.5l3 3" /></>,
    SquareMousePointer: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M10 10l4 1.5-1.5 2L10 10z" /></>,
    Link: <><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></>,
    PanelLeft: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /></>,
    ChevronRight: <path d="M9 18l6-6-6-6" />,
    ArrowLeftRight: <><path d="M8 3L4 7l4 4" /><path d="M4 7h16" /><path d="M16 21l4-4-4-4" /><path d="M20 17H4" /></>,
    PanelBottom: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 15h18" /></>,
    PanelRightOpen: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M15 3v18" /><path d="M10 9l-3 3 3 3" /></>,
    Plus: <><path d="M5 12h14" /><path d="M12 5v14" /></>,
    Image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>,
    Video: <><rect x="2" y="6" width="15" height="12" rx="2" /><path d="M22 8.5l-5 3 5 3v-6z" /></>,
    Music: <><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></>,
    GalleryHorizontal: <><rect x="1" y="5" width="22" height="14" rx="2" /><path d="M8 5v14" /><path d="M16 5v14" /></>,
    MapPin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></>,
    Table: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /><path d="M15 3v18" /></>,
    List: <><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><circle cx="3" cy="6" r="1" /><circle cx="3" cy="12" r="1" /><circle cx="3" cy="18" r="1" /></>,
    BarChart3: <><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></>,
    FileText: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></>,
    AlertTriangle: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    Bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></>,
    Maximize2: <><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></>,
    MessageSquare: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
    BoxSelect: <><rect x="4" y="4" width="16" height="16" rx="2" strokeDasharray="4 2" /></>,
    Loader2: <path d="M21 12a9 9 0 11-6.219-8.56" />,
  };

  return (
    <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {icons[name] ?? <rect x="4" y="4" width="16" height="16" rx="2" />}
    </svg>
  );
}

/* ──────────────────────────────────────────────
 * Widget Item (each tile in the grid)
 * ────────────────────────────────────────────── */

interface WidgetItemProps {
  widget: ExtendedWidgetDefinition;
  onAdd: () => void;
}

function WidgetItem({ widget, onAdd }: WidgetItemProps) {
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('application/widget-type', widget.type);
    e.dataTransfer.effectAllowed = 'copy';
  }, [widget.type]);

  return (
    <motion.button
      className={clsx(
        'flex flex-col items-center gap-1 p-2 rounded-lg text-center',
        'border border-transparent',
        'hover:bg-glass-white-10 hover:border-builder-border/30',
        'active:bg-glass-white-20 active:scale-95',
        'focus:outline-none focus-visible:ring-1 focus-visible:ring-builder-accent',
        'transition-colors cursor-grab active:cursor-grabbing',
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onAdd}
      draggable
      onDragStart={handleDragStart as any}
      title={widget.description}
    >
      <div className="w-7 h-7 flex items-center justify-center rounded-md bg-builder-elevated/60 text-builder-text-muted">
        <WidgetIcon name={widget.icon} />
      </div>
      <span className="text-[9px] text-builder-text-muted font-medium leading-tight truncate w-full">
        {widget.displayName}
      </span>
    </motion.button>
  );
}

/* ──────────────────────────────────────────────
 * Category Accordion (inside Default / User)
 * ────────────────────────────────────────────── */

interface CategoryAccordionProps {
  category: WidgetCategory;
  widgets: ExtendedWidgetDefinition[];
  isExpanded: boolean;
  onToggle: () => void;
  onAddWidget: (type: WidgetType) => void;
}

function CategoryAccordion({ category, widgets, isExpanded, onToggle, onAddWidget }: CategoryAccordionProps) {
  return (
    <div className="border-b border-builder-border/20 last:border-b-0">
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-builder-text-dim hover:text-builder-text-muted hover:bg-glass-white-10/50 transition-colors"
        onClick={onToggle}
      >
        <span className="flex items-center gap-1.5">
          {CATEGORY_LABELS[category]}
          <span className="text-[8px] font-normal text-builder-text-dim/60 normal-case tracking-normal">
            ({widgets.length})
          </span>
        </span>
        <motion.svg
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-3 gap-1 px-2 pb-2">
              {widgets.map((w) => (
                <WidgetItem key={w.type} widget={w} onAdd={() => onAddWidget(w.type)} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Top-Level Section (Default / User Created)
 * ────────────────────────────────────────────── */

interface SectionHeaderProps {
  title: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  accentColor?: string;
}

function SectionHeader({ title, count, isOpen, onToggle, icon, accentColor = '#6366f1' }: SectionHeaderProps) {
  return (
    <button
      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-builder-text hover:bg-glass-white-10 transition-colors border-b border-builder-border/30"
      onClick={onToggle}
    >
      {/* Dropdown arrow */}
      <motion.svg
        className="w-3.5 h-3.5 text-builder-text-muted flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
      </motion.svg>

      {/* Icon */}
      <div
        className="w-5 h-5 flex items-center justify-center rounded flex-shrink-0"
        style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
      >
        {icon}
      </div>

      {/* Title & count */}
      <span className="flex-1 text-left">{title}</span>
      <span
        className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
      >
        {count}
      </span>
    </button>
  );
}

/* ──────────────────────────────────────────────
 * Component Panel
 * ────────────────────────────────────────────── */

export function ComponentPanel() {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');

  // Section open states
  const [defaultOpen, setDefaultOpen] = useState(true);
  const [userOpen, setUserOpen] = useState(true);

  // Category expand states
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['default-layout', 'default-display', 'default-navigation', 'default-input']),
  );

  const defaultByCategory = useMemo(() => getDefaultWidgetsByCategory(), []);
  const userByCategory = useMemo(() => getUserWidgetsByCategory(), []);
  const searchResults = useMemo(() => searchWidgets(searchQuery), [searchQuery]);

  const toggleCategory = useCallback((key: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const handleAddWidget = useCallback(
    (type: WidgetType) => {
      dispatch(addWidget({ type, position: { x: 100, y: 100 } }));
    },
    [dispatch],
  );

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="p-2.5 border-b border-builder-border/30">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-builder-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search widgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-7 pl-8 pr-7 text-[11px] bg-builder-bg/60 border border-builder-border/40 rounded-lg text-builder-text placeholder:text-builder-text-dim focus:outline-none focus:border-builder-accent/50 focus:ring-1 focus:ring-builder-accent/20 transition-colors"
          />
          {searchQuery && (
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-builder-text-dim hover:text-builder-text" onClick={() => setSearchQuery('')}>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-builder-border/30">
        {isSearching ? (
          /* ── Search Results ── */
          <div className="p-2">
            <div className="text-[10px] text-builder-text-dim px-1 pb-2">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
            </div>
            {searchResults.length === 0 ? (
              <div className="py-8 text-center text-builder-text-dim text-xs">No widgets found</div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {searchResults.map((w) => (
                  <WidgetItem key={w.type} widget={w} onAdd={() => handleAddWidget(w.type)} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ═══════════ DEFAULT WIDGETS ═══════════ */}
            <SectionHeader
              title="Default"
              count={DEFAULT_WIDGETS.length}
              isOpen={defaultOpen}
              onToggle={() => setDefaultOpen(!defaultOpen)}
              accentColor="#6366f1"
              icon={
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              }
            />
            <AnimatePresence initial={false}>
              {defaultOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  {Array.from(defaultByCategory.entries()).map(([category, widgets]) => (
                    <CategoryAccordion
                      key={`default-${category}`}
                      category={category}
                      widgets={widgets}
                      isExpanded={expandedCategories.has(`default-${category}`)}
                      onToggle={() => toggleCategory(`default-${category}`)}
                      onAddWidget={handleAddWidget}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══════════ USER CREATED ═══════════ */}
            <SectionHeader
              title="User Created"
              count={USER_CREATED_WIDGETS.length}
              isOpen={userOpen}
              onToggle={() => setUserOpen(!userOpen)}
              accentColor="#22c55e"
              icon={
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              }
            />
            <AnimatePresence initial={false}>
              {userOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  {USER_CREATED_WIDGETS.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                      <div className="w-10 h-10 rounded-xl bg-builder-elevated/40 flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-builder-text-dim" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="4 2" />
                          <path d="M12 8v8M8 12h8" />
                        </svg>
                      </div>
                      <p className="text-[11px] text-builder-text-dim font-medium">No custom widgets yet</p>
                      <p className="text-[9px] text-builder-text-dim/60 mt-0.5">Create reusable components from your designs</p>
                    </div>
                  ) : (
                    Array.from(userByCategory.entries()).map(([category, widgets]) => (
                      <CategoryAccordion
                        key={`user-${category}`}
                        category={category}
                        widgets={widgets}
                        isExpanded={expandedCategories.has(`user-${category}`)}
                        onToggle={() => toggleCategory(`user-${category}`)}
                        onAddWidget={handleAddWidget}
                      />
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-builder-border/30 text-[9px] text-builder-text-dim flex justify-between">
        <span>{DEFAULT_WIDGETS.length} default</span>
        <span>{USER_CREATED_WIDGETS.length} custom</span>
      </div>
    </div>
  );
}
