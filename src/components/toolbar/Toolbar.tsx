/**
 * Toolbar
 * 
 * Top toolbar with undo/redo, zoom controls, device preview,
 * canvas display toggles, and action buttons.
 */

'use client';

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useAppDispatch, useAppSelector } from '@/store/store';
import {
  zoomIn,
  zoomOut,
  resetZoom,
  setDevicePreset,
  deleteSelected,
  duplicateWidget,
  selectAll,
} from '@/store/canvasSlice';
import { undo, redo, selectCanUndo, selectCanRedo } from '@/store/historySlice';
import {
  togglePreviewMode,
  toggleShowGrid,
  toggleShowOutlines,
  openModal,
  ModalType,
} from '@/store/uiSlice';
import { DevicePreset } from '@/types/canvas.types';
import { IconButton } from '@/components/shared/AnimatedButton';

/* ──────────────────────────────────────────────
 * Separator
 * ────────────────────────────────────────────── */

function ToolbarSeparator() {
  return <div className="w-px h-5 bg-builder-border/40 mx-1" />;
}

/* ──────────────────────────────────────────────
 * Toolbar Component
 * ────────────────────────────────────────────── */

export function Toolbar() {
  const dispatch = useAppDispatch();
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);
  const zoom = useAppSelector((state) => state.canvas.viewport.zoom);
  const devicePreset = useAppSelector((state) => state.canvas.deviceConfig.preset);
  const selectedIds = useAppSelector((state) => state.canvas.selection.selectedIds);
  const previewMode = useAppSelector((state) => state.ui.previewMode);
  const showGrid = useAppSelector((state) => state.ui.showGrid);
  const showOutlines = useAppSelector((state) => state.ui.showOutlines);
  const projectName = useAppSelector((state) => state.project.project?.name ?? 'Untitled');
  const isDirty = useAppSelector((state) => state.project.isDirty);

  const hasSelection = selectedIds.length > 0;
  const primarySelectedId = selectedIds[0];

  return (
    <div className="h-toolbar flex items-center justify-between px-3 bg-builder-surface border-b border-builder-border/40 select-none">
      {/* ── Left: Project & History ── */}
      <div className="flex items-center gap-1">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-3">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-builder-accent to-purple-500 flex items-center justify-center shadow-glow">
            <span className="text-white text-[10px] font-black">AB</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-builder-text">{projectName}</span>
            {isDirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-builder-warning" title="Unsaved changes" />
            )}
          </div>
        </div>

        <ToolbarSeparator />

        {/* Undo / Redo */}
        <IconButton
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7v6h6M21 17a9 9 0 00-9-9 9 9 0 00-6.69 3L3 13" />
            </svg>
          }
          label="Undo"
          tooltip="Undo (Ctrl+Z)"
          disabled={!canUndo}
          onClick={() => dispatch(undo())}
          size="sm"
        />
        <IconButton
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 7v6h-6M3 17a9 9 0 019-9 9 9 0 016.69 3L21 13" />
            </svg>
          }
          label="Redo"
          tooltip="Redo (Ctrl+Shift+Z)"
          disabled={!canRedo}
          onClick={() => dispatch(redo())}
          size="sm"
        />

        <ToolbarSeparator />

        {/* Widget Actions */}
        <IconButton
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="8" y="8" width="13" height="13" rx="2" />
              <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" />
            </svg>
          }
          label="Duplicate"
          tooltip="Duplicate (Ctrl+D)"
          disabled={!hasSelection}
          onClick={() => primarySelectedId && dispatch(duplicateWidget(primarySelectedId))}
          size="sm"
        />
        <IconButton
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          }
          label="Delete"
          tooltip="Delete (Del)"
          variant="danger"
          disabled={!hasSelection}
          onClick={() => dispatch(deleteSelected())}
          size="sm"
        />
      </div>

      {/* ── Center: Device Preview ── */}
      <div className="flex items-center gap-1">
        {/* Device selector */}
        {(
          [
            { preset: DevicePreset.MobileLarge, label: 'Mobile', icon: 'M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2zM12 18h.01' },
            { preset: DevicePreset.TabletPortrait, label: 'Tablet', icon: 'M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z' },
            { preset: DevicePreset.Desktop, label: 'Desktop', icon: 'M4 5h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zM8 20h8M12 17v3' },
          ] as const
        ).map(({ preset, label, icon }) => (
          <IconButton
            key={preset}
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d={icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            label={label}
            active={devicePreset === preset}
            onClick={() => dispatch(setDevicePreset(preset))}
            size="sm"
          />
        ))}

        <ToolbarSeparator />

        {/* Zoom controls */}
        <IconButton
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
            </svg>
          }
          label="Zoom In"
          tooltip="Zoom In (Ctrl++)"
          onClick={() => dispatch(zoomIn())}
          size="sm"
        />
        <button
          className="h-7 px-2 text-xs text-builder-text-muted hover:text-builder-text bg-builder-bg/40 rounded border border-builder-border/30 font-mono transition-colors"
          onClick={() => dispatch(resetZoom())}
          title="Reset Zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <IconButton
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35M8 11h6" />
            </svg>
          }
          label="Zoom Out"
          tooltip="Zoom Out (Ctrl+-)"
          onClick={() => dispatch(zoomOut())}
          size="sm"
        />
      </div>

      {/* ── Right: Actions ── */}
      <div className="flex items-center gap-1">
        {/* Canvas toggles */}
        <IconButton
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3h18v18H3z" />
              <path d="M3 9h18M3 15h18M9 3v18M15 3v18" opacity="0.5" />
            </svg>
          }
          label="Grid"
          tooltip="Toggle Grid"
          active={showGrid}
          onClick={() => dispatch(toggleShowGrid())}
          size="sm"
        />
        <IconButton
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="4 2" />
            </svg>
          }
          label="Outlines"
          tooltip="Toggle Outlines"
          active={showOutlines}
          onClick={() => dispatch(toggleShowOutlines())}
          size="sm"
        />

        <ToolbarSeparator />

        {/* Preview */}
        <motion.button
          className={clsx(
            'h-7 px-3 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5',
            previewMode
              ? 'bg-builder-accent text-white'
              : 'bg-builder-elevated text-builder-text-muted hover:text-builder-text border border-builder-border/40',
          )}
          onClick={() => dispatch(togglePreviewMode())}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          {previewMode ? 'Exit Preview' : 'Preview'}
        </motion.button>

        {/* Build */}
        <motion.button
          className="h-7 px-4 text-xs font-semibold rounded-lg bg-gradient-to-r from-builder-accent to-purple-500 text-white shadow-md shadow-builder-accent/20 flex items-center gap-1.5"
          onClick={() => dispatch(openModal({ type: ModalType.Build }))}
          whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}
          whileTap={{ scale: 0.97 }}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          Build
        </motion.button>
      </div>
    </div>
  );
}
