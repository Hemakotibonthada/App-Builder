/**
 * Canvas Interaction Hooks
 * 
 * Specialized hooks for canvas operations:
 * 1. useCanvasViewport - pan, zoom, fit-to-screen
 * 2. useCanvasDragDrop - widget drag & drop on canvas
 * 3. useCanvasSelection - selection management
 * 4. useCanvasGestures - pinch, pan, rotate gestures
 * 5. useCanvasHistory - undo/redo integration
 * 6. useCanvasSnapping - snap to grid/guides
 * 7. useCanvasRuler - ruler and measurements
 * 8. useCanvasContextMenu - right-click menu
 * 9. useCanvasMultiSelect - rubber band selection
 * 10. useCanvasClipboard - copy/paste widgets
 */

'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';

/* ──────────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────────── */

export interface ViewportState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  minScale: number;
  maxScale: number;
}

export interface DragState {
  isDragging: boolean;
  dragId: string | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  offsetX: number;
  offsetY: number;
}

export interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
  children?: ContextMenuItem[];
  action?: () => void;
}

export interface SnapResult {
  x: number;
  y: number;
  snappedX: boolean;
  snappedY: boolean;
  guideX: number | null;
  guideY: number | null;
}

export interface RulerMark {
  position: number;
  label: string;
  isMajor: boolean;
}

/* ──────────────────────────────────────────────────────────────
 * 1. useCanvasViewport
 * ────────────────────────────────────────────────────────────── */

export function useCanvasViewport(
  canvasRef: React.RefObject<HTMLElement | null>,
  options: {
    initialScale?: number;
    minScale?: number;
    maxScale?: number;
    zoomStep?: number;
    enableWheelZoom?: boolean;
    enablePan?: boolean;
  } = {},
) {
  const {
    initialScale = 1,
    minScale = 0.1,
    maxScale = 5,
    zoomStep = 0.1,
    enableWheelZoom = true,
    enablePan = true,
  } = options;

  const [viewport, setViewport] = useState<ViewportState>({
    x: 0,
    y: 0,
    scale: initialScale,
    rotation: 0,
    minScale,
    maxScale,
  });

  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  // Wheel zoom
  useEffect(() => {
    if (!enableWheelZoom) return;
    const el = canvasRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();

        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const direction = e.deltaY < 0 ? 1 : -1;
        const factor = 1 + direction * zoomStep;

        setViewport(v => {
          const newScale = Math.max(minScale, Math.min(maxScale, v.scale * factor));
          const scaleChange = newScale / v.scale;

          return {
            ...v,
            scale: newScale,
            x: mouseX - (mouseX - v.x) * scaleChange,
            y: mouseY - (mouseY - v.y) * scaleChange,
          };
        });
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [canvasRef, enableWheelZoom, minScale, maxScale, zoomStep]);

  // Middle-button pan
  useEffect(() => {
    if (!enablePan) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        e.preventDefault();
        isPanning.current = true;
        panStart.current = { x: e.clientX - viewport.x, y: e.clientY - viewport.y };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning.current) return;
      setViewport(v => ({
        ...v,
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      }));
    };

    const handleMouseUp = () => {
      isPanning.current = false;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enablePan, viewport.x, viewport.y]);

  const zoomIn = useCallback(() => {
    setViewport(v => ({
      ...v,
      scale: Math.min(maxScale, v.scale * (1 + zoomStep)),
    }));
  }, [maxScale, zoomStep]);

  const zoomOut = useCallback(() => {
    setViewport(v => ({
      ...v,
      scale: Math.max(minScale, v.scale * (1 - zoomStep)),
    }));
  }, [minScale, zoomStep]);

  const zoomTo = useCallback((scale: number) => {
    setViewport(v => ({
      ...v,
      scale: Math.max(minScale, Math.min(maxScale, scale)),
    }));
  }, [minScale, maxScale]);

  const fitToScreen = useCallback((contentWidth: number, contentHeight: number) => {
    const el = canvasRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const scaleX = (rect.width - 40) / contentWidth;
    const scaleY = (rect.height - 40) / contentHeight;
    const scale = Math.min(scaleX, scaleY, 1);

    setViewport(v => ({
      ...v,
      scale,
      x: (rect.width - contentWidth * scale) / 2,
      y: (rect.height - contentHeight * scale) / 2,
    }));
  }, [canvasRef]);

  const resetViewport = useCallback(() => {
    setViewport({
      x: 0,
      y: 0,
      scale: initialScale,
      rotation: 0,
      minScale,
      maxScale,
    });
  }, [initialScale, minScale, maxScale]);

  const panTo = useCallback((x: number, y: number) => {
    setViewport(v => ({ ...v, x, y }));
  }, []);

  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const el = canvasRef.current;
      if (!el) return { x: 0, y: 0 };

      const rect = el.getBoundingClientRect();
      return {
        x: (screenX - rect.left - viewport.x) / viewport.scale,
        y: (screenY - rect.top - viewport.y) / viewport.scale,
      };
    },
    [canvasRef, viewport],
  );

  const canvasToScreen = useCallback(
    (canvasX: number, canvasY: number) => {
      const el = canvasRef.current;
      if (!el) return { x: 0, y: 0 };

      const rect = el.getBoundingClientRect();
      return {
        x: canvasX * viewport.scale + viewport.x + rect.left,
        y: canvasY * viewport.scale + viewport.y + rect.top,
      };
    },
    [canvasRef, viewport],
  );

  return {
    viewport,
    setViewport,
    zoomIn,
    zoomOut,
    zoomTo,
    fitToScreen,
    resetViewport,
    panTo,
    screenToCanvas,
    canvasToScreen,
    isPanning: isPanning.current,
  };
}

