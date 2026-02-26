/**
 * Canvas
 * 
 * The main canvas component that hosts the artboard, grid,
 * selection overlay, drop zones, and all rendered widgets.
 * Handles pan, zoom, and pointer interactions.
 */

'use client';

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector, selectActivePageRootIds, store } from '@/store/store';
import {
  setViewport,
  panCanvas,
  selectWidget,
  clearSelection,
  addToSelection,
  setHoveredWidget,
  setSelectionBox,
  setInteractionMode,
  addWidget,
  updateWidget,
} from '@/store/canvasSlice';
import { InteractionMode, Point2D } from '@/types/canvas.types';
import { WidgetType } from '@/types/widget.types';
import { screenToCanvas, clamp, isPointInRect } from '@/utils';
import { autoLinkWidgets } from '@/services/AutoLinker';
import { CanvasGrid } from './CanvasGrid';
import { SelectionOverlay } from './SelectionOverlay';
import { DropZone } from './DropZone';
import { CanvasLayer } from './CanvasLayer';

/* ──────────────────────────────────────────────
 * Constants
 * ────────────────────────────────────────────── */

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_SENSITIVITY = 0.001;
const PAN_SPEED = 1;

/* ──────────────────────────────────────────────
 * Canvas Component
 * ────────────────────────────────────────────── */

