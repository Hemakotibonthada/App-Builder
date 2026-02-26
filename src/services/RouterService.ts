// =============================================================================
// Router Service - Client-side routing system for multi-page web apps with
// nested routes, guards, middleware, transitions, and dynamic loading
// =============================================================================

// =============================================================================
// Router Types
// =============================================================================

export interface RouteConfig {
  id: string;
  path: string;
  name: string;
  title?: string;
  component?: string;
  layout?: string;
  meta?: RouteMeta;
  children?: RouteConfig[];
  redirect?: string;
  alias?: string[];
  guards?: RouteGuard[];
  middleware?: RouteMiddleware[];
  transition?: RouteTransition;
  loadingComponent?: string;
  errorComponent?: string;
  props?: boolean | Record<string, unknown> | ((route: RouteMatch) => Record<string, unknown>);
  caseSensitive?: boolean;
  exact?: boolean;
}

export interface RouteMeta {
  requiresAuth?: boolean;
  roles?: string[];
  permissions?: string[];
  title?: string;
  description?: string;
  breadcrumb?: string | ((route: RouteMatch) => string);
  icon?: string;
  showInNav?: boolean;
  navOrder?: number;
  cache?: boolean;
  scrollBehavior?: 'top' | 'preserve' | 'smooth';
  layout?: string;
  analytics?: {
    trackPage?: boolean;
    category?: string;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    noIndex?: boolean;
    canonicalUrl?: string;
  };
}

export interface RouteMatch {
  route: RouteConfig;
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  hash: string;
  matched: RouteConfig[];
  fullPath: string;
  name?: string;
  meta: RouteMeta;
}

export interface RouteGuard {
  id: string;
  name: string;
  type: 'beforeEnter' | 'beforeLeave' | 'afterEnter';
  handler: (to: RouteMatch, from: RouteMatch | null) => GuardResult;
}

export type GuardResult =
  | true                    // Allow navigation
  | false                   // Cancel navigation
  | string                  // Redirect to path
  | { name: string }        // Redirect to named route
  | { path: string; replace?: boolean }; // Redirect with options

export interface RouteMiddleware {
  id: string;
  name: string;
  priority: number;
  handler: (context: MiddlewareContext) => void | Promise<void>;
}

export interface MiddlewareContext {
  to: RouteMatch;
  from: RouteMatch | null;
  next: (result?: GuardResult) => void;
  abort: () => void;
  redirect: (path: string) => void;
}

export interface RouteTransition {
  name: string;
  enterClass: string;
  leaveClass: string;
  enterActiveClass: string;
  leaveActiveClass: string;
  duration: number;
  mode: 'in-out' | 'out-in' | 'default';
}

export interface NavigationEntry {
  path: string;
  timestamp: number;
  title?: string;
  state?: Record<string, unknown>;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
  isActive: boolean;
}

// =============================================================================
// Route Pattern Matching
// =============================================================================

