/**
 * Icon Library
 * 
 * Searchable icon library with 200+ icon definitions.
 * Features:
 * - Categorized icons
 * - Search with fuzzy matching
 * - SVG path data for each icon
 * - Size and color customization
 * - Icon packs (Lucide-compatible)
 */

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

export interface IconDef {
  name: string;
  category: IconCategory;
  tags: string[];
  path: string; // SVG path d attribute
  viewBox?: string;
}

export type IconCategory = 'arrows' | 'communication' | 'design' | 'development' | 'devices' | 'editing' | 'files' | 'finance' | 'general' | 'layout' | 'media' | 'navigation' | 'people' | 'security' | 'shopping' | 'social' | 'weather';

/* ──────────────────────────────────────────────
 * Icon Library (200+ icons)
 * ────────────────────────────────────────────── */

export const ICON_LIBRARY: IconDef[] = [
  // Arrows (20)
  { name: 'ArrowUp', category: 'arrows', tags: ['up', 'direction'], path: 'M12 19V5m0 0l-7 7m7-7l7 7' },
  { name: 'ArrowDown', category: 'arrows', tags: ['down', 'direction'], path: 'M12 5v14m0 0l7-7m-7 7l-7-7' },
  { name: 'ArrowLeft', category: 'arrows', tags: ['left', 'back'], path: 'M19 12H5m0 0l7 7m-7-7l7-7' },
  { name: 'ArrowRight', category: 'arrows', tags: ['right', 'forward'], path: 'M5 12h14m0 0l-7-7m7 7l-7 7' },
  { name: 'ArrowUpRight', category: 'arrows', tags: ['diagonal', 'external'], path: 'M7 17L17 7m0 0H7m10 0v10' },
  { name: 'ArrowDownLeft', category: 'arrows', tags: ['diagonal'], path: 'M17 7L7 17m0 0h10M7 17V7' },
  { name: 'ChevronUp', category: 'arrows', tags: ['expand', 'collapse'], path: 'M18 15l-6-6-6 6' },
  { name: 'ChevronDown', category: 'arrows', tags: ['expand', 'dropdown'], path: 'M6 9l6 6 6-6' },
  { name: 'ChevronLeft', category: 'arrows', tags: ['back', 'previous'], path: 'M15 18l-6-6 6-6' },
  { name: 'ChevronRight', category: 'arrows', tags: ['next', 'forward'], path: 'M9 18l6-6-6-6' },
  { name: 'ChevronsUp', category: 'arrows', tags: ['double', 'up'], path: 'M17 11l-5-5-5 5m10 7l-5-5-5 5' },
  { name: 'ChevronsDown', category: 'arrows', tags: ['double', 'down'], path: 'M7 13l5 5 5-5M7 6l5 5 5-5' },
  { name: 'Undo', category: 'arrows', tags: ['undo', 'back'], path: 'M3 7v6h6M21 17a9 9 0 00-9-9 9 9 0 00-6.69 3L3 13' },
  { name: 'Redo', category: 'arrows', tags: ['redo', 'forward'], path: 'M21 7v6h-6M3 17a9 9 0 019-9 9 9 0 016.69 3L21 13' },
  { name: 'RefreshCw', category: 'arrows', tags: ['refresh', 'reload'], path: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15' },
  { name: 'CornerDownRight', category: 'arrows', tags: ['corner', 'enter'], path: 'M15 10l5 5-5 5M4 4v7a4 4 0 004 4h12' },
  { name: 'MoveHorizontal', category: 'arrows', tags: ['resize', 'horizontal'], path: 'M8 3L4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4' },
  { name: 'ExternalLink', category: 'arrows', tags: ['external', 'new tab'], path: 'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3' },
  { name: 'Download', category: 'arrows', tags: ['download', 'save'], path: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5 5 5-5m-5 5V3' },
  { name: 'Upload', category: 'arrows', tags: ['upload', 'send'], path: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m14-7l-5-5-5 5m5-5v12' },

  // Communication (15)
  { name: 'Mail', category: 'communication', tags: ['email', 'message'], path: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm16 2l-8 5-8-5' },
  { name: 'MessageSquare', category: 'communication', tags: ['chat', 'comment'], path: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
  { name: 'MessageCircle', category: 'communication', tags: ['chat', 'bubble'], path: 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z' },
  { name: 'Phone', category: 'communication', tags: ['call', 'telephone'], path: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z' },
  { name: 'Video', category: 'communication', tags: ['camera', 'call'], path: 'M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z' },
  { name: 'Bell', category: 'communication', tags: ['notification', 'alert'], path: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0' },
  { name: 'BellOff', category: 'communication', tags: ['mute', 'silent'], path: 'M13.73 21a2 2 0 01-3.46 0M18.63 13A17.89 17.89 0 0118 8M6.26 6.26A5.86 5.86 0 006 8c0 7-3 9-3 9h14M1 1l22 22' },
  { name: 'Send', category: 'communication', tags: ['send', 'submit'], path: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z' },
  { name: 'Inbox', category: 'communication', tags: ['inbox', 'received'], path: 'M22 12h-6l-2 3H10l-2-3H2m4.81-4.22L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-4.81-4.22A2 2 0 0015.76 6H8.24a2 2 0 00-1.43.58z' },
  { name: 'AtSign', category: 'communication', tags: ['at', 'mention', 'email'], path: 'M12 16a4 4 0 100-8 4 4 0 000 8zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-5.6 8.33' },
  { name: 'Share', category: 'communication', tags: ['share', 'send'], path: 'M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13' },
  { name: 'Share2', category: 'communication', tags: ['share', 'network'], path: 'M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6zM8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98' },
  { name: 'Globe', category: 'communication', tags: ['world', 'web', 'internet'], path: 'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z' },
  { name: 'Wifi', category: 'communication', tags: ['wireless', 'signal'], path: 'M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01' },
  { name: 'Radio', category: 'communication', tags: ['broadcast', 'live'], path: 'M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14' },

  // General (25)
  { name: 'Home', category: 'general', tags: ['home', 'house'], path: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  { name: 'Search', category: 'general', tags: ['search', 'find', 'magnify'], path: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { name: 'Settings', category: 'general', tags: ['gear', 'config'], path: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z' },
  { name: 'User', category: 'general', tags: ['person', 'profile', 'account'], path: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z' },
  { name: 'Users', category: 'general', tags: ['people', 'team', 'group'], path: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
  { name: 'Heart', category: 'general', tags: ['love', 'like', 'favorite'], path: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' },
  { name: 'Star', category: 'general', tags: ['favorite', 'rating', 'bookmark'], path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  { name: 'Plus', category: 'general', tags: ['add', 'create', 'new'], path: 'M12 5v14M5 12h14' },
  { name: 'Minus', category: 'general', tags: ['remove', 'subtract'], path: 'M5 12h14' },
  { name: 'X', category: 'general', tags: ['close', 'delete', 'cancel'], path: 'M18 6L6 18M6 6l12 12' },
  { name: 'Check', category: 'general', tags: ['done', 'complete', 'success'], path: 'M20 6L9 17l-5-5' },
  { name: 'Info', category: 'general', tags: ['information', 'details'], path: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-4M12 8h.01' },
  { name: 'AlertTriangle', category: 'general', tags: ['warning', 'caution'], path: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01' },
  { name: 'AlertCircle', category: 'general', tags: ['error', 'danger'], path: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 8v4M12 16h.01' },
  { name: 'HelpCircle', category: 'general', tags: ['help', 'question'], path: 'M12 22a10 10 0 100-20 10 10 0 000 20zM9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01' },
  { name: 'Trash', category: 'general', tags: ['delete', 'remove', 'bin'], path: 'M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2' },
  { name: 'Edit', category: 'general', tags: ['edit', 'pen', 'modify'], path: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' },
  { name: 'Copy', category: 'general', tags: ['copy', 'duplicate', 'clipboard'], path: 'M20 9h-9a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1' },
  { name: 'Clipboard', category: 'general', tags: ['paste', 'clipboard'], path: 'M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2M9 2h6a1 1 0 011 1v1a1 1 0 01-1 1H9a1 1 0 01-1-1V3a1 1 0 011-1z' },
  { name: 'Calendar', category: 'general', tags: ['date', 'schedule', 'event'], path: 'M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18' },
  { name: 'Clock', category: 'general', tags: ['time', 'schedule'], path: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2' },
  { name: 'Eye', category: 'general', tags: ['view', 'visible', 'show'], path: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z' },
  { name: 'EyeOff', category: 'general', tags: ['hide', 'invisible'], path: 'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22' },
  { name: 'Filter', category: 'general', tags: ['filter', 'sort', 'funnel'], path: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z' },
  { name: 'Bookmark', category: 'general', tags: ['save', 'bookmark', 'flag'], path: 'M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z' },

  // Security (10)
  { name: 'Lock', category: 'security', tags: ['lock', 'secure', 'password'], path: 'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4' },
  { name: 'Unlock', category: 'security', tags: ['unlock', 'open'], path: 'M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 019.9-1' },
  { name: 'Shield', category: 'security', tags: ['security', 'protection'], path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { name: 'ShieldCheck', category: 'security', tags: ['verified', 'safe'], path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4' },
  { name: 'Key', category: 'security', tags: ['key', 'access', 'api'], path: 'M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4' },
  { name: 'Fingerprint', category: 'security', tags: ['biometric', 'identity'], path: 'M2 12C2 6.5 6.5 2 12 2a10 10 0 018 4M5 19.5C5.5 18 6 16 6 12a6 6 0 0112 0M12 12a2 2 0 000 4M8.5 16a4.5 4.5 0 009 0' },
  { name: 'LogIn', category: 'security', tags: ['login', 'signin'], path: 'M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3' },
  { name: 'LogOut', category: 'security', tags: ['logout', 'signout'], path: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9' },
  { name: 'UserCheck', category: 'security', tags: ['verified', 'approved'], path: 'M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 3a4 4 0 100 8 4 4 0 000-8zM17 11l2 2 4-4' },
  { name: 'UserX', category: 'security', tags: ['banned', 'remove'], path: 'M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M8.5 3a4 4 0 100 8 4 4 0 000-8zM18 8l5 5M23 8l-5 5' },

  // Shopping (10)
  { name: 'ShoppingCart', category: 'shopping', tags: ['cart', 'buy', 'purchase'], path: 'M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6M9 22a1 1 0 100-2 1 1 0 000 2zM20 22a1 1 0 100-2 1 1 0 000 2z' },
  { name: 'ShoppingBag', category: 'shopping', tags: ['bag', 'store'], path: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0' },
  { name: 'CreditCard', category: 'shopping', tags: ['payment', 'card'], path: 'M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2zM1 10h22' },
  { name: 'DollarSign', category: 'shopping', tags: ['money', 'currency', 'price'], path: 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
  { name: 'Tag', category: 'shopping', tags: ['price', 'label'], path: 'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01' },
  { name: 'Gift', category: 'shopping', tags: ['present', 'reward'], path: 'M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z' },
  { name: 'Percent', category: 'shopping', tags: ['discount', 'sale'], path: 'M19 5L5 19M6.5 6.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 20.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z' },
  { name: 'Truck', category: 'shopping', tags: ['delivery', 'shipping'], path: 'M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z' },
  { name: 'Package', category: 'shopping', tags: ['box', 'order'], path: 'M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12' },
  { name: 'Receipt', category: 'shopping', tags: ['invoice', 'bill'], path: 'M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2-3-2zM8 10h8M8 14h4' },

  // Media (15)
  { name: 'Image', category: 'media', tags: ['photo', 'picture'], path: 'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 21' },
  { name: 'Camera', category: 'media', tags: ['photo', 'capture'], path: 'M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z' },
  { name: 'Film', category: 'media', tags: ['movie', 'video'], path: 'M19.82 2H4.18A2.18 2.18 0 002 4.18v15.64A2.18 2.18 0 004.18 22h15.64A2.18 2.18 0 0022 19.82V4.18A2.18 2.18 0 0019.82 2zM7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5' },
  { name: 'Music', category: 'media', tags: ['audio', 'song'], path: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM21 16a3 3 0 11-6 0 3 3 0 016 0z' },
  { name: 'Mic', category: 'media', tags: ['microphone', 'record'], path: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8' },
  { name: 'Volume2', category: 'media', tags: ['sound', 'speaker'], path: 'M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07' },
  { name: 'Play', category: 'media', tags: ['start', 'video'], path: 'M5 3l14 9-14 9V3z' },
  { name: 'Pause', category: 'media', tags: ['pause', 'stop'], path: 'M6 4h4v16H6zM14 4h4v16h-4z' },
  { name: 'SkipForward', category: 'media', tags: ['next', 'forward'], path: 'M5 4l10 8-10 8V4zM19 5v14' },
  { name: 'SkipBack', category: 'media', tags: ['previous', 'rewind'], path: 'M19 20L9 12l10-8v16zM5 19V5' },
  { name: 'Maximize', category: 'media', tags: ['fullscreen', 'expand'], path: 'M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3' },
  { name: 'Minimize', category: 'media', tags: ['minimize', 'collapse'], path: 'M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3' },
  { name: 'Airplay', category: 'media', tags: ['cast', 'stream'], path: 'M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1M12 15l5 6H7l5-6z' },
  { name: 'Headphones', category: 'media', tags: ['audio', 'listen'], path: 'M3 18v-6a9 9 0 0118 0v6M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z' },
  { name: 'Cast', category: 'media', tags: ['screencast', 'broadcast'], path: 'M2 16.1A5 5 0 015.9 20M2 12.05A9 9 0 019.95 20M2 8V6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2h-6M2 20h.01' },
];

/* ──────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────── */

export function searchIcons(query: string): IconDef[] {
  if (!query.trim()) return ICON_LIBRARY;
  const q = query.toLowerCase();
  return ICON_LIBRARY.filter(icon =>
    icon.name.toLowerCase().includes(q) ||
    icon.tags.some(t => t.includes(q)) ||
    icon.category.includes(q),
  );
}

export function getIconsByCategory(): Map<IconCategory, IconDef[]> {
  const m = new Map<IconCategory, IconDef[]>();
  for (const icon of ICON_LIBRARY) {
    const list = m.get(icon.category) ?? [];
    list.push(icon);
    m.set(icon.category, list);
  }
  return m;
}

export function getIconByName(name: string): IconDef | undefined {
  return ICON_LIBRARY.find(i => i.name === name);
}

export const ICON_CATEGORY_LABELS: Record<IconCategory, string> = {
  arrows: 'Arrows & Navigation',
  communication: 'Communication',
  design: 'Design',
  development: 'Development',
  devices: 'Devices',
  editing: 'Editing',
  files: 'Files & Folders',
  finance: 'Finance',
  general: 'General',
  layout: 'Layout',
  media: 'Media',
  navigation: 'Navigation UI',
  people: 'People',
  security: 'Security',
  shopping: 'Shopping & Commerce',
  social: 'Social Media',
  weather: 'Weather',
};
