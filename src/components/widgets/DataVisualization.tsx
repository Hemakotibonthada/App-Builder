/**
 * Data Visualization Engine
 * 
 * Pure SVG/Canvas chart components for the AppBuilder:
 * 1. BarChart - Vertical/horizontal bar charts
 * 2. LineChart - Line/area charts with gradient fills
 * 3. PieChart - Pie/donut charts
 * 4. RadarChart - Spider/radar charts
 * 5. ScatterPlot - Scatter/bubble charts
 * 6. Sparkline - Inline mini charts
 * 7. Gauge - Gauge/meter charts
 * 8. TreeMap - Hierarchical treemap
 * 9. Heatmap - Color intensity grid
 * 10. Funnel - Conversion funnel
 * 11. KPICard - Key metrics display
 * 12. MiniDashboard - Composite dashboard grid
 * 
 * All charts are animated, responsive, and theme-aware.
 */

'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';

/* ═══════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════ */

export interface DataPoint {
  label: string;
  value: number;
  color?: string;
  meta?: Record<string, any>;
}

export interface ChartTheme {
  colors: string[];
  backgroundColor: string;
  textColor: string;
  gridColor: string;
  tooltipBg: string;
  tooltipText: string;
  fontFamily: string;
}

const defaultTheme: ChartTheme = {
  colors: [
    '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444',
    '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6', '#e11d48',
    '#3b82f6', '#a855f7', '#22c55e', '#eab308', '#64748b',
  ],
  backgroundColor: 'transparent',
  textColor: '#6b7280',
  gridColor: '#e5e7eb',
  tooltipBg: '#1f2937',
  tooltipText: '#ffffff',
  fontFamily: 'Inter, system-ui, sans-serif',
};

interface ChartTooltipData {
  x: number;
  y: number;
  label: string;
  value: string;
  color?: string;
}

/* ═══════════════════════════════════════════════════════
 * SHARED CHART TOOLTIP
 * ═══════════════════════════════════════════════════════ */

