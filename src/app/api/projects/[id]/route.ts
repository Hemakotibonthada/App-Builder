/**
 * Single Project API Routes
 * GET    /api/projects/[id]  - Get project details (full)
 * PUT    /api/projects/[id]  - Update project
 * DELETE /api/projects/[id]  - Delete project
 * PATCH  /api/projects/[id]  - Partial update (publish, archive, etc.)
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  errorResponse,
  withErrorHandler,
} from '@/lib/api-helpers';
import { updateProjectSchema } from '@/lib/validations';
import { authenticateRequest } from '@/lib/auth';
import { randomUUID } from 'crypto';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/projects/[id]
export const GET = withErrorHandler(async (_req: Request, { params }: RouteParams) => {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      owner: {
        select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
      },
      pages: {
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          path: true,
          title: true,
          description: true,
          isHomePage: true,
          isPublished: true,
          sortOrder: true,
          layout: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      widgets: {
        orderBy: { sortOrder: 'asc' },
      },
      variables: {
        orderBy: { name: 'asc' },
      },
      apiEndpoints: {
        orderBy: { name: 'asc' },
      },
      dataModels: {
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { records: true } },
        },
      },
      assets: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
      collaborators: {
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
          },
        },
      },
      _count: {
        select: {
          pages: true,
          widgets: true,
          assets: true,
          variables: true,
          apiEndpoints: true,
          dataModels: true,
          deployments: true,
          comments: true,
          snapshots: true,
        },
      },
    },
  });

  if (!project) return notFoundResponse('Project');
  return successResponse(project);
});

// PUT /api/projects/[id]
export const PUT = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const parsed = updateProjectSchema.parse(body);

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return notFoundResponse('Project');

  const updateData: Record<string, unknown> = {};
  if (parsed.name !== undefined) updateData.name = parsed.name;
  if (parsed.description !== undefined) updateData.description = parsed.description;
  if (parsed.isPublished !== undefined) {
    updateData.isPublished = parsed.isPublished;
    if (parsed.isPublished) updateData.publishedAt = new Date();
  }
  if (parsed.isArchived !== undefined) updateData.isArchived = parsed.isArchived;
  if (parsed.settings !== undefined) updateData.settings = JSON.stringify(parsed.settings);
  if (parsed.theme !== undefined) updateData.theme = JSON.stringify(parsed.theme);
  if (parsed.customCode !== undefined) updateData.customCode = JSON.stringify(parsed.customCode);
  if (parsed.seoDefaults !== undefined) updateData.seoDefaults = JSON.stringify(parsed.seoDefaults);
  if (parsed.buildConfig !== undefined) updateData.buildConfig = JSON.stringify(parsed.buildConfig);

  const project = await prisma.project.update({
    where: { id },
    data: updateData,
    include: {
      owner: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  });

  return successResponse(project);
});

// DELETE /api/projects/[id]
export const DELETE = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return notFoundResponse('Project');

  // Check ownership
  const auth = await authenticateRequest(req);
  if (auth && auth.userId !== existing.ownerId && auth.role !== 'admin') {
    return errorResponse('Only the project owner can delete this project', 403);
  }

  await prisma.project.delete({ where: { id } });

  return successResponse({ message: 'Project deleted successfully' });
});

// PATCH /api/projects/[id] - Quick actions
export const PATCH = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const action = body.action as string;

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return notFoundResponse('Project');

  switch (action) {
    case 'publish': {
      const project = await prisma.project.update({
        where: { id },
        data: { isPublished: true, publishedAt: new Date(), version: { increment: 1 } },
      });
      return successResponse(project);
    }

    case 'unpublish': {
      const project = await prisma.project.update({
        where: { id },
        data: { isPublished: false },
      });
      return successResponse(project);
    }

    case 'archive': {
      const project = await prisma.project.update({
        where: { id },
        data: { isArchived: true },
      });
      return successResponse(project);
    }

    case 'unarchive': {
      const project = await prisma.project.update({
        where: { id },
        data: { isArchived: false },
      });
      return successResponse(project);
    }

    case 'snapshot': {
      const snapshot = await prisma.projectSnapshot.create({
        data: {
          id: randomUUID(),
          projectId: id,
          name: body.name || `Snapshot v${existing.version}`,
          description: body.description || null,
          version: existing.version,
          data: JSON.stringify({
            settings: existing.settings,
            theme: existing.theme,
            customCode: existing.customCode,
            pages: await prisma.page.findMany({ where: { projectId: id } }),
            widgets: await prisma.widget.findMany({ where: { projectId: id } }),
            variables: await prisma.variable.findMany({ where: { projectId: id } }),
          }),
        },
      });
      return createdResponse(snapshot);
    }

    case 'duplicate': {
      const auth = await authenticateRequest(req);
      const newId = randomUUID();
      const newSlug = `${existing.slug}-copy-${Date.now()}`;

      const newProject = await prisma.project.create({
        data: {
          id: newId,
          name: body.name || `${existing.name} (Copy)`,
          slug: newSlug,
          description: existing.description,
          ownerId: auth?.userId || existing.ownerId,
          settings: existing.settings,
          theme: existing.theme,
          customCode: existing.customCode,
          seoDefaults: existing.seoDefaults,
          buildConfig: existing.buildConfig,
        },
      });

      // Clone pages
      const pages = await prisma.page.findMany({ where: { projectId: id } });
      const pageIdMap = new Map<string, string>();
      for (const page of pages) {
        const newPageId = randomUUID();
        pageIdMap.set(page.id, newPageId);
        await prisma.page.create({
          data: { ...page, id: newPageId, projectId: newId },
        });
      }

      // Clone widgets
      const widgets = await prisma.widget.findMany({
        where: { projectId: id },
        orderBy: { sortOrder: 'asc' },
      });
      const widgetIdMap = new Map<string, string>();
      for (const widget of widgets) {
        const newWidgetId = randomUUID();
        widgetIdMap.set(widget.id, newWidgetId);
      }
      for (const widget of widgets) {
        await prisma.widget.create({
          data: {
            ...widget,
            id: widgetIdMap.get(widget.id)!,
            projectId: newId,
            pageId: widget.pageId ? pageIdMap.get(widget.pageId) || null : null,
            parentId: widget.parentId ? widgetIdMap.get(widget.parentId) || null : null,
          },
        });
      }

      // Clone variables
      const variables = await prisma.variable.findMany({ where: { projectId: id } });
      for (const v of variables) {
        await prisma.variable.create({
          data: { ...v, id: randomUUID(), projectId: newId },
        });
      }

      return createdResponse(newProject);
    }

    default:
      return errorResponse(`Unknown action: ${action}`);
  }
});
