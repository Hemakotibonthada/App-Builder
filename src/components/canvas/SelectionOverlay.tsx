/**
 * Selection Overlay
 * 
 * Renders selection rectangles, resize handles, and hover
 * indicators over selected widgets on the canvas.
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { startResize, updateResize, endResize } from '@/store/canvasSlice';
import { ResizeHandle } from '@/types/canvas.types';

/* ──────────────────────────────────────────────
 * Resize Handle Component
 * ────────────────────────────────────────────── */

interface HandleProps {
  position: ResizeHandle;
  x: number;
  y: number;
  cursor: string;
  widgetId: string;
  onResizeStart: (handle: ResizeHandle) => void;
}

function ResizeHandleComponent({ position, x, y, cursor, onResizeStart }: HandleProps) {
  return (
    <motion.div
      className="absolute w-2.5 h-2.5 bg-white border-2 border-builder-accent rounded-sm shadow-md"
      style={{
        left: x - 5,
        top: y - 5,
        cursor,
        zIndex: 1000,
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      onPointerDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onResizeStart(position);
      }}
      whileHover={{ scale: 1.4 }}
    />
  );
}

/* ──────────────────────────────────────────────
 * Spacing Indicator
 * ────────────────────────────────────────────── */

interface SpacingIndicatorProps {
  direction: 'horizontal' | 'vertical';
  x: number;
  y: number;
  length: number;
  label: string;
}

