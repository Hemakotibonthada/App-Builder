/**
 * Drop Zone
 * 
 * Visual indicator shown when dragging widgets,
 * highlighting valid drop targets with animated feedback.
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/store/store';

/* ──────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────── */

export function DropZone() {
  const isDragging = useAppSelector((state) => state.canvas.drag.isDragging);
  const dragTarget = useAppSelector((state) => state.canvas.drag.dragTarget);
  const viewport = useAppSelector((state) => state.canvas.viewport);
  const activeGuides = useAppSelector((state) => state.canvas.activeGuides);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 998 }}>
      <AnimatePresence>
        {/* Drop target highlight */}
        {isDragging && dragTarget && dragTarget.isValid && (
          <motion.div
            key="drop-target"
            className="absolute"
            style={{
              left: dragTarget.dropZone.x * viewport.zoom + viewport.x,
              top: dragTarget.dropZone.y * viewport.zoom + viewport.y,
              width: dragTarget.dropZone.width * viewport.zoom,
              height: dragTarget.dropZone.height * viewport.zoom,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Container highlight */}
            {dragTarget.position === 'inside' && (
              <div className="absolute inset-0 bg-builder-accent/5 border-2 border-dashed border-builder-accent/40 rounded-lg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    className="text-builder-accent text-xs font-medium bg-builder-bg/80 px-2 py-1 rounded"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    Drop here
                  </motion.span>
                </div>
              </div>
            )}

            {/* Insert line indicator */}
            {(dragTarget.position === 'before' || dragTarget.position === 'after') && (
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-builder-accent"
                style={{
                  top: dragTarget.position === 'before' ? 0 : '100%',
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                {/* Arrow endpoints */}
                <div className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-builder-accent" />
                <div className="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full bg-builder-accent" />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Invalid drop indicator */}
        {isDragging && dragTarget && !dragTarget.isValid && (
          <motion.div
            key="invalid-drop"
            className="absolute pointer-events-none"
            style={{
              left: dragTarget.dropZone.x * viewport.zoom + viewport.x,
              top: dragTarget.dropZone.y * viewport.zoom + viewport.y,
              width: dragTarget.dropZone.width * viewport.zoom,
              height: dragTarget.dropZone.height * viewport.zoom,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-builder-error/5 border-2 border-dashed border-builder-error/30 rounded-lg" />
          </motion.div>
        )}

        {/* Snap guides */}
        {isDragging &&
          activeGuides.map((guide) => (
            <motion.div
              key={guide.id}
              className="absolute"
              style={
                guide.orientation === 'vertical'
                  ? {
                      left: guide.position * viewport.zoom + viewport.x,
                      top: 0,
                      width: 1,
                      height: '100%',
                    }
                  : {
                      left: 0,
                      top: guide.position * viewport.zoom + viewport.y,
                      width: '100%',
                      height: 1,
                    }
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <div
                className={`h-full w-full ${
                  guide.type === 'center'
                    ? 'bg-builder-info/60'
                    : guide.type === 'spacing'
                      ? 'bg-builder-success/60'
                      : 'bg-builder-accent/50'
                }`}
                style={{
                  backgroundImage:
                    guide.type !== 'center'
                      ? guide.orientation === 'vertical'
                        ? 'repeating-linear-gradient(0deg, transparent, transparent 3px, currentColor 3px, currentColor 6px)'
                        : 'repeating-linear-gradient(90deg, transparent, transparent 3px, currentColor 3px, currentColor 6px)'
                      : undefined,
                }}
              />

              {/* Guide label */}
              {guide.label && (
                <span
                  className={`absolute text-[9px] font-mono px-1 rounded ${
                    guide.type === 'center'
                      ? 'bg-builder-info text-white'
                      : 'bg-builder-accent text-white'
                  }`}
                  style={
                    guide.orientation === 'vertical'
                      ? { top: 8, left: 4 }
                      : { left: 8, top: -4 }
                  }
                >
                  {guide.label}
                </span>
              )}
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}
