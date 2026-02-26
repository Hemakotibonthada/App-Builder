/**
 * Templates API Routes
 * GET  /api/templates - List template gallery
 * POST /api/templates - Create template (admin)
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { randomUUID } from 'crypto';
import {
  successResponse,
  createdResponse,
  paginatedResponse,
  withErrorHandler,
  getPageParams,
  getSearchParam,
} from '@/lib/api-helpers';
import { createTemplateSchema } from '@/lib/validations';

// GET /api/templates
export const GET = withErrorHandler(async (req: NextRequest) => {
  const url = new URL(req.url);
  const { page, pageSize, skip } = getPageParams(url.searchParams);
  const search = getSearchParam(url.searchParams);
  const category = url.searchParams.get('category');
  const featured = url.searchParams.get('featured');
  const official = url.searchParams.get('official');

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (category) where.category = category;
  if (featured === 'true') where.isFeatured = true;
  if (official === 'true') where.isOfficial = true;

  const [templates, total] = await Promise.all([
    prisma.templateEntry.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: [{ isFeatured: 'desc' }, { usageCount: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        tags: true,
        thumbnailUrl: true,
        previewUrl: true,
        isOfficial: true,
        isFeatured: true,
        usageCount: true,
        rating: true,
        createdAt: true,
      },
    }),
    prisma.templateEntry.count({ where }),
  ]);

  // Parse tags
  const parsedTemplates = templates.map((t) => ({
    ...t,
    tags: JSON.parse(t.tags),
  }));

  return paginatedResponse(parsedTemplates, total, page, pageSize);
});

// POST /api/templates
export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = createTemplateSchema.parse(body);

  const template = await prisma.templateEntry.create({
    data: {
      id: randomUUID(),
      name: parsed.name,
      description: parsed.description || null,
      category: parsed.category,
      tags: JSON.stringify(parsed.tags),
      thumbnailUrl: parsed.thumbnailUrl || null,
      previewUrl: parsed.previewUrl || null,
      data: JSON.stringify(parsed.data),
      isOfficial: parsed.isOfficial,
      isFeatured: parsed.isFeatured,
    },
  });

  return createdResponse(template);
});
