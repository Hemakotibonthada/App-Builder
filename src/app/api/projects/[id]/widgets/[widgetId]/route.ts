/**
 * Single Widget API Routes
 * GET    /api/projects/[id]/widgets/[widgetId] - Get widget
 * PUT    /api/projects/[id]/widgets/[widgetId] - Update widget
 * DELETE /api/projects/[id]/widgets/[widgetId] - Delete widget
 * PATCH  /api/projects/[id]/widgets/[widgetId] - Widget actions (move, duplicate, lock)
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
import { updateWidgetSchema, moveWidgetSchema } from '@/lib/validations';

type RouteParams = { params: Promise<{ id: string; widgetId: string }> };

// GET /api/projects/[id]/widgets/[widgetId]
export const GET = withErrorHandler(async (_req: Request, { params }: RouteParams) => {
  const { id, widgetId } = await params;

  const widget = await prisma.widget.findFirst({
    where: { id: widgetId, projectId: id },
    include: {
      children: {
        orderBy: { sortOrder: 'asc' },
      },
      parent: {
        select: { id: true, name: true, type: true },
      },
    },
  });

  if (!widget) return notFoundResponse('Widget');
  return successResponse(widget);
});

// PUT /api/projects/[id]/widgets/[widgetId]
export const PUT = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id, widgetId } = await params;
  const body = await req.json();
  const parsed = updateWidgetSchema.parse(body);

  const existing = await prisma.widget.findFirst({
    where: { id: widgetId, projectId: id },
  });
  if (!existing) return notFoundResponse('Widget');

  const data: Record<string, unknown> = {};
  if (parsed.name !== undefined) data.name = parsed.name;
  if (parsed.parentId !== undefined) data.parentId = parsed.parentId;
  if (parsed.pageId !== undefined) data.pageId = parsed.pageId;
  if (parsed.props !== undefined) data.props = JSON.stringify(parsed.props);
  if (parsed.style !== undefined) data.style = JSON.stringify(parsed.style);
  if (parsed.responsive !== undefined) data.responsive = JSON.stringify(parsed.responsive);
  if (parsed.events !== undefined) data.events = JSON.stringify(parsed.events);
  if (parsed.bindings !== undefined) data.bindings = JSON.stringify(parsed.bindings);
  if (parsed.animations !== undefined) data.animations = JSON.stringify(parsed.animations);
  if (parsed.conditions !== undefined) data.conditions = JSON.stringify(parsed.conditions);
  if (parsed.accessibility !== undefined) data.accessibility = JSON.stringify(parsed.accessibility);
  if (parsed.locked !== undefined) data.locked = parsed.locked;
  if (parsed.hidden !== undefined) data.hidden = parsed.hidden;
  if (parsed.sortOrder !== undefined) data.sortOrder = parsed.sortOrder;

  const widget = await prisma.widget.update({
    where: { id: widgetId },
    data,
    include: {
      children: { orderBy: { sortOrder: 'asc' }, select: { id: true, name: true, type: true } },
    },
  });

  return successResponse(widget);
});

// DELETE /api/projects/[id]/widgets/[widgetId]
export const DELETE = withErrorHandler(async (_req: Request, { params }: RouteParams) => {
  const { id, widgetId } = await params;

  const existing = await prisma.widget.findFirst({
    where: { id: widgetId, projectId: id },
  });
  if (!existing) return notFoundResponse('Widget');

  // Recursively delete children
  async function deleteDescendants(parentId: string) {
    const children = await prisma.widget.findMany({
      where: { parentId, projectId: id },
      select: { id: true },
    });
    for (const child of children) {
      await deleteDescendants(child.id);
    }
    await prisma.widget.deleteMany({ where: { parentId, projectId: id } });
  }

  await deleteDescendants(widgetId);
  await prisma.widget.delete({ where: { id: widgetId } });

  return successResponse({ message: 'Widget deleted successfully' });
});

// PATCH /api/projects/[id]/widgets/[widgetId] - Actions
export const PATCH = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id, widgetId } = await params;
  const body = await req.json();
  const action = body.action as string;

  const existing = await prisma.widget.findFirst({
    where: { id: widgetId, projectId: id },
  });
  if (!existing) return notFoundResponse('Widget');

  switch (action) {
    case 'move': {
      const parsed = moveWidgetSchema.parse(body);
      const widget = await prisma.widget.update({
        where: { id: widgetId },
        data: {
          parentId: parsed.parentId || null,
          pageId: parsed.pageId || existing.pageId,
          sortOrder: parsed.sortOrder,
        },
      });
      return successResponse(widget);
    }

    case 'duplicate': {
      const newId = randomUUID();

      // Deep clone function
      async function cloneWidget(sourceId: string, newParentId: string | null): Promise<string> {
        const source = await prisma.widget.findUnique({ where: { id: sourceId } });
        if (!source) throw new Error('Widget not found');

        const cloneId = sourceId === widgetId ? newId : randomUUID();
        await prisma.widget.create({
          data: {
            ...source,
            id: cloneId,
            parentId: newParentId,
            name: sourceId === widgetId ? `${source.name} (Copy)` : source.name,
          },
        });

        // Clone children
        const children = await prisma.widget.findMany({
          where: { parentId: sourceId, projectId: id },
          orderBy: { sortOrder: 'asc' },
        });
        for (const child of children) {
          await cloneWidget(child.id, cloneId);
        }

        return cloneId;
      }

      await cloneWidget(widgetId, existing.parentId);

      const cloned = await prisma.widget.findUnique({
        where: { id: newId },
        include: { children: { orderBy: { sortOrder: 'asc' } } },
      });

      return createdResponse(cloned);
    }

    case 'lock':
      return successResponse(
        await prisma.widget.update({ where: { id: widgetId }, data: { locked: true } }),
      );

    case 'unlock':
      return successResponse(
        await prisma.widget.update({ where: { id: widgetId }, data: { locked: false } }),
      );

    case 'hide':
      return successResponse(
        await prisma.widget.update({ where: { id: widgetId }, data: { hidden: true } }),
      );

    case 'show':
      return successResponse(
        await prisma.widget.update({ where: { id: widgetId }, data: { hidden: false } }),
      );

    default:
      return errorResponse(`Unknown action: ${action}`);
  }
});
