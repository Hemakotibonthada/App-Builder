/**
 * Data Models API Routes
 * GET    /api/projects/[id]/data-models       - List data models
 * POST   /api/projects/[id]/data-models       - Create data model
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
import { createDataModelSchema } from '@/lib/validations';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/projects/[id]/data-models
export const GET = withErrorHandler(async (_req: Request, { params }: RouteParams) => {
  const { id } = await params;

  const models = await prisma.dataModel.findMany({
    where: { projectId: id },
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { records: true } },
    },
  });

  return successResponse(models);
});

// POST /api/projects/[id]/data-models
export const POST = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const parsed = createDataModelSchema.parse(body);

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return notFoundResponse('Project');

  const existing = await prisma.dataModel.findFirst({
    where: { projectId: id, name: parsed.name },
  });
  if (existing) return errorResponse(`Data model "${parsed.name}" already exists`, 409);

  const model = await prisma.dataModel.create({
    data: {
      id: randomUUID(),
      projectId: id,
      name: parsed.name,
      description: parsed.description || null,
      fields: JSON.stringify(parsed.fields),
      validations: JSON.stringify(parsed.validations),
      indexes: JSON.stringify(parsed.indexes),
      relations: JSON.stringify(parsed.relations),
    },
    include: {
      _count: { select: { records: true } },
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      id: randomUUID(),
      projectId: id,
      action: 'create',
      entityType: 'dataModel',
      entityId: model.id,
      details: JSON.stringify({ name: model.name }),
    },
  });

  return createdResponse(model);
});
