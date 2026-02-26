/**
 * Advanced Custom Hooks Library
 * 
 * Production-grade React hooks for the AppBuilder:
 * 1. useDebounce / useThrottle
 * 2. useLocalStorage / useSessionStorage
 * 3. useMediaQuery
 * 4. useIntersectionObserver
 * 5. useResizeObserver
 * 6. useMutationObserver
 * 7. useClickOutside
 * 8. usePrevious
 * 9. useToggle / useCounter
 * 10. useAsync / useFetch
 * 11. useEventListener
 * 12. useInterval / useTimeout
 * 13. useClipboard
 * 14. useFullscreen
 * 15. useGeolocation
 * 16. useOnlineStatus
 * 17. useWindowSize
 * 18. useScrollPosition
 * 19. useLockBodyScroll
 * 20. useHover
 * 21. useFocus
 * 22. useDarkMode
 * 23. usePageVisibility
 * 24. useRenderCount
 * 25. useWhyDidYouUpdate
 * 26. useMeasure
 * 27. useList / useMap / useSet
 * 28. useQueue / useStack
 * 29. useForm
 * 30. useStep
 */

'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useLayoutEffect,
  useReducer,
  MutableRefObject,
  RefObject,
  Dispatch,
  SetStateAction,
} from 'react';

/* ──────────────────────────────────────────────────────────────
 * 1. useDebounce
 * ────────────────────────────────────────────────────────────── */

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): T {
  const callbackRef = useRef(callback);
  const timerRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: any[]) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callbackRef.current(...args), delay);
    }) as T,
    [delay],
  );
}

/* ──────────────────────────────────────────────────────────────
 * 2. useThrottle
 * ────────────────────────────────────────────────────────────── */

export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now - lastUpdated.current >= interval) {
      setThrottledValue(value);
      lastUpdated.current = now;
      return undefined;
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(value);
        lastUpdated.current = Date.now();
      }, interval - (now - lastUpdated.current));
      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  interval: number,
): T {
  const callbackRef = useRef(callback);
  const lastRan = useRef(0);
  const timerRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: any[]) => {
      const now = Date.now();
      if (now - lastRan.current >= interval) {
        callbackRef.current(...args);
        lastRan.current = now;
      } else {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          callbackRef.current(...args);
          lastRan.current = Date.now();
        }, interval - (now - lastRan.current));
      }
    }) as T,
    [interval],
  );
}

/* ──────────────────────────────────────────────────────────────
 * 3. useLocalStorage / useSessionStorage
 * ────────────────────────────────────────────────────────────── */

type StorageType = 'local' | 'session';

function useStorage<T>(
  key: string,
  initialValue: T,
  type: StorageType,
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const getStorage = (): Storage | null => {
    if (typeof window === 'undefined') return null;
    return type === 'local' ? window.localStorage : window.sessionStorage;
  };

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const storage = getStorage();
      if (!storage) return initialValue;
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        const storage = getStorage();
        if (storage) {
          storage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (e) {
        console.warn(`useStorage: Error setting key "${key}":`, e);
      }
    },
    [key, storedValue],
  );

  const removeValue = useCallback(() => {
    try {
      const storage = getStorage();
      if (storage) storage.removeItem(key);
      setStoredValue(initialValue);
    } catch (e) {
      console.warn(`useStorage: Error removing key "${key}":`, e);
    }
  }, [key, initialValue]);

  // Listen for storage events (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.storageArea === getStorage()) {
        try {
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
        } catch {
          setStoredValue(initialValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  return useStorage(key, initialValue, 'local');
}

export function useSessionStorage<T>(key: string, initialValue: T) {
  return useStorage(key, initialValue, 'session');
}

/* ──────────────────────────────────────────────────────────────
 * 4. useMediaQuery
 * ────────────────────────────────────────────────────────────── */

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    setMatches(mediaQuery.matches);
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
    () => ({
      isMobile,
      isTablet,
      isDesktop,
      isLargeDesktop,
      breakpoint: isMobile ? 'sm' : isTablet ? 'md' : isLargeDesktop ? 'xl' : 'lg',
    }),
    [isMobile, isTablet, isDesktop, isLargeDesktop],
  );
}

/* ──────────────────────────────────────────────────────────────
 * 5. useIntersectionObserver
 * ────────────────────────────────────────────────────────────── */

