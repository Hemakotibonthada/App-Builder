/**
 * API Response Helpers
 * 
 * Standardized API response format and error handling utilities
 * for all Next.js API routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';

// ─── Response Types ─────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

// ─── Success Responses ──────────────────────────────────────

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function createdResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
): NextResponse<ApiResponse<T[]>> {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

// ─── Error Responses ────────────────────────────────────────

export function errorResponse(message: string, status = 400): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function notFoundResponse(entity = 'Resource'): NextResponse<ApiResponse> {
  return NextResponse.json(
    { success: false, error: `${entity} not found` },
    { status: 404 },
  );
}

export function unauthorizedResponse(message = 'Unauthorized'): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function forbiddenResponse(message = 'Forbidden'): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

export function conflictResponse(message: string): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: message }, { status: 409 });
}

export function validationErrorResponse(errors: Record<string, string[]>): NextResponse<ApiResponse> {
  return NextResponse.json(
    { success: false, error: 'Validation failed', errors },
    { status: 422 },
  );
}

export function serverErrorResponse(message = 'Internal server error'): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}

// ─── Validation Helpers ─────────────────────────────────────

export function validateBody<T>(schema: ZodSchema<T>, data: unknown): { data: T } | { errors: Record<string, string[]> } {
  try {
    const parsed = schema.parse(data);
    return { data: parsed };
  } catch (err) {
    if (err instanceof ZodError) {
      const errors: Record<string, string[]> = {};
      for (const issue of err.issues) {
        const path = issue.path.join('.') || '_root';
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      }
      return { errors };
    }
    return { errors: { _root: ['Invalid data'] } };
  }
}

// ─── Query Param Helpers ────────────────────────────────────

export function getPageParams(searchParams: URLSearchParams): { page: number; pageSize: number; skip: number } {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip };
}

export function getSortParams(
  searchParams: URLSearchParams,
  allowedFields: string[],
  defaultField = 'createdAt',
  defaultOrder: 'asc' | 'desc' = 'desc',
): { field: string; order: 'asc' | 'desc' } {
  const field = searchParams.get('sortBy') || defaultField;
  const order = (searchParams.get('sortOrder') || defaultOrder) as 'asc' | 'desc';
  return {
    field: allowedFields.includes(field) ? field : defaultField,
    order: ['asc', 'desc'].includes(order) ? order : defaultOrder,
  };
}

export function getSearchParam(searchParams: URLSearchParams): string | undefined {
  const q = searchParams.get('q') || searchParams.get('search');
  return q?.trim() || undefined;
}

// ─── Error Handler Wrapper ──────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RouteHandler = (
  req: any,
  context: any,
) => Promise<NextResponse>;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error('[API Error]', error);

      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.') || '_root';
          if (!errors[path]) errors[path] = [];
          errors[path].push(issue.message);
        }
        return validationErrorResponse(errors);
      }

      if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('No ')) {
          return notFoundResponse();
        }
        if (error.message.includes('unique constraint') || error.message.includes('Unique')) {
          return conflictResponse('Resource already exists');
        }
      }

      return serverErrorResponse();
    }
  };
}

// ─── CORS Headers ───────────────────────────────────────────

export function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key',
    'Access-Control-Max-Age': '86400',
  };
}

export function corsResponse(): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

// ─── Auth Helpers ───────────────────────────────────────────

export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

export function extractApiKey(req: Request): string | null {
  return req.headers.get('X-Api-Key');
}
