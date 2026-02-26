/**
 * Auto-Linker Service
 * 
 * Automatically links pages together when templates are created.
 * 
 * Rules:
 * - Login page: "Sign up" → /signup, "Forgot password?" → /forgot-password
 * - Signup page: "Sign in" → /login
 * - Landing page: navbar links → existing pages, CTA → /signup or /login
 * - Dashboard: settings link → /settings, profile → /profile
 * - 404 page: "Go Home" → /
 * - Any "Contact" links → /contact
 * - Any "Pricing" links → /pricing
 * - Footer links → matching pages
 * - Coming Soon → / after launch
 * 
 * This makes the app immediately navigable with zero configuration.
 */

import { WidgetConfig } from '@/types/widget.types';

/* ──────────────────────────────────────────────
 * Link Mapping Rules
 * ────────────────────────────────────────────── */

/** Common text → path mappings (case-insensitive) */
const TEXT_TO_PATH: Record<string, string> = {
  'home': '/',
  'sign in': '/login',
  'signin': '/login',
  'login': '/login',
  'log in': '/login',
  'sign up': '/signup',
  'signup': '/signup',
  'register': '/signup',
  'create account': '/signup',
  'get started': '/signup',
  'get started free': '/signup',
  'start free trial': '/signup',
  'start building': '/signup',
  'start free': '/signup',
  'try free': '/signup',
  'dashboard': '/dashboard',
  'settings': '/settings',
  'profile': '/profile',
  'pricing': '/pricing',
  'about': '/about',
  'about us': '/about',
  'contact': '/contact',
  'contact us': '/contact',
  'get in touch': '/contact',
  'blog': '/blog',
  'features': '/#features',
  'faq': '/faq',
  'help': '/faq',
  'terms': '/terms',
  'privacy': '/terms',
  'privacy policy': '/terms',
  'terms of service': '/terms',
  'changelog': '/changelog',
  'go home': '/',
  'go back home': '/',
  'back to home': '/',
  'forgot password': '/forgot-password',
  'forgot password?': '/forgot-password',
  'products': '/products',
  'shop': '/products',
  'docs': '/docs',
  'documentation': '/docs',
  'careers': '/careers',
  'press': '/press',
};

/** Page template ID → which pages it naturally links to */
const TEMPLATE_LINK_MAP: Record<string, string[]> = {
  'landing': ['/signup', '/login', '/pricing', '/about', '/contact', '/#features'],
  'login': ['/signup', '/forgot-password', '/dashboard'],
  'signup': ['/login', '/terms'],
  'dashboard': ['/settings', '/profile', '/'],
  'settings': ['/profile', '/dashboard'],
  'profile': ['/settings', '/dashboard'],
  'about': ['/contact', '/careers', '/'],
  'contact': ['/', '/about'],
  'pricing': ['/signup', '/contact'],
  'blog-listing': ['/', '/about'],
  'faq': ['/contact', '/'],
  '404': ['/'],
  'ecommerce-products': ['/'],
  'terms': ['/'],
  'changelog': ['/'],
  'coming-soon': ['/'],
};

/* ──────────────────────────────────────────────
 * Auto-Link Functions
 * ────────────────────────────────────────────── */

export interface AutoLinkResult {
  widgetName: string;
  property: string;
  oldValue: string;
  newValue: string;
}

/**
 * Given a template's widgets and all existing page paths,
 * returns updated widgets with links automatically resolved
 * to actual existing pages.
 */