interface IntersectionOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  elementRef: RefObject<Element | null>,
  options: IntersectionOptions = {},
): IntersectionObserverEntry | null {
  const { threshold = 0, root = null, rootMargin = '0%', freezeOnceVisible = false } = options;
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    const node = elementRef.current;
    if (!node || frozen) return;

    const observer = new IntersectionObserver(
      ([e]) => setEntry(e),
      { threshold, root, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [elementRef, threshold, root, rootMargin, frozen]);

  return entry;
}

/* ──────────────────────────────────────────────────────────────
 * 6. useResizeObserver
 * ────────────────────────────────────────────────────────────── */

export interface ResizeObserverEntry2 {
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly left: number;
}

export function useResizeObserver(
  elementRef: RefObject<HTMLElement | null>,
): ResizeObserverEntry2 | null {
  const [size, setSize] = useState<ResizeObserverEntry2 | null>(null);

  useEffect(() => {
    const node = elementRef.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height, top, left } = entry.contentRect;
      setSize({ width, height, top, left });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [elementRef]);

  return size;
}

/* ──────────────────────────────────────────────────────────────
 * 7. useMutationObserver
 * ────────────────────────────────────────────────────────────── */

export function useMutationObserver(
  elementRef: RefObject<HTMLElement | null>,
  callback: MutationCallback,
  options: MutationObserverInit = { childList: true, subtree: true },
): void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const node = elementRef.current;
    if (!node) return;

    const observer = new MutationObserver((...args) => callbackRef.current(...args));
    observer.observe(node, options);
    return () => observer.disconnect();
  }, [elementRef, options]);
}

/* ──────────────────────────────────────────────────────────────
 * 8. useClickOutside
 * ────────────────────────────────────────────────────────────── */

export function useClickOutside(
  refs: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  handler: (event: MouseEvent | TouchEvent) => void,
): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const refsArray = Array.isArray(refs) ? refs : [refs];
      const isOutside = refsArray.every(ref => {
        const el = ref.current;
        return el && !el.contains(event.target as Node);
      });

      if (isOutside) handlerRef.current(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [refs]);
}

/* ──────────────────────────────────────────────────────────────
 * 9. usePrevious
 * ────────────────────────────────────────────────────────────── */

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

/* ──────────────────────────────────────────────────────────────
 * 10. useToggle / useCounter
 * ────────────────────────────────────────────────────────────── */

export function useToggle(
  initialValue: boolean = false,
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle, setValue];
}

export function useCounter(
  initialValue: number = 0,
  options?: { min?: number; max?: number; step?: number },
) {
  const { min = -Infinity, max = Infinity, step = 1 } = options ?? {};
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(c => Math.min(max, c + step));
  }, [max, step]);

  const decrement = useCallback(() => {
    setCount(c => Math.max(min, c - step));
  }, [min, step]);

  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  const set = useCallback(
    (value: number) => setCount(Math.max(min, Math.min(max, value))),
    [min, max],
  );

  return { count, increment, decrement, reset, set };
}

/* ──────────────────────────────────────────────────────────────
 * 11. useAsync / useFetch
 * ────────────────────────────────────────────────────────────── */

export type AsyncState<T> =
  | { status: 'idle'; data: null; error: null; isLoading: false }
  | { status: 'loading'; data: null; error: null; isLoading: true }
  | { status: 'success'; data: T; error: null; isLoading: false }
  | { status: 'error'; data: null; error: Error; isLoading: false };

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: readonly any[] = [],
): AsyncState<T> & { execute: () => Promise<void> } {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(async () => {
    setState({ status: 'loading', data: null, error: null, isLoading: true });
    try {
      const data = await asyncFunction();
      setState({ status: 'success', data, error: null, isLoading: false });
    } catch (error) {
      setState({
        status: 'error',
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
        isLoading: false,
      });
    }
  }, dependencies);

  return { ...state, execute };
}

export function useFetch<T>(
  url: string | null,
  options?: RequestInit,
): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
    isLoading: false,
  });
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!url) return;

    const controller = new AbortController();

    const fetchData = async () => {
      setState({ status: 'loading', data: null, error: null, isLoading: true });
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setState({ status: 'success', data, error: null, isLoading: false });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setState({
            status: 'error',
            data: null,
            error: error instanceof Error ? error : new Error(String(error)),
            isLoading: false,
          });
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, [url, trigger]);

  const refetch = useCallback(() => setTrigger(t => t + 1), []);

  return { ...state, refetch };
}

