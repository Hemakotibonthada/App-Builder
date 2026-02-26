/**
 * Layout System — Advanced Layout Components
 * 
 * Provides flexbox, grid, responsive, and advanced layout
 * primitives for the AppBuilder canvas and generated apps.
 * Includes masonry, waterfall, split pane, and dock layouts.
 */

'use client';

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  createContext,
  useContext,
} from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { clsx } from 'clsx';

/* ──────────────────────────────────────────────
 * Responsive Context
 * ────────────────────────────────────────────── */

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpointValues: Record<Breakpoint, number> = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

interface ResponsiveContextValue {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isAbove: (bp: Breakpoint) => boolean;
  isBelow: (bp: Breakpoint) => boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const ResponsiveContext = createContext<ResponsiveContextValue>({
  width: 1024,
  height: 768,
  breakpoint: 'lg',
  isAbove: () => true,
  isBelow: () => false,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
});

export function useResponsive() {
  return useContext(ResponsiveContext);
}

export function ResponsiveProvider({ children }: { children: React.ReactNode }) {
  const [dimensions, setDimensions] = useState({ width: 1024, height: 768 });

  useEffect(() => {
    const update = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const breakpoint = useMemo((): Breakpoint => {
    const w = dimensions.width;
    if (w >= breakpointValues['2xl']) return '2xl';
    if (w >= breakpointValues.xl) return 'xl';
    if (w >= breakpointValues.lg) return 'lg';
    if (w >= breakpointValues.md) return 'md';
    if (w >= breakpointValues.sm) return 'sm';
    return 'xs';
  }, [dimensions.width]);

  const isAbove = useCallback((bp: Breakpoint) => dimensions.width >= breakpointValues[bp], [dimensions.width]);
  const isBelow = useCallback((bp: Breakpoint) => dimensions.width < breakpointValues[bp], [dimensions.width]);

  const value: ResponsiveContextValue = {
    ...dimensions,
    breakpoint,
    isAbove,
    isBelow,
    isMobile: dimensions.width < breakpointValues.md,
    isTablet: dimensions.width >= breakpointValues.md && dimensions.width < breakpointValues.lg,
    isDesktop: dimensions.width >= breakpointValues.lg,
  };

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
}

/* ──────────────────────────────────────────────
 * FlexLayout Component
 * ────────────────────────────────────────────── */

interface FlexLayoutProps {
  children: React.ReactNode;
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  wrap?: boolean | 'reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  gap?: number | string;
  padding?: number | string;
  className?: string;
  style?: React.CSSProperties;
  animate?: boolean;
}

export function FlexLayout({
  children,
  direction = 'row',
  wrap = false,
  justify = 'start',
  align = 'stretch',
  gap = 0,
  padding = 0,
  className,
  style,
  animate = false,
}: FlexLayoutProps) {
  const justifyMap = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  };

  const alignMap = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    stretch: 'stretch',
    baseline: 'baseline',
  };

  const Wrapper = animate ? motion.div : 'div';

  return (
    <Wrapper
      className={clsx('flex', className)}
      style={{
        flexDirection: direction,
        flexWrap: wrap === true ? 'wrap' : wrap === 'reverse' ? 'wrap-reverse' : 'nowrap',
        justifyContent: justifyMap[justify],
        alignItems: alignMap[align],
        gap: typeof gap === 'number' ? `${gap}px` : gap,
        padding: typeof padding === 'number' ? `${padding}px` : padding,
        ...style,
      }}
      {...(animate ? { layout: true } : {})}
    >
      {children}
    </Wrapper>
  );
}

/* ──────────────────────────────────────────────
 * GridLayout Component
 * ────────────────────────────────────────────── */

interface GridLayoutProps {
  children: React.ReactNode;
  columns?: number | string | Record<Breakpoint, number | string>;
  rows?: number | string;
  gap?: number | string;
  rowGap?: number | string;
  colGap?: number | string;
  autoFlow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  autoRows?: string;
  autoCols?: string;
  areas?: string[];
  justify?: 'start' | 'end' | 'center' | 'stretch';
  align?: 'start' | 'end' | 'center' | 'stretch';
  className?: string;
  style?: React.CSSProperties;
  animate?: boolean;
}

export function GridLayout({
  children,
  columns = 1,
  rows,
  gap = 0,
  rowGap,
  colGap,
  autoFlow = 'row',
  autoRows,
  autoCols,
  areas,
  justify = 'stretch',
  align = 'stretch',
  className,
  style,
  animate = false,
}: GridLayoutProps) {
  const { breakpoint } = useResponsive();

  const resolvedColumns = useMemo(() => {
    if (typeof columns === 'object') {
      const bps: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
      const bpIndex = bps.indexOf(breakpoint);
      for (let i = bpIndex; i < bps.length; i++) {
        const val = columns[bps[i]];
        if (val !== undefined) return val;
      }
      return columns.xs ?? 1;
    }
    return columns;
  }, [columns, breakpoint]);

  const gridTemplateColumns = typeof resolvedColumns === 'number'
    ? `repeat(${resolvedColumns}, minmax(0, 1fr))`
    : resolvedColumns;

  const gridTemplateRows = typeof rows === 'number'
    ? `repeat(${rows}, minmax(0, 1fr))`
    : rows;

  const Wrapper = animate ? motion.div : 'div';

  return (
    <Wrapper
      className={clsx('grid', className)}
      style={{
        gridTemplateColumns,
        gridTemplateRows,
        gap: typeof gap === 'number' ? `${gap}px` : gap,
        rowGap: rowGap !== undefined ? (typeof rowGap === 'number' ? `${rowGap}px` : rowGap) : undefined,
        columnGap: colGap !== undefined ? (typeof colGap === 'number' ? `${colGap}px` : colGap) : undefined,
        gridAutoFlow: autoFlow,
        gridAutoRows: autoRows,
        gridAutoColumns: autoCols,
        gridTemplateAreas: areas?.map(a => `"${a}"`).join(' '),
        justifyItems: justify,
        alignItems: align,
        ...style,
      }}
      {...(animate ? { layout: true } : {})}
    >
      {children}
    </Wrapper>
  );
}

/* ──────────────────────────────────────────────
 * GridItem Component
 * ────────────────────────────────────────────── */

interface GridItemProps {
  children: React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
  colStart?: number;
  colEnd?: number;
  rowStart?: number;
  rowEnd?: number;
  area?: string;
  justify?: 'start' | 'end' | 'center' | 'stretch';
  align?: 'start' | 'end' | 'center' | 'stretch';
  className?: string;
  style?: React.CSSProperties;
}

export function GridItem({
  children,
  colSpan,
  rowSpan,
  colStart,
  colEnd,
  rowStart,
  rowEnd,
  area,
  justify,
  align,
  className,
  style,
}: GridItemProps) {
  return (
    <div
      className={className}
      style={{
        gridColumn: colSpan ? `span ${colSpan}` : colStart ? `${colStart} / ${colEnd ?? 'auto'}` : undefined,
        gridRow: rowSpan ? `span ${rowSpan}` : rowStart ? `${rowStart} / ${rowEnd ?? 'auto'}` : undefined,
        gridArea: area,
        justifySelf: justify,
        alignSelf: align,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * SplitPane Component
 * ────────────────────────────────────────────── */

interface SplitPaneProps {
  children: [React.ReactNode, React.ReactNode];
  direction?: 'horizontal' | 'vertical';
  defaultSplit?: number; // percentage 0-100
  minSize?: number; // px
  maxSize?: number; // px
  collapsible?: boolean;
  onResize?: (size: number) => void;
  className?: string;
}

export function SplitPane({
  children,
  direction = 'horizontal',
  defaultSplit = 50,
  minSize = 100,
  maxSize,
  collapsible = false,
  onResize,
  className,
}: SplitPaneProps) {
  const [split, setSplit] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    const handleMouseMove = (e: MouseEvent) => {
      let pct: number;
      if (direction === 'horizontal') {
        pct = ((e.clientX - rect.left) / rect.width) * 100;
      } else {
        pct = ((e.clientY - rect.top) / rect.height) * 100;
      }

      // Clamp
      const containerSize = direction === 'horizontal' ? rect.width : rect.height;
      const minPct = (minSize / containerSize) * 100;
      const maxPct = maxSize ? (maxSize / containerSize) * 100 : 100 - minPct;
      pct = Math.max(minPct, Math.min(maxPct, pct));

      setSplit(pct);
      onResize?.(pct);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [direction, minSize, maxSize, onResize]);

  const effectiveSplit = isCollapsed ? 0 : split;

  return (
    <div
      ref={containerRef}
      className={clsx(
        'flex relative overflow-hidden',
        direction === 'horizontal' ? 'flex-row' : 'flex-col',
        className,
      )}
    >
      {/* Pane 1 */}
      <div
        style={{
          [direction === 'horizontal' ? 'width' : 'height']: `${effectiveSplit}%`,
          flexShrink: 0,
          overflow: 'auto',
        }}
        className="transition-all duration-75"
      >
        {children[0]}
      </div>

      {/* Divider */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={() => collapsible && setIsCollapsed(!isCollapsed)}
        className={clsx(
          'relative flex items-center justify-center group',
          direction === 'horizontal'
            ? 'w-1 cursor-col-resize hover:w-1.5'
            : 'h-1 cursor-row-resize hover:h-1.5',
          isDragging ? 'bg-indigo-500' : 'bg-white/10 hover:bg-indigo-400/50',
          'transition-all duration-150 z-10',
        )}
      >
        {/* Drag handle dots */}
        <div className={clsx(
          'absolute opacity-0 group-hover:opacity-100 transition-opacity',
          direction === 'horizontal' ? 'flex flex-col gap-1' : 'flex flex-row gap-1',
        )}>
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1 h-1 rounded-full bg-white/40" />
          ))}
        </div>
      </div>

      {/* Pane 2 */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
        }}
      >
        {children[1]}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Masonry Layout
 * ────────────────────────────────────────────── */

interface MasonryLayoutProps {
  children: React.ReactNode[];
  columns?: number | Record<Breakpoint, number>;
  gap?: number;
  className?: string;
}

export function MasonryLayout({
  children,
  columns = 3,
  gap = 16,
  className,
}: MasonryLayoutProps) {
  const { breakpoint } = useResponsive();

  const colCount = useMemo(() => {
    if (typeof columns === 'number') return columns;
    const bps: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
    const bpIndex = bps.indexOf(breakpoint);
    for (let i = bpIndex; i < bps.length; i++) {
      const val = columns[bps[i]];
      if (val !== undefined) return val;
    }
    return columns.xs ?? 2;
  }, [columns, breakpoint]);

  // Distribute children into columns
  const columnItems = useMemo(() => {
    const cols: React.ReactNode[][] = Array.from({ length: colCount }, () => []);
    React.Children.forEach(children, (child, i) => {
      cols[i % colCount].push(child);
    });
    return cols;
  }, [children, colCount]);

  return (
    <div
      className={clsx('flex', className)}
      style={{ gap: `${gap}px` }}
    >
      {columnItems.map((items, colIdx) => (
        <div
          key={colIdx}
          className="flex flex-col flex-1"
          style={{ gap: `${gap}px` }}
        >
          {items.map((item, itemIdx) => (
            <motion.div
              key={itemIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (colIdx * items.length + itemIdx) * 0.05 }}
            >
              {item}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Stack Layout (Overlapping Children)
 * ────────────────────────────────────────────── */

interface StackLayoutProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  justify?: 'start' | 'center' | 'end';
  offset?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export function StackLayout({
  children,
  align = 'center',
  justify = 'center',
  offset = 0,
  direction = 'down',
  className,
}: StackLayoutProps) {
  const alignMap = { start: 'items-start', center: 'items-center', end: 'items-end' };
  const justifyMap = { start: 'justify-start', center: 'justify-center', end: 'justify-end' };

  return (
    <div className={clsx('relative', alignMap[align], justifyMap[justify], className)}>
      {React.Children.map(children, (child, i) => {
        const style: React.CSSProperties = { position: i === 0 ? 'relative' : 'absolute' };
        if (offset && i > 0) {
          switch (direction) {
            case 'down': style.top = `${i * offset}px`; break;
            case 'up': style.bottom = `${i * offset}px`; break;
            case 'right': style.left = `${i * offset}px`; break;
            case 'left': style.right = `${i * offset}px`; break;
          }
        }
        return (
          <div style={{ ...style, zIndex: React.Children.count(children) - i }}>
            {child}
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Dock Layout
 * ────────────────────────────────────────────── */

interface DockLayoutProps {
  children: React.ReactNode;
  top?: React.ReactNode;
  bottom?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  topHeight?: number | string;
  bottomHeight?: number | string;
  leftWidth?: number | string;
  rightWidth?: number | string;
  className?: string;
}

export function DockLayout({
  children,
  top,
  bottom,
  left,
  right,
  topHeight = 'auto',
  bottomHeight = 'auto',
  leftWidth = 250,
  rightWidth = 300,
  className,
}: DockLayoutProps) {
  return (
    <div className={clsx('flex flex-col h-full', className)}>
      {/* Top rail */}
      {top && (
        <div style={{ height: typeof topHeight === 'number' ? `${topHeight}px` : topHeight, flexShrink: 0 }}>
          {top}
        </div>
      )}

      {/* Middle row */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        {left && (
          <div style={{ width: typeof leftWidth === 'number' ? `${leftWidth}px` : leftWidth, flexShrink: 0 }} className="overflow-auto">
            {left}
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {/* Right panel */}
        {right && (
          <div style={{ width: typeof rightWidth === 'number' ? `${rightWidth}px` : rightWidth, flexShrink: 0 }} className="overflow-auto">
            {right}
          </div>
        )}
      </div>

      {/* Bottom rail */}
      {bottom && (
        <div style={{ height: typeof bottomHeight === 'number' ? `${bottomHeight}px` : bottomHeight, flexShrink: 0 }}>
          {bottom}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Scroll Container
 * ────────────────────────────────────────────── */

interface ScrollContainerProps {
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal' | 'both';
  hideScrollbar?: boolean;
  fadeEdges?: boolean;
  onScroll?: (position: { x: number; y: number; xPercent: number; yPercent: number }) => void;
  onReachEnd?: () => void;
  endThreshold?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function ScrollContainer({
  children,
  direction = 'vertical',
  hideScrollbar = false,
  fadeEdges = false,
  onScroll,
  onReachEnd,
  endThreshold = 50,
  className,
  style,
}: ScrollContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    atTop: true,
    atBottom: false,
    atLeft: true,
    atRight: false,
  });

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = el;

    setScrollState({
      atTop: scrollTop <= 0,
      atBottom: scrollTop + clientHeight >= scrollHeight - 1,
      atLeft: scrollLeft <= 0,
      atRight: scrollLeft + clientWidth >= scrollWidth - 1,
    });

    onScroll?.({
      x: scrollLeft,
      y: scrollTop,
      xPercent: scrollWidth > clientWidth ? scrollLeft / (scrollWidth - clientWidth) : 0,
      yPercent: scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0,
    });

    // Infinite scroll
    if (onReachEnd) {
      const isNearEnd = direction === 'horizontal'
        ? scrollLeft + clientWidth >= scrollWidth - endThreshold
        : scrollTop + clientHeight >= scrollHeight - endThreshold;
      if (isNearEnd) onReachEnd();
    }
  }, [direction, endThreshold, onScroll, onReachEnd]);

  return (
    <div className={clsx('relative', className)}>
      {fadeEdges && direction !== 'horizontal' && !scrollState.atTop && (
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-900 to-transparent z-10 pointer-events-none" />
      )}
      <div
        ref={ref}
        onScroll={handleScroll}
        className={clsx(
          direction === 'vertical' && 'overflow-y-auto overflow-x-hidden',
          direction === 'horizontal' && 'overflow-x-auto overflow-y-hidden',
          direction === 'both' && 'overflow-auto',
          hideScrollbar && 'scrollbar-none',
          !hideScrollbar && 'scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent',
        )}
        style={style}
      >
        {children}
      </div>
      {fadeEdges && direction !== 'horizontal' && !scrollState.atBottom && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none" />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Accordion / Collapsible Sections
 * ────────────────────────────────────────────── */

interface AccordionItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  variant?: 'default' | 'bordered' | 'ghost' | 'card';
  className?: string;
}

export function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  variant = 'default',
  className,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggleItem = useCallback((id: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }, [allowMultiple]);

  const variantClasses = {
    default: {
      container: 'divide-y divide-white/10',
      item: '',
      header: 'px-4 py-3 hover:bg-white/3',
      content: 'px-4 pb-4',
    },
    bordered: {
      container: 'border border-white/10 rounded-lg overflow-hidden divide-y divide-white/10',
      item: '',
      header: 'px-4 py-3 hover:bg-white/3',
      content: 'px-4 pb-4',
    },
    ghost: {
      container: 'space-y-1',
      item: '',
      header: 'px-3 py-2 rounded-lg hover:bg-white/5',
      content: 'px-3 pb-3',
    },
    card: {
      container: 'space-y-2',
      item: 'border border-white/10 rounded-lg overflow-hidden',
      header: 'px-4 py-3 hover:bg-white/3',
      content: 'px-4 pb-4',
    },
  };

  const styles = variantClasses[variant];

  return (
    <div className={clsx(styles.container, className)}>
      {items.map((item) => {
        const isOpen = openItems.has(item.id);
        return (
          <div key={item.id} className={styles.item}>
            <button
              type="button"
              onClick={() => !item.disabled && toggleItem(item.id)}
              className={clsx(
                'w-full flex items-center justify-between text-left transition-colors',
                styles.header,
                item.disabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                {item.icon && <span className="text-white/40 flex-shrink-0">{item.icon}</span>}
                <div className="min-w-0">
                  <span className="text-sm font-medium text-white/80 block truncate">{item.title}</span>
                  {item.subtitle && (
                    <span className="text-[10px] text-white/40 block truncate">{item.subtitle}</span>
                  )}
                </div>
              </div>
              <motion.svg
                className="w-4 h-4 text-white/30 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path d="M6 9l6 6 6-6" />
              </motion.svg>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className={styles.content}>
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Tab Panel Component
 * ────────────────────────────────────────────── */

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabPanelProps {
  tabs: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'enclosed' | 'segment';
  size?: 'sm' | 'md' | 'lg';
  position?: 'top' | 'bottom' | 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
}

export function TabPanel({
  tabs,
  defaultTab,
  onChange,
  variant = 'underline',
  size = 'md',
  position = 'top',
  fullWidth = false,
  className,
}: TabPanelProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? '');

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  }, [onChange]);

  const activeContent = tabs.find(t => t.id === activeTab)?.content;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-sm px-3.5 py-2',
    lg: 'text-base px-4 py-2.5',
  };

  const renderTabs = () => {
    const isVertical = position === 'left' || position === 'right';

    return (
      <div className={clsx(
        'flex',
        isVertical ? 'flex-col' : 'flex-row',
        variant === 'underline' && !isVertical && 'border-b border-white/10',
        variant === 'enclosed' && 'bg-white/5 rounded-lg p-1',
        variant === 'segment' && 'bg-white/5 rounded-lg p-0.5',
        fullWidth && !isVertical && '[&>*]:flex-1',
      )}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <motion.button
              key={tab.id}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              disabled={tab.disabled}
              className={clsx(
                'relative flex items-center justify-center gap-1.5 font-medium transition-all',
                sizeClasses[size],
                tab.disabled && 'opacity-40 cursor-not-allowed',

                // Variant styles
                variant === 'underline' && clsx(
                  isActive
                    ? 'text-indigo-400'
                    : 'text-white/50 hover:text-white/70',
                ),
                variant === 'pills' && clsx(
                  isActive
                    ? 'bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-500/20'
                    : 'text-white/50 hover:text-white/70 hover:bg-white/5 rounded-lg',
                ),
                variant === 'enclosed' && clsx(
                  isActive
                    ? 'bg-white/10 text-white rounded-md shadow-sm'
                    : 'text-white/50 hover:text-white/70 rounded-md',
                ),
                variant === 'segment' && clsx(
                  isActive
                    ? 'bg-indigo-500 text-white rounded-md shadow-sm'
                    : 'text-white/50 hover:text-white/70 rounded-md',
                ),
              )}
              whileHover={{ scale: tab.disabled ? 1 : 1.02 }}
              whileTap={{ scale: tab.disabled ? 1 : 0.98 }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={clsx(
                  'ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-bold',
                  isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/40',
                )}>
                  {tab.badge}
                </span>
              )}
              {/* Underline indicator */}
              {variant === 'underline' && isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400 rounded-full"
                  layoutId="tab-underline"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    );
  };

  const isVertical = position === 'left' || position === 'right';

  return (
    <div className={clsx(
      'flex',
      isVertical ? 'flex-row' : 'flex-col',
      position === 'right' && 'flex-row-reverse',
      position === 'bottom' && 'flex-col-reverse',
      className,
    )}>
      {renderTabs()}
      <div className={clsx('flex-1', isVertical ? 'ml-4' : 'mt-3')}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {activeContent}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Resizable Box
 * ────────────────────────────────────────────── */

interface ResizableBoxProps {
  children: React.ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  handles?: ('n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw')[];
  onResize?: (size: { width: number; height: number }) => void;
  className?: string;
}

export function ResizableBox({
  children,
  defaultWidth = 200,
  defaultHeight = 200,
  minWidth = 50,
  minHeight = 50,
  maxWidth = 1000,
  maxHeight = 1000,
  handles = ['se'],
  onResize,
  className,
}: ResizableBoxProps) {
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [isResizing, setIsResizing] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const startResize = useCallback((
    e: React.MouseEvent,
    handle: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = { ...size };

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const newSize = { ...startSize };

      if (handle.includes('e')) newSize.width = Math.min(maxWidth, Math.max(minWidth, startSize.width + dx));
      if (handle.includes('w')) newSize.width = Math.min(maxWidth, Math.max(minWidth, startSize.width - dx));
      if (handle.includes('s')) newSize.height = Math.min(maxHeight, Math.max(minHeight, startSize.height + dy));
      if (handle.includes('n')) newSize.height = Math.min(maxHeight, Math.max(minHeight, startSize.height - dy));

      setSize(newSize);
      onResize?.(newSize);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [size, minWidth, minHeight, maxWidth, maxHeight, onResize]);

  const handleCursors: Record<string, string> = {
    n: 'cursor-n-resize',
    s: 'cursor-s-resize',
    e: 'cursor-e-resize',
    w: 'cursor-w-resize',
    ne: 'cursor-ne-resize',
    nw: 'cursor-nw-resize',
    se: 'cursor-se-resize',
    sw: 'cursor-sw-resize',
  };

  const handlePositions: Record<string, string> = {
    n: 'top-0 left-0 right-0 h-1.5',
    s: 'bottom-0 left-0 right-0 h-1.5',
    e: 'top-0 right-0 bottom-0 w-1.5',
    w: 'top-0 left-0 bottom-0 w-1.5',
    ne: 'top-0 right-0 w-3 h-3',
    nw: 'top-0 left-0 w-3 h-3',
    se: 'bottom-0 right-0 w-3 h-3',
    sw: 'bottom-0 left-0 w-3 h-3',
  };

  return (
    <div
      ref={boxRef}
      className={clsx('relative', className)}
      style={{ width: `${size.width}px`, height: `${size.height}px` }}
    >
      {children}
      {handles.map((handle) => (
        <div
          key={handle}
          onMouseDown={(e) => startResize(e, handle)}
          className={clsx(
            'absolute z-10',
            handleCursors[handle],
            handlePositions[handle],
            isResizing ? 'bg-indigo-500/30' : 'hover:bg-indigo-500/20',
          )}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Drawer Component
 * ────────────────────────────────────────────── */

interface DrawerProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: number | string;
  overlay?: boolean;
  title?: string;
  className?: string;
}

export function Drawer({
  children,
  isOpen,
  onClose,
  position = 'right',
  size = 320,
  overlay = true,
  title,
  className,
}: DrawerProps) {
  const sizeStyle = typeof size === 'number' ? `${size}px` : size;

  const positionStyles = {
    left: { left: 0, top: 0, bottom: 0, width: sizeStyle },
    right: { right: 0, top: 0, bottom: 0, width: sizeStyle },
    top: { top: 0, left: 0, right: 0, height: sizeStyle },
    bottom: { bottom: 0, left: 0, right: 0, height: sizeStyle },
  };

  const slideIn = {
    left: { x: '-100%' },
    right: { x: '100%' },
    top: { y: '-100%' },
    bottom: { y: '100%' },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          {overlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
          )}

          {/* Drawer panel */}
          <motion.div
            initial={slideIn[position]}
            animate={{ x: 0, y: 0 }}
            exit={slideIn[position]}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={clsx(
              'fixed z-50 bg-slate-900 border-white/10 shadow-2xl flex flex-col',
              position === 'left' && 'border-r',
              position === 'right' && 'border-l',
              position === 'top' && 'border-b',
              position === 'bottom' && 'border-t',
              className,
            )}
            style={positionStyles[position]}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <motion.button
                  onClick={onClose}
                  className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ──────────────────────────────────────────────
 * Infinite Scroll Container
 * ────────────────────────────────────────────── */

interface InfiniteScrollProps {
  children: React.ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  loading?: boolean;
  threshold?: number;
  loader?: React.ReactNode;
  className?: string;
}

export function InfiniteScroll({
  children,
  onLoadMore,
  hasMore,
  loading = false,
  threshold = 200,
  loader,
  className,
}: InfiniteScrollProps) {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: `${threshold}px` },
    );

    const el = observerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, loading, onLoadMore, threshold]);

  return (
    <div className={className}>
      {children}
      <div ref={observerRef} className="h-1" />
      {loading && (
        <div className="flex items-center justify-center py-6">
          {loader ?? (
            <motion.div
              className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Aspect Ratio Box
 * ────────────────────────────────────────────── */

interface AspectRatioProps {
  children: React.ReactNode;
  ratio: number; // width / height, e.g., 16/9
  maxWidth?: number | string;
  className?: string;
}

export function AspectRatio({
  children,
  ratio,
  maxWidth,
  className,
}: AspectRatioProps) {
  return (
    <div
      className={clsx('relative overflow-hidden', className)}
      style={{
        maxWidth: maxWidth ? (typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth) : undefined,
      }}
    >
      <div style={{ paddingBottom: `${(1 / ratio) * 100}%` }} />
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
 * Sticky Container
 * ────────────────────────────────────────────── */

interface StickyProps {
  children: React.ReactNode;
  top?: number;
  bottom?: number;
  zIndex?: number;
  className?: string;
}

export function Sticky({
  children,
  top = 0,
  bottom,
  zIndex = 10,
  className,
}: StickyProps) {
  return (
    <div
      className={clsx('sticky', className)}
      style={{
        top: bottom === undefined ? `${top}px` : undefined,
        bottom: bottom !== undefined ? `${bottom}px` : undefined,
        zIndex,
      }}
    >
      {children}
    </div>
  );
}