export function autoLinkWidgets(
  widgets: Array<{
    type: string;
    name: string;
    x: number;
    y: number;
    props?: Record<string, unknown>;
    style?: Record<string, unknown>;
  }>,
  existingPagePaths: string[],
  templateId?: string,
): {
  widgets: typeof widgets;
  links: AutoLinkResult[];
} {
  const pathSet = new Set(existingPagePaths.map(p => p.toLowerCase()));
  const links: AutoLinkResult[] = [];

  const updatedWidgets = widgets.map(w => {
    const updatedProps = { ...w.props };
    let changed = false;

    // Auto-link based on widget type
    if (w.type === 'link') {
      const text = ((updatedProps.text as string) ?? '').toLowerCase().trim();
      const currentUrl = (updatedProps.url as string) ?? '#';

      // Try to find a matching path
      const resolvedPath = resolveLink(text, currentUrl, pathSet);
      if (resolvedPath && resolvedPath !== currentUrl) {
        updatedProps.url = resolvedPath;
        links.push({
          widgetName: w.name,
          property: 'url',
          oldValue: currentUrl,
          newValue: resolvedPath,
        });
        changed = true;
      }
    }

    if (w.type === 'button') {
      const label = ((updatedProps.label as string) ?? '').toLowerCase().trim();

      // Map button labels to navigation targets
      const resolvedPath = resolveLink(label, '', pathSet);
      if (resolvedPath) {
        updatedProps._navigateTo = resolvedPath;
        links.push({
          widgetName: w.name,
          property: '_navigateTo',
          oldValue: '',
          newValue: resolvedPath,
        });
        changed = true;
      }
    }

    return changed ? { ...w, props: updatedProps } : w;
  });

  return { widgets: updatedWidgets, links };
}

/**
 * Resolves a text/label to a navigation path.
 * Checks against existing pages, falls back to known mappings.
 */
function resolveLink(
  text: string,
  currentValue: string,
  existingPaths: Set<string>,
): string | null {
  if (!text) return null;

  // Clean the text
  const cleanText = text
    .replace(/[→←↑↓]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  // Direct match in our mapping
  const mapped = TEXT_TO_PATH[cleanText];
  if (mapped) {
    // Check if the target page exists
    if (existingPaths.has(mapped.toLowerCase())) {
      return mapped;
    }
    // Even if page doesn't exist yet, set the link
    // (it'll work once the user creates that page)
    return mapped;
  }

  // Try partial matching
  for (const [key, path] of Object.entries(TEXT_TO_PATH)) {
    if (cleanText.includes(key) || key.includes(cleanText)) {
      return path;
    }
  }

  // If it looks like a page reference (starts with /)
  if (currentValue.startsWith('/') && currentValue !== '#') {
    return currentValue;
  }

  return null;
}

/**
 * Suggests pages that should be created based on
 * the links found in the current project.
 */
export function suggestMissingPages(
  allWidgets: Record<string, WidgetConfig>,
  existingPagePaths: string[],
): string[] {
  const pathSet = new Set(existingPagePaths.map(p => p.toLowerCase()));
  const neededPaths = new Set<string>();

  for (const widget of Object.values(allWidgets)) {
    // Check link widgets
    if (widget.type === 'link') {
      const url = (widget.props.url as string) ?? '';
      if (url.startsWith('/') && !url.startsWith('/#') && !pathSet.has(url.toLowerCase())) {
        neededPaths.add(url);
      }
    }

    // Check button navigation targets
    if (widget.type === 'button') {
      const navigateTo = (widget.props._navigateTo as string) ?? '';
      if (navigateTo.startsWith('/') && !navigateTo.startsWith('/#') && !pathSet.has(navigateTo.toLowerCase())) {
        neededPaths.add(navigateTo);
      }
    }
  }

  return Array.from(neededPaths);
}

/**
 * Gets the recommended page templates for auto-creating
 * missing pages based on their paths.
 */
export function getRecommendedTemplate(path: string): string | null {
  const pathMap: Record<string, string> = {
    '/login': 'login',
    '/signup': 'signup',
    '/dashboard': 'dashboard',
    '/settings': 'settings',
    '/about': 'about',
    '/contact': 'contact',
    '/pricing': 'pricing',
    '/blog': 'blog-listing',
    '/faq': 'faq',
    '/products': 'ecommerce-products',
    '/profile': 'profile',
    '/terms': 'terms',
    '/changelog': 'changelog',
    '/404': '404',
  };

  return pathMap[path.toLowerCase()] ?? null;
}

/**
 * Given a template ID, returns the list of page paths
 * that this template naturally links to.
 */
export function getTemplateLinks(templateId: string): string[] {
  return TEMPLATE_LINK_MAP[templateId] ?? [];
}