/* ──────────────────────────────────────────────────────────────
 * 12. useEventListener
 * ────────────────────────────────────────────────────────────── */

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: RefObject<HTMLElement | null>,
  options?: boolean | AddEventListenerOptions,
): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const targetElement = element?.current ?? window;
    if (!targetElement?.addEventListener) return;

    const listener = (event: Event) => handlerRef.current(event as WindowEventMap[K]);
    targetElement.addEventListener(eventName, listener, options);
    return () => targetElement.removeEventListener(eventName, listener, options);
  }, [eventName, element, options]);
}

/* ──────────────────────────────────────────────────────────────
 * 13. useInterval / useTimeout
 * ────────────────────────────────────────────────────────────── */

export function useInterval(callback: () => void, delay: number | null): void {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => callbackRef.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

export function useTimeout(callback: () => void, delay: number | null): {
  reset: () => void;
  clear: () => void;
} {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const set = useCallback(() => {
    if (delay === null) return;
    timeoutRef.current = setTimeout(() => callbackRef.current(), delay);
  }, [delay]);

  const clear = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const reset = useCallback(() => {
    clear();
    set();
  }, [clear, set]);

  useEffect(() => {
    set();
    return clear;
  }, [delay]);

  return { reset, clear };
}

/* ──────────────────────────────────────────────────────────────
 * 14. useClipboard
 * ────────────────────────────────────────────────────────────── */

export function useClipboard(
  timeout: number = 2000,
): {
  copied: boolean;
  copy: (text: string) => Promise<void>;
  error: Error | null;
} {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setError(null);
        setTimeout(() => setCopied(false), timeout);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Copy failed'));
        setCopied(false);
      }
    },
    [timeout],
  );

  return { copied, copy, error };
}

/* ──────────────────────────────────────────────────────────────
 * 15. useFullscreen
 * ────────────────────────────────────────────────────────────── */

export function useFullscreen(
  elementRef: RefObject<HTMLElement | null>,
): {
  isFullscreen: boolean;
  enter: () => Promise<void>;
  exit: () => Promise<void>;
  toggle: () => Promise<void>;
} {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const enter = useCallback(async () => {
    const el = elementRef.current;
    if (el?.requestFullscreen) await el.requestFullscreen();
  }, [elementRef]);

  const exit = useCallback(async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
  }, []);

  const toggle = useCallback(async () => {
    if (isFullscreen) await exit();
    else await enter();
  }, [isFullscreen, enter, exit]);

  return { isFullscreen, enter, exit, toggle };
}

/* ──────────────────────────────────────────────────────────────
 * 16. useOnlineStatus
 * ────────────────────────────────────────────────────────────── */

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
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

/* ──────────────────────────────────────────────────────────────
 * 17. useWindowSize
 * ────────────────────────────────────────────────────────────── */

export function useWindowSize(): { width: number; height: number } {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

/* ──────────────────────────────────────────────────────────────
 * 18. useScrollPosition
 * ────────────────────────────────────────────────────────────── */

export function useScrollPosition(
  elementRef?: RefObject<HTMLElement | null>,
): { x: number; y: number; isScrolling: boolean } {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isScrolling, setIsScrolling] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const element = elementRef?.current ?? window;

    const handleScroll = () => {
      setIsScrolling(true);
      if (element === window) {
        setPosition({ x: window.scrollX, y: window.scrollY });
      } else {
        const el = element as HTMLElement;
        setPosition({ x: el.scrollLeft, y: el.scrollTop });
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsScrolling(false), 150);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => element.removeEventListener('scroll', handleScroll);
  }, [elementRef]);

  return { ...position, isScrolling };
}

/* ──────────────────────────────────────────────────────────────
 * 19. useLockBodyScroll
 * ────────────────────────────────────────────────────────────── */

export function useLockBodyScroll(locked: boolean = true): void {
  useLayoutEffect(() => {
    if (!locked) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [locked]);
}

/* ──────────────────────────────────────────────────────────────
 * 20. useHover
 * ────────────────────────────────────────────────────────────── */

export function useHover<T extends HTMLElement>(): [
  RefObject<T | null>,
  boolean,
] {
  const ref = useRef<T>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    node.addEventListener('mouseenter', handleMouseEnter);
    node.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      node.removeEventListener('mouseenter', handleMouseEnter);
      node.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return [ref, isHovered];
}

/* ──────────────────────────────────────────────────────────────
 * 21. useFocus
 * ────────────────────────────────────────────────────────────── */

export function useFocus<T extends HTMLElement>(): [
  RefObject<T | null>,
  boolean,
  { focus: () => void; blur: () => void },
] {
  const ref = useRef<T>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    node.addEventListener('focus', handleFocus);
    node.addEventListener('blur', handleBlur);

    return () => {
      node.removeEventListener('focus', handleFocus);
      node.removeEventListener('blur', handleBlur);
    };
  }, []);

  const controls = useMemo(
    () => ({
      focus: () => ref.current?.focus(),
      blur: () => ref.current?.blur(),
    }),
    [],
  );

  return [ref, isFocused, controls];
}

