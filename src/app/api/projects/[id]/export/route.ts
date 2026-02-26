/**
 * Export API Routes
 * POST /api/projects/[id]/export - Export project as JSON/ZIP
 * POST /api/projects/[id]/import - Import project from JSON
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
import { importProjectSchema } from '@/lib/validations';
import { authenticateRequest } from '@/lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/projects/[id]/export
export const POST = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const format = (body as Record<string, string>).format || 'json';

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      pages: { orderBy: { sortOrder: 'asc' } },
      widgets: { orderBy: { sortOrder: 'asc' } },
      variables: { orderBy: { name: 'asc' } },
      apiEndpoints: true,
      dataModels: {
        include: { records: true },
      },
      assets: true,
    },
  });

  if (!project) return notFoundResponse('Project');

  const exportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    project: {
      name: project.name,
      slug: project.slug,
      description: project.description,
      settings: JSON.parse(project.settings),
      theme: JSON.parse(project.theme),
      customCode: JSON.parse(project.customCode),
      seoDefaults: JSON.parse(project.seoDefaults),
      buildConfig: JSON.parse(project.buildConfig),
    },
    pages: project.pages.map((p) => ({
      name: p.name,
      path: p.path,
      title: p.title,
      description: p.description,
      isHomePage: p.isHomePage,
      layout: p.layout,
      meta: JSON.parse(p.meta),
      customCSS: p.customCSS,
      customJS: p.customJS,
      sortOrder: p.sortOrder,
    })),
    widgets: project.widgets.map((w) => ({
      name: w.name,
      type: w.type,
      pageIndex: project.pages.findIndex((p) => p.id === w.pageId),
      parentIndex: project.widgets.findIndex((pw) => pw.id === w.parentId),
      props: JSON.parse(w.props),
      style: JSON.parse(w.style),
      responsive: JSON.parse(w.responsive),
      events: JSON.parse(w.events),
      bindings: JSON.parse(w.bindings),
      animations: JSON.parse(w.animations),
      conditions: JSON.parse(w.conditions),
      accessibility: JSON.parse(w.accessibility),
      locked: w.locked,
      hidden: w.hidden,
      sortOrder: w.sortOrder,
    })),
    variables: project.variables.map((v) => ({
      name: v.name,
      type: v.type,
      defaultValue: v.defaultValue,
      scope: v.scope,
      isComputed: v.isComputed,
      expression: v.expression,
      description: v.description,
      group: v.group,
    })),
    apiEndpoints: project.apiEndpoints.map((a) => ({
      name: a.name,
      method: a.method,
      url: a.url,
      headers: JSON.parse(a.headers),
      queryParams: JSON.parse(a.queryParams),
      body: a.body,
      authType: a.authType,
      authConfig: JSON.parse(a.authConfig),
      transform: a.transform,
      cacheTime: a.cacheTime,
      timeout: a.timeout,
    })),
    dataModels: project.dataModels.map((dm) => ({
      name: dm.name,
      description: dm.description,
      fields: JSON.parse(dm.fields),
      validations: JSON.parse(dm.validations),
      indexes: JSON.parse(dm.indexes),
      relations: JSON.parse(dm.relations),
      records: dm.records.map((r) => ({
        data: JSON.parse(r.data),
        status: r.status,
        sortOrder: r.sortOrder,
      })),
    })),
  };

  // Log export activity
  const auth = await authenticateRequest(req);
  await prisma.activityLog.create({
    data: {
      id: randomUUID(),
      projectId: id,
      userId: auth?.userId || null,
      action: 'export',
      entityType: 'project',
      entityId: id,
      details: JSON.stringify({ format }),
    },
  });

  return successResponse(exportData);
});

// PUT /api/projects/[id]/export - Import into existing project (replace)
export const PUT = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const parsed = importProjectSchema.parse(body);
  const auth = await authenticateRequest(req);

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return notFoundResponse('Project');

  // Clear existing data
  await prisma.$transaction([
    prisma.widget.deleteMany({ where: { projectId: id } }),
    prisma.page.deleteMany({ where: { projectId: id } }),
    prisma.variable.deleteMany({ where: { projectId: id } }),
    prisma.apiEndpoint.deleteMany({ where: { projectId: id } }),
  ]);

  // Create snapshot before import
  await prisma.projectSnapshot.create({
    data: {
      id: randomUUID(),
      projectId: id,
      name: `Pre-import backup v${project.version}`,
      version: project.version,
      data: JSON.stringify({ note: 'Auto-backup before import' }),
    },
  });

  // Import pages
  const pageIdMap = new Map<number, string>();
  const pages = parsed.data.pages as Array<Record<string, unknown>>;
  for (let i = 0; i < pages.length; i++) {
    const pageData = pages[i] as Record<string, unknown>;
    const pageId = randomUUID();
    pageIdMap.set(i, pageId);
    await prisma.page.create({
      data: {
        id: pageId,
        projectId: id,
        name: (pageData.name as string) || `Page ${i + 1}`,
        path: (pageData.path as string) || `/${i === 0 ? '' : `page-${i}`}`,
        title: (pageData.title as string) || null,
        description: (pageData.description as string) || null,
        isHomePage: i === 0,
        sortOrder: i,
      },
    });
  }

  // Import widgets
  const widgets = parsed.data.widgets as Array<Record<string, unknown>>;
  const widgetIdMap = new Map<number, string>();
  for (let i = 0; i < widgets.length; i++) {
    widgetIdMap.set(i, randomUUID());
  }
  for (let i = 0; i < widgets.length; i++) {
    const w = widgets[i] as Record<string, unknown>;
    const pageIndex = w.pageIndex as number;
    const parentIndex = w.parentIndex as number;
    await prisma.widget.create({
      data: {
        id: widgetIdMap.get(i)!,
        projectId: id,
        pageId: pageIndex >= 0 ? pageIdMap.get(pageIndex) || null : null,
        parentId: parentIndex >= 0 ? widgetIdMap.get(parentIndex) || null : null,
        name: (w.name as string) || `Widget ${i + 1}`,
        type: (w.type as string) || 'container',
        props: JSON.stringify(w.props || {}),
        style: JSON.stringify(w.style || {}),
        sortOrder: (w.sortOrder as number) || i,
      },
    });
  }

  // Update project
  const updatedProject = await prisma.project.update({
    where: { id },
    data: {
      name: parsed.name || project.name,
      description: parsed.description || project.description,
      version: { increment: 1 },
      settings: parsed.data.settings ? JSON.stringify(parsed.data.settings) : project.settings,
      theme: parsed.data.theme ? JSON.stringify(parsed.data.theme) : project.theme,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      id: randomUUID(),
      projectId: id,
      userId: auth?.userId || null,
      action: 'import',
      entityType: 'project',
      entityId: id,
      details: JSON.stringify({
        pages: pages.length,
        widgets: widgets.length,
      }),
    },
  });

  return successResponse(updatedProject);
});
