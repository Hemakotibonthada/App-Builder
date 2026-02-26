// =============================================================================
// Custom Hooks Collection - Reusable React hooks for the web builder
// =============================================================================

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// =============================================================================
// useLocalStorage - Persistent state with localStorage
// =============================================================================

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue(prev => {
        const newValue = value instanceof Function ? value(prev) : value;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(newValue));
        }
        return newValue;
      });
    },
    [key]
  );

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// =============================================================================
// useDebounce - Debounced value
// =============================================================================

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// =============================================================================
// useThrottle - Throttled value
// =============================================================================

export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
      return;
    }
    const timer = setTimeout(() => {
      lastUpdated.current = Date.now();
      setThrottledValue(value);
    }, interval - (now - lastUpdated.current));
    return () => clearTimeout(timer);
  }, [value, interval]);

  return throttledValue;
}

// =============================================================================
// useMediaQuery - Responsive breakpoint detection
// =============================================================================

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export function useBreakpoint() {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isLargeDesktop = useMediaQuery('(min-width: 1280px)');

  return useMemo(
    () => ({ isMobile, isTablet, isDesktop, isLargeDesktop }),
    [isMobile, isTablet, isDesktop, isLargeDesktop]
  );
}

// =============================================================================
// useClickOutside - Detect clicks outside element
// =============================================================================

export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}

// =============================================================================
// useIntersectionObserver - Visibility detection
// =============================================================================

export function useIntersectionObserver(
  ref: React.RefObject<HTMLElement | null>,
  options?: IntersectionObserverInit
): IntersectionObserverEntry | null {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry ?? null),
      options
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options?.threshold, options?.root, options?.rootMargin]);

  return entry;
}

// =============================================================================
// useResizeObserver - Element size tracking
// =============================================================================

export function useResizeObserver(
  ref: React.RefObject<HTMLElement | null>
): { width: number; height: number } | null {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}

// =============================================================================
// usePrevious - Previous value tracking
// =============================================================================

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// =============================================================================
// useToggle - Boolean toggle state
// =============================================================================

export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle, setValue];
}

// =============================================================================
// useCopyToClipboard - Copy text to clipboard
// =============================================================================

export function useCopyToClipboard(): [boolean, (text: string) => Promise<boolean>] {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (!navigator.clipboard) {
      // Fallback
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return true;
      } catch {
        return false;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      return false;
    }
  }, []);

  return [copied, copy];
}

// =============================================================================
// useWindowSize - Window dimensions
// =============================================================================

export function useWindowSize(): { width: number; height: number } {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handler = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return size;
}

// =============================================================================
// useScrollPosition - Scroll tracking
// =============================================================================

export function useScrollPosition(): {
  x: number;
  y: number;
  direction: 'up' | 'down' | null;
  isAtTop: boolean;
  isAtBottom: boolean;
} {
  const [position, setPosition] = useState({
    x: 0, y: 0, direction: null as 'up' | 'down' | null,
    isAtTop: true, isAtBottom: false,
  });
  const prevY = useRef(0);

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      const x = window.scrollX;
      const direction = y > prevY.current ? 'down' : y < prevY.current ? 'up' : null;
      const isAtTop = y <= 0;
      const isAtBottom = y + window.innerHeight >= document.documentElement.scrollHeight - 1;

      setPosition({ x, y, direction, isAtTop, isAtBottom });
      prevY.current = y;
    };

    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return position;
}

// =============================================================================
// useHover - Hover state tracking
// =============================================================================

export function useHover<T extends HTMLElement = HTMLElement>(): [
  React.RefObject<T | null>,
  boolean
] {
  const ref = useRef<T | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return [ref, isHovered];
}

// =============================================================================
// useFocusTrap - Trap focus within element
// =============================================================================

export function useFocusTrap(
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled || !ref.current) return;

    const element = ref.current;
    const focusableSelector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = element.querySelectorAll(focusableSelector);
      if (focusableElements.length === 0) return;

      const firstFocusable = focusableElements[0] as HTMLElement;
      const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [ref, enabled]);
}

// =============================================================================
// useColorScheme - OS color scheme detection
// =============================================================================

export function useColorScheme(): 'light' | 'dark' {
  const isDark = useMediaQuery('(prefers-color-scheme: dark)');
  return isDark ? 'dark' : 'light';
}

// =============================================================================
// useInterval - Declarative setInterval
// =============================================================================

export function useInterval(
  callback: () => void,
  delay: number | null
): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// =============================================================================
// useTimeout - Declarative setTimeout
// =============================================================================

export function useTimeout(
  callback: () => void,
  delay: number | null
): { reset: () => void; clear: () => void } {
  const savedCallback = useRef(callback);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const clear = useCallback(() => {
    if (timeoutId.current) clearTimeout(timeoutId.current);
  }, []);

  const reset = useCallback(() => {
    clear();
    if (delay !== null) {
      timeoutId.current = setTimeout(() => savedCallback.current(), delay);
    }
  }, [delay, clear]);

  useEffect(() => {
    reset();
    return clear;
  }, [delay, reset, clear]);

  return { reset, clear };
}

// =============================================================================
// useOnlineStatus - Network online/offline detection
// =============================================================================

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// =============================================================================
// useDocumentTitle - Dynamic document title
// =============================================================================

export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    return () => { document.title = prevTitle; };
  }, [title]);
}

// =============================================================================
// useLockBodyScroll - Lock body scroll
// =============================================================================

export function useLockBodyScroll(locked: boolean = true): void {
  useEffect(() => {
    if (!locked) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [locked]);
}

// =============================================================================
// useEventListener - Typed event listener hook
// =============================================================================

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: HTMLElement | Window | null,
  options?: AddEventListenerOptions
): void {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const target = element ?? window;
    if (!target?.addEventListener) return;

    const listener = (event: Event) => savedHandler.current(event as WindowEventMap[K]);

    target.addEventListener(eventName, listener, options);
    return () => target.removeEventListener(eventName, listener, options);
  }, [eventName, element, options]);
}

// =============================================================================
// useMeasure - Element measurement hook
// =============================================================================

export interface UseMeasureResult {
  ref: React.RefObject<HTMLElement | null>;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export function useMeasure(): UseMeasureResult {
  const ref = useRef<HTMLElement | null>(null);
  const [bounds, setBounds] = useState({
    x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0,
  });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const rect = entry.target.getBoundingClientRect();
      setBounds({
        x: rect.x, y: rect.y,
        width: rect.width, height: rect.height,
        top: rect.top, right: rect.right,
        bottom: rect.bottom, left: rect.left,
      });
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, bounds };
}
