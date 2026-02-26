/**
 * Canvas Grid
 * 
 * Renders the background grid pattern on the canvas.
 * Supports configurable grid size, subdivisions, and opacity.
 * Uses SVG pattern for GPU-accelerated infinite tiling.
 */

'use client';

import React, { useMemo } from 'react';
import { useAppSelector } from '@/store/store';

/* ──────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────── */

export function CanvasGrid() {
  const grid = useAppSelector((state) => state.canvas.grid);
  const viewport = useAppSelector((state) => state.canvas.viewport);
  const showGrid = useAppSelector((state) => state.ui.showGrid);

  const gridPattern = useMemo(() => {
    if (!grid.enabled || !showGrid) return null;

    const scaledSize = grid.size * viewport.zoom;
    const subSize = scaledSize / grid.subdivisions;
    const patternId = `grid-pattern-${grid.size}`;
    const subPatternId = `grid-sub-pattern-${grid.size}`;

    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ zIndex: 0 }}
      >
        <defs>
          {/* Sub-grid pattern */}
          <pattern
            id={subPatternId}
            width={subSize}
            height={subSize}
            patternUnits="userSpaceOnUse"
            x={viewport.x % subSize}
            y={viewport.y % subSize}
          >
            <path
              d={`M ${subSize} 0 L 0 0 0 ${subSize}`}
              fill="none"
              stroke={grid.color}
              strokeWidth="0.5"
              opacity={grid.opacity * 0.3}
            />
          </pattern>

          {/* Main grid pattern */}
          <pattern
            id={patternId}
            width={scaledSize}
            height={scaledSize}
            patternUnits="userSpaceOnUse"
            x={viewport.x % scaledSize}
            y={viewport.y % scaledSize}
          >
            {/* Sub-grid fill */}
            <rect
              width={scaledSize}
              height={scaledSize}
              fill={`url(#${subPatternId})`}
            />
            {/* Main grid lines */}
            <path
              d={`M ${scaledSize} 0 L 0 0 0 ${scaledSize}`}
              fill="none"
              stroke={grid.color}
              strokeWidth="1"
              opacity={grid.opacity}
            />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill={`url(#${patternId})`} />

        {/* Origin crosshair */}
        <g
          opacity={grid.opacity * 1.5}
          transform={`translate(${viewport.x}, ${viewport.y})`}
        >
          <line
            x1="-20"
            y1="0"
            x2="20"
            y2="0"
            stroke={grid.color}
            strokeWidth="1.5"
          />
          <line
            x1="0"
            y1="-20"
            x2="0"
            y2="20"
            stroke={grid.color}
            strokeWidth="1.5"
          />
        </g>
      </svg>
    );
  }, [grid, viewport, showGrid]);

  return <>{gridPattern}</>;
}