export function Canvas() {
  const dispatch = useAppDispatch();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point2D>({ x: 0, y: 0 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectStart, setSelectStart] = useState<Point2D>({ x: 0, y: 0 });

  const viewport = useAppSelector((state) => state.canvas.viewport);
  const widgets = useAppSelector((state) => state.canvas.widgets);
  const rootWidgetIds = useAppSelector(selectActivePageRootIds);
  const interactionMode = useAppSelector((state) => state.canvas.interactionMode);
  const isDragging = useAppSelector((state) => state.canvas.drag.isDragging);
  const canvasWidth = useAppSelector((state) => state.canvas.canvasWidth);
  const canvasHeight = useAppSelector((state) => state.canvas.canvasHeight);
  const previewMode = useAppSelector((state) => state.ui.previewMode);

  /* ── Zoom via wheel ── */
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const delta = -e.deltaY * ZOOM_SENSITIVITY;
        const newZoom = clamp(viewport.zoom * (1 + delta), MIN_ZOOM, MAX_ZOOM);

        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (!canvasRect) return;

        // Zoom toward cursor position
        const mouseX = e.clientX - canvasRect.left;
        const mouseY = e.clientY - canvasRect.top;
        const zoomFactor = newZoom / viewport.zoom;

        dispatch(
          setViewport({
            zoom: newZoom,
            x: mouseX - (mouseX - viewport.x) * zoomFactor,
            y: mouseY - (mouseY - viewport.y) * zoomFactor,
          }),
        );
      } else {
        // Pan
        dispatch(
          panCanvas({
            x: -e.deltaX * PAN_SPEED,
            y: -e.deltaY * PAN_SPEED,
          }),
        );
      }
    },
    [dispatch, viewport],
  );

  // Attach wheel listener as non-passive so preventDefault works
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  /* ── Pointer Down ── */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (previewMode) return;

      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const screenPos: Point2D = {
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top,
      };

      // Middle button or space held = pan mode
      if (e.button === 1 || interactionMode === InteractionMode.Pan) {
        setIsPanning(true);
        setPanStart(screenPos);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        return;
      }

      // Left click
      if (e.button === 0) {
        const canvasPos = screenToCanvas(screenPos, viewport);

        // Check if clicked on a widget
        let clickedWidget: string | null = null;
        for (const id of Object.keys(widgets)) {
          const w = widgets[id]!;
          const wx = w.position.x;
          const wy = w.position.y;
          const ww = w.style.width?.value ?? 100;
          const wh = w.style.height?.value ?? 40;

          if (
            isPointInRect(canvasPos, {
              x: wx,
              y: wy,
              width: ww,
              height: wh,
            })
          ) {
            clickedWidget = id;
          }
        }

        if (clickedWidget) {
          if (e.shiftKey) {
            dispatch(addToSelection(clickedWidget));
          } else {
            dispatch(selectWidget(clickedWidget));
          }
        } else {
          // Start rubber-band selection
          dispatch(clearSelection());
          setIsSelecting(true);
          setSelectStart(canvasPos);
          dispatch(
            setSelectionBox({
              x: canvasPos.x,
              y: canvasPos.y,
              width: 0,
              height: 0,
            }),
          );
        }

        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }
    },
    [dispatch, viewport, widgets, interactionMode, previewMode],
  );

  /* ── Pointer Move ── */
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const screenPos: Point2D = {
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top,
      };

      if (isPanning) {
        dispatch(
          panCanvas({
            x: screenPos.x - panStart.x,
            y: screenPos.y - panStart.y,
          }),
        );
        setPanStart(screenPos);
        return;
      }

      if (isSelecting) {
        const canvasPos = screenToCanvas(screenPos, viewport);
        dispatch(
          setSelectionBox({
            x: Math.min(selectStart.x, canvasPos.x),
            y: Math.min(selectStart.y, canvasPos.y),
            width: Math.abs(canvasPos.x - selectStart.x),
            height: Math.abs(canvasPos.y - selectStart.y),
          }),
        );
        return;
      }

      // Hover detection
      if (!isDragging && !previewMode) {
        const canvasPos = screenToCanvas(screenPos, viewport);
        let hoveredWidget: string | null = null;

        for (const id of Object.keys(widgets)) {
          const w = widgets[id]!;
          const wx = w.position.x;
          const wy = w.position.y;
          const ww = w.style.width?.value ?? 100;
          const wh = w.style.height?.value ?? 40;

          if (isPointInRect(canvasPos, { x: wx, y: wy, width: ww, height: wh })) {
            hoveredWidget = id;
          }
        }

        dispatch(setHoveredWidget(hoveredWidget));
      }
    },
    [
      dispatch,
      isPanning,
      isSelecting,
      panStart,
      selectStart,
      viewport,
      widgets,
      isDragging,
      previewMode,
    ],
  );

  /* ── Pointer Up ── */
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (isPanning) {
        setIsPanning(false);
      }

      if (isSelecting) {
        setIsSelecting(false);
        // Select widgets within selection box – handled by selection overlay
        dispatch(setSelectionBox(null));
      }

      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    },
    [dispatch, isPanning, isSelecting],
  );

  /* ── Keyboard Shortcuts ── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (previewMode) return;

      // Space = pan mode
      if (e.code === 'Space' && !e.repeat) {
        dispatch(setInteractionMode(InteractionMode.Pan));
      }

      // Delete / Backspace = delete selected
      if (e.code === 'Delete' || e.code === 'Backspace') {
        // Handled by toolbar
      }

      // Escape = deselect
      if (e.code === 'Escape') {
        dispatch(clearSelection());
      }

      // Ctrl+A = select all
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyA') {
        e.preventDefault();
        // Handled by toolbar
      }

      // Zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && e.code === 'Equal') {
        e.preventDefault();
        dispatch(
          setViewport({
            zoom: clamp(viewport.zoom * 1.2, MIN_ZOOM, MAX_ZOOM),
          }),
        );
      }
      if ((e.ctrlKey || e.metaKey) && e.code === 'Minus') {
        e.preventDefault();
        dispatch(
          setViewport({
            zoom: clamp(viewport.zoom / 1.2, MIN_ZOOM, MAX_ZOOM),
          }),
        );
      }
      if ((e.ctrlKey || e.metaKey) && e.code === 'Digit0') {
        e.preventDefault();
        dispatch(setViewport({ zoom: 1, x: 0, y: 0 }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        dispatch(setInteractionMode(InteractionMode.Select));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [dispatch, viewport, previewMode]);

  /* ── Canvas cursor ── */
  const cursor = isPanning
    ? 'grabbing'
    : interactionMode === InteractionMode.Pan
      ? 'grab'
      : isDragging
        ? 'copy'
        : 'default';

  /* ── Drag & Drop from palette ── */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      // Check for widget type drop
      const widgetType = e.dataTransfer.getData('application/widget-type') as WidgetType;
      if (widgetType) {
        const screenPos: Point2D = {
          x: e.clientX - canvasRect.left,
          y: e.clientY - canvasRect.top,
        };
        const canvasPos = screenToCanvas(screenPos, viewport);
        dispatch(addWidget({ type: widgetType, position: canvasPos }));
        return;
      }

      // Check for template drop
      const templateData = e.dataTransfer.getData('application/template');
      if (templateData) {
        try {
          const template = JSON.parse(templateData);
          const screenPos: Point2D = {
            x: e.clientX - canvasRect.left,
            y: e.clientY - canvasRect.top,
          };
          const canvasPos = screenToCanvas(screenPos, viewport);
          if (Array.isArray(template.widgets)) {
            // Auto-link template widgets to existing pages
            const existingPaths = (store.getState() as any).canvas.pages.map((p: any) => p.path);
            const { widgets: linkedWidgets } = autoLinkWidgets(template.widgets, existingPaths);
            for (const w of linkedWidgets) {
              dispatch(addWidget({
                type: w.type as WidgetType,
                position: { x: canvasPos.x + (w.x ?? 0), y: canvasPos.y + (w.y ?? 0) },
                props: w.props ?? {},
                style: w.style ?? {},
                name: w.name,
              }));
            }
          }
        } catch { /* invalid JSON */ }
      }
    },
    [dispatch, viewport],
  );

  return (
    <div
      ref={canvasRef}
      className="relative flex-1 overflow-hidden bg-builder-bg"
      style={{ cursor }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Background Grid */}
      <CanvasGrid />

      {/* Artboard */}
      <div
        className="absolute origin-top-left"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          width: canvasWidth,
          height: canvasHeight,
        }}
      >
        {/* Artboard background */}
        <div
          className="absolute inset-0 bg-white/[0.03] border border-builder-border/30 rounded-sm shadow-glass"
          style={{ width: canvasWidth, height: canvasHeight }}
        />

        {/* Rendered Widgets */}
        <CanvasLayer
          widgetIds={rootWidgetIds as string[]}
          widgets={widgets}
        />
      </div>

      {/* Drop Zone Indicator */}
      <DropZone />

      {/* Selection Overlay */}
      {!previewMode && <SelectionOverlay />}

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-builder-surface/80 backdrop-blur-glass text-builder-text-muted text-xs px-2 py-1 rounded-lg border border-builder-border/40 font-mono">
        {Math.round(viewport.zoom * 100)}%
      </div>
    </div>
  );
}
