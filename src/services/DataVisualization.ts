// =============================================================================
// Data Visualization Engine - Charts, graphs, and data visualization
// Features: SVG chart generation, chart types, data transformations,
//           color scales, tooltips, legends, axes, responsive charts
// =============================================================================

// =============================================================================
// Chart Types
// =============================================================================

export type ChartType =
  | 'line' | 'bar' | 'horizontal-bar' | 'stacked-bar' | 'grouped-bar'
  | 'pie' | 'donut' | 'area' | 'stacked-area'
  | 'scatter' | 'bubble' | 'radar' | 'polar'
  | 'heatmap' | 'treemap' | 'sunburst'
  | 'funnel' | 'waterfall' | 'gauge'
  | 'candlestick' | 'sankey' | 'histogram'
  | 'box-plot' | 'violin' | 'sparkline'
  | 'progress-ring' | 'progress-bar' | 'kpi-card'
  | 'map' | 'network' | 'timeline';

export interface ChartConfig {
  type: ChartType;
  data: ChartData;
  options: ChartOptions;
  width: number;
  height: number;
  responsive: boolean;
  padding: { top: number; right: number; bottom: number; left: number };
  theme: ChartTheme;
  animation: ChartAnimation;
  interactions: ChartInteractions;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
  categories?: string[];
}

export interface ChartDataset {
  label: string;
  data: number[] | DataPoint[];
  color?: string;
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
  tension?: number;         // 0-1 for line smoothing
  pointRadius?: number;
  pointStyle?: 'circle' | 'square' | 'triangle' | 'diamond' | 'star' | 'cross';
  hidden?: boolean;
  stack?: string;
  yAxisID?: string;
  order?: number;
}

export interface DataPoint {
  x: number;
  y: number;
  z?: number;              // For bubble charts
  label?: string;
  color?: string;
}

// =============================================================================
// Chart Options
// =============================================================================

export interface ChartOptions {
  title?: ChartTitleConfig;
  subtitle?: ChartTitleConfig;
  legend?: LegendConfig;
  tooltip?: TooltipConfig;
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  grid?: GridConfig;
  annotations?: AnnotationConfig[];
  datalabels?: DataLabelConfig;
}

export interface ChartTitleConfig {
  text: string;
  display: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  fontSize: number;
  fontWeight: number;
  color: string;
  padding: number;
  align: 'start' | 'center' | 'end';
}

export interface LegendConfig {
  display: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
  fontSize: number;
  color: string;
  itemSpacing: number;
  symbolSize: number;
  symbolShape: 'circle' | 'square' | 'line' | 'dash';
  interactive: boolean;
  maxItems?: number;
}

export interface TooltipConfig {
  enabled: boolean;
  mode: 'single' | 'nearest' | 'index' | 'dataset' | 'all';
  position: 'average' | 'nearest' | 'cursor';
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderRadius: number;
  padding: number;
  fontSize: number;
  formatter?: (value: number, label: string, dataset: string) => string;
  followCursor: boolean;
}

export interface AxisConfig {
  display: boolean;
  title?: { text: string; display: boolean; fontSize: number; color: string };
  type: 'linear' | 'logarithmic' | 'category' | 'time' | 'percentage';
  min?: number;
  max?: number;
  stepSize?: number;
  ticks?: {
    display: boolean;
    fontSize: number;
    color: string;
    rotation?: number;
    padding?: number;
    formatter?: (value: number) => string;
    count?: number;
    prefix?: string;
    suffix?: string;
  };
  gridLines?: {
    display: boolean;
    color: string;
    lineWidth: number;
    dash?: number[];
  };
  position?: 'left' | 'right' | 'top' | 'bottom';
  stacked?: boolean;
}

export interface GridConfig {
  display: boolean;
  horizontal: boolean;
  vertical: boolean;
  color: string;
  lineWidth: number;
  dash?: number[];
}

export interface AnnotationConfig {
  type: 'line' | 'box' | 'point' | 'label';
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  value?: number;
  label?: string;
  color: string;
  lineWidth?: number;
  dash?: number[];
  fontSize?: number;
}

export interface DataLabelConfig {
  display: boolean;
  position: 'inside' | 'outside' | 'top' | 'bottom' | 'left' | 'right' | 'center';
  fontSize: number;
  color: string;
  formatter?: (value: number) => string;
  offset?: number;
  rotation?: number;
}

// =============================================================================
// Theme & Animation
// =============================================================================

export interface ChartTheme {
  name: string;
  backgroundColor: string;
  textColor: string;
  gridColor: string;
  axisColor: string;
  colorPalette: string[];
  fontFamily: string;
  borderRadius: number;
  barWidth?: number;
  lineWidth?: number;
}

export interface ChartAnimation {
  enabled: boolean;
  duration: number;
  easing: string;
  delay?: number;
  type: 'grow' | 'fade' | 'slide' | 'bounce' | 'draw' | 'reveal';
  stagger?: number;
}

export interface ChartInteractions {
  hover: boolean;
  click: boolean;
  zoom: boolean;
  pan: boolean;
  crosshair: boolean;
  brush: boolean;
  select: boolean;
}

// =============================================================================
// Chart Themes
// =============================================================================