export function parsePathPattern(pattern: string): { regex: RegExp; paramNames: string[] } {
  const paramNames: string[] = [];
  let regexStr = '^';

  const segments = pattern.split('/').filter(Boolean);
  for (const segment of segments) {
    regexStr += '\\/';

    if (segment.startsWith(':')) {
      const paramName = segment.slice(1).replace(/\?$/, '');
      const optional = segment.endsWith('?');
      paramNames.push(paramName);

      if (optional) {
        regexStr = regexStr.slice(0, -2); // Remove the \\/ we just added
        regexStr += `(?:\\/([^/]+))?`;
      } else {
        regexStr += '([^/]+)';
      }
    } else if (segment === '*') {
      paramNames.push('wildcard');
      regexStr += '(.*)';
    } else if (segment === '**') {
      paramNames.push('rest');
      regexStr += '(.+)';
    } else {
      regexStr += segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
  }

  regexStr += '\\/?$';

  return {
    regex: new RegExp(regexStr, 'i'),
    paramNames,
  };
}

export function matchRoute(path: string, route: RouteConfig): RouteMatch | null {
  const { regex, paramNames } = parsePathPattern(route.path);

  // Parse URL
  const [pathPart, queryPart = ''] = path.split('?');
  const [cleanPath, hash = ''] = pathPart.split('#');

  const match = cleanPath.match(regex);
  if (!match) return null;

  // Extract params
  const params: Record<string, string> = {};
  paramNames.forEach((name, index) => {
    if (match[index + 1]) {
      params[name] = decodeURIComponent(match[index + 1]);
    }
  });

  // Parse query string
  const query: Record<string, string> = {};
  if (queryPart) {
    const searchParams = new URLSearchParams(queryPart);
    searchParams.forEach((value, key) => {
      query[key] = value;
    });
  }

  return {
    route,
    path: cleanPath,
    params,
    query,
    hash: hash ? `#${hash}` : '',
    matched: [route],
    fullPath: path,
    name: route.name,
    meta: route.meta || {},
  };
}

export function findMatchingRoute(path: string, routes: RouteConfig[]): RouteMatch | null {
  for (const route of routes) {
    // Check aliases
    if (route.alias) {
      for (const alias of route.alias) {
        const aliasRoute = { ...route, path: alias };
        const match = matchRoute(path, aliasRoute);
        if (match) return { ...match, route };
      }
    }

    // Check main path
    const match = matchRoute(path, route);
    if (match) {
      // Handle redirect
      if (route.redirect) {
        const redirectRoute = findMatchingRoute(route.redirect, routes);
        if (redirectRoute) return redirectRoute;
      }
      return match;
    }

    // Check children
    if (route.children) {
      for (const child of route.children) {
        const childPath = `${route.path}${child.path}`.replace(/\/+/g, '/');
        const childRoute = { ...child, path: childPath };
        const childMatch = matchRoute(path, childRoute);
        if (childMatch) {
          return {
            ...childMatch,
            matched: [route, child],
            meta: { ...route.meta, ...child.meta },
          };
        }
      }
    }
  }

  return null;
}

// =============================================================================
// URL Builder
// =============================================================================

export function buildPath(
  routeName: string,
  routes: RouteConfig[],
  params?: Record<string, string>,
  query?: Record<string, string>
): string {
  const route = findRouteByName(routeName, routes);
  if (!route) return '/';

  let path = route.path;

  // Replace params
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replace(`:${key}`, encodeURIComponent(value));
      path = path.replace(`:${key}?`, encodeURIComponent(value));
    }
  }

  // Remove optional params that weren't provided
  path = path.replace(/\/:[^/]+\?/g, '');

  // Add query string
  if (query && Object.keys(query).length > 0) {
    const searchParams = new URLSearchParams(query);
    path += `?${searchParams.toString()}`;
  }

  return path;
}

export function findRouteByName(name: string, routes: RouteConfig[]): RouteConfig | null {
  for (const route of routes) {
    if (route.name === name) return route;
    if (route.children) {
      const found = findRouteByName(name, route.children);
      if (found) return found;
    }
  }
  return null;
}

// =============================================================================
// Breadcrumb Generator
// =============================================================================

export function generateBreadcrumbs(match: RouteMatch, routes: RouteConfig[]): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/', icon: 'home', isActive: false },
  ];

  for (let i = 0; i < match.matched.length; i++) {
    const route = match.matched[i];
    const isLast = i === match.matched.length - 1;

    let label = '';
    if (route.meta?.breadcrumb) {
      label = typeof route.meta.breadcrumb === 'function'
        ? route.meta.breadcrumb(match)
        : route.meta.breadcrumb;
    } else {
      label = route.meta?.title || route.name || route.path;
    }

    breadcrumbs.push({
      label,
      path: isLast ? undefined : route.path,
      icon: route.meta?.icon,
      isActive: isLast,
    });
  }

  return breadcrumbs;
}

// =============================================================================
// Navigation History
// =============================================================================

export class NavigationHistory {
  private entries: NavigationEntry[] = [];
  private currentIndex: number = -1;
  private maxEntries: number;

  constructor(maxEntries: number = 100) {
    this.maxEntries = maxEntries;
  }

  push(path: string, title?: string, state?: Record<string, unknown>): void {
    // Remove entries after current index (forward history)
    this.entries = this.entries.slice(0, this.currentIndex + 1);

    this.entries.push({
      path,
      timestamp: Date.now(),
      title,
      state,
    });

    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }

