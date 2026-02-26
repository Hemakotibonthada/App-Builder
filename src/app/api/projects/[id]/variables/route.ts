/**
 * Variables API Routes
 * GET    /api/projects/[id]/variables  - List variables
 * POST   /api/projects/[id]/variables  - Create variable
 * PUT    /api/projects/[id]/variables  - Batch update variables
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
import { createVariableSchema } from '@/lib/validations';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/projects/[id]/variables
export const GET = withErrorHandler(async (_req: Request, { params }: RouteParams) => {
  const { id } = await params;

  const variables = await prisma.variable.findMany({
    where: { projectId: id },
    orderBy: [{ group: 'asc' }, { name: 'asc' }],
  });

  return successResponse(variables);
});

// POST /api/projects/[id]/variables
export const POST = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const parsed = createVariableSchema.parse(body);

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return notFoundResponse('Project');

  // Check for duplicate name
  const existing = await prisma.variable.findFirst({
    where: { projectId: id, name: parsed.name },
  });
  if (existing) return errorResponse(`Variable "${parsed.name}" already exists`, 409);

  const variable = await prisma.variable.create({
    data: {
      id: randomUUID(),
      projectId: id,
      name: parsed.name,
      type: parsed.type,
      defaultValue: parsed.defaultValue || null,
      currentValue: parsed.currentValue || parsed.defaultValue || null,
      scope: parsed.scope,
      isComputed: parsed.isComputed,
      expression: parsed.expression || null,
      description: parsed.description || null,
      group: parsed.group || null,
    },
  });

  return createdResponse(variable);
});

// PUT /api/projects/[id]/variables - Batch update values
export const PUT = withErrorHandler(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = await params;
  const body = await req.json();
  const updates: Array<{ id: string; currentValue: string }> = body.variables || [];

  await prisma.$transaction(
    updates.map((u) =>
      prisma.variable.update({
        where: { id: u.id },
        data: { currentValue: u.currentValue },
      }),
    ),
  );

  const variables = await prisma.variable.findMany({
    where: { projectId: id },
    orderBy: [{ group: 'asc' }, { name: 'asc' }],
  });

  return successResponse(variables);
});
