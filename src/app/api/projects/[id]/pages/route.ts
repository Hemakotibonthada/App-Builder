/**
 * Pages API Routes
 * GET    /api/projects/[id]/pages       - List pages
 * POST   /api/projects/[id]/pages       - Create page
 * PUT    /api/projects/[id]/pages       - Batch update (reorder)
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { randomUUID } from 'crypto';
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  errorResponse,
  withErrorHandler,
} from '@/lib/api-helpers';
import { createPageSchema, reorderPagesSchema } from '@/lib/validations';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/projects/[id]/pages
export const GET = withErrorHandler(async (_req: Request, { params }: RouteParams) => {
  const { id } = await params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return notFoundResponse('Project');

  const pages = await prisma.page.findMany({
    where: { projectId: id },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { widgets: true } },
    },
  });

  return successResponse(pages);
});

// POST /api/projects/[id]/pages
export const POST = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const parsed = createPageSchema.parse(body);

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return notFoundResponse('Project');

  // Check for duplicate path
  const existing = await prisma.page.findFirst({
    where: { projectId: id, path: parsed.path },
  });
  if (existing) return errorResponse(`Page with path "${parsed.path}" already exists`, 409);

  // If this is set as home page, unset others
  if (parsed.isHomePage) {
    await prisma.page.updateMany({
      where: { projectId: id, isHomePage: true },
      data: { isHomePage: false },
    });
  }

  // Get next sort order
  const maxSort = await prisma.page.findFirst({
    where: { projectId: id },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  });

  const page = await prisma.page.create({
    data: {
      id: randomUUID(),
      projectId: id,
      name: parsed.name,
      path: parsed.path,
      title: parsed.title || parsed.name,
      description: parsed.description || null,
      ogImage: parsed.ogImage || null,
      isHomePage: parsed.isHomePage,
      layout: parsed.layout,
      sortOrder: (maxSort?.sortOrder ?? -1) + 1,
      customCSS: parsed.customCSS || null,
      customJS: parsed.customJS || null,
    },
    include: {
      _count: { select: { widgets: true } },
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      id: randomUUID(),
      projectId: id,
      action: 'create',
      entityType: 'page',
      entityId: page.id,
      details: JSON.stringify({ name: page.name, path: page.path }),
    },
  });

  return createdResponse(page);
});

// PUT /api/projects/[id]/pages - Batch reorder
export const PUT = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const parsed = reorderPagesSchema.parse(body);

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return notFoundResponse('Project');

  // Update sort orders in transaction
  await prisma.$transaction(
    parsed.pages.map((p) =>
      prisma.page.update({
        where: { id: p.id },
        data: { sortOrder: p.sortOrder },
      }),
    ),
  );

  const pages = await prisma.page.findMany({
    where: { projectId: id },
    orderBy: { sortOrder: 'asc' },
  });

  return successResponse(pages);
});
