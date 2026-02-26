/**
 * Data Records API Routes
 * GET    /api/projects/[id]/data-models/[modelId]/records  - List records
 * POST   /api/projects/[id]/data-models/[modelId]/records  - Create record
 * PUT    /api/projects/[id]/data-models/[modelId]/records  - Update record
 * DELETE /api/projects/[id]/data-models/[modelId]/records  - Delete records
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
import { createDataRecordSchema } from '@/lib/validations';

type RouteParams = { params: Promise<{ id: string; modelId: string }> };

// GET /api/projects/[id]/data-models/[modelId]/records
export const GET = withErrorHandler(async (req: Request, { params }: RouteParams) => {
  const { modelId } = await params;
  const url = new URL(req.url);
  const { page, pageSize, skip } = getPageParams(url.searchParams);
  const status = url.searchParams.get('status') || 'active';
  const search = url.searchParams.get('search');

  const where: Record<string, unknown> = { dataModelId: modelId };
  if (status !== 'all') where.status = status;
  if (search) {
    where.data = { contains: search };
  }

  const [records, total] = await Promise.all([
    prisma.dataRecord.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.dataRecord.count({ where }),
  ]);

  // Parse JSON data for each record
  const parsed = records.map((r) => ({
    ...r,
    data: JSON.parse(r.data),
  }));

  return paginatedResponse(parsed, total, page, pageSize);
});

// POST /api/projects/[id]/data-models/[modelId]/records
export const POST = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { modelId } = await params;
  const body = await req.json();
  const parsedBody = createDataRecordSchema.parse(body);

  const model = await prisma.dataModel.findUnique({ where: { id: modelId } });
  if (!model) return notFoundResponse('Data model');

  // Validate record data against model fields
  const fields = JSON.parse(model.fields) as Array<{ name: string; required?: boolean; type: string }>;
  const errors: string[] = [];
  for (const field of fields) {
    if (field.required && !(field.name in parsedBody.data)) {
      errors.push(`Field "${field.name}" is required`);
    }
  }
  if (errors.length > 0) {
    return successResponse({ error: 'Validation failed', errors }, 422 as never);
  }

  const maxSort = await prisma.dataRecord.findFirst({
    where: { dataModelId: modelId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  });

  const record = await prisma.dataRecord.create({
    data: {
      id: randomUUID(),
      dataModelId: modelId,
      data: JSON.stringify(parsedBody.data),
      sortOrder: (maxSort?.sortOrder ?? -1) + 1,
    },
  });

  return createdResponse({ ...record, data: JSON.parse(record.data) });
});

// PUT /api/projects/[id]/data-models/[modelId]/records
export const PUT = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { modelId } = await params;
  const body = await req.json();
  const { id: recordId, data, status } = body;

  const existing = await prisma.dataRecord.findFirst({
    where: { id: recordId, dataModelId: modelId },
  });
  if (!existing) return notFoundResponse('Record');

  const updateData: Record<string, unknown> = {};
  if (data !== undefined) updateData.data = JSON.stringify(data);
  if (status !== undefined) updateData.status = status;

  const record = await prisma.dataRecord.update({
    where: { id: recordId },
    data: updateData,
  });

  return successResponse({ ...record, data: JSON.parse(record.data) });
});

// DELETE /api/projects/[id]/data-models/[modelId]/records
export const DELETE = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { modelId } = await params;
  const body = await req.json();
  const recordIds: string[] = body.ids || [];

  const result = await prisma.dataRecord.deleteMany({
    where: { id: { in: recordIds }, dataModelId: modelId },
  });

  return successResponse({ deleted: result.count });
});