/* ──────────────────────────────────────────────────────────────
 * 2. useCanvasDragDrop
 * ────────────────────────────────────────────────────────────── */

export function useCanvasDragDrop(
  viewport: ViewportState,
  options: {
    onDragStart?: (id: string, x: number, y: number) => void;
    onDragMove?: (id: string, x: number, y: number) => void;
    onDragEnd?: (id: string, x: number, y: number) => void;
    snapToGrid?: boolean;
    gridSize?: number;
  } = {},
) {
  const { onDragStart, onDragMove, onDragEnd, snapToGrid = false, gridSize = 8 } = options;

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    offsetX: 0,
    offsetY: 0,
  });

  const startDrag = useCallback(
    (id: string, mouseX: number, mouseY: number, widgetX: number, widgetY: number) => {
      const offsetX = mouseX / viewport.scale - widgetX;
      const offsetY = mouseY / viewport.scale - widgetY;

      setDragState({
        isDragging: true,
        dragId: id,
        startX: widgetX,
        startY: widgetY,
        currentX: widgetX,
        currentY: widgetY,
        offsetX,
        offsetY,
      });

      onDragStart?.(id, widgetX, widgetY);
    },
    [viewport.scale, onDragStart],
  );

  const updateDrag = useCallback(
    (mouseX: number, mouseY: number) => {
      if (!dragState.isDragging || !dragState.dragId) return;

      let x = mouseX / viewport.scale - dragState.offsetX;
      let y = mouseY / viewport.scale - dragState.offsetY;

      if (snapToGrid) {
        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;
      }

      setDragState(s => ({ ...s, currentX: x, currentY: y }));
      onDragMove?.(dragState.dragId, x, y);
    },
    [dragState, viewport.scale, snapToGrid, gridSize, onDragMove],
  );

  const endDrag = useCallback(() => {
    if (dragState.isDragging && dragState.dragId) {
      onDragEnd?.(dragState.dragId, dragState.currentX, dragState.currentY);
    }

    setDragState({
      isDragging: false,
      dragId: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      offsetX: 0,
      offsetY: 0,
    });
  }, [dragState, onDragEnd]);

  const cancelDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      dragId: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      offsetX: 0,
      offsetY: 0,
    });
  }, []);

  return {
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
  };
}

/* ──────────────────────────────────────────────────────────────
 * 3. useCanvasSelection
 * ────────────────────────────────────────────────────────────── */

