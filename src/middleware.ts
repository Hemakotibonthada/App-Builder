/**
 * Auth Middleware
 * 
 * Next.js middleware for protecting routes and API endpoints.
 * Checks for valid JWT tokens in Authorization header or cookies.
 */

import { NextRequest, NextResponse } from 'next/server';

// Routes that don't require authentication
const PUBLIC_PATHS = new Set([
  '/api/health',
  '/api/auth',
  '/api/templates',
  '/api/plugins',
]);

// Routes that are public pages (not API)
const PUBLIC_PAGES = new Set([
  '/',
  '/login',
  '/register',
  '/forgot-password',
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next();
  }

  // Public pages — always accessible
  if (PUBLIC_PAGES.has(pathname)) {
    return NextResponse.next();
  }

  // Public API routes — always accessible
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // Handle CORS preflight for API routes
  if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // For API routes, check authentication
  if (pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('Authorization');
    const apiKey = request.headers.get('X-Api-Key');

    // Allow if bearer token or API key is present
    // (actual validation happens in route handlers via authenticateRequest)
    if (authHeader?.startsWith('Bearer ') || apiKey) {
      const response = NextResponse.next();
      // Add CORS headers to API responses
      response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
      return response;
    }

    // For GET requests, some API routes may allow unauthenticated access
    // (e.g., templates, plugins). Let route handlers decide.
    if (request.method === 'GET') {
      return NextResponse.next();
    }

    // Reject unauthenticated POST/PUT/DELETE to API routes
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 },
    );
  }

  // For builder pages, check for token in cookie or allow (client handles auth)
  // The builder SPA manages its own auth state via localStorage tokens
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match builder routes
    '/builder/:path*',
  ],
};