function SpacingIndicator({ direction, x, y, length, label }: SpacingIndicatorProps) {
  if (length <= 0) return null;

  return (
    <div
      className="absolute flex items-center justify-center pointer-events-none"
      style={{
        left: x,
        top: y,
        width: direction === 'horizontal' ? length : 1,
        height: direction === 'vertical' ? length : 1,
      }}
    >
      {/* Line */}
      <div
        className={`absolute bg-builder-accent/60 ${
          direction === 'horizontal' ? 'h-px w-full' : 'w-px h-full'
        }`}
      />
      {/* End caps */}
      <div
        className={`absolute bg-builder-accent/60 ${
          direction === 'horizontal'
            ? 'w-px h-2 left-0 top-1/2 -translate-y-1/2'
            : 'h-px w-2 top-0 left-1/2 -translate-x-1/2'
        }`}
      />
      <div
        className={`absolute bg-builder-accent/60 ${
          direction === 'horizontal'
            ? 'w-px h-2 right-0 top-1/2 -translate-y-1/2'
            : 'h-px w-2 bottom-0 left-1/2 -translate-x-1/2'
        }`}
      />
      {/* Label */}
      <span className="bg-builder-accent text-white text-[9px] px-1 rounded font-mono absolute">
        {label}
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Selection Overlay Component
 * ────────────────────────────────────────────── */

export function SelectionOverlay() {
  const dispatch = useAppDispatch();
  const selectedIds = useAppSelector((state) => state.canvas.selection.selectedIds);
  const hoveredId = useAppSelector((state) => state.canvas.selection.hoveredId);
  const widgets = useAppSelector((state) => state.canvas.widgets);
  const viewport = useAppSelector((state) => state.canvas.viewport);
  const showSpacing = useAppSelector((state) => state.ui.showSpacing);
  const showOutlines = useAppSelector((state) => state.ui.showOutlines);

  const handleResizeStart = useCallback(
    (widgetId: string, handle: ResizeHandle) => {
      const widget = widgets[widgetId];
      if (!widget) return;

      const width = widget.style.width?.value ?? 100;
      const height = widget.style.height?.value ?? 40;

      dispatch(
        startResize({
          widgetId,
          handle,
          startRect: {
            x: widget.position.x,
            y: widget.position.y,
            width,
            height,
          },
        }),
      );
    },
    [dispatch, widgets],
  );

  const resizeHandles = useMemo(() => {
    return [
      { position: ResizeHandle.TopLeft, xFactor: 0, yFactor: 0, cursor: 'nwse-resize' },
      { position: ResizeHandle.TopCenter, xFactor: 0.5, yFactor: 0, cursor: 'ns-resize' },
      { position: ResizeHandle.TopRight, xFactor: 1, yFactor: 0, cursor: 'nesw-resize' },
      { position: ResizeHandle.MiddleLeft, xFactor: 0, yFactor: 0.5, cursor: 'ew-resize' },
      { position: ResizeHandle.MiddleRight, xFactor: 1, yFactor: 0.5, cursor: 'ew-resize' },
      { position: ResizeHandle.BottomLeft, xFactor: 0, yFactor: 1, cursor: 'nesw-resize' },
      { position: ResizeHandle.BottomCenter, xFactor: 0.5, yFactor: 1, cursor: 'ns-resize' },
      { position: ResizeHandle.BottomRight, xFactor: 1, yFactor: 1, cursor: 'nwse-resize' },
    ];
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 999 }}
    >
      <AnimatePresence>
        {/* Hover highlight */}
        {hoveredId &&
          !selectedIds.includes(hoveredId) &&
          widgets[hoveredId] && (
            <motion.div
              key={`hover-${hoveredId}`}
              className="absolute border border-builder-accent/40 rounded-sm pointer-events-none"
              style={{
                left: (widgets[hoveredId]!.position.x * viewport.zoom) + viewport.x,
                top: (widgets[hoveredId]!.position.y * viewport.zoom) + viewport.y,
                width: (widgets[hoveredId]!.style.width?.value ?? 100) * viewport.zoom,
                height: (widgets[hoveredId]!.style.height?.value ?? 40) * viewport.zoom,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              {/* Widget name badge */}
              <div className="absolute -top-5 left-0 bg-builder-accent/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                {widgets[hoveredId]!.name}
              </div>
            </motion.div>
          )}

        {/* Selected widgets */}
        {selectedIds.map((id) => {
          const widget = widgets[id];
          if (!widget) return null;

          const w = (widget.style.width?.value ?? 100) * viewport.zoom;
          const h = (widget.style.height?.value ?? 40) * viewport.zoom;
          const x = (widget.position.x * viewport.zoom) + viewport.x;
          const y = (widget.position.y * viewport.zoom) + viewport.y;

          return (
            <motion.div
              key={`sel-${id}`}
              className="absolute pointer-events-none"
              style={{ left: x, top: y, width: w, height: h }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Selection border */}
              <div className="absolute inset-0 border-2 border-builder-accent rounded-sm" />

              {/* Widget info badge */}
              <div className="absolute -top-6 left-0 flex items-center gap-1.5">
                <span className="bg-builder-accent text-white text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                  {widget.name}
                </span>
                <span className="bg-builder-bg/80 text-builder-text-muted text-[9px] px-1 py-0.5 rounded font-mono">
                  {Math.round(w / viewport.zoom)} × {Math.round(h / viewport.zoom)}
                </span>
              </div>

              {/* Resize handles */}
              {selectedIds.length === 1 && !widget.locked && (
                <>
                  {resizeHandles.map((handle) => (
                    <ResizeHandleComponent
                      key={handle.position}
                      position={handle.position}
                      x={w * handle.xFactor}
                      y={h * handle.yFactor}
                      cursor={handle.cursor}
                      widgetId={id}
                      onResizeStart={(h) => handleResizeStart(id, h)}
                    />
                  ))}
                </>
              )}

              {/* Spacing indicators */}
              {showSpacing && widget.style.padding && (
                <>
                  <SpacingIndicator
                    direction="vertical"
                    x={w / 2}
                    y={0}
                    length={(widget.style.padding.top ?? 0) * viewport.zoom}
                    label={`${widget.style.padding.top}px`}
                  />
                  <SpacingIndicator
                    direction="vertical"
                    x={w / 2}
                    y={h - (widget.style.padding.bottom ?? 0) * viewport.zoom}
                    length={(widget.style.padding.bottom ?? 0) * viewport.zoom}
                    label={`${widget.style.padding.bottom}px`}
                  />
                </>
              )}
            </motion.div>
          );
        })}

        {/* Widget outlines (when enabled) */}
        {showOutlines &&
          Object.values(widgets).map((widget) => {
            if (!widget || selectedIds.includes(widget.id) || widget.id === hoveredId) {
              return null;
            }
            return (
              <div
                key={`outline-${widget.id}`}
                className="absolute border border-builder-border/30 pointer-events-none"
                style={{
                  left: (widget.position.x * viewport.zoom) + viewport.x,
                  top: (widget.position.y * viewport.zoom) + viewport.y,
                  width: (widget.style.width?.value ?? 100) * viewport.zoom,
                  height: (widget.style.height?.value ?? 40) * viewport.zoom,
                }}
              />
            );
          })}
      </AnimatePresence>
    </div>
  );
}