    this.currentIndex = this.entries.length - 1;
  }

  replace(path: string, title?: string, state?: Record<string, unknown>): void {
    if (this.currentIndex >= 0) {
      this.entries[this.currentIndex] = {
        path,
        timestamp: Date.now(),
        title,
        state,
      };
    } else {
      this.push(path, title, state);
    }
  }

  back(): NavigationEntry | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.entries[this.currentIndex];
    }
    return null;
  }

  forward(): NavigationEntry | null {
    if (this.currentIndex < this.entries.length - 1) {
      this.currentIndex++;
      return this.entries[this.currentIndex];
    }
    return null;
  }

  canGoBack(): boolean {
    return this.currentIndex > 0;
  }

  canGoForward(): boolean {
    return this.currentIndex < this.entries.length - 1;
  }

  current(): NavigationEntry | null {
    return this.entries[this.currentIndex] || null;
  }

  getEntries(): NavigationEntry[] {
    return [...this.entries];
  }

  getBackStack(): NavigationEntry[] {
    return this.entries.slice(0, this.currentIndex);
  }

  getForwardStack(): NavigationEntry[] {
    return this.entries.slice(this.currentIndex + 1);
  }

  clear(): void {
    this.entries = [];
    this.currentIndex = -1;
  }
}

// =============================================================================
// Route Transition Presets
// =============================================================================

export const ROUTE_TRANSITIONS: Record<string, RouteTransition> = {
  fade: {
    name: 'fade',
    enterClass: 'opacity-0',
    leaveClass: 'opacity-100',
    enterActiveClass: 'transition-opacity duration-300',
    leaveActiveClass: 'transition-opacity duration-300',
    duration: 300,
    mode: 'out-in',
  },
  slideLeft: {
    name: 'slide-left',
    enterClass: 'translate-x-full opacity-0',
    leaveClass: 'translate-x-0 opacity-100',
    enterActiveClass: 'transition-all duration-300 ease-out',
    leaveActiveClass: 'transition-all duration-300 ease-in',
    duration: 300,
    mode: 'out-in',
  },
  slideRight: {
    name: 'slide-right',
    enterClass: '-translate-x-full opacity-0',
    leaveClass: 'translate-x-0 opacity-100',
    enterActiveClass: 'transition-all duration-300 ease-out',
    leaveActiveClass: 'transition-all duration-300 ease-in',
    duration: 300,
    mode: 'out-in',
  },
  slideUp: {
    name: 'slide-up',
    enterClass: 'translate-y-full opacity-0',
    leaveClass: 'translate-y-0 opacity-100',
    enterActiveClass: 'transition-all duration-300 ease-out',
    leaveActiveClass: 'transition-all duration-300 ease-in',
    duration: 300,
    mode: 'out-in',
  },
  slideDown: {
    name: 'slide-down',
    enterClass: '-translate-y-full opacity-0',
    leaveClass: 'translate-y-0 opacity-100',
    enterActiveClass: 'transition-all duration-300 ease-out',
    leaveActiveClass: 'transition-all duration-300 ease-in',
    duration: 300,
    mode: 'out-in',
  },
  scale: {
    name: 'scale',
    enterClass: 'scale-95 opacity-0',
    leaveClass: 'scale-100 opacity-100',
    enterActiveClass: 'transition-all duration-300 ease-out',
    leaveActiveClass: 'transition-all duration-200 ease-in',
    duration: 300,
    mode: 'out-in',
  },
  scaleRotate: {
    name: 'scale-rotate',
    enterClass: 'scale-0 rotate-180 opacity-0',
    leaveClass: 'scale-100 rotate-0 opacity-100',
    enterActiveClass: 'transition-all duration-500 ease-out',
    leaveActiveClass: 'transition-all duration-300 ease-in',
    duration: 500,
    mode: 'out-in',
  },
  flip: {
    name: 'flip',
    enterClass: 'rotateY-90 opacity-0',
    leaveClass: 'rotateY-0 opacity-100',
    enterActiveClass: 'transition-all duration-500 ease-out',
    leaveActiveClass: 'transition-all duration-300 ease-in',
    duration: 500,
    mode: 'out-in',
  },
  none: {
    name: 'none',
    enterClass: '',
    leaveClass: '',
    enterActiveClass: '',
    leaveActiveClass: '',
    duration: 0,
    mode: 'default',
  },
};

// =============================================================================
// Route Templates for Common App Types
// =============================================================================