export function useCanvasSelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const select = useCallback((id: string) => {
    setSelectedIds([id]);
  }, []);

  const addToSelection = useCallback((id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const removeFromSelection = useCallback((id: string) => {
    setSelectedIds(prev => prev.filter(x => x !== id));
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds],
  );

  return {
    selectedIds,
    hoveredId,
    select,
    addToSelection,
    removeFromSelection,
    toggleSelection,
    clearSelection,
    selectAll,
    isSelected,
    setHoveredId,
    selectionCount: selectedIds.length,
    hasSelection: selectedIds.length > 0,
  };
}

/* ──────────────────────────────────────────────────────────────
 * 4. useCanvasGestures
 * ────────────────────────────────────────────────────────────── */

export function useCanvasGestures(
  elementRef: React.RefObject<HTMLElement | null>,
  callbacks: {
    onPinch?: (scale: number, center: { x: number; y: number }) => void;
    onPan?: (deltaX: number, deltaY: number) => void;
    onRotate?: (angle: number) => void;
    onTap?: (x: number, y: number) => void;
    onDoubleTap?: (x: number, y: number) => void;
    onLongPress?: (x: number, y: number) => void;
  } = {},
) {
  const touchesRef = useRef<Touch[]>([]);
  const lastPinchDistRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout>(null);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const getDistance = (t1: Touch, t2: Touch) =>
      Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

    const getCenter = (t1: Touch, t2: Touch) => ({
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2,
    });

    const handleTouchStart = (e: TouchEvent) => {
      touchesRef.current = Array.from(e.touches);

      if (e.touches.length === 1) {
        // Long press detection
        const touch = e.touches[0];
        longPressTimerRef.current = setTimeout(() => {
          callbacks.onLongPress?.(touch.clientX, touch.clientY);
        }, 500);
      }

      if (e.touches.length === 2) {
        lastPinchDistRef.current = getDistance(e.touches[0], e.touches[1]);
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);

      if (e.touches.length === 1 && callbacks.onPan) {
        const prev = touchesRef.current[0];
        const curr = e.touches[0];
        if (prev) {
          callbacks.onPan(curr.clientX - prev.clientX, curr.clientY - prev.clientY);
        }
      }

      if (e.touches.length === 2 && callbacks.onPinch) {
        const dist = getDistance(e.touches[0], e.touches[1]);
        const scale = dist / lastPinchDistRef.current;
        const center = getCenter(e.touches[0], e.touches[1]);
        callbacks.onPinch(scale, center);
        lastPinchDistRef.current = dist;
      }

      touchesRef.current = Array.from(e.touches);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);

      if (e.changedTouches.length === 1 && touchesRef.current.length === 1) {
        const touch = e.changedTouches[0];
        const prev = touchesRef.current[0];
        const distance = Math.hypot(
          touch.clientX - prev.clientX,
          touch.clientY - prev.clientY,
        );

        if (distance < 10) {
          tapCountRef.current++;

          if (tapCountRef.current === 2) {
            callbacks.onDoubleTap?.(touch.clientX, touch.clientY);
            tapCountRef.current = 0;
            if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
          } else {
            tapTimerRef.current = setTimeout(() => {
              if (tapCountRef.current === 1) {
                callbacks.onTap?.(touch.clientX, touch.clientY);
              }
              tapCountRef.current = 0;
            }, 300);
          }
        }
      }

      touchesRef.current = Array.from(e.touches);
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, callbacks]);
}

/* ──────────────────────────────────────────────────────────────
 * 5. useCanvasHistory
 * ────────────────────────────────────────────────────────────── */

export function useCanvasHistory<T>(maxHistory: number = 100) {
  const [history, setHistory] = useState<T[]>([]);
  const [future, setFuture] = useState<T[]>([]);
  const [present, setPresent] = useState<T | null>(null);

  const pushState = useCallback(
    (state: T) => {
      if (present !== null) {
        setHistory(h => [...h, present].slice(-maxHistory));
      }
      setPresent(state);
      setFuture([]);
    },
    [present, maxHistory],
  );

  const undo = useCallback(() => {
    if (history.length === 0) return null;

    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    if (present !== null) {
      setFuture(f => [present, ...f]);
    }
    setPresent(prev);
    return prev;
  }, [history, present]);

  const redo = useCallback(() => {
    if (future.length === 0) return null;

    const next = future[0];
    setFuture(f => f.slice(1));
    if (present !== null) {
      setHistory(h => [...h, present]);
    }
    setPresent(next);
    return next;
  }, [future, present]);

  const clear = useCallback(() => {
    setHistory([]);
    setFuture([]);
    setPresent(null);
  }, []);

  return {
    present,
    pushState,
    undo,
    redo,
    clear,
    canUndo: history.length > 0,
    canRedo: future.length > 0,
    historyLength: history.length,
    futureLength: future.length,
  };
}