/* ──────────────────────────────────────────────────────────────
 * 22. useDarkMode
 * ────────────────────────────────────────────────────────────── */

export function useDarkMode(): [boolean, () => void, (dark: boolean) => void] {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [isDark, setIsDark, remove] = useLocalStorage('dark-mode', prefersDark);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggle = useCallback(() => setIsDark(d => !d), [setIsDark]);

  return [isDark, toggle, setIsDark];
}

/* ──────────────────────────────────────────────────────────────
 * 23. usePageVisibility
 * ────────────────────────────────────────────────────────────── */

export function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(
    typeof document !== 'undefined' ? !document.hidden : true,
  );

  useEffect(() => {
    const handler = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  return isVisible;
}

/* ──────────────────────────────────────────────────────────────
 * 24. useRenderCount
 * ────────────────────────────────────────────────────────────── */

export function useRenderCount(): number {
  const count = useRef(0);
  count.current++;
  return count.current;
}

/* ──────────────────────────────────────────────────────────────
 * 25. useWhyDidYouUpdate (debug hook)
 * ────────────────────────────────────────────────────────────── */

export function useWhyDidYouUpdate(
  componentName: string,
  props: Record<string, any>,
): void {
  const prevProps = useRef<Record<string, any>>({});

  useEffect(() => {
    if (prevProps.current) {
      const allKeys = Object.keys({ ...prevProps.current, ...props });
      const changes: Record<string, { from: any; to: any }> = {};

      for (const key of allKeys) {
        if (prevProps.current[key] !== props[key]) {
          changes[key] = { from: prevProps.current[key], to: props[key] };
        }
      }

      if (Object.keys(changes).length > 0) {
        console.log(`[${componentName}] re-rendered due to:`, changes);
      }
    }

    prevProps.current = props;
  });
}

/* ──────────────────────────────────────────────────────────────
 * 26. useMeasure
 * ────────────────────────────────────────────────────────────── */

export interface MeasureRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function useMeasure<T extends HTMLElement>(): [
  RefObject<T | null>,
  MeasureRect,
] {
  const ref = useRef<T>(null);
  const [rect, setRect] = useState<MeasureRect>({
    x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0,
  });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new ResizeObserver(() => {
      const bounds = node.getBoundingClientRect();
      setRect({
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        top: bounds.top,
        right: bounds.right,
        bottom: bounds.bottom,
        left: bounds.left,
      });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, rect];
}

/* ──────────────────────────────────────────────────────────────
 * 27. useList / useMap / useSet
 * ────────────────────────────────────────────────────────────── */

export function useList<T>(initialList: T[] = []) {
  const [list, setList] = useState(initialList);

  const actions = useMemo(
    () => ({
      push: (...items: T[]) => setList(l => [...l, ...items]),
      insertAt: (index: number, item: T) =>
        setList(l => [...l.slice(0, index), item, ...l.slice(index)]),
      removeAt: (index: number) =>
        setList(l => [...l.slice(0, index), ...l.slice(index + 1)]),
      updateAt: (index: number, item: T) =>
        setList(l => l.map((v, i) => (i === index ? item : v))),
      filter: (fn: (item: T) => boolean) => setList(l => l.filter(fn)),
      sort: (compareFn?: (a: T, b: T) => number) =>
        setList(l => [...l].sort(compareFn)),
      reverse: () => setList(l => [...l].reverse()),
      clear: () => setList([]),
      set: setList,
      move: (from: number, to: number) => {
        setList(l => {
          const copy = [...l];
          const [removed] = copy.splice(from, 1);
          copy.splice(to, 0, removed);
          return copy;
        });
      },
    }),
    [],
  );

  return [list, actions] as const;
}

export function useMap<K, V>(initialMap: Iterable<[K, V]> = []) {
  const [map, setMap] = useState(new Map<K, V>(initialMap));

  const actions = useMemo(
    () => ({
      set: (key: K, value: V) =>
        setMap(m => new Map(m).set(key, value)),
      delete: (key: K) =>
        setMap(m => {
          const copy = new Map(m);
          copy.delete(key);
          return copy;
        }),
      clear: () => setMap(new Map()),
      has: (key: K) => map.has(key),
      get: (key: K) => map.get(key),
      setAll: (entries: Iterable<[K, V]>) =>
        setMap(new Map(entries)),
    }),
    [map],
  );

  return [map, actions] as const;
}

export function useSet<T>(initialSet: Iterable<T> = []) {
  const [set, setSet] = useState(new Set<T>(initialSet));

  const actions = useMemo(
    () => ({
      add: (item: T) =>
        setSet(s => new Set(s).add(item)),
      delete: (item: T) =>
        setSet(s => {
          const copy = new Set(s);
          copy.delete(item);
          return copy;
        }),
      has: (item: T) => set.has(item),
      clear: () => setSet(new Set()),
      toggle: (item: T) =>
        setSet(s => {
          const copy = new Set(s);
          if (copy.has(item)) copy.delete(item);
          else copy.add(item);
          return copy;
        }),
    }),
    [set],
  );

  return [set, actions] as const;
}

/* ──────────────────────────────────────────────────────────────
 * 28. useQueue / useStack
 * ────────────────────────────────────────────────────────────── */

export function useQueue<T>(initialItems: T[] = []) {
  const [queue, setQueue] = useState(initialItems);

  const actions = useMemo(
    () => ({
      enqueue: (item: T) => setQueue(q => [...q, item]),
      dequeue: () => {
        let dequeued: T | undefined;
        setQueue(q => {
          [dequeued] = q;
          return q.slice(1);
        });
        return dequeued;
      },
      peek: () => queue[0],
      clear: () => setQueue([]),
      size: queue.length,
      isEmpty: queue.length === 0,
    }),
    [queue],
  );

  return [queue, actions] as const;
}

export function useStack<T>(initialItems: T[] = []) {
  const [stack, setStack] = useState(initialItems);

  const actions = useMemo(
    () => ({
      push: (item: T) => setStack(s => [...s, item]),
      pop: () => {
        let popped: T | undefined;
        setStack(s => {
          popped = s[s.length - 1];
          return s.slice(0, -1);
        });
        return popped;
      },
      peek: () => stack[stack.length - 1],
      clear: () => setStack([]),
      size: stack.length,
      isEmpty: stack.length === 0,
    }),
    [stack],
  );

  return [stack, actions] as const;
}

/* ──────────────────────────────────────────────────────────────
 * 29. useForm
 * ────────────────────────────────────────────────────────────── */

export interface FormFieldConfig {
  initialValue: any;
  validate?: (value: any, values: Record<string, any>) => string | null;
  required?: boolean;
  requiredMessage?: string;
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string | null>;
  touched: Record<string, boolean>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
}

export function useForm(fields: Record<string, FormFieldConfig>) {
  const initialValues = useMemo(() => {
    const v: Record<string, any> = {};
    for (const [key, config] of Object.entries(fields)) {
      v[key] = config.initialValue;
    }
    return v;
  }, []);

  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback(
    (fieldName: string, value: any): string | null => {
      const config = fields[fieldName];
      if (!config) return null;

      if (config.required && (value === '' || value === null || value === undefined)) {
        return config.requiredMessage ?? `${fieldName} is required`;
      }

      if (config.validate) {
        return config.validate(value, values);
      }

      return null;
    },
    [fields, values],
  );

  const validateAll = useCallback((): boolean => {
    const newErrors: Record<string, string | null> = {};
    let isValid = true;

    for (const [key] of Object.entries(fields)) {
      const error = validate(key, values[key]);
      newErrors[key] = error;
      if (error) isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [fields, values, validate]);

  const setFieldValue = useCallback(
    (field: string, value: any) => {
      setValues(prev => ({ ...prev, [field]: value }));
      const error = validate(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    },
    [validate],
  );

  const setFieldTouched = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const handleChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
      setFieldValue(field, value);
    },
    [setFieldValue],
  );

  const handleBlur = useCallback(
    (field: string) => () => {
      setFieldTouched(field);
    },
    [setFieldTouched],
  );

  const handleSubmit = useCallback(
    (onSubmit: (values: Record<string, any>) => Promise<void> | void) => async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Touch all fields
      const allTouched: Record<string, boolean> = {};
      for (const key of Object.keys(fields)) {
        allTouched[key] = true;
      }
      setTouched(allTouched);

      const isValid = validateAll();
      if (isValid) {
        try {
          await onSubmit(values);
        } catch (e) {
          console.error('Form submission error:', e);
        }
      }

      setIsSubmitting(false);
    },
    [fields, values, validateAll],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isDirty = useMemo(() => {
    return Object.keys(fields).some(key => values[key] !== initialValues[key]);
  }, [values, initialValues, fields]);

  const isValid = useMemo(() => {
    return Object.values(errors).every(e => e === null || e === undefined);
  }, [errors]);

  return {
    values,
    errors,
    touched,
    isDirty,
    isValid,
    isSubmitting,
    setFieldValue,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    validateAll,
    reset,
  };
}

/* ──────────────────────────────────────────────────────────────
 * 30. useStep
 * ────────────────────────────────────────────────────────────── */

export function useStep(maxStep: number) {
  const [currentStep, setCurrentStep] = useState(0);

  const canGoForward = currentStep < maxStep;
  const canGoBack = currentStep > 0;

  const goForward = useCallback(() => {
    setCurrentStep(s => Math.min(s + 1, maxStep));
  }, [maxStep]);

  const goBack = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 0));
  }, []);

  const goTo = useCallback(
    (step: number) => {
      setCurrentStep(Math.max(0, Math.min(step, maxStep)));
    },
    [maxStep],
  );

  const reset = useCallback(() => setCurrentStep(0), []);

  return {
    currentStep,
    canGoForward,
    canGoBack,
    goForward,
    goBack,
    goTo,
    reset,
    isFirst: currentStep === 0,
    isLast: currentStep === maxStep,
  };
}

