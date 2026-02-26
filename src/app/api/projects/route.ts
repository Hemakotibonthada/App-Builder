/**
 * Projects API Routes
 * GET    /api/projects          - List all projects (with pagination, search, filters)
 * POST   /api/projects          - Create new project
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { randomUUID } from 'crypto';
import {
  successResponse,
  createdResponse,
  paginatedResponse,
  errorResponse,
  withErrorHandler,
  getPageParams,
  getSortParams,
  getSearchParam,
} from '@/lib/api-helpers';
import { createProjectSchema } from '@/lib/validations';
import { authenticateRequest } from '@/lib/auth';

// GET /api/projects
export const GET = withErrorHandler(async (req: NextRequest) => {
  const url = new URL(req.url);
  const { page, pageSize, skip } = getPageParams(url.searchParams);
  const { field, order } = getSortParams(url.searchParams, ['name', 'createdAt', 'updatedAt'], 'updatedAt');
  const search = getSearchParam(url.searchParams);
  const isTemplate = url.searchParams.get('isTemplate');
  const isArchived = url.searchParams.get('isArchived');

  // Build filter
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (isTemplate !== null && isTemplate !== undefined) {
    where.isTemplate = isTemplate === 'true';
  }
  if (isArchived !== null && isArchived !== undefined) {
    where.isArchived = isArchived === 'true';
  } else {
    where.isArchived = false; // Default: hide archived
  }

  // Optional: filter by owner if authenticated
  const auth = await authenticateRequest(req);
  if (auth) {
    where.OR = [
      { ownerId: auth.userId },
      { collaborators: { some: { userId: auth.userId } } },
      ...(Array.isArray(where.OR) ? where.OR : []),
    ];
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [field]: order },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        thumbnailUrl: true,
        isPublished: true,
        isArchived: true,
        isTemplate: true,
        version: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        owner: {
          select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
        },
        _count: {
          select: { pages: true, widgets: true, assets: true, collaborators: true },
        },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return paginatedResponse(projects, total, page, pageSize);
});

// POST /api/projects
export const POST = withErrorHandler(async (req: NextRequest) => {
  const auth = await authenticateRequest(req);
  const body = await req.json();
  const parsed = createProjectSchema.parse(body);

  // Generate slug from name
  const baseSlug = parsed.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Ensure unique slug
  let slug = baseSlug;
  let counter = 0;
  while (await prisma.project.findUnique({ where: { slug } })) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  const projectId = randomUUID();
  const ownerId = auth?.userId || (await prisma.user.findFirst())?.id || randomUUID();

  // If cloning from template
  let templateData: Record<string, unknown> = {};
  if (parsed.templateId) {
    const template = await prisma.templateEntry.findUnique({ where: { id: parsed.templateId } });
    if (template) {
      templateData = JSON.parse(template.data);
      // Increment template usage
      await prisma.templateEntry.update({
        where: { id: parsed.templateId },
        data: { usageCount: { increment: 1 } },
      });
    }
  }

  const project = await prisma.project.create({
    data: {
      id: projectId,
      name: parsed.name,
      slug,
      description: parsed.description || null,
      ownerId,
      isTemplate: parsed.isTemplate,
      settings: JSON.stringify(parsed.settings || {
        language: 'en',
        framework: 'next',
        responsive: true,
        maxWidth: 1440,
      }),
      theme: JSON.stringify(parsed.theme || {
        colors: { primary: '#3B82F6', secondary: '#8B5CF6', background: '#FFFFFF', text: '#1E293B' },
        fonts: { heading: 'Inter', body: 'Inter' },
        borderRadius: '8px',
      }),
    },
    include: {
      owner: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  });

  // Create default home page
  await prisma.page.create({
    data: {
      id: randomUUID(),
      projectId: project.id,
      name: 'Home',
      path: '/',
      title: parsed.name,
      isHomePage: true,
      sortOrder: 0,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      id: randomUUID(),
      projectId: project.id,
      userId: ownerId,
      action: 'create',
      entityType: 'project',
      entityId: project.id,
      details: JSON.stringify({ name: project.name, slug: project.slug }),
    },
  });

  return createdResponse(project);
});