/* ──────────────────────────────────────────────────────────────
 * 6. useCanvasSnapping
 * ────────────────────────────────────────────────────────────── */

export function useCanvasSnapping(options: {
  gridSize?: number;
  snapThreshold?: number;
  guides?: number[];
  enabled?: boolean;
} = {}) {
  const { gridSize = 8, snapThreshold = 4, guides = [], enabled = true } = options;

  const snap = useCallback(
    (x: number, y: number, widgetRects?: { id: string; x: number; y: number; width: number; height: number }[]): SnapResult => {
      if (!enabled) return { x, y, snappedX: false, snappedY: false, guideX: null, guideY: null };

      let snappedX = x;
      let snappedY = y;
      let isSnappedX = false;
      let isSnappedY = false;
      let guideX: number | null = null;
      let guideY: number | null = null;

      // Grid snapping
      const gridSnapX = Math.round(x / gridSize) * gridSize;
      const gridSnapY = Math.round(y / gridSize) * gridSize;

      if (Math.abs(x - gridSnapX) < snapThreshold) {
        snappedX = gridSnapX;
        isSnappedX = true;
      }
      if (Math.abs(y - gridSnapY) < snapThreshold) {
        snappedY = gridSnapY;
        isSnappedY = true;
      }

      // Guide snapping (takes priority over grid)
      for (const guide of guides) {
        if (Math.abs(x - guide) < snapThreshold) {
          snappedX = guide;
          isSnappedX = true;
          guideX = guide;
        }
        if (Math.abs(y - guide) < snapThreshold) {
          snappedY = guide;
          isSnappedY = true;
          guideY = guide;
        }
      }

      // Widget edge snapping
      if (widgetRects) {
        for (const rect of widgetRects) {
          // Snap to left edge
          if (Math.abs(x - rect.x) < snapThreshold) {
            snappedX = rect.x;
            isSnappedX = true;
            guideX = rect.x;
          }
          // Snap to right edge
          if (Math.abs(x - (rect.x + rect.width)) < snapThreshold) {
            snappedX = rect.x + rect.width;
            isSnappedX = true;
            guideX = rect.x + rect.width;
          }
          // Snap to center X
          if (Math.abs(x - (rect.x + rect.width / 2)) < snapThreshold) {
            snappedX = rect.x + rect.width / 2;
            isSnappedX = true;
            guideX = rect.x + rect.width / 2;
          }
          // Snap to top edge
          if (Math.abs(y - rect.y) < snapThreshold) {
            snappedY = rect.y;
            isSnappedY = true;
            guideY = rect.y;
          }
          // Snap to bottom edge
          if (Math.abs(y - (rect.y + rect.height)) < snapThreshold) {
            snappedY = rect.y + rect.height;
            isSnappedY = true;
            guideY = rect.y + rect.height;
          }
          // Snap to center Y
          if (Math.abs(y - (rect.y + rect.height / 2)) < snapThreshold) {
            snappedY = rect.y + rect.height / 2;
            isSnappedY = true;
            guideY = rect.y + rect.height / 2;
          }
        }
      }

      return {
        x: snappedX,
        y: snappedY,
        snappedX: isSnappedX,
        snappedY: isSnappedY,
        guideX,
        guideY,
      };
    },
    [gridSize, snapThreshold, guides, enabled],
  );

  return { snap };
}

/* ──────────────────────────────────────────────────────────────
 * 7. useCanvasRuler
 * ────────────────────────────────────────────────────────────── */