export const CHART_THEMES: Record<string, ChartTheme> = {
  default: {
    name: 'Default',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    gridColor: '#e5e7eb',
    axisColor: '#6b7280',
    colorPalette: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'],
    fontFamily: 'system-ui, sans-serif',
    borderRadius: 4,
    lineWidth: 2,
  },
  dark: {
    name: 'Dark',
    backgroundColor: '#1a1a2e',
    textColor: '#e5e7eb',
    gridColor: '#374151',
    axisColor: '#9ca3af',
    colorPalette: ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#F472B6', '#22D3EE', '#A3E635', '#FB923C', '#818CF8'],
    fontFamily: 'system-ui, sans-serif',
    borderRadius: 4,
    lineWidth: 2,
  },
  pastel: {
    name: 'Pastel',
    backgroundColor: '#fefefe',
    textColor: '#4a5568',
    gridColor: '#edf2f7',
    axisColor: '#a0aec0',
    colorPalette: ['#93C5FD', '#6EE7B7', '#FDE68A', '#FCA5A5', '#C4B5FD', '#FBCFE8', '#A5F3FC', '#D9F99D', '#FDBA74', '#A5B4FC'],
    fontFamily: 'system-ui, sans-serif',
    borderRadius: 8,
    lineWidth: 2,
  },
  vibrant: {
    name: 'Vibrant',
    backgroundColor: '#ffffff',
    textColor: '#1a202c',
    gridColor: '#e2e8f0',
    axisColor: '#718096',
    colorPalette: ['#0066FF', '#00CC88', '#FF6633', '#CC0066', '#6600CC', '#00CCCC', '#CCCC00', '#FF0066', '#0099FF', '#FF9900'],
    fontFamily: 'system-ui, sans-serif',
    borderRadius: 2,
    lineWidth: 3,
  },
  monochrome: {
    name: 'Monochrome',
    backgroundColor: '#ffffff',
    textColor: '#1a202c',
    gridColor: '#e2e8f0',
    axisColor: '#718096',
    colorPalette: ['#1a202c', '#2d3748', '#4a5568', '#718096', '#a0aec0', '#cbd5e0', '#e2e8f0', '#edf2f7', '#f7fafc', '#4a5568'],
    fontFamily: 'system-ui, sans-serif',
    borderRadius: 0,
    lineWidth: 2,
  },
  nature: {
    name: 'Nature',
    backgroundColor: '#f0fdf4',
    textColor: '#14532d',
    gridColor: '#d1fae5',
    axisColor: '#6b7280',
    colorPalette: ['#166534', '#15803d', '#22c55e', '#86efac', '#4f46e5', '#7c3aed', '#c084fc', '#fbbf24', '#f97316', '#ef4444'],
    fontFamily: 'system-ui, sans-serif',
    borderRadius: 6,
    lineWidth: 2,
  },
};

// =============================================================================
// Data Visualization Engine Class
// =============================================================================

export class DataVisualizationEngine {
  private charts: Map<string, ChartConfig> = new Map();
  private listeners: Map<string, Array<(data: unknown) => void>> = new Map();

  // ---------------------------------------------------------------------------
  // Chart CRUD
  // ---------------------------------------------------------------------------

  createChart(id: string, config: Partial<ChartConfig>): ChartConfig {
    const fullConfig = this.mergeDefaults(config);
    this.charts.set(id, fullConfig);
    this.emit('chart:created', { id, config: fullConfig });
    return fullConfig;
  }

  updateChart(id: string, updates: Partial<ChartConfig>): ChartConfig | null {
    const existing = this.charts.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    this.charts.set(id, updated);
    this.emit('chart:updated', { id, config: updated });
    return updated;
  }

  deleteChart(id: string): boolean {
    const result = this.charts.delete(id);
    if (result) this.emit('chart:deleted', { id });
    return result;
  }

  getChart(id: string): ChartConfig | undefined {
    return this.charts.get(id);
  }

  getAllCharts(): Array<{ id: string; config: ChartConfig }> {
    return Array.from(this.charts.entries()).map(([id, config]) => ({ id, config }));
  }

  // ---------------------------------------------------------------------------
  // SVG Chart Generation
  // ---------------------------------------------------------------------------