/* ──────────────────────────────────────────────────────────────
 * Bonus: useKeyCombo
 * ────────────────────────────────────────────────────────────── */

export function useKeyCombo(
  combo: string,
  callback: () => void,
  options: { preventDefault?: boolean } = {},
): void {
  const { preventDefault = true } = options;
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const keys = combo.toLowerCase().split('+').map(k => k.trim());

    const handler = (e: KeyboardEvent) => {
      const pressed = keys.every(key => {
        switch (key) {
          case 'ctrl': case 'control': return e.ctrlKey;
          case 'shift': return e.shiftKey;
          case 'alt': return e.altKey;
          case 'meta': case 'cmd': return e.metaKey;
          default: return e.key.toLowerCase() === key;
        }
      });

      if (pressed) {
        if (preventDefault) e.preventDefault();
        callbackRef.current();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [combo, preventDefault]);
}

/* ──────────────────────────────────────────────────────────────
 * Bonus: useAnimationFrame
 * ────────────────────────────────────────────────────────────── */

export function useAnimationFrame(
  callback: (deltaTime: number) => void,
  isRunning: boolean = true,
): void {
  const callbackRef = useRef(callback);
  const previousTimeRef = useRef<number>(undefined);
  const rafRef = useRef<number>(undefined);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isRunning) return;

    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callbackRef.current(deltaTime);
      }
      previousTimeRef.current = time;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning]);
}