export const ROUTE_TEMPLATES: Record<string, RouteConfig[]> = {
  landing: [
    { id: 'home', path: '/', name: 'Home', title: 'Home', meta: { showInNav: true, navOrder: 1, scrollBehavior: 'top' } },
    { id: 'features', path: '/features', name: 'Features', title: 'Features', meta: { showInNav: true, navOrder: 2 } },
    { id: 'pricing', path: '/pricing', name: 'Pricing', title: 'Pricing', meta: { showInNav: true, navOrder: 3 } },
    { id: 'about', path: '/about', name: 'About', title: 'About Us', meta: { showInNav: true, navOrder: 4 } },
    { id: 'contact', path: '/contact', name: 'Contact', title: 'Contact Us', meta: { showInNav: true, navOrder: 5 } },
    { id: 'blog', path: '/blog', name: 'Blog', title: 'Blog', meta: { showInNav: true, navOrder: 6 } },
    { id: 'blog-post', path: '/blog/:slug', name: 'BlogPost', title: 'Blog Post' },
    { id: 'privacy', path: '/privacy', name: 'Privacy', title: 'Privacy Policy' },
    { id: 'terms', path: '/terms', name: 'Terms', title: 'Terms of Service' },
    { id: 'not-found', path: '*', name: 'NotFound', title: '404 - Page Not Found' },
  ],
  dashboard: [
    { id: 'login', path: '/login', name: 'Login', title: 'Sign In', meta: { layout: 'auth' } },
    { id: 'register', path: '/register', name: 'Register', title: 'Sign Up', meta: { layout: 'auth' } },
    { id: 'forgot-password', path: '/forgot-password', name: 'ForgotPassword', title: 'Forgot Password', meta: { layout: 'auth' } },
    {
      id: 'dashboard',
      path: '/dashboard',
      name: 'Dashboard',
      title: 'Dashboard',
      meta: { requiresAuth: true, showInNav: true, navOrder: 1, icon: 'home', layout: 'dashboard' },
    },
    {
      id: 'projects',
      path: '/projects',
      name: 'Projects',
      title: 'Projects',
      meta: { requiresAuth: true, showInNav: true, navOrder: 2, icon: 'folder' },
      children: [
        { id: 'project-detail', path: '/:id', name: 'ProjectDetail', title: 'Project' },
        { id: 'project-settings', path: '/:id/settings', name: 'ProjectSettings', title: 'Project Settings' },
      ],
    },
    {
      id: 'analytics',
      path: '/analytics',
      name: 'Analytics',
      title: 'Analytics',
      meta: { requiresAuth: true, showInNav: true, navOrder: 3, icon: 'chart', permissions: ['analytics:view'] },
    },
    {
      id: 'settings',
      path: '/settings',
      name: 'Settings',
      title: 'Settings',
      meta: { requiresAuth: true, showInNav: true, navOrder: 10, icon: 'settings' },
      children: [
        { id: 'profile', path: '/profile', name: 'Profile', title: 'Profile', meta: { breadcrumb: 'Profile' } },
        { id: 'security', path: '/security', name: 'Security', title: 'Security', meta: { breadcrumb: 'Security' } },
        { id: 'notifications-settings', path: '/notifications', name: 'NotificationSettings', title: 'Notifications' },
        { id: 'team', path: '/team', name: 'Team', title: 'Team', meta: { permissions: ['team:manage'] } },
        { id: 'billing', path: '/billing', name: 'Billing', title: 'Billing', meta: { permissions: ['billing:manage'] } },
      ],
    },
  ],
  ecommerce: [
    { id: 'home', path: '/', name: 'Home', title: 'Store', meta: { showInNav: true, navOrder: 1 } },
    { id: 'shop', path: '/shop', name: 'Shop', title: 'Shop', meta: { showInNav: true, navOrder: 2 } },
    { id: 'category', path: '/shop/:category', name: 'Category', title: 'Category' },
    { id: 'product', path: '/shop/:category/:slug', name: 'Product', title: 'Product' },
    { id: 'cart', path: '/cart', name: 'Cart', title: 'Shopping Cart', meta: { showInNav: true, icon: 'cart' } },
    { id: 'checkout', path: '/checkout', name: 'Checkout', title: 'Checkout', meta: { requiresAuth: true } },
    { id: 'order-success', path: '/order/:orderId/success', name: 'OrderSuccess', title: 'Order Confirmed' },
    {
      id: 'account',
      path: '/account',
      name: 'Account',
      title: 'My Account',
      meta: { requiresAuth: true },
      children: [
        { id: 'orders', path: '/orders', name: 'Orders', title: 'My Orders' },
        { id: 'order-detail', path: '/orders/:orderId', name: 'OrderDetail', title: 'Order Details' },
        { id: 'addresses', path: '/addresses', name: 'Addresses', title: 'Saved Addresses' },
        { id: 'wishlist', path: '/wishlist', name: 'Wishlist', title: 'Wishlist' },
      ],
    },
    { id: 'search', path: '/search', name: 'Search', title: 'Search Results' },
  ],
  blog: [
    { id: 'home', path: '/', name: 'Home', title: 'Blog', meta: { showInNav: true, navOrder: 1 } },
    { id: 'posts', path: '/posts', name: 'Posts', redirect: '/' },
    { id: 'post', path: '/posts/:slug', name: 'Post', title: 'Blog Post' },
    { id: 'category', path: '/category/:slug', name: 'Category', title: 'Category' },
    { id: 'tag', path: '/tag/:slug', name: 'Tag', title: 'Tag' },
    { id: 'author', path: '/author/:username', name: 'Author', title: 'Author' },
    { id: 'archive', path: '/archive/:year/:month?', name: 'Archive', title: 'Archive' },
    { id: 'search', path: '/search', name: 'Search', title: 'Search' },
    { id: 'about', path: '/about', name: 'About', title: 'About', meta: { showInNav: true, navOrder: 2 } },
    { id: 'rss', path: '/rss.xml', name: 'RSS', title: 'RSS Feed' },
  ],
  portfolio: [
    { id: 'home', path: '/', name: 'Home', title: 'Portfolio', meta: { showInNav: true, navOrder: 1 } },
    { id: 'work', path: '/work', name: 'Work', title: 'My Work', meta: { showInNav: true, navOrder: 2 } },
    { id: 'project', path: '/work/:slug', name: 'Project', title: 'Project' },
    { id: 'about', path: '/about', name: 'About', title: 'About Me', meta: { showInNav: true, navOrder: 3 } },
    { id: 'services', path: '/services', name: 'Services', title: 'Services', meta: { showInNav: true, navOrder: 4 } },
    { id: 'contact', path: '/contact', name: 'Contact', title: 'Contact', meta: { showInNav: true, navOrder: 5 } },
    { id: 'resume', path: '/resume', name: 'Resume', title: 'Resume' },
  ],
};

