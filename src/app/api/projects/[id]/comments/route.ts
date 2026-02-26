/**
 * Comments API Routes
 * GET    /api/projects/[id]/comments  - List comments
 * POST   /api/projects/[id]/comments  - Create comment
 * PUT    /api/projects/[id]/comments  - Update comment
 * DELETE /api/projects/[id]/comments  - Delete comment
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
import { createCommentSchema, updateCommentSchema } from '@/lib/validations';
import { authenticateRequest } from '@/lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/projects/[id]/comments
export const GET = withErrorHandler(async (req: Request, { params }: RouteParams) => {
  const { id } = await params;
  const url = new URL(req.url);
  const widgetId = url.searchParams.get('widgetId');
  const pageId = url.searchParams.get('pageId');
  const resolved = url.searchParams.get('resolved');

  const where: Record<string, unknown> = { projectId: id, parentId: null }; // Top-level only
  if (widgetId) where.widgetId = widgetId;
  if (pageId) where.pageId = pageId;
  if (resolved !== null) where.resolved = resolved === 'true';

  const comments = await prisma.comment.findMany({
    where,
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
      },
      replies: {
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse(comments);
});

// POST /api/projects/[id]/comments
export const POST = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const parsed = createCommentSchema.parse(body);
  const auth = await authenticateRequest(req);

  const userId = auth?.userId || (await prisma.user.findFirst())?.id;
  if (!userId) return notFoundResponse('User');

  const comment = await prisma.comment.create({
    data: {
      id: randomUUID(),
      projectId: id,
      userId,
      parentId: parsed.parentId || null,
      widgetId: parsed.widgetId || null,
      pageId: parsed.pageId || null,
      content: parsed.content,
      position: parsed.position ? JSON.stringify(parsed.position) : null,
    },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
      },
    },
  });

  return createdResponse(comment);
});

// PUT /api/projects/[id]/comments
export const PUT = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const commentId = body.id as string;
  const parsed = updateCommentSchema.parse(body);

  const existing = await prisma.comment.findFirst({
    where: { id: commentId, projectId: id },
  });
  if (!existing) return notFoundResponse('Comment');

  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: {
      content: parsed.content,
      resolved: parsed.resolved,
    },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
      },
    },
  });

  return successResponse(comment);
});

// DELETE /api/projects/[id]/comments
export const DELETE = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const commentId = body.id as string;

  const existing = await prisma.comment.findFirst({
    where: { id: commentId, projectId: id },
  });
  if (!existing) return notFoundResponse('Comment');

  // Delete comment and all replies
  await prisma.comment.deleteMany({ where: { parentId: commentId } });
  await prisma.comment.delete({ where: { id: commentId } });

  return successResponse({ message: 'Comment deleted' });
});
