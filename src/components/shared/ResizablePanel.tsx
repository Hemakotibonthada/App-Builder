/**
 * Resizable Panel
 * 
 * A panel container with a draggable resize handle on one edge.
 * Supports left or right edge resize with min/max constraints.
 * Shows visual feedback during drag.
 */

'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { clsx } from 'clsx';

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

interface ResizablePanelProps {
  children: React.ReactNode;
  width: number;
  minWidth?: number;
  maxWidth?: number;
  onWidthChange: (width: number) => void;
  side: 'left' | 'right';
  className?: string;
}

/* ──────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────── */

export function ResizablePanel({
  children,
  width,
  minWidth = 200,
  maxWidth = 600,
  onWidthChange,
  side,
  className,
}: ResizablePanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(width);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;
    },
    [width],
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      const newWidth = side === 'left'
        ? startWidthRef.current + delta
        : startWidthRef.current - delta;

      const clamped = Math.min(maxWidth, Math.max(minWidth, newWidth));
      onWidthChange(clamped);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, side, minWidth, maxWidth, onWidthChange]);

  return (
    <div
      className={clsx('relative flex', className)}
      style={{ width, minWidth: width }}
    >
      {/* Panel content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>

      {/* Resize handle */}
      <div
        className={clsx(
          'absolute top-0 bottom-0 z-30 flex items-center',
          side === 'left' ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2',
        )}
        style={{ width: 12, cursor: 'col-resize' }}
        onMouseDown={handleMouseDown}
      >
        {/* Visible handle line */}
        <div
          className={clsx(
            'w-[3px] h-full transition-all duration-150',
            isDragging
              ? 'bg-builder-accent/60'
              : 'bg-transparent hover:bg-builder-accent/30',
          )}
        />
        {/* Drag indicator (dots) — shown on hover */}
        <div
          className={clsx(
            'absolute top-1/2 -translate-y-1/2 flex flex-col gap-[3px] transition-opacity duration-150',
            side === 'left' ? 'right-[2px]' : 'left-[2px]',
            isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-60',
          )}
          style={{ pointerEvents: 'none' }}
        >
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="w-[3px] h-[3px] rounded-full bg-builder-text-dim/40" />
          ))}
        </div>
      </div>

      {/* Overlay during drag to prevent iframes/canvas from eating events */}
      {isDragging && (
        <div className="fixed inset-0 z-50" style={{ cursor: 'col-resize' }} />
      )}
    </div>
  );
}
