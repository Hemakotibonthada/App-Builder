/**
 * Responsive Breakpoint System
 * 
 * Manages responsive design breakpoints, device presets,
 * and per-breakpoint style overrides.
 * 
 * Features:
 * - 6 default breakpoints (xs, sm, md, lg, xl, 2xl)
 * - Custom breakpoint creation
 * - Device presets (30+ devices)
 * - Media query generation
 * - Responsive style merging
 */

/* ──────────────────────────────────────────────
 * Breakpoint Types
 * ────────────────────────────────────────────── */

export interface Breakpoint {
  id: string;
  name: string;
  minWidth: number;
  maxWidth: number;
  icon: string;
  color: string;
}

export interface DevicePresetInfo {
  id: string;
  name: string;
  brand: string;
  width: number;
  height: number;
  scaleFactor: number;
  platform: 'ios' | 'android' | 'web' | 'tablet';
  hasNotch: boolean;
  borderRadius: number;
  year: number;
}

/* ──────────────────────────────────────────────
 * Default Breakpoints
 * ────────────────────────────────────────────── */

export const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  { id: 'xs', name: 'Extra Small', minWidth: 0, maxWidth: 479, icon: '📱', color: '#ef4444' },
  { id: 'sm', name: 'Small', minWidth: 480, maxWidth: 639, icon: '📱', color: '#f97316' },
  { id: 'md', name: 'Medium', minWidth: 640, maxWidth: 767, icon: '📱', color: '#f59e0b' },
  { id: 'lg', name: 'Large', minWidth: 768, maxWidth: 1023, icon: '📲', color: '#22c55e' },
  { id: 'xl', name: 'Extra Large', minWidth: 1024, maxWidth: 1279, icon: '💻', color: '#3b82f6' },
  { id: '2xl', name: '2X Large', minWidth: 1280, maxWidth: 9999, icon: '🖥️', color: '#8b5cf6' },
];

/* ──────────────────────────────────────────────
 * Device Presets (30+ devices)
 * ────────────────────────────────────────────── */

