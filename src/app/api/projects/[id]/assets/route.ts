/**
 * Assets API Routes
 * GET    /api/projects/[id]/assets  - List assets
 * POST   /api/projects/[id]/assets  - Upload/register asset
 * DELETE /api/projects/[id]/assets  - Batch delete assets
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { randomUUID } from 'crypto';
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  paginatedResponse,
  withErrorHandler,
  getPageParams,
} from '@/lib/api-helpers';
import { createAssetSchema } from '@/lib/validations';
import { authenticateRequest } from '@/lib/auth';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/projects/[id]/assets
export const GET = withErrorHandler(async (req: Request, { params }: RouteParams) => {
  const { id } = await params;
  const url = new URL(req.url);
  const { page, pageSize, skip } = getPageParams(url.searchParams);
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');

  const where: Record<string, unknown> = { projectId: id };
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { fileName: { contains: search } },
      { alt: { contains: search } },
    ];
  }

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.asset.count({ where }),
  ]);

  return paginatedResponse(assets, total, page, pageSize);
});

// POST /api/projects/[id]/assets
export const POST = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const parsed = createAssetSchema.parse(body);
  const auth = await authenticateRequest(req);

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return notFoundResponse('Project');

  const asset = await prisma.asset.create({
    data: {
      id: randomUUID(),
      projectId: id,
      uploadedById: auth?.userId || null,
      name: parsed.name,
      fileName: parsed.fileName,
      mimeType: parsed.mimeType,
      fileSize: parsed.fileSize,
      url: parsed.url,
      thumbnailUrl: parsed.thumbnailUrl || null,
      width: parsed.width || null,
      height: parsed.height || null,
      alt: parsed.alt || null,
      category: parsed.category,
      tags: JSON.stringify(parsed.tags),
      isGlobal: parsed.isGlobal,
    },
  });

  return createdResponse(asset);
});

// DELETE /api/projects/[id]/assets
export const DELETE = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const assetIds: string[] = body.ids || [];

  const result = await prisma.asset.deleteMany({
    where: { id: { in: assetIds }, projectId: id },
  });

  return successResponse({ deleted: result.count });
});
