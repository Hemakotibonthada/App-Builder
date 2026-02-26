/**
 * Performance Monitor
 * 
 * Real-time FPS, memory, render time tracking.
 * Features: 
 * - FPS counter with history graph
 * - Widget count / visible count
 * - Render time measurement
 * - Memory usage estimation
 * - Performance scoring
 * - Optimization suggestions
 */

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export interface PerformanceSnapshot {
  timestamp: number;
  fps: number;
  frameTime: number;
  widgetCount: number;
  visibleWidgets: number;
  pageCount: number;
  memoryEstimate: number; // bytes
  renderCalls: number;
  domNodes: number;
}

export interface PerformanceScore {
  overall: number; // 0-100
  fps: number;
  widgetComplexity: number;
  memoryUsage: number;
  suggestions: PerformanceSuggestion[];
}

export interface PerformanceSuggestion {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  metric: string;
  currentValue: string;
  targetValue: string;
}

/* ──────────────────────────────────────────────
 * Performance Monitor Class
 * ────────────────────────────────────────────── */

export class PerformanceMonitor {
  private snapshots: PerformanceSnapshot[] = [];
  private maxSnapshots = 120; // 2 seconds at 60fps
  private frameCount = 0;
  private lastTime = 0;
  private fpsHistory: number[] = [];
  private isRunning = false;
  private animFrameId: number | null = null;

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.tick();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private tick = (): void => {
    if (!this.isRunning) return;

    const now = performance.now();
    const delta = now - this.lastTime;

    this.frameCount++;

    if (delta >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / delta);
      this.fpsHistory.push(fps);
      if (this.fpsHistory.length > this.maxSnapshots) this.fpsHistory.shift();
      this.frameCount = 0;
      this.lastTime = now;
    }

    this.animFrameId = requestAnimationFrame(this.tick);
  };

  captureSnapshot(widgetCount: number, visibleWidgets: number, pageCount: number): PerformanceSnapshot {
    const snapshot: PerformanceSnapshot = {
      timestamp: Date.now(),
      fps: this.fpsHistory[this.fpsHistory.length - 1] ?? 60,
      frameTime: this.fpsHistory.length > 0 ? 1000 / (this.fpsHistory[this.fpsHistory.length - 1] ?? 60) : 16.67,
      widgetCount,
      visibleWidgets,
      pageCount,
      memoryEstimate: widgetCount * 2048, // ~2KB per widget
      renderCalls: this.frameCount,
      domNodes: typeof document !== 'undefined' ? document.querySelectorAll('*').length : 0,
    };

    this.snapshots.push(snapshot);
    if (this.snapshots.length > this.maxSnapshots) this.snapshots.shift();

    return snapshot;
  }

  getScore(snapshot: PerformanceSnapshot): PerformanceScore {
    const suggestions: PerformanceSuggestion[] = [];

    // FPS score
    const fpsScore = Math.min(100, (snapshot.fps / 60) * 100);
    if (snapshot.fps < 30) {
      suggestions.push({ severity: 'critical', title: 'Low FPS', description: 'Frame rate is below 30fps. Consider reducing widget count or disabling animations.', metric: 'FPS', currentValue: `${snapshot.fps}`, targetValue: '60' });
    } else if (snapshot.fps < 55) {
      suggestions.push({ severity: 'warning', title: 'Sub-optimal FPS', description: 'Frame rate below 55fps. Try simplifying complex widgets.', metric: 'FPS', currentValue: `${snapshot.fps}`, targetValue: '60' });
    }

    // Widget complexity
    const complexityScore = snapshot.widgetCount <= 50 ? 100 : snapshot.widgetCount <= 100 ? 80 : snapshot.widgetCount <= 200 ? 60 : snapshot.widgetCount <= 500 ? 40 : 20;
    if (snapshot.widgetCount > 200) {
      suggestions.push({ severity: 'warning', title: 'Many widgets', description: `${snapshot.widgetCount} widgets on canvas. Consider grouping or using containers.`, metric: 'Widgets', currentValue: `${snapshot.widgetCount}`, targetValue: '< 100' });
    }
    if (snapshot.widgetCount > 500) {
      suggestions.push({ severity: 'critical', title: 'Too many widgets', description: 'Over 500 widgets may cause performance issues. Split across multiple pages.', metric: 'Widgets', currentValue: `${snapshot.widgetCount}`, targetValue: '< 200' });
    }

    // Memory
    const memMB = snapshot.memoryEstimate / (1024 * 1024);
    const memScore = memMB < 10 ? 100 : memMB < 50 ? 80 : memMB < 100 ? 60 : 40;
    if (memMB > 50) {
      suggestions.push({ severity: 'warning', title: 'High memory usage', description: `Estimated ${memMB.toFixed(1)}MB. Optimize images and reduce widget count.`, metric: 'Memory', currentValue: `${memMB.toFixed(1)}MB`, targetValue: '< 50MB' });
    }

    // DOM nodes
    if (snapshot.domNodes > 5000) {
      suggestions.push({ severity: 'warning', title: 'Large DOM', description: `${snapshot.domNodes} DOM nodes. This can slow down rendering.`, metric: 'DOM Nodes', currentValue: `${snapshot.domNodes}`, targetValue: '< 3000' });
    }

    const overall = Math.round((fpsScore * 0.4 + complexityScore * 0.3 + memScore * 0.3));

    return { overall, fps: fpsScore, widgetComplexity: complexityScore, memoryUsage: memScore, suggestions };
  }

  getHistory(): PerformanceSnapshot[] {
    return [...this.snapshots];
  }

  getFPSHistory(): number[] {
    return [...this.fpsHistory];
  }

  reset(): void {
    this.snapshots = [];
    this.fpsHistory = [];
    this.frameCount = 0;
  }
}

export const performanceMonitor = new PerformanceMonitor();