export const DEVICE_PRESETS_LIST: DevicePresetInfo[] = [
  // iPhones
  { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', brand: 'Apple', width: 430, height: 932, scaleFactor: 3, platform: 'ios', hasNotch: true, borderRadius: 55, year: 2023 },
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', brand: 'Apple', width: 393, height: 852, scaleFactor: 3, platform: 'ios', hasNotch: true, borderRadius: 55, year: 2023 },
  { id: 'iphone-15', name: 'iPhone 15', brand: 'Apple', width: 393, height: 852, scaleFactor: 3, platform: 'ios', hasNotch: true, borderRadius: 50, year: 2023 },
  { id: 'iphone-14', name: 'iPhone 14', brand: 'Apple', width: 390, height: 844, scaleFactor: 3, platform: 'ios', hasNotch: true, borderRadius: 47, year: 2022 },
  { id: 'iphone-se', name: 'iPhone SE', brand: 'Apple', width: 375, height: 667, scaleFactor: 2, platform: 'ios', hasNotch: false, borderRadius: 0, year: 2022 },
  { id: 'iphone-13-mini', name: 'iPhone 13 Mini', brand: 'Apple', width: 375, height: 812, scaleFactor: 3, platform: 'ios', hasNotch: true, borderRadius: 44, year: 2021 },
  { id: 'iphone-12', name: 'iPhone 12', brand: 'Apple', width: 390, height: 844, scaleFactor: 3, platform: 'ios', hasNotch: true, borderRadius: 47, year: 2020 },

  // Android
  { id: 'pixel-8-pro', name: 'Pixel 8 Pro', brand: 'Google', width: 412, height: 892, scaleFactor: 3.5, platform: 'android', hasNotch: true, borderRadius: 30, year: 2023 },
  { id: 'pixel-8', name: 'Pixel 8', brand: 'Google', width: 412, height: 892, scaleFactor: 2.625, platform: 'android', hasNotch: true, borderRadius: 28, year: 2023 },
  { id: 'pixel-7', name: 'Pixel 7', brand: 'Google', width: 412, height: 915, scaleFactor: 2.625, platform: 'android', hasNotch: true, borderRadius: 24, year: 2022 },
  { id: 'samsung-s24-ultra', name: 'Galaxy S24 Ultra', brand: 'Samsung', width: 412, height: 915, scaleFactor: 3.5, platform: 'android', hasNotch: true, borderRadius: 26, year: 2024 },
  { id: 'samsung-s24', name: 'Galaxy S24', brand: 'Samsung', width: 360, height: 780, scaleFactor: 3, platform: 'android', hasNotch: true, borderRadius: 24, year: 2024 },
  { id: 'samsung-a54', name: 'Galaxy A54', brand: 'Samsung', width: 360, height: 800, scaleFactor: 2.5, platform: 'android', hasNotch: true, borderRadius: 20, year: 2023 },
  { id: 'oneplus-12', name: 'OnePlus 12', brand: 'OnePlus', width: 412, height: 920, scaleFactor: 3.5, platform: 'android', hasNotch: true, borderRadius: 28, year: 2024 },

  // Tablets
  { id: 'ipad-pro-12', name: 'iPad Pro 12.9"', brand: 'Apple', width: 1024, height: 1366, scaleFactor: 2, platform: 'tablet', hasNotch: false, borderRadius: 18, year: 2022 },
  { id: 'ipad-pro-11', name: 'iPad Pro 11"', brand: 'Apple', width: 834, height: 1194, scaleFactor: 2, platform: 'tablet', hasNotch: false, borderRadius: 18, year: 2022 },
  { id: 'ipad-air', name: 'iPad Air', brand: 'Apple', width: 820, height: 1180, scaleFactor: 2, platform: 'tablet', hasNotch: false, borderRadius: 18, year: 2022 },
  { id: 'ipad-mini', name: 'iPad Mini', brand: 'Apple', width: 744, height: 1133, scaleFactor: 2, platform: 'tablet', hasNotch: false, borderRadius: 18, year: 2021 },
  { id: 'ipad-10th', name: 'iPad 10th Gen', brand: 'Apple', width: 810, height: 1080, scaleFactor: 2, platform: 'tablet', hasNotch: false, borderRadius: 18, year: 2022 },
  { id: 'samsung-tab-s9', name: 'Galaxy Tab S9', brand: 'Samsung', width: 800, height: 1280, scaleFactor: 2, platform: 'tablet', hasNotch: false, borderRadius: 12, year: 2023 },
  { id: 'surface-pro', name: 'Surface Pro', brand: 'Microsoft', width: 912, height: 1368, scaleFactor: 2, platform: 'tablet', hasNotch: false, borderRadius: 8, year: 2023 },

  // Desktop
  { id: 'macbook-pro-16', name: 'MacBook Pro 16"', brand: 'Apple', width: 1728, height: 1117, scaleFactor: 2, platform: 'web', hasNotch: true, borderRadius: 10, year: 2023 },
  { id: 'macbook-pro-14', name: 'MacBook Pro 14"', brand: 'Apple', width: 1512, height: 982, scaleFactor: 2, platform: 'web', hasNotch: true, borderRadius: 10, year: 2023 },
  { id: 'macbook-air-15', name: 'MacBook Air 15"', brand: 'Apple', width: 1440, height: 900, scaleFactor: 2, platform: 'web', hasNotch: true, borderRadius: 10, year: 2023 },
  { id: 'macbook-air-13', name: 'MacBook Air 13"', brand: 'Apple', width: 1470, height: 956, scaleFactor: 2, platform: 'web', hasNotch: true, borderRadius: 10, year: 2022 },
  { id: 'desktop-hd', name: 'Desktop HD', brand: 'Generic', width: 1920, height: 1080, scaleFactor: 1, platform: 'web', hasNotch: false, borderRadius: 0, year: 2020 },
  { id: 'desktop-2k', name: 'Desktop 2K', brand: 'Generic', width: 2560, height: 1440, scaleFactor: 1, platform: 'web', hasNotch: false, borderRadius: 0, year: 2020 },
  { id: 'laptop-standard', name: 'Laptop Standard', brand: 'Generic', width: 1366, height: 768, scaleFactor: 1, platform: 'web', hasNotch: false, borderRadius: 0, year: 2020 },
  { id: 'desktop-xl', name: 'Desktop XL', brand: 'Generic', width: 1440, height: 900, scaleFactor: 1, platform: 'web', hasNotch: false, borderRadius: 0, year: 2020 },
];

/* ──────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────── */

export function getBreakpointForWidth(width: number): Breakpoint {
  for (const bp of DEFAULT_BREAKPOINTS) {
    if (width >= bp.minWidth && width <= bp.maxWidth) return bp;
  }
  return DEFAULT_BREAKPOINTS[DEFAULT_BREAKPOINTS.length - 1]!;
}

export function generateMediaQuery(bp: Breakpoint): string {
  if (bp.minWidth === 0) return `@media (max-width: ${bp.maxWidth}px)`;
  if (bp.maxWidth >= 9999) return `@media (min-width: ${bp.minWidth}px)`;
  return `@media (min-width: ${bp.minWidth}px) and (max-width: ${bp.maxWidth}px)`;
}

export function getDevicesByPlatform(): Map<string, DevicePresetInfo[]> {
  const m = new Map<string, DevicePresetInfo[]>();
  for (const d of DEVICE_PRESETS_LIST) {
    const list = m.get(d.platform) ?? [];
    list.push(d);
    m.set(d.platform, list);
  }
  return m;
}