export function useCanvasRuler(viewport: ViewportState, length: number) {
  const marks = useMemo((): RulerMark[] => {
    const result: RulerMark[] = [];

    // Determine appropriate tick spacing based on zoom
    let majorSpacing = 100;
    let minorDivisions = 10;

    if (viewport.scale < 0.25) { majorSpacing = 500; minorDivisions = 5; }
    else if (viewport.scale < 0.5) { majorSpacing = 200; minorDivisions = 4; }
    else if (viewport.scale > 2) { majorSpacing = 50; minorDivisions = 5; }
    else if (viewport.scale > 4) { majorSpacing = 20; minorDivisions = 4; }

    const minorSpacing = majorSpacing / minorDivisions;
    const startPos = Math.floor(-viewport.x / viewport.scale / minorSpacing) * minorSpacing;
    const endPos = startPos + length / viewport.scale;

    for (let pos = startPos; pos <= endPos; pos += minorSpacing) {
      const isMajor = pos % majorSpacing === 0;
      result.push({
        position: pos * viewport.scale + viewport.x,
        label: isMajor ? `${Math.round(pos)}` : '',
        isMajor,
      });
    }

    return result;
  }, [viewport, length]);

  return { marks };
}

/* ──────────────────────────────────────────────────────────────
 * 8. useCanvasContextMenu
 * ────────────────────────────────────────────────────────────── */

export function useCanvasContextMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [items, setItems] = useState<ContextMenuItem[]>([]);
  const [targetId, setTargetId] = useState<string | null>(null);

  const show = useCallback(
    (x: number, y: number, menuItems: ContextMenuItem[], widgetId?: string) => {
      setPosition({ x, y });
      setItems(menuItems);
      setTargetId(widgetId ?? null);
      setIsOpen(true);
    },
    [],
  );

  const hide = useCallback(() => {
    setIsOpen(false);
    setItems([]);
    setTargetId(null);
  }, []);

  // Auto-hide on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = () => hide();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, hide]);

  return {
    isOpen,
    position,
    items,
    targetId,
    show,
    hide,
  };
}

/* ──────────────────────────────────────────────────────────────
 * 9. useCanvasMultiSelect
 * ────────────────────────────────────────────────────────────── */

export function useCanvasMultiSelect() {
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const startSelection = useCallback((x: number, y: number) => {
    setStartPoint({ x, y });
    setSelectionBox({ x, y, width: 0, height: 0 });
    setIsSelecting(true);
  }, []);

  const updateSelection = useCallback(
    (x: number, y: number) => {
      if (!startPoint || !isSelecting) return;

      setSelectionBox({
        x: Math.min(startPoint.x, x),
        y: Math.min(startPoint.y, y),
        width: Math.abs(x - startPoint.x),
        height: Math.abs(y - startPoint.y),
      });
    },
    [startPoint, isSelecting],
  );

  const endSelection = useCallback((): SelectionBox | null => {
    const box = selectionBox;
    setSelectionBox(null);
    setStartPoint(null);
    setIsSelecting(false);
    return box;
  }, [selectionBox]);

  const cancelSelection = useCallback(() => {
    setSelectionBox(null);
    setStartPoint(null);
    setIsSelecting(false);
  }, []);

  return {
    selectionBox,
    isSelecting,
    startSelection,
    updateSelection,
    endSelection,
    cancelSelection,
  };
}

/* ──────────────────────────────────────────────────────────────
 * 10. useCanvasClipboard
 * ────────────────────────────────────────────────────────────── */

export function useCanvasClipboard<T>() {
  const [clipboard, setClipboard] = useState<{
    items: T[];
    operation: 'copy' | 'cut';
  } | null>(null);

  const copy = useCallback((items: T[]) => {
    setClipboard({ items, operation: 'copy' });
  }, []);

  const cut = useCallback((items: T[]) => {
    setClipboard({ items, operation: 'cut' });
  }, []);

  const paste = useCallback((): { items: T[]; operation: 'copy' | 'cut' } | null => {
    return clipboard;
  }, [clipboard]);

  const hasClipboard = clipboard !== null && clipboard.items.length > 0;

  const clear = useCallback(() => {
    setClipboard(null);
  }, []);

  return {
    clipboard,
    copy,
    cut,
    paste,
    clear,
    hasClipboard,
  };
}