// =============================================================================
// Navigation Menu Builder
// =============================================================================

export interface NavMenuItem {
  label: string;
  path: string;
  icon?: string;
  children?: NavMenuItem[];
  isActive?: boolean;
  badge?: string | number;
  target?: '_self' | '_blank';
  order: number;
}

export function buildNavigationMenu(routes: RouteConfig[], currentPath?: string): NavMenuItem[] {
  const navRoutes = routes.filter(r => r.meta?.showInNav);

  return navRoutes
    .sort((a, b) => (a.meta?.navOrder || 99) - (b.meta?.navOrder || 99))
    .map(route => {
      const item: NavMenuItem = {
        label: route.meta?.title || route.title || route.name,
        path: route.path,
        icon: route.meta?.icon,
        isActive: currentPath === route.path || currentPath?.startsWith(route.path + '/'),
        order: route.meta?.navOrder || 99,
      };

      if (route.children) {
        item.children = route.children
          .filter(c => c.meta?.showInNav)
          .sort((a, b) => (a.meta?.navOrder || 99) - (b.meta?.navOrder || 99))
          .map(child => ({
            label: child.meta?.title || child.title || child.name,
            path: `${route.path}${child.path}`.replace(/\/+/g, '/'),
            icon: child.meta?.icon,
            isActive: currentPath === `${route.path}${child.path}`.replace(/\/+/g, '/'),
            order: child.meta?.navOrder || 99,
          }));
      }

      return item;
    });
}

// =============================================================================
// Route Code Generation
// =============================================================================