/* ──────────────────────────────────────────────────────────────
 * Bonus: useUndoState
 * ────────────────────────────────────────────────────────────── */

export function useUndoState<T>(initialValue: T, maxHistory: number = 50) {
  const [state, setState] = useState({
    past: [] as T[],
    present: initialValue,
    future: [] as T[],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const set = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setState(s => {
        const value = typeof newValue === 'function'
          ? (newValue as Function)(s.present)
          : newValue;

        return {
          past: [...s.past, s.present].slice(-maxHistory),
          present: value,
          future: [],
        };
      });
    },
    [maxHistory],
  );

  const undo = useCallback(() => {
    setState(s => {
      if (s.past.length === 0) return s;
      const previous = s.past[s.past.length - 1];
      return {
        past: s.past.slice(0, -1),
        present: previous,
        future: [s.present, ...s.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(s => {
      if (s.future.length === 0) return s;
      const next = s.future[0];
      return {
        past: [...s.past, s.present],
        present: next,
        future: s.future.slice(1),
      };
    });
  }, []);

  const reset = useCallback(
    (newValue: T = initialValue) => {
      setState({ past: [], present: newValue, future: [] });
    },
    [initialValue],
  );

  return {
    value: state.present,
    set,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    pastCount: state.past.length,
    futureCount: state.future.length,
  };
}