  generateSVG(config: ChartConfig): string {
    const { width, height, padding } = config;
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="font-family: ${config.theme.fontFamily}; background: ${config.theme.backgroundColor}">`;

    // Title
    if (config.options.title?.display) {
      svg += this.generateTitle(config.options.title, width);
    }

    // Chart area group
    svg += `<g transform="translate(${padding.left}, ${padding.top})">`;

    switch (config.type) {
      case 'line':
        svg += this.generateLineChart(config.data, innerWidth, innerHeight, config);
        break;
      case 'bar':
      case 'grouped-bar':
        svg += this.generateBarChart(config.data, innerWidth, innerHeight, config);
        break;
      case 'horizontal-bar':
        svg += this.generateHorizontalBarChart(config.data, innerWidth, innerHeight, config);
        break;
      case 'pie':
      case 'donut':
        svg += this.generatePieChart(config.data, innerWidth, innerHeight, config);
        break;
      case 'area':
        svg += this.generateAreaChart(config.data, innerWidth, innerHeight, config);
        break;
      case 'scatter':
        svg += this.generateScatterChart(config.data, innerWidth, innerHeight, config);
        break;
      case 'radar':
        svg += this.generateRadarChart(config.data, innerWidth, innerHeight, config);
        break;
      case 'gauge':
        svg += this.generateGaugeChart(config.data, innerWidth, innerHeight, config);
        break;
      case 'sparkline':
        svg += this.generateSparkline(config.data, innerWidth, innerHeight, config);
        break;
      case 'progress-ring':
        svg += this.generateProgressRing(config.data, innerWidth, innerHeight, config);
        break;
      case 'heatmap':
        svg += this.generateHeatmap(config.data, innerWidth, innerHeight, config);
        break;
      case 'funnel':
        svg += this.generateFunnelChart(config.data, innerWidth, innerHeight, config);
        break;
      case 'waterfall':
        svg += this.generateWaterfallChart(config.data, innerWidth, innerHeight, config);
        break;
      case 'treemap':
        svg += this.generateTreemap(config.data, innerWidth, innerHeight, config);
        break;
    }

    svg += `</g>`;

    // Legend
    if (config.options.legend?.display) {
      svg += this.generateLegend(config.data, config.options.legend, width, height, config.theme);
    }

    svg += `</svg>`;
    return svg;
  }

  // ---------------------------------------------------------------------------
  // Individual Chart Generators
  // ---------------------------------------------------------------------------

  private generateLineChart(data: ChartData, width: number, height: number, config: ChartConfig): string {
    let svg = '';
    const { yMin, yMax } = this.getDataRange(data);
    const range = yMax - yMin || 1;

    // Grid lines
    svg += this.generateGridLines(width, height, config);

    // Axes
    svg += this.generateAxes(data, width, height, config, yMin, yMax);

    // Lines
    for (let di = 0; di < data.datasets.length; di++) {
      const dataset = data.datasets[di];
      if (dataset.hidden) continue;

      const color = dataset.color || config.theme.colorPalette[di % config.theme.colorPalette.length];
      const values = dataset.data as number[];
      const points: Array<{ x: number; y: number }> = [];

      for (let i = 0; i < values.length; i++) {
        const x = (i / Math.max(1, values.length - 1)) * width;
        const y = height - ((values[i] - yMin) / range) * height;
        points.push({ x, y });
      }

      // Line path
      const tension = dataset.tension || 0;
      const pathData = tension > 0 ? this.smoothPath(points, tension) : points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

      svg += `<path d="${pathData}" fill="none" stroke="${color}" stroke-width="${dataset.borderWidth || config.theme.lineWidth || 2}" stroke-linecap="round" stroke-linejoin="round" />`;

      // Points
      if (dataset.pointRadius !== 0) {
        const radius = dataset.pointRadius || 4;
        for (const p of points) {
          svg += `<circle cx="${p.x}" cy="${p.y}" r="${radius}" fill="${color}" stroke="white" stroke-width="2" />`;
        }
      }

      // Data labels
      if (config.options.datalabels?.display) {
        for (let i = 0; i < points.length; i++) {
          svg += `<text x="${points[i].x}" y="${points[i].y - 10}" text-anchor="middle" fill="${config.theme.textColor}" font-size="11">${values[i]}</text>`;
        }
      }
    }

    return svg;
  }

  private generateBarChart(data: ChartData, width: number, height: number, config: ChartConfig): string {
    let svg = '';
    const { yMin, yMax } = this.getDataRange(data);
    const range = yMax - yMin || 1;
    const barGroupWidth = width / data.labels.length;
    const groupPadding = barGroupWidth * 0.2;
    const barWidth = (barGroupWidth - groupPadding * 2) / data.datasets.filter(d => !d.hidden).length;

    // Grid & axes
    svg += this.generateGridLines(width, height, config);
    svg += this.generateAxes(data, width, height, config, yMin, yMax);

    // Bars
    let visibleIdx = 0;
    for (let di = 0; di < data.datasets.length; di++) {
      const dataset = data.datasets[di];
      if (dataset.hidden) continue;

      const color = dataset.color || config.theme.colorPalette[di % config.theme.colorPalette.length];
      const values = dataset.data as number[];
      const radius = config.theme.borderRadius || 0;

      for (let i = 0; i < values.length; i++) {
        const barHeight = ((values[i] - Math.min(0, yMin)) / range) * height;
        const x = i * barGroupWidth + groupPadding + visibleIdx * barWidth;
        const y = height - barHeight;

        svg += `<rect x="${x}" y="${y}" width="${barWidth - 1}" height="${barHeight}" fill="${color}" rx="${radius}" ry="${radius}" opacity="0.9">`;
        if (config.animation.enabled) {
          svg += `<animate attributeName="height" from="0" to="${barHeight}" dur="${config.animation.duration}ms" fill="freeze" />`;
          svg += `<animate attributeName="y" from="${height}" to="${y}" dur="${config.animation.duration}ms" fill="freeze" />`;
        }
        svg += `</rect>`;

        // Data labels
        if (config.options.datalabels?.display) {
          svg += `<text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" fill="${config.theme.textColor}" font-size="11">${values[i]}</text>`;
        }
      }
      visibleIdx++;
    }

    return svg;
  }

  private generateHorizontalBarChart(data: ChartData, width: number, height: number, config: ChartConfig): string {
    let svg = '';
    const { yMax } = this.getDataRange(data);
    const barGroupHeight = height / data.labels.length;
    const barHeight = barGroupHeight * 0.6;
    const radius = config.theme.borderRadius || 0;

    for (let di = 0; di < data.datasets.length; di++) {
      const dataset = data.datasets[di];
      if (dataset.hidden) continue;

      const color = dataset.color || config.theme.colorPalette[di % config.theme.colorPalette.length];
      const values = dataset.data as number[];

      for (let i = 0; i < values.length; i++) {
        const barWidth = (values[i] / (yMax || 1)) * width;
        const y = i * barGroupHeight + (barGroupHeight - barHeight) / 2;

        svg += `<rect x="0" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" rx="${radius}" ry="${radius}" opacity="0.9" />`;

        // Label
        svg += `<text x="${barWidth + 5}" y="${y + barHeight / 2 + 4}" fill="${config.theme.textColor}" font-size="12">${values[i]}</text>`;
        svg += `<text x="-5" y="${y + barHeight / 2 + 4}" text-anchor="end" fill="${config.theme.textColor}" font-size="12">${data.labels[i]}</text>`;
      }
    }

    return svg;
  }

  private generatePieChart(data: ChartData, width: number, height: number, config: ChartConfig): string {
    let svg = '';
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    const innerRadius = config.type === 'donut' ? radius * 0.6 : 0;

    const values = data.datasets[0]?.data as number[] || [];
    const total = values.reduce((sum, v) => sum + v, 0);
    let currentAngle = -Math.PI / 2;

    for (let i = 0; i < values.length; i++) {
      const sliceAngle = (values[i] / (total || 1)) * 2 * Math.PI;
      const endAngle = currentAngle + sliceAngle;
      const color = config.theme.colorPalette[i % config.theme.colorPalette.length];

      const x1 = cx + radius * Math.cos(currentAngle);
      const y1 = cy + radius * Math.sin(currentAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;
      let path: string;

      if (innerRadius > 0) {
        const ix1 = cx + innerRadius * Math.cos(currentAngle);
        const iy1 = cy + innerRadius * Math.sin(currentAngle);
        const ix2 = cx + innerRadius * Math.cos(endAngle);
        const iy2 = cy + innerRadius * Math.sin(endAngle);
        path = `M${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} L${ix2},${iy2} A${innerRadius},${innerRadius} 0 ${largeArc} 0 ${ix1},${iy1} Z`;
      } else {
        path = `M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;
      }

      svg += `<path d="${path}" fill="${color}" stroke="${config.theme.backgroundColor}" stroke-width="2" />`;

      // Label
      const midAngle = currentAngle + sliceAngle / 2;
      const labelRadius = radius * (innerRadius > 0 ? 1.15 : 0.7);
      const lx = cx + labelRadius * Math.cos(midAngle);
      const ly = cy + labelRadius * Math.sin(midAngle);
      const pct = ((values[i] / (total || 1)) * 100).toFixed(1);

      if (config.options.datalabels?.display) {
        svg += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" fill="${innerRadius > 0 ? config.theme.textColor : '#ffffff'}" font-size="12" font-weight="600">${pct}%</text>`;
      }

      currentAngle = endAngle;
    }

    // Center label for donut
    if (config.type === 'donut') {
      svg += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" fill="${config.theme.textColor}" font-size="24" font-weight="700">${total}</text>`;
      svg += `<text x="${cx}" y="${cy + 20}" text-anchor="middle" fill="${config.theme.axisColor}" font-size="12">Total</text>`;
    }

    return svg;
  }

  private generateAreaChart(data: ChartData, width: number, height: number, config: ChartConfig): string {
    let svg = '';
    const { yMin, yMax } = this.getDataRange(data);
    const range = yMax - yMin || 1;

    svg += this.generateGridLines(width, height, config);
    svg += this.generateAxes(data, width, height, config, yMin, yMax);

    for (let di = 0; di < data.datasets.length; di++) {
      const dataset = data.datasets[di];
      if (dataset.hidden) continue;

      const color = dataset.color || config.theme.colorPalette[di % config.theme.colorPalette.length];
      const values = dataset.data as number[];
      const points: string[] = [];
      const linePoints: string[] = [];

      for (let i = 0; i < values.length; i++) {
        const x = (i / Math.max(1, values.length - 1)) * width;
        const y = height - ((values[i] - yMin) / range) * height;
        points.push(`${x},${y}`);
        linePoints.push(`${i === 0 ? 'M' : 'L'}${x},${y}`);
      }

      // Area fill
      const areaPath = `M0,${height} L${points.join(' L')} L${width},${height} Z`;
      svg += `<path d="${areaPath}" fill="${color}" opacity="0.2" />`;

      // Line
      svg += `<path d="${linePoints.join(' ')}" fill="none" stroke="${color}" stroke-width="2" />`;
    }

    return svg;
  }

  private generateScatterChart(data: ChartData, width: number, height: number, config: ChartConfig): string {
    let svg = '';
    svg += this.generateGridLines(width, height, config);

    for (let di = 0; di < data.datasets.length; di++) {
      const dataset = data.datasets[di];
      if (dataset.hidden) continue;

      const color = dataset.color || config.theme.colorPalette[di % config.theme.colorPalette.length];
      const points = dataset.data as DataPoint[];
      const allX = points.map(p => p.x);
      const allY = points.map(p => p.y);
      const xMin = Math.min(...allX);
      const xMax = Math.max(...allX);
      const yMin = Math.min(...allY);
      const yMax = Math.max(...allY);
      const xRange = xMax - xMin || 1;
      const yRange = yMax - yMin || 1;

      for (const point of points) {
        const x = ((point.x - xMin) / xRange) * width;
        const y = height - ((point.y - yMin) / yRange) * height;
        const r = point.z ? Math.sqrt(point.z) * 3 : dataset.pointRadius || 5;

        svg += `<circle cx="${x}" cy="${y}" r="${r}" fill="${point.color || color}" opacity="0.7" stroke="${color}" stroke-width="1" />`;
      }
    }

    return svg;
  }

  private generateRadarChart(data: ChartData, width: number, height: number, config: ChartConfig): string {
    let svg = '';
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 30;
    const labels = data.labels;
    const n = labels.length;

    // Grid rings
    for (let ring = 1; ring <= 5; ring++) {
      const r = (ring / 5) * radius;
      const ringPoints: string[] = [];

      for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        ringPoints.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
      }
      svg += `<polygon points="${ringPoints.join(' ')}" fill="none" stroke="${config.theme.gridColor}" stroke-width="1" />`;
    }

    // Axis lines & labels
    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);

      svg += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${config.theme.gridColor}" stroke-width="1" />`;

      const lx = cx + (radius + 15) * Math.cos(angle);
      const ly = cy + (radius + 15) * Math.sin(angle);
      svg += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" fill="${config.theme.textColor}" font-size="11">${labels[i]}</text>`;
    }

    // Data polygons
    for (let di = 0; di < data.datasets.length; di++) {
      const dataset = data.datasets[di];
      if (dataset.hidden) continue;

      const color = dataset.color || config.theme.colorPalette[di % config.theme.colorPalette.length];
      const values = dataset.data as number[];
      const maxVal = Math.max(...values, 1);
      const polyPoints: string[] = [];

      for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        const r = (values[i] / maxVal) * radius;
        polyPoints.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
      }

      svg += `<polygon points="${polyPoints.join(' ')}" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="2" />`;

      // Points
      for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI * i) / n - Math.PI / 2;
        const r = (values[i] / maxVal) * radius;
        svg += `<circle cx="${cx + r * Math.cos(angle)}" cy="${cy + r * Math.sin(angle)}" r="4" fill="${color}" stroke="white" stroke-width="2" />`;
      }
    }

    return svg;
  }

  private generateGaugeChart(data: ChartData, width: number, height: number, config: ChartConfig): string {
    let svg = '';
    const cx = width / 2;
    const cy = height * 0.7;
    const radius = Math.min(width, height) * 0.4;
    const value = (data.datasets[0]?.data as number[])?.[0] || 0;
    const maxValue = config.options.yAxis?.max || 100;
    const progress = Math.min(1, value / maxValue);

    const startAngle = -Math.PI * 0.75;
    const endAngle = Math.PI * -0.25;
    const totalAngle = endAngle - startAngle;

    // Background arc
    svg += this.describeArc(cx, cy, radius, startAngle, endAngle, config.theme.gridColor, 20);

    // Value arc
    const valueAngle = startAngle + totalAngle * progress;
    const color = this.getGaugeColor(progress, config);
    svg += this.describeArc(cx, cy, radius, startAngle, valueAngle, color, 20);

    // Value text
    svg += `<text x="${cx}" y="${cy - 10}" text-anchor="middle" fill="${config.theme.textColor}" font-size="36" font-weight="700">${Math.round(value)}</text>`;
    svg += `<text x="${cx}" y="${cy + 15}" text-anchor="middle" fill="${config.theme.axisColor}" font-size="14">/ ${maxValue}</text>`;

    // Min/max labels
    const minX = cx + radius * Math.cos(startAngle);
    const minY = cy + radius * Math.sin(startAngle);
    const maxX = cx + radius * Math.cos(endAngle);
    const maxY = cy + radius * Math.sin(endAngle);

    svg += `<text x="${minX}" y="${minY + 20}" text-anchor="middle" fill="${config.theme.axisColor}" font-size="11">0</text>`;
    svg += `<text x="${maxX}" y="${maxY + 20}" text-anchor="middle" fill="${config.theme.axisColor}" font-size="11">${maxValue}</text>`;

    return svg;
  }

  private generateSparkline(data: ChartData, width: number, height: number, config: ChartConfig): string {
    const values = data.datasets[0]?.data as number[] || [];
    if (values.length === 0) return '';

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const color = config.theme.colorPalette[0];

    const points = values.map((v, i) => ({
      x: (i / Math.max(1, values.length - 1)) * width,
      y: height - ((v - min) / range) * height * 0.8 - height * 0.1,
    }));

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    let svg = `<path d="${pathData}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" />`;

    // End dot
    const last = points[points.length - 1];
    svg += `<circle cx="${last.x}" cy="${last.y}" r="3" fill="${color}" />`;

    return svg;
  }

  private generateProgressRing(data: ChartData, width: number, height: number, config: ChartConfig): string {
    let svg = '';
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 10;
    const strokeWidth = 10;
    const value = (data.datasets[0]?.data as number[])?.[0] || 0;
    const max = config.options.yAxis?.max || 100;
    const progress = Math.min(1, value / max);
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - progress);
    const color = config.theme.colorPalette[0];

    // Background ring
    svg += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${config.theme.gridColor}" stroke-width="${strokeWidth}" />`;

    // Progress ring
    svg += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}" stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})">`;
    if (config.animation.enabled) {
      svg += `<animate attributeName="stroke-dashoffset" from="${circumference}" to="${dashOffset}" dur="${config.animation.duration}ms" fill="freeze" />`;
    }
    svg += `</circle>`;

    // Center text
    svg += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" fill="${config.theme.textColor}" font-size="28" font-weight="700">${Math.round(progress * 100)}%</text>`;

    return svg;
  }

  private generateHeatmap(data: ChartData, width: number, height: number, config: ChartConfig): string {
    let svg = '';
    const values = data.datasets[0]?.data as number[] || [];
    const cols = data.labels.length;
    const rows = Math.ceil(values.length / cols);
    const cellWidth = width / cols;
    const cellHeight = height / rows;
    const max = Math.max(...values, 1);

    for (let i = 0; i < values.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const intensity = values[i] / max;
      const color = this.interpolateColor('#e2e8f0', config.theme.colorPalette[0], intensity);

      svg += `<rect x="${col * cellWidth}" y="${row * cellHeight}" width="${cellWidth - 1}" height="${cellHeight - 1}" fill="${color}" rx="2" />`;
      svg += `<text x="${col * cellWidth + cellWidth / 2}" y="${row * cellHeight + cellHeight / 2}" text-anchor="middle" dominant-baseline="middle" fill="${intensity > 0.5 ? '#ffffff' : config.theme.textColor}" font-size="10">${values[i]}</text>`;
    }

    return svg;
  }

  private generateFunnelChart(data: ChartData, width: number, height: number, config: ChartConfig): string {
    let svg = '';
    const values = data.datasets[0]?.data as number[] || [];
    const max = Math.max(...values, 1);
    const sectionHeight = height / values.length;

    for (let i = 0; i < values.length; i++) {
      const percent = values[i] / max;
      const nextPercent = i < values.length - 1 ? (values[i + 1] / max) : percent * 0.8;
      const color = config.theme.colorPalette[i % config.theme.colorPalette.length];

      const topWidth = percent * width;
      const bottomWidth = nextPercent * width;
      const topX = (width - topWidth) / 2;
      const bottomX = (width - bottomWidth) / 2;
      const y = i * sectionHeight;

      const points = `${topX},${y} ${topX + topWidth},${y} ${bottomX + bottomWidth},${y + sectionHeight} ${bottomX},${y + sectionHeight}`;
      svg += `<polygon points="${points}" fill="${color}" opacity="0.9" stroke="${config.theme.backgroundColor}" stroke-width="1" />`;

      // Label
      svg += `<text x="${width / 2}" y="${y + sectionHeight / 2}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="13" font-weight="600">${data.labels[i]} (${values[i]})</text>`;
    }

    return svg;
  }

  private generateWaterfallChart(data: ChartData, width: number, height: number, config: ChartConfig): string {
    let svg = '';
    const values = data.datasets[0]?.data as number[] || [];
    const barWidth = (width / values.length) * 0.7;
    const barSpacing = (width / values.length) * 0.3;

    let cumulative = 0;
    const allValues = [0];
    for (const v of values) {
      cumulative += v;
      allValues.push(cumulative);
    }

    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const range = max - min || 1;

    svg += this.generateGridLines(width, height, config);

    cumulative = 0;
    for (let i = 0; i < values.length; i++) {
      const prev = cumulative;
      cumulative += values[i];

      const x = i * (barWidth + barSpacing) + barSpacing / 2;
      const y1 = height - ((prev - min) / range) * height;
      const y2 = height - ((cumulative - min) / range) * height;
      const barY = Math.min(y1, y2);
      const barH = Math.abs(y1 - y2);
      const color = values[i] >= 0 ? config.theme.colorPalette[0] : config.theme.colorPalette[3];

      svg += `<rect x="${x}" y="${barY}" width="${barWidth}" height="${barH}" fill="${color}" rx="2" />`;

      // Connector line
      if (i < values.length - 1) {
        const nextX = (i + 1) * (barWidth + barSpacing) + barSpacing / 2;
        svg += `<line x1="${x + barWidth}" y1="${y2}" x2="${nextX}" y2="${y2}" stroke="${config.theme.gridColor}" stroke-width="1" stroke-dasharray="3,3" />`;
      }

      // Label
      svg += `<text x="${x + barWidth / 2}" y="${barY - 5}" text-anchor="middle" fill="${config.theme.textColor}" font-size="11">${values[i] > 0 ? '+' : ''}${values[i]}</text>`;
    }

    return svg;
  }

  private generateTreemap(data: ChartData, width: number, height: number, config: ChartConfig): string {
    let svg = '';
    const values = data.datasets[0]?.data as number[] || [];
    const total = values.reduce((sum, v) => sum + v, 0) || 1;

    // Simple squarified treemap using horizontal slicing
    let currentX = 0;
    let currentY = 0;
    let remainingWidth = width;
    let remainingHeight = height;
    let isHorizontal = true;

    const items = values.map((v, i) => ({ value: v, index: i })).sort((a, b) => b.value - a.value);
    let remainingTotal = total;

    for (const item of items) {
      const fraction = item.value / remainingTotal;
      const color = config.theme.colorPalette[item.index % config.theme.colorPalette.length];

      let rectW: number, rectH: number;
      if (isHorizontal) {
        rectW = remainingWidth * fraction;
        rectH = remainingHeight;
      } else {
        rectW = remainingWidth;
        rectH = remainingHeight * fraction;
      }

      svg += `<rect x="${currentX}" y="${currentY}" width="${rectW}" height="${rectH}" fill="${color}" stroke="${config.theme.backgroundColor}" stroke-width="2" rx="2" />`;

      if (rectW > 50 && rectH > 25) {
        svg += `<text x="${currentX + rectW / 2}" y="${currentY + rectH / 2}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="12" font-weight="600">${data.labels[item.index]}</text>`;
        svg += `<text x="${currentX + rectW / 2}" y="${currentY + rectH / 2 + 14}" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="10">${item.value}</text>`;
      }

      if (isHorizontal) {
        currentX += rectW;
        remainingWidth -= rectW;
      } else {
        currentY += rectH;
        remainingHeight -= rectH;
      }

      remainingTotal -= item.value;
      isHorizontal = !isHorizontal;
    }

    return svg;
  }

  // ---------------------------------------------------------------------------
  // Chart Helpers
  // ---------------------------------------------------------------------------

  private generateTitle(config: ChartTitleConfig, width: number): string {
    const x = config.align === 'start' ? 20 : config.align === 'end' ? width - 20 : width / 2;
    const anchor = config.align === 'start' ? 'start' : config.align === 'end' ? 'end' : 'middle';

    return `<text x="${x}" y="${config.padding + config.fontSize}" text-anchor="${anchor}" fill="${config.color}" font-size="${config.fontSize}" font-weight="${config.fontWeight}">${config.text}</text>`;
  }

  private generateLegend(data: ChartData, legend: LegendConfig, width: number, height: number, theme: ChartTheme): string {
    let svg = '';
    const items = data.datasets.map((d, i) => ({
      label: d.label,
      color: d.color || theme.colorPalette[i % theme.colorPalette.length],
    }));

    let x = legend.position === 'right' ? width - 100 : 20;
    let y = legend.position === 'bottom' ? height - 20 : 15;

    for (const item of items) {
      if (legend.symbolShape === 'circle') {
        svg += `<circle cx="${x + 6}" cy="${y}" r="${legend.symbolSize / 2}" fill="${item.color}" />`;
      } else {
        svg += `<rect x="${x}" y="${y - legend.symbolSize / 2}" width="${legend.symbolSize}" height="${legend.symbolSize}" fill="${item.color}" rx="2" />`;
      }

      svg += `<text x="${x + legend.symbolSize + 6}" y="${y + 4}" fill="${legend.color}" font-size="${legend.fontSize}">${item.label}</text>`;

      if (legend.position === 'top' || legend.position === 'bottom') {
        x += legend.symbolSize + item.label.length * 8 + legend.itemSpacing;
      } else {
        y += legend.symbolSize + legend.itemSpacing;
      }
    }

    return svg;
  }

  private generateGridLines(width: number, height: number, config: ChartConfig): string {
    let svg = '';
    const gridConfig = config.options.grid;
    if (!gridConfig?.display) return svg;

    const gridColor = gridConfig.color || config.theme.gridColor;
    const lineWidth = gridConfig.lineWidth || 1;
    const dash = gridConfig.dash ? `stroke-dasharray="${gridConfig.dash.join(',')}"` : '';

    // Horizontal lines
    if (gridConfig.horizontal !== false) {
      for (let i = 0; i <= 5; i++) {
        const y = (i / 5) * height;
        svg += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${gridColor}" stroke-width="${lineWidth}" ${dash} />`;
      }
    }

    // Vertical lines
    if (gridConfig.vertical !== false) {
      for (let i = 0; i <= 5; i++) {
        const x = (i / 5) * width;
        svg += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${gridColor}" stroke-width="${lineWidth}" ${dash} />`;
      }
    }

    return svg;
  }

  private generateAxes(data: ChartData, width: number, height: number, config: ChartConfig, yMin: number, yMax: number): string {
    let svg = '';
    const axisColor = config.theme.axisColor;

    // X axis
    if (config.options.xAxis?.display !== false) {
      svg += `<line x1="0" y1="${height}" x2="${width}" y2="${height}" stroke="${axisColor}" stroke-width="1" />`;

      for (let i = 0; i < data.labels.length; i++) {
        const x = (i / Math.max(1, data.labels.length - 1)) * width;
        const rotation = config.options.xAxis?.ticks?.rotation || 0;
        const transform = rotation ? `transform="rotate(${rotation} ${x} ${height + 15})"` : '';
        svg += `<text x="${x}" y="${height + 18}" text-anchor="middle" fill="${axisColor}" font-size="11" ${transform}>${data.labels[i]}</text>`;
      }
    }

    // Y axis
    if (config.options.yAxis?.display !== false) {
      svg += `<line x1="0" y1="0" x2="0" y2="${height}" stroke="${axisColor}" stroke-width="1" />`;

      const ticks = config.options.yAxis?.ticks?.count || 5;
      const prefix = config.options.yAxis?.ticks?.prefix || '';
      const suffix = config.options.yAxis?.ticks?.suffix || '';

      for (let i = 0; i <= ticks; i++) {
        const value = yMin + (i / ticks) * (yMax - yMin);
        const y = height - (i / ticks) * height;
        const formatted = config.options.yAxis?.ticks?.formatter
          ? config.options.yAxis.ticks.formatter(value)
          : `${prefix}${Math.round(value)}${suffix}`;

        svg += `<text x="-8" y="${y + 4}" text-anchor="end" fill="${axisColor}" font-size="11">${formatted}</text>`;
      }
    }

    return svg;
  }

  // ---------------------------------------------------------------------------
  // Utility Methods
  // ---------------------------------------------------------------------------

  private getDataRange(data: ChartData): { yMin: number; yMax: number } {
    let yMin = Infinity;
    let yMax = -Infinity;

    for (const dataset of data.datasets) {
      if (dataset.hidden) continue;
      const values = dataset.data as number[];
      for (const v of values) {
        if (typeof v === 'number') {
          yMin = Math.min(yMin, v);
          yMax = Math.max(yMax, v);
        }
      }
    }

    if (yMin === Infinity) { yMin = 0; yMax = 100; }
    if (yMin > 0) yMin = 0; // Always start from 0
    yMax = yMax * 1.1; // Add 10% padding

    return { yMin, yMax };
  }

  private smoothPath(points: Array<{ x: number; y: number }>, tension: number): string {
    if (points.length < 2) return '';

    let path = `M${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const cp1x = points[i].x + (points[i + 1].x - points[i].x) * tension;
      const cp1y = points[i].y;
      const cp2x = points[i + 1].x - (points[i + 1].x - points[i].x) * tension;
      const cp2y = points[i + 1].y;
      path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i + 1].x},${points[i + 1].y}`;
    }
    return path;
  }

  private describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number, color: string, strokeWidth: number): string {
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;

    return `<path d="M${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" />`;
  }

  private getGaugeColor(progress: number, config: ChartConfig): string {
    if (progress < 0.33) return config.theme.colorPalette[3] || '#EF4444';
    if (progress < 0.67) return config.theme.colorPalette[2] || '#F59E0B';
    return config.theme.colorPalette[1] || '#10B981';
  }

  private interpolateColor(color1: string, color2: string, factor: number): string {
    const c1 = this.hexToRGB(color1);
    const c2 = this.hexToRGB(color2);

    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);

    return `rgb(${r}, ${g}, ${b})`;
  }

  private hexToRGB(hex: string): { r: number; g: number; b: number } {
    hex = hex.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
    };
  }

  private mergeDefaults(config: Partial<ChartConfig>): ChartConfig {
    return {
      type: config.type || 'bar',
      width: config.width || 600,
      height: config.height || 400,
      responsive: config.responsive ?? true,
      padding: config.padding || { top: 40, right: 20, bottom: 40, left: 50 },
      theme: config.theme || CHART_THEMES.default,
      animation: config.animation || { enabled: true, duration: 600, easing: 'ease-out', type: 'grow' },
      interactions: config.interactions || { hover: true, click: true, zoom: false, pan: false, crosshair: false, brush: false, select: false },
      data: config.data || { labels: [], datasets: [] },
      options: {
        title: config.options?.title || { text: '', display: false, position: 'top', fontSize: 16, fontWeight: 600, color: '#333', padding: 10, align: 'center' },
        legend: config.options?.legend || { display: true, position: 'top', align: 'center', fontSize: 12, color: '#666', itemSpacing: 20, symbolSize: 10, symbolShape: 'square', interactive: true },
        tooltip: config.options?.tooltip || { enabled: true, mode: 'nearest', position: 'nearest', backgroundColor: '#1a202c', textColor: '#ffffff', borderColor: '#4a5568', borderRadius: 6, padding: 8, fontSize: 12, followCursor: false },
        xAxis: config.options?.xAxis || { display: true, type: 'category' },
        yAxis: config.options?.yAxis || { display: true, type: 'linear' },
        grid: config.options?.grid || { display: true, horizontal: true, vertical: false, color: '#e5e7eb', lineWidth: 1 },
        datalabels: config.options?.datalabels || { display: false, position: 'top', fontSize: 11, color: '#333' },
        annotations: config.options?.annotations || [],
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Data Transformations
  // ---------------------------------------------------------------------------

  calculateStatistics(data: number[]): DataStatistics {
    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const variance = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;

    return {
      count: n,
      sum,
      mean,
      median: n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)],
      mode: this.calculateMode(sorted),
      min: sorted[0],
      max: sorted[n - 1],
      range: sorted[n - 1] - sorted[0],
      variance,
      stdDev: Math.sqrt(variance),
      q1: sorted[Math.floor(n * 0.25)],
      q3: sorted[Math.floor(n * 0.75)],
      iqr: sorted[Math.floor(n * 0.75)] - sorted[Math.floor(n * 0.25)],
      skewness: sorted.reduce((acc, v) => acc + Math.pow((v - mean) / Math.sqrt(variance), 3), 0) / n,
      kurtosis: sorted.reduce((acc, v) => acc + Math.pow((v - mean) / Math.sqrt(variance), 4), 0) / n - 3,
    };
  }

  normalizeData(data: number[], method: 'min-max' | 'z-score' | 'percentage' = 'min-max'): number[] {
    switch (method) {
      case 'min-max': {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        return data.map(v => (v - min) / range);
      }
      case 'z-score': {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const stdDev = Math.sqrt(data.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / data.length);
        return data.map(v => (v - mean) / (stdDev || 1));
      }
      case 'percentage': {
        const total = data.reduce((a, b) => a + b, 0) || 1;
        return data.map(v => (v / total) * 100);
      }
    }
  }

  movingAverage(data: number[], window: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(window / 2));
      const end = Math.min(data.length, i + Math.ceil(window / 2));
      const slice = data.slice(start, end);
      result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
    }
    return result;
  }

  cumulativeSum(data: number[]): number[] {
    let sum = 0;
    return data.map(v => (sum += v));
  }

  percentageChange(data: number[]): number[] {
    return data.map((v, i) => i === 0 ? 0 : ((v - data[i - 1]) / (data[i - 1] || 1)) * 100);
  }

  // Event system
  on(event: string, handler: (data: unknown) => void): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(handler);
    return () => {
      const handlers = this.listeners.get(event);
      if (handlers) {
        const idx = handlers.indexOf(handler);
        if (idx >= 0) handlers.splice(idx, 1);
      }
    };
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.listeners.get(event);
    if (handlers) handlers.forEach(h => { try { h(data); } catch (e) { console.error(e); } });
  }

  private calculateMode(sorted: number[]): number {
    let maxCount = 0;
    let mode = sorted[0];
    let currentCount = 1;

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === sorted[i - 1]) {
        currentCount++;
      } else {
        if (currentCount > maxCount) {
          maxCount = currentCount;
          mode = sorted[i - 1];
        }
        currentCount = 1;
      }
    }

    if (currentCount > maxCount) mode = sorted[sorted.length - 1];
    return mode;
  }
}

// =============================================================================
// Types (continued)
// =============================================================================

export interface DataStatistics {
  count: number;
  sum: number;
  mean: number;
  median: number;
  mode: number;
  min: number;
  max: number;
  range: number;
  variance: number;
  stdDev: number;
  q1: number;
  q3: number;
  iqr: number;
  skewness: number;
  kurtosis: number;
}

// =============================================================================
// Singleton Instance
// =============================================================================

export const dataVisualization = new DataVisualizationEngine();