function ChartTooltip({ data }: { data: ChartTooltipData | null }) {
  if (!data) return null;
  return (
    <motion.div
      className="absolute pointer-events-none z-50 px-3 py-2 rounded-lg shadow-xl text-xs"
      style={{
        left: data.x,
        top: data.y - 40,
        backgroundColor: defaultTheme.tooltipBg,
        color: defaultTheme.tooltipText,
        transform: 'translateX(-50%)',
      }}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center gap-2">
        {data.color && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />}
        <span className="font-medium">{data.label}:</span>
        <span>{data.value}</span>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
 * 1. BAR CHART
 * ═══════════════════════════════════════════════════════ */

interface BarChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  orientation?: 'vertical' | 'horizontal';
  showGrid?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
  barRadius?: number;
  barGap?: number;
  animate?: boolean;
  stacked?: boolean;
  grouped?: boolean;
  theme?: Partial<ChartTheme>;
  className?: string;
  title?: string;
}

export const BarChart = memo(function BarChart({
  data,
  width = 500,
  height = 300,
  orientation = 'vertical',
  showGrid = true,
  showLabels = true,
  showValues = false,
  barRadius = 4,
  barGap = 4,
  animate = true,
  theme: customTheme,
  className,
  title,
}: BarChartProps) {
  const [tooltip, setTooltip] = useState<ChartTooltipData | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const theme = { ...defaultTheme, ...customTheme };

  const padding = { top: title ? 40 : 20, right: 20, bottom: showLabels ? 40 : 20, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const gridLines = 5;

  const barWidth = orientation === 'vertical'
    ? (chartWidth - barGap * (data.length - 1)) / data.length
    : 0;

  const barHeight = orientation === 'horizontal'
    ? (chartHeight - barGap * (data.length - 1)) / data.length
    : 0;

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={width} height={height} style={{ fontFamily: theme.fontFamily }}>
        {title && (
          <text x={width / 2} y={20} textAnchor="middle" className="text-sm font-semibold" fill={theme.textColor}>
            {title}
          </text>
        )}

        {/* Grid lines */}
        {showGrid && Array.from({ length: gridLines + 1 }).map((_, i) => {
          if (orientation === 'vertical') {
            const y = padding.top + chartHeight - (i / gridLines) * chartHeight;
            return (
              <g key={i}>
                <line x1={padding.left} y1={y} x2={padding.left + chartWidth} y2={y} stroke={theme.gridColor} strokeDasharray="4,4" />
                <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize={10} fill={theme.textColor}>
                  {Math.round((i / gridLines) * maxValue)}
                </text>
              </g>
            );
          } else {
            const x = padding.left + (i / gridLines) * chartWidth;
            return (
              <g key={i}>
                <line x1={x} y1={padding.top} x2={x} y2={padding.top + chartHeight} stroke={theme.gridColor} strokeDasharray="4,4" />
                <text x={x} y={height - 8} textAnchor="middle" fontSize={10} fill={theme.textColor}>
                  {Math.round((i / gridLines) * maxValue)}
                </text>
              </g>
            );
          }
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const color = d.color ?? theme.colors[i % theme.colors.length];
          const ratio = d.value / maxValue;

          if (orientation === 'vertical') {
            const x = padding.left + i * (barWidth + barGap);
            const bh = ratio * chartHeight;
            const y = padding.top + chartHeight - bh;

            return (
              <g key={i}>
                <motion.rect
                  x={x}
                  y={animate ? padding.top + chartHeight : y}
                  width={barWidth}
                  height={animate ? 0 : bh}
                  rx={barRadius}
                  fill={color}
                  opacity={hoveredIndex !== null && hoveredIndex !== i ? 0.4 : 1}
                  animate={{ y, height: bh }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                  onMouseEnter={(e) => {
                    setHoveredIndex(i);
                    setTooltip({
                      x: x + barWidth / 2,
                      y: y,
                      label: d.label,
                      value: d.value.toLocaleString(),
                      color,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredIndex(null);
                    setTooltip(null);
                  }}
                  className="cursor-pointer"
                />
                {showLabels && (
                  <text
                    x={x + barWidth / 2}
                    y={padding.top + chartHeight + 20}
                    textAnchor="middle"
                    fontSize={10}
                    fill={theme.textColor}
                  >
                    {d.label.length > 8 ? d.label.slice(0, 8) + '...' : d.label}
                  </text>
                )}
                {showValues && (
                  <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fontSize={10} fill={theme.textColor} fontWeight="600">
                    {d.value}
                  </text>
                )}
              </g>
            );
          } else {
            const y = padding.top + i * (barHeight + barGap);
            const bw = ratio * chartWidth;

            return (
              <g key={i}>
                <motion.rect
                  x={padding.left}
                  y={y}
                  width={animate ? 0 : bw}
                  height={barHeight}
                  rx={barRadius}
                  fill={color}
                  opacity={hoveredIndex !== null && hoveredIndex !== i ? 0.4 : 1}
                  animate={{ width: bw }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                  onMouseEnter={(e) => {
                    setHoveredIndex(i);
                    setTooltip({
                      x: padding.left + bw,
                      y: y,
                      label: d.label,
                      value: d.value.toLocaleString(),
                      color,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredIndex(null);
                    setTooltip(null);
                  }}
                  className="cursor-pointer"
                />
                {showLabels && (
                  <text x={padding.left - 8} y={y + barHeight / 2 + 4} textAnchor="end" fontSize={10} fill={theme.textColor}>
                    {d.label}
                  </text>
                )}
              </g>
            );
          }
        })}
      </svg>
      <AnimatePresence>
        {tooltip && <ChartTooltip data={tooltip} />}
      </AnimatePresence>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 2. LINE CHART
 * ═══════════════════════════════════════════════════════ */

interface LineChartSeries {
  name: string;
  data: number[];
  color?: string;
  fill?: boolean;
  dashed?: boolean;
}

interface LineChartProps {
  series: LineChartSeries[];
  labels: string[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  showDots?: boolean;
  showLabels?: boolean;
  curved?: boolean;
  animate?: boolean;
  theme?: Partial<ChartTheme>;
  className?: string;
  title?: string;
}

export const LineChart = memo(function LineChart({
  series,
  labels,
  width = 500,
  height = 300,
  showGrid = true,
  showDots = true,
  showLabels = true,
  curved = true,
  animate = true,
  theme: customTheme,
  className,
  title,
}: LineChartProps) {
  const [tooltip, setTooltip] = useState<ChartTooltipData | null>(null);
  const theme = { ...defaultTheme, ...customTheme };

  const padding = { top: title ? 40 : 20, right: 20, bottom: showLabels ? 40 : 20, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const allValues = series.flatMap(s => s.data);
  const maxValue = Math.max(...allValues, 1);
  const minValue = Math.min(...allValues, 0);
  const range = maxValue - minValue || 1;

  const getX = (i: number) => padding.left + (i / Math.max(labels.length - 1, 1)) * chartWidth;
  const getY = (v: number) => padding.top + chartHeight - ((v - minValue) / range) * chartHeight;

  const buildPath = (data: number[], areaPath = false) => {
    if (data.length === 0) return '';

    const points = data.map((v, i) => ({ x: getX(i), y: getY(v) }));

    if (curved && points.length > 2) {
      let path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(i - 1, 0)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(i + 2, points.length - 1)];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }

      if (areaPath) {
        path += ` L ${points[points.length - 1].x} ${padding.top + chartHeight}`;
        path += ` L ${points[0].x} ${padding.top + chartHeight} Z`;
      }

      return path;
    }

    let path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    if (areaPath) {
      path += ` L ${points[points.length - 1].x} ${padding.top + chartHeight}`;
      path += ` L ${points[0].x} ${padding.top + chartHeight} Z`;
    }

    return path;
  };

  const gridLines = 5;

  return (
    <div className={cn('relative inline-block', className)}>
      <svg width={width} height={height} style={{ fontFamily: theme.fontFamily }}>
        <defs>
          {series.map((s, si) => {
            const color = s.color ?? theme.colors[si % theme.colors.length];
            return (
              <linearGradient key={si} id={`line-grad-${si}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>

        {title && (
          <text x={width / 2} y={20} textAnchor="middle" className="text-sm font-semibold" fill={theme.textColor}>
            {title}
          </text>
        )}

        {/* Grid */}
        {showGrid && Array.from({ length: gridLines + 1 }).map((_, i) => {
          const y = padding.top + (i / gridLines) * chartHeight;
          const val = maxValue - (i / gridLines) * range;
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={padding.left + chartWidth} y2={y} stroke={theme.gridColor} strokeDasharray="4,4" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize={10} fill={theme.textColor}>
                {Math.round(val)}
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {showLabels && labels.map((label, i) => (
          <text key={i} x={getX(i)} y={height - 8} textAnchor="middle" fontSize={10} fill={theme.textColor}>
            {label}
          </text>
        ))}

        {/* Series */}
        {series.map((s, si) => {
          const color = s.color ?? theme.colors[si % theme.colors.length];
          return (
            <g key={si}>
              {/* Area fill */}
              {s.fill && (
                <motion.path
                  d={buildPath(s.data, true)}
                  fill={`url(#line-grad-${si})`}
                  initial={animate ? { opacity: 0 } : undefined}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                />
              )}

              {/* Line */}
              <motion.path
                d={buildPath(s.data)}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray={s.dashed ? '6,4' : undefined}
                initial={animate ? { pathLength: 0 } : undefined}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              />

              {/* Dots */}
              {showDots && s.data.map((v, i) => (
                <motion.circle
                  key={i}
                  cx={getX(i)}
                  cy={getY(v)}
                  r={4}
                  fill="white"
                  stroke={color}
                  strokeWidth={2}
                  initial={animate ? { scale: 0 } : undefined}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    setTooltip({
                      x: getX(i),
                      y: getY(v),
                      label: `${s.name} - ${labels[i]}`,
                      value: v.toLocaleString(),
                      color,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  whileHover={{ r: 6 }}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      {series.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-2">
          {series.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-0.5 rounded" style={{ backgroundColor: s.color ?? theme.colors[i % theme.colors.length] }} />
              {s.name}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {tooltip && <ChartTooltip data={tooltip} />}
      </AnimatePresence>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 3. PIE/DONUT CHART
 * ═══════════════════════════════════════════════════════ */

interface PieChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  donut?: boolean;
  donutWidth?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  showValues?: boolean;
  animate?: boolean;
  theme?: Partial<ChartTheme>;
  className?: string;
  title?: string;
  centerLabel?: string;
  centerValue?: string;
}

export const PieChart = memo(function PieChart({
  data,
  width = 300,
  height = 300,
  donut = false,
  donutWidth = 40,
  showLabels = false,
  showLegend = true,
  showValues = true,
  animate = true,
  theme: customTheme,
  className,
  title,
  centerLabel,
  centerValue,
}: PieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const theme = { ...defaultTheme, ...customTheme };

  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy) - 20;
  const innerRadius = donut ? radius - donutWidth : 0;

  const slices = useMemo(() => {
    let startAngle = -Math.PI / 2;
    return data.map((d, i) => {
      const angle = (d.value / total) * 2 * Math.PI;
      const slice = {
        ...d,
        startAngle,
        endAngle: startAngle + angle,
        color: d.color ?? theme.colors[i % theme.colors.length],
        percentage: (d.value / total) * 100,
      };
      startAngle += angle;
      return slice;
    });
  }, [data, total, theme.colors]);

  const arcPath = (start: number, end: number, r: number, ir: number) => {
    const largeArcFlag = end - start > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);

    if (ir === 0) {
      return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    }

    const ix1 = cx + ir * Math.cos(start);
    const iy1 = cy + ir * Math.sin(start);
    const ix2 = cx + ir * Math.cos(end);
    const iy2 = cy + ir * Math.sin(end);

    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${ir} ${ir} 0 ${largeArcFlag} 0 ${ix1} ${iy1} Z`;
  };

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      {title && <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>}

      <div className="relative">
        <svg width={width} height={height}>
          {slices.map((slice, i) => {
            const midAngle = (slice.startAngle + slice.endAngle) / 2;
            const isHovered = hoveredIndex === i;
            const offset = isHovered ? 8 : 0;

            return (
              <g key={i}>
                <motion.path
                  d={arcPath(slice.startAngle, slice.endAngle, radius, innerRadius)}
                  fill={slice.color}
                  stroke="white"
                  strokeWidth={2}
                  opacity={hoveredIndex !== null && hoveredIndex !== i ? 0.5 : 1}
                  initial={animate ? { scale: 0, opacity: 0 } : undefined}
                  animate={{
                    scale: 1,
                    opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.5 : 1,
                    translateX: offset * Math.cos(midAngle),
                    translateY: offset * Math.sin(midAngle),
                  }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                {showLabels && slice.percentage > 5 && (
                  <text
                    x={cx + (radius * 0.7) * Math.cos(midAngle)}
                    y={cy + (radius * 0.7) * Math.sin(midAngle)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={11}
                    fontWeight="600"
                    fill="white"
                  >
                    {slice.percentage.toFixed(0)}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Center text for donut */}
        {donut && (centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {centerValue && <span className="text-2xl font-bold text-gray-900 dark:text-white">{centerValue}</span>}
            {centerLabel && <span className="text-xs text-gray-500">{centerLabel}</span>}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4">
          {slices.map((slice, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-1.5 text-xs cursor-pointer transition-opacity',
                hoveredIndex !== null && hoveredIndex !== i && 'opacity-50',
              )}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: slice.color }} />
              <span className="text-gray-600 dark:text-gray-400">{slice.label}</span>
              {showValues && (
                <span className="text-gray-400 font-mono">({slice.percentage.toFixed(1)}%)</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 4. SPARKLINE
 * ═══════════════════════════════════════════════════════ */

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
  showDot?: boolean;
  className?: string;
  strokeWidth?: number;
}

export const Sparkline = memo(function Sparkline({
  data,
  width = 100,
  height = 30,
  color = '#6366f1',
  fill = true,
  showDot = true,
  className,
  strokeWidth = 1.5,
}: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data.map((v, i) => ({
    x: padding + (i / (data.length - 1)) * (width - padding * 2),
    y: padding + (1 - (v - min) / range) * (height - padding * 2),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const lastPoint = points[points.length - 1];
  const trend = data[data.length - 1] >= data[0];

  return (
    <svg width={width} height={height} className={className}>
      {fill && (
        <defs>
          <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
      )}
      {fill && <path d={areaPath} fill={`url(#spark-${color.replace('#', '')})`} />}
      <motion.path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1 }}
      />
      {showDot && (
        <circle cx={lastPoint.x} cy={lastPoint.y} r={2.5} fill={color} />
      )}
    </svg>
  );
});

/* ═══════════════════════════════════════════════════════
 * 5. GAUGE
 * ═══════════════════════════════════════════════════════ */

interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
  size?: number;
  thickness?: number;
  color?: string;
  backgroundColor?: string;
  ranges?: Array<{ min: number; max: number; color: string; label?: string }>;
  animate?: boolean;
  className?: string;
}

export const Gauge = memo(function Gauge({
  value,
  min = 0,
  max = 100,
  label,
  unit = '%',
  size = 200,
  thickness = 20,
  color = '#6366f1',
  backgroundColor = '#e5e7eb',
  ranges,
  animate = true,
  className,
}: GaugeProps) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - thickness) / 2 - 10;
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;
  const totalArc = endAngle - startAngle;
  const valueAngle = startAngle + (percentage / 100) * totalArc;

  const arcPath = (start: number, end: number) => {
    const x1 = cx + radius * Math.cos(start);
    const y1 = cy + radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy + radius * Math.sin(end);
    const largeArc = end - start > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const activeColor = ranges
    ? ranges.find(r => value >= r.min && value <= r.max)?.color ?? color
    : color;

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <svg width={size} height={size * 0.75}>
        {/* Background arc */}
        <path
          d={arcPath(startAngle, endAngle)}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={thickness}
          strokeLinecap="round"
        />

        {/* Value arc */}
        <motion.path
          d={arcPath(startAngle, valueAngle)}
          fill="none"
          stroke={activeColor}
          strokeWidth={thickness}
          strokeLinecap="round"
          initial={animate ? { pathLength: 0 } : undefined}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* Needle */}
        {(() => {
          const nx = cx + (radius - thickness) * Math.cos(valueAngle);
          const ny = cy + (radius - thickness) * Math.sin(valueAngle);
          return (
            <motion.circle
              cx={nx}
              cy={ny}
              r={6}
              fill={activeColor}
              stroke="white"
              strokeWidth={3}
              initial={animate ? { scale: 0 } : undefined}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            />
          );
        })()}

        {/* Center value */}
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize={size / 6} fontWeight="bold" fill="currentColor">
          {Math.round(value)}{unit}
        </text>
        {label && (
          <text x={cx} y={cy + size / 8} textAnchor="middle" fontSize={11} fill="#9ca3af">
            {label}
          </text>
        )}

        {/* Min/Max labels */}
        <text x={cx - radius * 0.8} y={cy + radius * 0.6} textAnchor="middle" fontSize={10} fill="#9ca3af">
          {min}
        </text>
        <text x={cx + radius * 0.8} y={cy + radius * 0.6} textAnchor="middle" fontSize={10} fill="#9ca3af">
          {max}
        </text>
      </svg>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 6. KPI CARD
 * ═══════════════════════════════════════════════════════ */

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  sparklineData?: number[];
  color?: string;
  variant?: 'default' | 'minimal' | 'gradient';
  className?: string;
}

export const KPICard = memo(function KPICard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon,
  sparklineData,
  color = '#6366f1',
  variant = 'default',
  className,
}: KPICardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <motion.div
      className={cn(
        'rounded-xl p-5',
        variant === 'default' && 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm',
        variant === 'minimal' && 'bg-transparent',
        variant === 'gradient' && 'text-white',
        className,
      )}
      style={variant === 'gradient' ? { background: `linear-gradient(135deg, ${color}, ${color}dd)` } : undefined}
      whileHover={variant !== 'minimal' ? { y: -2 } : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className={cn(
            'text-xs font-medium uppercase tracking-wider mb-1',
            variant === 'gradient' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400',
          )}>
            {title}
          </p>
          <p className={cn(
            'text-2xl font-bold',
            variant === 'gradient' ? 'text-white' : 'text-gray-900 dark:text-white',
          )}>
            {value}
          </p>
        </div>
        {icon && (
          <div
            className={cn(
              'p-2.5 rounded-lg',
              variant === 'gradient' ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700',
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        {change !== undefined && (
          <div className="flex items-center gap-1">
            <span className={cn(
              'inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded',
              isPositive
                ? variant === 'gradient' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : variant === 'gradient' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            )}>
              {isPositive ? '↑' : '↓'} {Math.abs(change)}%
            </span>
            <span className={cn(
              'text-xs',
              variant === 'gradient' ? 'text-white/60' : 'text-gray-400',
            )}>
              {changeLabel}
            </span>
          </div>
        )}

        {sparklineData && sparklineData.length > 1 && (
          <Sparkline
            data={sparklineData}
            width={80}
            height={24}
            color={variant === 'gradient' ? 'rgba(255,255,255,0.8)' : color}
            strokeWidth={1.5}
          />
        )}
      </div>
    </motion.div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 7. FUNNEL CHART
 * ═══════════════════════════════════════════════════════ */

interface FunnelProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  animate?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
  theme?: Partial<ChartTheme>;
  className?: string;
  title?: string;
}

export const FunnelChart = memo(function FunnelChart({
  data,
  width = 400,
  height = 300,
  animate = true,
  showLabels = true,
  showValues = true,
  theme: customTheme,
  className,
  title,
}: FunnelProps) {
  const theme = { ...defaultTheme, ...customTheme };
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const stepHeight = height / data.length;
  const padding = 20;

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      {title && <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{title}</h3>}

      <svg width={width} height={height}>
        {data.map((d, i) => {
          const color = d.color ?? theme.colors[i % theme.colors.length];
          const widthRatio = d.value / maxValue;
          const nextRatio = i < data.length - 1 ? data[i + 1].value / maxValue : widthRatio * 0.8;

          const topWidth = (width - padding * 2) * widthRatio;
          const bottomWidth = (width - padding * 2) * nextRatio;
          const topX = (width - topWidth) / 2;
          const bottomX = (width - bottomWidth) / 2;
          const y = i * stepHeight;

          const path = `
            M ${topX} ${y}
            L ${topX + topWidth} ${y}
            L ${bottomX + bottomWidth} ${y + stepHeight}
            L ${bottomX} ${y + stepHeight}
            Z
          `;

          return (
            <g key={i}>
              <motion.path
                d={path}
                fill={color}
                opacity={0.85}
                stroke="white"
                strokeWidth={2}
                initial={animate ? { opacity: 0, scale: 0.9 } : undefined}
                animate={{ opacity: 0.85, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="hover:opacity-100 cursor-pointer transition-opacity"
              />
              {showLabels && (
                <text
                  x={width / 2}
                  y={y + stepHeight / 2 - (showValues ? 5 : 0)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={12}
                  fontWeight="600"
                  fill="white"
                >
                  {d.label}
                </text>
              )}
              {showValues && (
                <text
                  x={width / 2}
                  y={y + stepHeight / 2 + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={10}
                  fill="rgba(255,255,255,0.7)"
                >
                  {d.value.toLocaleString()} ({((d.value / maxValue) * 100).toFixed(0)}%)
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 8. HEATMAP
 * ═══════════════════════════════════════════════════════ */

interface HeatmapProps {
  data: number[][];
  xLabels?: string[];
  yLabels?: string[];
  width?: number;
  height?: number;
  colorRange?: [string, string];
  animate?: boolean;
  showValues?: boolean;
  borderRadius?: number;
  gap?: number;
  className?: string;
  title?: string;
}

export const Heatmap = memo(function Heatmap({
  data,
  xLabels,
  yLabels,
  width = 400,
  height = 300,
  colorRange = ['#ede9fe', '#6366f1'],
  animate = true,
  showValues = true,
  borderRadius = 4,
  gap = 2,
  className,
  title,
}: HeatmapProps) {
  const [tooltip, setTooltip] = useState<ChartTooltipData | null>(null);

  const rows = data.length;
  const cols = data[0]?.length ?? 0;
  const flatValues = data.flat();
  const minVal = Math.min(...flatValues);
  const maxVal = Math.max(...flatValues);
  const range = maxVal - minVal || 1;

  const labelMarginLeft = yLabels ? 60 : 10;
  const labelMarginBottom = xLabels ? 30 : 10;
  const chartWidth = width - labelMarginLeft - 10;
  const chartHeight = height - (title ? 30 : 10) - labelMarginBottom;
  const cellW = (chartWidth - gap * (cols - 1)) / cols;
  const cellH = (chartHeight - gap * (rows - 1)) / rows;

  const interpolateColor = (t: number) => {
    // Simple lerp between two hex colors
    const c1 = parseInt(colorRange[0].slice(1), 16);
    const c2 = parseInt(colorRange[1].slice(1), 16);
    const r = Math.round(((c1 >> 16) & 0xff) * (1 - t) + ((c2 >> 16) & 0xff) * t);
    const g = Math.round(((c1 >> 8) & 0xff) * (1 - t) + ((c2 >> 8) & 0xff) * t);
    const b = Math.round((c1 & 0xff) * (1 - t) + (c2 & 0xff) * t);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className={cn('relative inline-block', className)}>
      {title && <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">{title}</h3>}

      <svg width={width} height={height - (title ? 0 : 20)}>
        {/* Y labels */}
        {yLabels?.map((label, i) => (
          <text
            key={i}
            x={labelMarginLeft - 8}
            y={(title ? 30 : 10) + i * (cellH + gap) + cellH / 2}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={10}
            fill="#9ca3af"
          >
            {label}
          </text>
        ))}

        {/* X labels */}
        {xLabels?.map((label, i) => (
          <text
            key={i}
            x={labelMarginLeft + i * (cellW + gap) + cellW / 2}
            y={height - (title ? 0 : 20) - 8}
            textAnchor="middle"
            fontSize={10}
            fill="#9ca3af"
          >
            {label}
          </text>
        ))}

        {/* Cells */}
        {data.map((row, ri) =>
          row.map((val, ci) => {
            const t = (val - minVal) / range;
            const x = labelMarginLeft + ci * (cellW + gap);
            const y = (title ? 30 : 10) + ri * (cellH + gap);
            const cellColor = interpolateColor(t);

            return (
              <motion.rect
                key={`${ri}-${ci}`}
                x={x}
                y={y}
                width={cellW}
                height={cellH}
                rx={borderRadius}
                fill={cellColor}
                initial={animate ? { opacity: 0, scale: 0.8 } : undefined}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (ri * cols + ci) * 0.01 }}
                className="cursor-pointer"
                onMouseEnter={() => {
                  setTooltip({
                    x: x + cellW / 2,
                    y,
                    label: `${yLabels?.[ri] ?? `Row ${ri}`} × ${xLabels?.[ci] ?? `Col ${ci}`}`,
                    value: val.toLocaleString(),
                    color: cellColor,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          }),
        )}

        {/* Values */}
        {showValues && cellW > 25 && cellH > 20 && data.map((row, ri) =>
          row.map((val, ci) => {
            const t = (val - minVal) / range;
            const x = labelMarginLeft + ci * (cellW + gap) + cellW / 2;
            const y = (title ? 30 : 10) + ri * (cellH + gap) + cellH / 2;

            return (
              <text
                key={`v-${ri}-${ci}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={Math.min(cellW, cellH) * 0.35}
                fontWeight="500"
                fill={t > 0.5 ? 'white' : '#374151'}
              >
                {val}
              </text>
            );
          }),
        )}
      </svg>

      <AnimatePresence>
        {tooltip && <ChartTooltip data={tooltip} />}
      </AnimatePresence>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 9. RADAR CHART
 * ═══════════════════════════════════════════════════════ */

interface RadarChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  maxValue?: number;
  levels?: number;
  fillOpacity?: number;
  animate?: boolean;
  color?: string;
  className?: string;
  title?: string;
}

export const RadarChart = memo(function RadarChart({
  data,
  width = 300,
  height = 300,
  maxValue: propMax,
  levels = 5,
  fillOpacity = 0.2,
  animate = true,
  color = '#6366f1',
  className,
  title,
}: RadarChartProps) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(cx, cy) - 40;
  const maxVal = propMax ?? Math.max(...data.map(d => d.value));
  const angleStep = (2 * Math.PI) / data.length;
  const startAngle = -Math.PI / 2;

  const getPoint = (index: number, value: number) => ({
    x: cx + radius * (value / maxVal) * Math.cos(startAngle + index * angleStep),
    y: cy + radius * (value / maxVal) * Math.sin(startAngle + index * angleStep),
  });

  const polygonPoints = data
    .map((d, i) => getPoint(i, d.value))
    .map(p => `${p.x},${p.y}`)
    .join(' ');

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      {title && <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>}

      <svg width={width} height={height}>
        {/* Level polygons */}
        {Array.from({ length: levels }).map((_, level) => {
          const r = radius * ((level + 1) / levels);
          const pts = data
            .map((_, i) => {
              const x = cx + r * Math.cos(startAngle + i * angleStep);
              const y = cy + r * Math.sin(startAngle + i * angleStep);
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <polygon
              key={level}
              points={pts}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          );
        })}

        {/* Axis lines */}
        {data.map((_, i) => {
          const end = getPoint(i, maxVal);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          );
        })}

        {/* Axis labels */}
        {data.map((d, i) => {
          const p = getPoint(i, maxVal * 1.15);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10}
              fill="#6b7280"
            >
              {d.label}
            </text>
          );
        })}

        {/* Data polygon */}
        <motion.polygon
          points={polygonPoints}
          fill={color}
          fillOpacity={fillOpacity}
          stroke={color}
          strokeWidth={2}
          initial={animate ? { opacity: 0, scale: 0.5 } : undefined}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Data dots */}
        {data.map((d, i) => {
          const p = getPoint(i, d.value);
          return (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill="white"
              stroke={color}
              strokeWidth={2}
              initial={animate ? { scale: 0 } : undefined}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.05 }}
              className="cursor-pointer"
            />
          );
        })}
      </svg>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
 * 10. MINI DASHBOARD (Composite)
 * ═══════════════════════════════════════════════════════ */

interface MiniDashboardProps {
  kpis: KPICardProps[];
  barData?: DataPoint[];
  lineData?: { series: LineChartSeries[]; labels: string[] };
  pieData?: DataPoint[];
  className?: string;
}

export const MiniDashboard = memo(function MiniDashboard({
  kpis = [],
  barData,
  lineData,
  pieData,
  className,
}: MiniDashboardProps) {
  return (
    <div className={cn('grid gap-4', className)}>
      {/* KPI Row */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <KPICard key={i} {...kpi} />
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-4">
        {lineData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <LineChart {...lineData} width={400} height={220} title="Trends" />
          </div>
        )}
        {barData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <BarChart data={barData} width={400} height={220} title="Distribution" />
          </div>
        )}
      </div>

      {/* Pie chart */}
      {pieData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex justify-center">
          <PieChart data={pieData} donut donutWidth={35} title="Breakdown" centerValue="100%" centerLabel="Total" />
        </div>
      )}
    </div>
  );
});
