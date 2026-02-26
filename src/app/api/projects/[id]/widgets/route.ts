/**
 * Widgets API Routes
 * GET    /api/projects/[id]/widgets       - List widgets (with filters)
 * POST   /api/projects/[id]/widgets       - Create widget
 * PUT    /api/projects/[id]/widgets       - Batch update widgets
 * DELETE /api/projects/[id]/widgets       - Batch delete widgets
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { randomUUID } from 'crypto';
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  withErrorHandler,
} from '@/lib/api-helpers';
import { createWidgetSchema, batchUpdateWidgetsSchema } from '@/lib/validations';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/projects/[id]/widgets
export const GET = withErrorHandler(async (req: Request, { params }: RouteParams) => {
  const { id } = await params;
  const url = new URL(req.url);
  const pageId = url.searchParams.get('pageId');
  const type = url.searchParams.get('type');
  const parentId = url.searchParams.get('parentId');

  const where: Record<string, unknown> = { projectId: id };
  if (pageId) where.pageId = pageId;
  if (type) where.type = type;
  if (parentId) where.parentId = parentId === 'null' ? null : parentId;

  const widgets = await prisma.widget.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
    include: {
      children: {
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, type: true, sortOrder: true },
      },
    },
  });

  return successResponse(widgets);
});

// POST /api/projects/[id]/widgets
export const POST = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const parsed = createWidgetSchema.parse(body);

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return notFoundResponse('Project');

  const widget = await prisma.widget.create({
    data: {
      id: randomUUID(),
      projectId: id,
      pageId: parsed.pageId || null,
      parentId: parsed.parentId || null,
      name: parsed.name,
      type: parsed.type,
      props: JSON.stringify(parsed.props),
      style: JSON.stringify(parsed.style),
      responsive: JSON.stringify(parsed.responsive),
      events: JSON.stringify(parsed.events),
      bindings: JSON.stringify(parsed.bindings),
      animations: JSON.stringify(parsed.animations),
      conditions: JSON.stringify(parsed.conditions),
      accessibility: JSON.stringify(parsed.accessibility),
      sortOrder: parsed.sortOrder,
    },
    include: {
      children: {
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, type: true, sortOrder: true },
      },
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      id: randomUUID(),
      projectId: id,
      action: 'create',
      entityType: 'widget',
      entityId: widget.id,
      details: JSON.stringify({ name: widget.name, type: widget.type }),
    },
  });

  return createdResponse(widget);
});

// PUT /api/projects/[id]/widgets - Batch update
export const PUT = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const parsed = batchUpdateWidgetsSchema.parse(body);

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return notFoundResponse('Project');

  const updates = parsed.widgets.map((item) => {
    const data: Record<string, unknown> = {};
    if (item.data.name !== undefined) data.name = item.data.name;
    if (item.data.parentId !== undefined) data.parentId = item.data.parentId;
    if (item.data.pageId !== undefined) data.pageId = item.data.pageId;
    if (item.data.props !== undefined) data.props = JSON.stringify(item.data.props);
    if (item.data.style !== undefined) data.style = JSON.stringify(item.data.style);
    if (item.data.responsive !== undefined) data.responsive = JSON.stringify(item.data.responsive);
    if (item.data.events !== undefined) data.events = JSON.stringify(item.data.events);
    if (item.data.bindings !== undefined) data.bindings = JSON.stringify(item.data.bindings);
    if (item.data.animations !== undefined) data.animations = JSON.stringify(item.data.animations);
    if (item.data.conditions !== undefined) data.conditions = JSON.stringify(item.data.conditions);
    if (item.data.accessibility !== undefined) data.accessibility = JSON.stringify(item.data.accessibility);
    if (item.data.locked !== undefined) data.locked = item.data.locked;
    if (item.data.hidden !== undefined) data.hidden = item.data.hidden;
    if (item.data.sortOrder !== undefined) data.sortOrder = item.data.sortOrder;

    return prisma.widget.update({
      where: { id: item.id },
      data,
    });
  });

  await prisma.$transaction(updates);

  const widgets = await prisma.widget.findMany({
    where: { projectId: id },
    orderBy: { sortOrder: 'asc' },
  });

  return successResponse(widgets);
});

// DELETE /api/projects/[id]/widgets - Batch delete
export const DELETE = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const widgetIds: string[] = body.ids || [];

  if (widgetIds.length === 0) {
    return successResponse({ deleted: 0 });
  }

  // Recursive delete: find all descendants
  async function getDescendantIds(parentIds: string[]): Promise<string[]> {
    const children = await prisma.widget.findMany({
      where: { parentId: { in: parentIds }, projectId: id },
      select: { id: true },
    });
    const childIds = children.map((c) => c.id);
    if (childIds.length === 0) return [];
    const grandchildren = await getDescendantIds(childIds);
    return [...childIds, ...grandchildren];
  }

  const descendantIds = await getDescendantIds(widgetIds);
  const allIds = [...new Set([...widgetIds, ...descendantIds])];

  const result = await prisma.widget.deleteMany({
    where: { id: { in: allIds }, projectId: id },
  });

  return successResponse({ deleted: result.count });
});
