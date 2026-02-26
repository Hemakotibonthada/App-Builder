/**
 * Builder Page
 * 
 * The main builder interface with:
 * - Top toolbar
 * - Left sidebar (component panel / layers)
 * - Center canvas
 * - Right sidebar (properties / styles)
 * - Build modal
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { addPage } from '@/store/canvasSlice';
import { createProject } from '@/store/projectSlice';
import { SidebarTab, RightPanelTab, setLeftPanelTab, setRightPanelTab, setLeftPanelWidth, setRightPanelWidth } from '@/store/uiSlice';
import { Toolbar } from '@/components/toolbar/Toolbar';
import { Canvas } from '@/components/canvas/Canvas';
import { ComponentPanel } from '@/components/panels/ComponentPanel';
import { LayerPanel } from '@/components/panels/LayerPanel';
import { PropertyPanel } from '@/components/panels/PropertyPanel';
import { StylePanel } from '@/components/panels/StylePanel';
import { TemplatePanel } from '@/components/panels/TemplatePanel';
import { PagesPanel } from '@/components/panels/PagesPanel';
import { BuildModal } from '@/components/modals/BuildModal';
import { ShortcutsModal } from '@/components/modals/ShortcutsModal';
import { ResizablePanel } from '@/components/shared/ResizablePanel';
import { NotificationToasts } from '@/components/shared/NotificationToasts';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

/* ──────────────────────────────────────────────
 * Sidebar Tab Button
 * ────────────────────────────────────────────── */

interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

function TabButton({ label, icon, active, onClick }: TabButtonProps) {
  return (
    <motion.button
      className={clsx(
        'flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0',
        active
          ? 'bg-builder-accent/10 text-builder-accent'
          : 'text-builder-text-muted hover:text-builder-text hover:bg-glass-white-10',
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon}
      {label}
    </motion.button>
  );
}

/* ──────────────────────────────────────────────
 * Builder Page Component
 * ────────────────────────────────────────────── */

export default function BuilderPage() {
  const dispatch = useAppDispatch();
  const leftPanelOpen = useAppSelector((state) => state.ui.leftPanelOpen);
  const leftPanelWidth = useAppSelector((state) => state.ui.leftPanelWidth);
  const leftPanelTab = useAppSelector((state) => state.ui.leftPanelTab);
  const rightPanelOpen = useAppSelector((state) => state.ui.rightPanelOpen);
  const rightPanelWidth = useAppSelector((state) => state.ui.rightPanelWidth);
  const rightPanelTab = useAppSelector((state) => state.ui.rightPanelTab);
  const project = useAppSelector((state) => state.project.project);
  const pages = useAppSelector((state) => state.canvas.pages);

  // Keyboard shortcuts
  useKeyboardShortcuts();

  // Initialize project if not already created
  useEffect(() => {
    if (!project) {
      dispatch(createProject({ name: 'Untitled Project', description: '' }));
    }
    if (pages.length === 0) {
      dispatch(addPage({ name: 'Home', path: '/' }));
    }
  }, [dispatch, project, pages.length]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-builder-bg">
      {/* Top Toolbar */}
      <Toolbar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left Sidebar (Resizable) ── */}
        <AnimatePresence initial={false}>
          {leftPanelOpen && (
            <ResizablePanel
              width={leftPanelWidth}
              minWidth={220}
              maxWidth={500}
              side="left"
              onWidthChange={(w) => dispatch(setLeftPanelWidth(w))}
              className="bg-builder-surface border-r border-builder-border/40">
              {/* Tab Switcher */}
              <div className="flex items-center gap-1 px-2 py-1.5 border-b border-builder-border/30 overflow-x-auto scrollbar-thin scrollbar-thumb-builder-border/30 flex-shrink-0">
                <TabButton
                  label="Components"
                  icon={
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  }
                  active={leftPanelTab === SidebarTab.Components}
                  onClick={() => dispatch(setLeftPanelTab(SidebarTab.Components))}
                />
                <TabButton
                  label="Templates"
                  icon={
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M9 21V9" />
                    </svg>
                  }
                  active={leftPanelTab === SidebarTab.Templates}
                  onClick={() => dispatch(setLeftPanelTab(SidebarTab.Templates))}
                />
                <TabButton
                  label="Layers"
                  icon={
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  }
                  active={leftPanelTab === SidebarTab.Layers}
                  onClick={() => dispatch(setLeftPanelTab(SidebarTab.Layers))}
                />
                <TabButton
                  label="Pages"
                  icon={
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  }
                  active={leftPanelTab === SidebarTab.Pages}
                  onClick={() => dispatch(setLeftPanelTab(SidebarTab.Pages))}
                />
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  {leftPanelTab === SidebarTab.Components && (
                    <motion.div
                      key="components"
                      className="h-full"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ComponentPanel />
                    </motion.div>
                  )}
                  {leftPanelTab === SidebarTab.Templates && (
                    <motion.div
                      key="templates"
                      className="h-full"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15 }}
                    >
                      <TemplatePanel />
                    </motion.div>
                  )}
                  {leftPanelTab === SidebarTab.Layers && (
                    <motion.div
                      key="layers"
                      className="h-full"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15 }}
                    >
                      <LayerPanel />
                    </motion.div>
                  )}
                  {leftPanelTab === SidebarTab.Pages && (
                    <motion.div
                      key="pages"
                      className="h-full flex flex-col"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.15 }}
                    >
                      <PagesPanel />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ResizablePanel>
          )}
        </AnimatePresence>

        {/* ── Canvas ── */}
        <Canvas />

        {/* ── Right Sidebar (Resizable) ── */}
        <AnimatePresence initial={false}>
          {rightPanelOpen && (
            <ResizablePanel
              width={rightPanelWidth}
              minWidth={220}
              maxWidth={500}
              side="right"
              onWidthChange={(w) => dispatch(setRightPanelWidth(w))}
              className="bg-builder-surface border-l border-builder-border/40">
              {/* Tab Switcher */}
              <div className="flex items-center gap-1 px-2 py-1.5 border-b border-builder-border/30">
                <TabButton
                  label="Properties"
                  icon={
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 3v1m0 16v1m-8-9H3m18 0h-1M5.6 5.6l.7.7m12.1-.7l-.7.7M5.6 18.4l.7-.7m12.1.7l-.7-.7" />
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                  }
                  active={rightPanelTab === RightPanelTab.Properties}
                  onClick={() => dispatch(setRightPanelTab(RightPanelTab.Properties))}
                />
                <TabButton
                  label="Style"
                  icon={
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
                    </svg>
                  }
                  active={rightPanelTab === RightPanelTab.Style}
                  onClick={() => dispatch(setRightPanelTab(RightPanelTab.Style))}
                />
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  {rightPanelTab === RightPanelTab.Properties && (
                    <motion.div
                      key="properties"
                      className="h-full"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                    >
                      <PropertyPanel />
                    </motion.div>
                  )}
                  {rightPanelTab === RightPanelTab.Style && (
                    <motion.div
                      key="style"
                      className="h-full"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                    >
                      <StylePanel />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ResizablePanel>
          )}
        </AnimatePresence>
      </div>

      {/* Build Modal */}
      <BuildModal />
      <ShortcutsModal />

      {/* Toast Notifications */}
      <NotificationToasts />
    </div>
  );
}