export function generateNextJSRoutes(routes: RouteConfig[]): string {
  let code = `// Auto-generated Next.js App Router structure\n`;
  code += `// Place these files in your app/ directory\n\n`;

  const processRoute = (route: RouteConfig, parentPath: string = '') => {
    const fullPath = `${parentPath}${route.path}`.replace(/\/+/g, '/');
    const dirPath = fullPath
      .replace(/^\//, '')
      .replace(/:(\w+)/g, '[$1]')
      .replace(/\*/g, '[...slug]');

    code += `// app/${dirPath || '(root)'}/page.tsx\n`;
    code += `export default function ${toPascalCase(route.name)}Page() {\n`;
    code += `  return (\n`;
    code += `    <div>\n`;
    code += `      <h1>${route.title || route.name}</h1>\n`;
    code += `    </div>\n`;
    code += `  );\n`;
    code += `}\n\n`;

    if (route.meta?.title) {
      code += `// app/${dirPath || '(root)'}/layout.tsx\n`;
      code += `export const metadata = {\n`;
      code += `  title: '${route.meta.title}',\n`;
      if (route.meta.description) {
        code += `  description: '${route.meta.description}',\n`;
      }
      code += `};\n\n`;
    }

    if (route.children) {
      for (const child of route.children) {
        processRoute(child, fullPath);
      }
    }
  };

  for (const route of routes) {
    processRoute(route);
  }

  return code;
}

export function generateReactRouterCode(routes: RouteConfig[]): string {
  let code = `import { createBrowserRouter, RouterProvider } from 'react-router-dom';\n\n`;
  code += `// Auto-generated React Router configuration\n\n`;

  const processRoutes = (routes: RouteConfig[], indent: string = '    '): string => {
    let str = '';
    for (const route of routes) {
      str += `${indent}{\n`;
      str += `${indent}  path: '${route.path}',\n`;
      if (route.name) str += `${indent}  // name: '${route.name}'\n`;
      str += `${indent}  element: <${toPascalCase(route.name)}Page />,\n`;
      if (route.redirect) str += `${indent}  loader: () => redirect('${route.redirect}'),\n`;
      if (route.children && route.children.length > 0) {
        str += `${indent}  children: [\n`;
        str += processRoutes(route.children, indent + '    ');
        str += `${indent}  ],\n`;
      }
      str += `${indent}},\n`;
    }
    return str;
  };

  code += `const router = createBrowserRouter([\n`;
  code += processRoutes(routes);
  code += `]);\n\n`;

  code += `export default function App() {\n`;
  code += `  return <RouterProvider router={router} />;\n`;
  code += `}\n`;

  return code;
}

function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

// =============================================================================
// Sitemap Generation from Routes
// =============================================================================

export function generateSitemapFromRoutes(
  routes: RouteConfig[],
  baseUrl: string,
  options?: { defaultPriority?: number; defaultChangeFreq?: string }
): string {
  const priority = options?.defaultPriority || 0.5;
  const changefreq = options?.defaultChangeFreq || 'weekly';

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  const processRoute = (route: RouteConfig, parentPath: string = '') => {
    // Skip dynamic routes and non-indexable routes
    if (route.path.includes(':') || route.path === '*' || route.meta?.seo?.noIndex) return;

    const fullPath = `${parentPath}${route.path}`.replace(/\/+/g, '/');
    const routePriority = fullPath === '/' ? 1.0 : priority;

    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${fullPath}</loc>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${routePriority}</priority>\n`;
    xml += '  </url>\n';

    if (route.children) {
      for (const child of route.children) {
        processRoute(child, fullPath);
      }
    }
  };

  for (const route of routes) {
    processRoute(route);
  }

  xml += '</urlset>';
  return xml;
}

// =============================================================================
// Route Validation
// =============================================================================

export interface RouteValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateRoutes(routes: RouteConfig[]): RouteValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const paths = new Set<string>();
  const names = new Set<string>();

  const checkRoute = (route: RouteConfig, parentPath: string = '') => {
    const fullPath = `${parentPath}${route.path}`.replace(/\/+/g, '/');

    // Check duplicate paths
    if (paths.has(fullPath)) {
      errors.push(`Duplicate path: ${fullPath}`);
    }
    paths.add(fullPath);

    // Check duplicate names
    if (route.name) {
      if (names.has(route.name)) {
        errors.push(`Duplicate route name: ${route.name}`);
      }
      names.add(route.name);
    } else {
      warnings.push(`Route at path "${fullPath}" has no name`);
    }

    // Check path format
    if (!route.path.startsWith('/') && !route.path.startsWith(':') && route.path !== '*') {
      warnings.push(`Path "${route.path}" should start with /`);
    }

    // Check redirect target exists
    if (route.redirect) {
      const redirectExists = routes.some(r => r.path === route.redirect);
      if (!redirectExists) {
        warnings.push(`Redirect target "${route.redirect}" may not exist`);
      }
    }

    // Check meta
    if (!route.title && !route.meta?.title) {
      warnings.push(`Route "${route.name || fullPath}" has no title (bad for SEO)`);
    }

    // Check children
    if (route.children) {
      for (const child of route.children) {
        checkRoute(child, fullPath);
      }
    }
  };

  // Check for catch-all route
  const hasCatchAll = routes.some(r => r.path === '*' || r.path === '**');
  if (!hasCatchAll) {
    warnings.push('No catch-all route (*) defined for 404 handling');
  }

  // Check for home route
  const hasHome = routes.some(r => r.path === '/');
  if (!hasHome) {
    warnings.push('No home route (/) defined');
  }

  for (const route of routes) {
    checkRoute(route);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
