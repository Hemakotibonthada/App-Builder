/**
 * Single Page API Routes
 * GET    /api/projects/[id]/pages/[pageId] - Get page with widgets
 * PUT    /api/projects/[id]/pages/[pageId] - Update page
 * DELETE /api/projects/[id]/pages/[pageId] - Delete page
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  successResponse,
  notFoundResponse,
  errorResponse,
  withErrorHandler,
} from '@/lib/api-helpers';
import { updatePageSchema } from '@/lib/validations';
import { randomUUID } from 'crypto';

type RouteParams = { params: Promise<{ id: string; pageId: string }> };

// GET /api/projects/[id]/pages/[pageId]
export const GET = withErrorHandler(async (_req: Request, { params }: RouteParams) => {
  const { id, pageId } = await params;

  const page = await prisma.page.findFirst({
    where: { id: pageId, projectId: id },
    include: {
      widgets: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!page) return notFoundResponse('Page');
  return successResponse(page);
});

// PUT /api/projects/[id]/pages/[pageId]
export const PUT = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id, pageId } = await params;
  const body = await req.json();
  const parsed = updatePageSchema.parse(body);

  const existing = await prisma.page.findFirst({
    where: { id: pageId, projectId: id },
  });
  if (!existing) return notFoundResponse('Page');

  // Check path uniqueness if changing path
  if (parsed.path && parsed.path !== existing.path) {
    const pathExists = await prisma.page.findFirst({
      where: { projectId: id, path: parsed.path, id: { not: pageId } },
    });
    if (pathExists) return errorResponse(`Path "${parsed.path}" already exists`, 409);
  }

  // If setting as home page, unset others
  if (parsed.isHomePage) {
    await prisma.page.updateMany({
      where: { projectId: id, isHomePage: true, id: { not: pageId } },
      data: { isHomePage: false },
    });
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.name !== undefined) updateData.name = parsed.name;
  if (parsed.path !== undefined) updateData.path = parsed.path;
  if (parsed.title !== undefined) updateData.title = parsed.title;
  if (parsed.description !== undefined) updateData.description = parsed.description;
  if (parsed.ogImage !== undefined) updateData.ogImage = parsed.ogImage;
  if (parsed.isHomePage !== undefined) updateData.isHomePage = parsed.isHomePage;
  if (parsed.isPublished !== undefined) updateData.isPublished = parsed.isPublished;
  if (parsed.sortOrder !== undefined) updateData.sortOrder = parsed.sortOrder;
  if (parsed.layout !== undefined) updateData.layout = parsed.layout;
  if (parsed.meta !== undefined) updateData.meta = JSON.stringify(parsed.meta);
  if (parsed.customCSS !== undefined) updateData.customCSS = parsed.customCSS;
  if (parsed.customJS !== undefined) updateData.customJS = parsed.customJS;

  const page = await prisma.page.update({
    where: { id: pageId },
    data: updateData,
  });

  return successResponse(page);
});

// DELETE /api/projects/[id]/pages/[pageId]
export const DELETE = withErrorHandler(async (_req: Request, { params }: RouteParams) => {
  const { id, pageId } = await params;

  const existing = await prisma.page.findFirst({
    where: { id: pageId, projectId: id },
  });
  if (!existing) return notFoundResponse('Page');

  if (existing.isHomePage) {
    return errorResponse('Cannot delete the home page. Set another page as home first.', 400);
  }

  await prisma.page.delete({ where: { id: pageId } });

  // Log activity
  await prisma.activityLog.create({
    data: {
      id: randomUUID(),
      projectId: id,
      action: 'delete',
      entityType: 'page',
      entityId: pageId,
      details: JSON.stringify({ name: existing.name, path: existing.path }),
    },
  });

  return successResponse({ message: 'Page deleted successfully' });
});
